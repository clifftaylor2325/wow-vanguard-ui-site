// The few GitHub REST calls the feedback Function makes, with the token from
// the GITHUB_TOKEN secret. Only api.github.com is used, unless GITHUB_API_URL
// points at a server on this machine (the local stub, scripts/github-stub.mjs):
// the token is never sent anywhere else.

const API = "https://api.github.com";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export class GitHubError extends Error {
  constructor(status, what) {
    super(`GitHub ${what}: HTTP ${status}`);
    this.status = status;
  }
}

// The API base: GitHub's, or a local stub; null when GITHUB_API_URL names
// anything else.
export function apiBase(env) {
  const raw = env.GITHUB_API_URL;
  if (!raw) return API;
  try {
    const url = new URL(raw);
    if (raw.replace(/\/+$/, "") === API) return API;
    if (LOCAL_HOSTS.has(url.hostname) && /^https?:$/.test(url.protocol)) return url.origin;
  } catch {
    // not a URL: fall through
  }
  return null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Seconds GitHub asks us to wait on a 403 or 429, or null when it doesn't.
function waitFor(res) {
  const after = Number(res.headers.get("retry-after"));
  if (after > 0) return after;
  if (res.headers.get("x-ratelimit-remaining") === "0") return 60;
  return null;
}

// A client for one repository: { createIssue, search, getIssue, addComment }.
// fetchFn is fetch (tests pass their own).
export function gitHub({ base, token, repo, fetchFn = fetch, maxWait = 5 }) {
  async function call(method, path, what, body) {
    for (let attempt = 0; ; attempt++) {
      const res = await fetchFn(`${base}${path}`, {
        method,
        headers: {
          accept: "application/vnd.github+json",
          authorization: `Bearer ${token}`,
          "x-github-api-version": "2022-11-28",
          "user-agent": "foreverui-feedback",
          ...(body ? { "content-type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.ok) return res.json();
      const wait = res.status === 403 || res.status === 429 ? waitFor(res) : null;
      if (attempt === 0 && wait !== null && wait <= maxWait) {
        await sleep(wait * 1000);
        continue;
      }
      throw new GitHubError(res.status, what);
    }
  }
  return {
    createIssue: (title, body, labels) => call("POST", `/repos/${repo}/issues`, "create issue", { title, body, labels }),
    search: (q) => call("GET", `/search/issues?q=${encodeURIComponent(q)}&per_page=10`, "search", null).then((r) => r.items || []),
    getIssue: (number) => call("GET", `/repos/${repo}/issues/${number}`, "get issue", null),
    addComment: (number, body) => call("POST", `/repos/${repo}/issues/${number}/comments`, "comment", { body }),
  };
}
