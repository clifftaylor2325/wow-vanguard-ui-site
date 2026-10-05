#!/usr/bin/env node
// A stand-in for the GitHub REST API, for trying the feedback Function on this
// machine without filing anything real. It answers the four calls the
// Function makes (create issue, search, get issue, comment), keeps the issues
// in memory, and prints each call. Point the Function at it with
// GITHUB_API_URL=http://127.0.0.1:8789 in .dev.vars (see README).
//   node scripts/github-stub.mjs [port]
// GET /_stub/issues lists what it holds (with comments), for checking by hand.
import http from "node:http";
import { fileURLToPath } from "node:url";

// A stub server; resolves to { server, issues }.
export function startStub(port = 0) {
  const issues = [];
  const send = (res, status, data) => res.writeHead(status, { "content-type": "application/json" }).end(JSON.stringify(data));
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://stub");
    let body = "";
    for await (const chunk of req) body += chunk;
    let data = {};
    try {
      data = body ? JSON.parse(body) : {};
    } catch {
      return send(res, 400, { message: "Problems parsing JSON" });
    }
    console.log(`stub: ${req.method} ${url.pathname}${url.search}`);
    if (url.pathname === "/_stub/issues") return send(res, 200, issues);
    if (!/^Bearer \S+/.test(req.headers.authorization || "")) return send(res, 401, { message: "Requires authentication" });
    const repoIssues = url.pathname.match(/^\/repos\/[^/]+\/[^/]+\/issues$/);
    const one = url.pathname.match(/^\/repos\/[^/]+\/[^/]+\/issues\/(\d+)$/);
    const comments = url.pathname.match(/^\/repos\/[^/]+\/[^/]+\/issues\/(\d+)\/comments$/);
    if (repoIssues && req.method === "POST") {
      const issue = { number: issues.length + 1, state: "open", title: data.title, body: data.body, labels: (data.labels || []).map((name) => ({ name })), comments: [] };
      issues.push(issue);
      return send(res, 201, { ...issue, html_url: `http://stub/issues/${issue.number}` });
    }
    if (one && req.method === "GET") {
      const issue = issues[Number(one[1]) - 1];
      return issue ? send(res, 200, issue) : send(res, 404, { message: "Not Found" });
    }
    if (comments && req.method === "POST") {
      const issue = issues[Number(comments[1]) - 1];
      if (!issue) return send(res, 404, { message: "Not Found" });
      issue.comments.push(data.body);
      return send(res, 201, { id: issue.comments.length, body: data.body });
    }
    if (url.pathname === "/search/issues" && req.method === "GET") {
      const q = url.searchParams.get("q") || "";
      const phrase = (q.match(/"([^"]+)"/) || [])[1] || "";
      const items = issues.filter((i) => (!/is:open/.test(q) || i.state === "open") && i.body.includes(phrase));
      return send(res, 200, { total_count: items.length, items });
    }
    return send(res, 404, { message: "Not Found" });
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve({ server, issues })));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { server } = await startStub(Number(process.argv[2] || 8789));
  console.log(`GitHub stub at http://127.0.0.1:${server.address().port} (nothing leaves this machine)`);
}
