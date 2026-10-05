// The feedback form's back end for `npm run shots` when no SHOTS_BASE is set:
// the page's /api/feedback calls are answered in this process by the real
// Pages Function code (functions/_lib/handler.js), filing into the local
// GitHub stub (scripts/github-stub.mjs) with an in-memory KV. Turnstile's
// script is replaced by a stand-in that hands over Cloudflare's dummy test
// token, and siteverify answers as Cloudflare does for the test secret.
// Nothing leaves this machine. (Running `wrangler pages dev` here instead
// would need Node 22 for Wrangler 4; set SHOTS_BASE to use one you started.)
import fs from "node:fs";
import path from "node:path";
import { handleGet, handlePost } from "../../functions/_lib/handler.js";
import { SITEVERIFY } from "../../functions/_lib/turnstile.js";
import { startStub } from "../github-stub.mjs";
import { memoryKV } from "./memory-kv.mjs";

const DUMMY_TOKEN = "XXXX.DUMMY.TOKEN.XXXX";

// A stand-in for Turnstile's api.js: a box where the widget goes, and the dummy token.
const FAKE_TURNSTILE = `window.turnstile = {
  render(sel, opts) {
    const el = typeof sel === "string" ? document.querySelector(sel) : sel;
    el.innerHTML = '<div style="display:inline-flex;align-items:center;gap:10px;width:300px;max-width:100%;height:65px;padding:0 14px;border:1px solid #444;border-radius:4px;background:#232323;color:#ddd;font:14px sans-serif">&#10003; Spam check passed (test stand-in)</div><input type="hidden" name="cf-turnstile-response" value="${DUMMY_TOKEN}">';
    setTimeout(() => opts.callback("${DUMMY_TOKEN}"), 50);
    this._cb = opts.callback;
    return 0;
  },
  reset() { setTimeout(() => this._cb && this._cb("${DUMMY_TOKEN}"), 50); },
};`;

// Starts the stub and wires a Playwright browser context. Returns { close, issues }.
export async function mockFeedback(context, distDir) {
  const { server, issues } = await startStub(0);
  const env = {
    GITHUB_TOKEN: "local-stub-token-not-a-secret",
    GITHUB_API_URL: `http://127.0.0.1:${server.address().port}`,
    FEEDBACK_REPO: "local/feedback-stub",
    TURNSTILE_SITEKEY: "1x00000000000000000000AA",
    TURNSTILE_SECRET: "1x0000000000000000000000000000000AA",
    RL_SALT: "shots-salt",
    FEEDBACK_KV: memoryKV(),
    ASSETS: { fetch: async (req) => new Response(fs.readFileSync(path.join(distDir, new URL(req.url).pathname))) },
  };
  const fetchFn = async (url, init) => {
    if (String(url) === SITEVERIFY) return Response.json({ success: true, hostname: "example.com", metadata: { result_with_testing_key: true } });
    return fetch(url, init);
  };
  await context.route("https://challenges.cloudflare.com/turnstile/v0/api.js*", (route) => route.fulfill({ contentType: "text/javascript", body: FAKE_TURNSTILE }));
  await context.route("**/api/feedback", async (route) => {
    const r = route.request();
    const req = new Request(r.url(), { method: r.method(), headers: r.headers(), body: r.method() === "POST" ? r.postData() : undefined });
    const res = r.method() === "GET" ? handleGet(req, env) : r.method() === "POST" ? await handlePost(req, env, { fetchFn }) : new Response("", { status: 405 });
    await route.fulfill({ status: res.status, headers: Object.fromEntries(res.headers), body: await res.text() });
  });
  return { issues, close: () => server.close() };
}
