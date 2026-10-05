// POST /api/feedback: checks a report and files it as an issue in the
// maintainers' private repository (FEEDBACK_REPO), or adds it to the open
// issue for the same error. The player only ever gets a short reference
// (VG-AB12CD): never an issue URL, the repository's name, or anything
// about the token. GET /api/feedback tells the page whether reports are being
// accepted and which Turnstile sitekey to use.
//
// Bindings (Pages project settings; locally .dev.vars and --kv):
//   GITHUB_TOKEN       secret: fine-grained token, only FEEDBACK_REPO, Issues read/write
//   TURNSTILE_SECRET   secret: the Turnstile widget's secret key
//   RL_SALT            secret: a random string for the hashed rate-cap keys
//   TURNSTILE_SITEKEY  var: the Turnstile widget's public sitekey
//   FEEDBACK_REPO      var: owner/name of the repository issues go to
//   FEEDBACK_KV        KV namespace: rate caps, fingerprint -> issue, contact details (90 days)
//   GITHUB_API_URL     local only: a stub GitHub on this machine (scripts/github-stub.mjs)
import { readFields, validate, REFUSED, FALLBACK_AREAS } from "../../src/feedback/fields.js";
import { bugIssue, featureIssue, duplicateComment } from "../../src/feedback/body.js";
import { gitHub, apiBase, GitHubError } from "./github.js";
import { verifyTurnstile, TEST_SECRETS, TEST_SITEKEYS } from "./turnstile.js";
import { capKeys, reserve, release } from "./ratelimit.js";

const MAX_BODY = 64 * 1024;
const MIN_SECONDS = 3;
const CONTACT_TTL = 90 * 86400;
const FP_TTL = 30 * 86400;
const LOCAL = new Set(["localhost", "127.0.0.1", "[::1]"]);
const REF_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

// The messages the page shows for each kind of failure.
const MESSAGES = {
  bad_request: "That didn't look like a report from this page. Reload the page and try again.",
  invalid: "Some fields need another look.",
  spam: "That was sent too quickly. Wait a few seconds and try again.",
  turnstile: "The spam check didn't pass. Please try it again.",
  rate_limited: "You've sent several reports in a short time. Please wait a while before sending another.",
  unavailable: "Reports can't be sent right now. Your text is still here: try again later, or copy it to keep it.",
};

// A JSON response that is never cached.
function json(status, data, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });
}

// An error response: { error, message } (and the field problems for "invalid").
function fail(status, error, extra = {}, headers = {}) {
  return json(status, { error, message: MESSAGES[error], ...extra }, headers);
}

// Why the Function can't take reports here, or "" when everything is set.
// Cloudflare's Turnstile test keys and a local GitHub stub only work on localhost.
export function configProblem(env, hostname) {
  const local = LOCAL.has(hostname);
  if (!env.GITHUB_TOKEN || !env.TURNSTILE_SECRET || !env.TURNSTILE_SITEKEY || !env.RL_SALT) return "missing secret or var";
  if (!/^[\w.-]+\/[\w.-]+$/.test(env.FEEDBACK_REPO || "")) return "FEEDBACK_REPO is not owner/name";
  if (!env.FEEDBACK_KV || typeof env.FEEDBACK_KV.get !== "function") return "no FEEDBACK_KV binding";
  const base = apiBase(env);
  if (!base || (base !== "https://api.github.com" && !local)) return "GITHUB_API_URL is not allowed here";
  if (!local && (TEST_SECRETS.includes(env.TURNSTILE_SECRET) || TEST_SITEKEYS.includes(env.TURNSTILE_SITEKEY))) return "Turnstile test keys outside localhost";
  return "";
}

// GET: { accepting, sitekey }.
export function handleGet(request, env) {
  const problem = configProblem(env, new URL(request.url).hostname);
  return json(200, problem ? { accepting: false, sitekey: null } : { accepting: true, sitekey: env.TURNSTILE_SITEKEY });
}

// The "Part of Vanguard" choices: value -> label, from the modules in the
// built site's site-data.json, then the fallbacks.
async function loadAreas(request, env) {
  const areas = new Map();
  const res = await env.ASSETS.fetch(new Request(new URL("/site-data.json", request.url)));
  const data = res.ok ? await res.json() : { modules: [] };
  for (const m of data.modules || []) areas.set(m.key, m.name);
  for (const [value, label] of FALLBACK_AREAS) areas.set(value, label);
  return areas;
}

// A new reference: VG- and six characters that can't be mistaken for each other
// (reports sent before the rename have FUI- references).
function newReference() {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(6));
  return `VG-${Array.from(bytes, (b) => REF_CHARS[b % REF_CHARS.length]).join("")}`;
}

// The request's JSON object, or null when it isn't one (or is too big).
async function readBody(request) {
  if (!/^application\/json\b/i.test(request.headers.get("content-type") || "")) return null;
  const text = await request.text();
  if (text.length > MAX_BODY) return null;
  try {
    const data = JSON.parse(text);
    return data && typeof data === "object" && !Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

// True when a bot filled the hidden field or the form was sent under 3 seconds after it opened.
function looksAutomated(data) {
  if (typeof data.fui_hp === "string" && data.fui_hp !== "") return true;
  const t0 = Number(data.t0);
  const t1 = Number(data.t1);
  return !Number.isFinite(t0) || !Number.isFinite(t1) || t1 - t0 < MIN_SECONDS * 1000;
}

// Runs a KV write that comes after the report was filed: a failure is logged,
// not reported, so the player isn't told to send it again.
async function quietly(what, fn) {
  try {
    await fn();
  } catch {
    console.error(`feedback: ${what} failed`);
  }
}

// True for a GitHub answer that means the token or repository is wrong.
const authProblem = (e) => e instanceof GitHubError && [401, 403, 404].includes(e.status);

// True when issue is the open bug filed for fingerprint fp. Only the first
// line counts: player text can't put an HTML comment there.
function sameBug(issue, fp) {
  return !!issue && issue.state === "open" && !issue.pull_request && String(issue.body || "").startsWith(`<!-- fui-feedback v1 kind=bug fp=${fp} src=site -->`);
}

// The open issue for fp: the one remembered in KV, else a search. A failed
// search (other than a token problem) finds nothing, so the report is filed.
async function findBug(gh, env, fp) {
  const known = await env.FEEDBACK_KV.get(`fp:${fp}`);
  if (known) {
    try {
      const issue = await gh.getIssue(Number(known));
      if (sameBug(issue, fp)) return issue;
    } catch (e) {
      if (e instanceof GitHubError && [401, 403].includes(e.status)) throw e;
    }
  }
  try {
    const items = await gh.search(`"fp:${fp}" repo:${env.FEEDBACK_REPO} is:issue is:open in:body`);
    return items.find((i) => sameBug(i, fp)) || null;
  } catch (e) {
    if (authProblem(e)) throw e;
    console.error(`feedback: search failed (${e.message}); filing a new issue`);
    return null;
  }
}

// Files the report: a comment on the matching open bug, or a new issue.
// Every report gets its own reference, written into the issue body or into
// its own comment, so a removal request names exactly one player's part.
// Returns { reference, duplicate, issueNumber, created }.
async function file(gh, env, f, areas) {
  const reference = newReference();
  if (f.kind === "feature") {
    const issue = featureIssue(f, areas.get(f.area), reference);
    const made = await gh.createIssue(issue.title, issue.body, issue.labels);
    return { reference, duplicate: false, issueNumber: made.number, created: true };
  }
  const issue = await bugIssue(f, reference);
  const match = issue.fp ? await findBug(gh, env, issue.fp) : null;
  if (match) {
    await gh.addComment(match.number, duplicateComment(f, issue.env, issue.fp, reference));
    return { reference, duplicate: true, issueNumber: match.number, created: false };
  }
  const made = await gh.createIssue(issue.title, issue.body, issue.labels);
  if (issue.fp) await quietly("remember fingerprint", () => env.FEEDBACK_KV.put(`fp:${issue.fp}`, String(made.number), { expirationTtl: FP_TTL }));
  return { reference, duplicate: false, issueNumber: made.number, created: true };
}

// Keeps contact details privately in KV for 90 days (never in the issue).
async function keepContact(env, f, result, now) {
  if (!f.contact) return;
  const value = JSON.stringify({ contact: f.contact, issue: result.issueNumber, reference: result.reference, at: new Date(now).toISOString() });
  await env.FEEDBACK_KV.put(`contact:${result.reference}:${now}`, value, { expirationTtl: CONTACT_TTL });
}

// POST. deps: { fetchFn, now, areas } for tests.
export async function handlePost(request, env, deps = {}) {
  const fetchFn = deps.fetchFn || fetch;
  const now = deps.now ? deps.now() : Date.now();
  const hostname = new URL(request.url).hostname;
  const data = await readBody(request);
  if (!data || REFUSED.some((k) => k in data)) return fail(400, "bad_request");
  if (looksAutomated(data)) return fail(400, "spam");
  const areas = deps.areas || (await loadAreas(request, env));
  const f = readFields(data);
  const errors = validate(f, areas.keys());
  if (Object.keys(errors).length) return fail(400, "invalid", { fields: errors });
  const problem = configProblem(env, hostname);
  if (problem) {
    console.error(`feedback: not configured (${problem})`);
    return fail(503, "unavailable");
  }
  const ip = request.headers.get("cf-connecting-ip") || "local";
  // Turnstile first: a request without a valid token never touches KV.
  const human = await verifyTurnstile({ secret: env.TURNSTILE_SECRET, token: data.turnstile, ip: ip === "local" ? "" : ip, hostname, fetchFn });
  if (!human) return fail(403, "turnstile");
  const keys = await capKeys(ip, env.RL_SALT, now);
  let held;
  try {
    held = await reserve(env.FEEDBACK_KV, keys, now);
  } catch {
    console.error("feedback: KV unavailable for the rate caps");
    return fail(503, "unavailable");
  }
  if (held.retryAfter) return fail(429, "rate_limited", { retryAfter: held.retryAfter }, { "retry-after": String(held.retryAfter) });
  const gh = gitHub({ base: apiBase(env), token: env.GITHUB_TOKEN, repo: env.FEEDBACK_REPO, fetchFn });
  let result;
  try {
    result = await file(gh, env, f, areas);
  } catch (e) {
    console.error(`feedback: ${e instanceof GitHubError ? e.message : "filing failed"}`);
    await quietly("release caps", () => release(env.FEEDBACK_KV, held.slots, { failed: true }));
    return fail(503, "unavailable");
  }
  if (!result.created) await quietly("release day cap", () => release(env.FEEDBACK_KV, held.slots, { failed: false }));
  await quietly("keep contact", () => keepContact(env, f, result, now));
  return json(200, { reference: result.reference, duplicate: result.duplicate });
}
