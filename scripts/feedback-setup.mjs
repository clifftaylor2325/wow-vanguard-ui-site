// Sets up the feedback form on Cloudflare (README → Feedback form → Bindings),
// for the "feedback setup" workflow. Safe to run again: it finds what it made
// before instead of making it twice.
//
// 1. Checks the GitHub token: it must reach FEEDBACK_REPO and make sure the
//    form's labels exist there (so a token without Issues write fails here,
//    not on the first player's report).
// 2. The KV namespace FEEDBACK_KV, made if missing.
// 3. The Turnstile widget, made if missing, for the site's hostnames (DOMAINS).
// 4. Sets the Pages project's production variables, secrets and KV binding.
//    RL_SALT is made once and kept on later runs.
//
// Nothing secret is printed. The new settings apply from the next deploy,
// which the workflow runs straight after.
//
// Environment: CLOUDFLARE_API_TOKEN (Pages: Edit, Workers KV Storage: Edit,
// Turnstile: Edit), CLOUDFLARE_ACCOUNT_ID, FEEDBACK_GITHUB_TOKEN,
// FEEDBACK_REPO (owner/name), and optionally SITE_DOMAINS (more hostnames for
// the widget, comma-separated, such as a custom domain).
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import { LABELS } from "../src/feedback/body.js";

export const PROJECT = "vanguard-ui";
export const KV_TITLE = "vanguard-ui-feedback";
export const WIDGET_NAME = "Vanguard UI feedback";
// The site's hostnames (a Turnstile widget's hostname also covers its subdomains, such as www).
export const DOMAINS = ["vanguardui.com", "vanguard-ui.pages.dev"];
const CF = "https://api.cloudflare.com/client/v4";
const GH = "https://api.github.com";
// The colors the labels get when this makes them.
const LABEL_COLORS = { bug: "d73a4a", "feature-request": "a2eeef", "from-site": "ededed" };

// A failure the workflow shows as is.
export class SetupError extends Error {}

// The settings from the environment, or a SetupError naming what's missing.
export function readEnv(env) {
  const names = ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "FEEDBACK_GITHUB_TOKEN", "FEEDBACK_REPO"];
  const missing = names.filter((n) => !env[n]);
  if (missing.length) throw new SetupError(`Missing repository secrets: ${missing.join(", ")}. See the comment at the top of .github/workflows/feedback-setup.yml.`);
  const repo = env.FEEDBACK_REPO.trim();
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new SetupError("FEEDBACK_REPO must be owner/name, such as clifftaylor2325/wow-vanguard-ui.");
  const extra = (env.SITE_DOMAINS || "").split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
  return { cfToken: env.CLOUDFLARE_API_TOKEN, account: env.CLOUDFLARE_ACCOUNT_ID.trim(), ghToken: env.FEEDBACK_GITHUB_TOKEN, repo, domains: [...new Set([...DOMAINS, ...extra])] };
}

// A Cloudflare API call's result; a SetupError (with the permission to check) when it fails.
export async function cf(fetchFn, cfg, method, path, body, permission) {
  const res = await fetchFn(`${CF}/accounts/${cfg.account}${path}`, {
    method,
    headers: { authorization: `Bearer ${cfg.cfToken}`, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok && data.success !== false) return data.result;
  const why = (data.errors || []).map((e) => e.message).join("; ") || `HTTP ${res.status}`;
  const hint = res.status === 403 || res.status === 401 ? ` Give CLOUDFLARE_API_TOKEN the "${permission}" permission (Cloudflare dashboard → My Profile → API Tokens → edit the token).` : "";
  throw new SetupError(`Cloudflare ${method} ${path} failed: ${why}.${hint}`);
}

// A GitHub API call with the feedback token: { status, data }.
async function gh(fetchFn, cfg, method, path, body) {
  const res = await fetchFn(`${GH}${path}`, {
    method,
    headers: { authorization: `Bearer ${cfg.ghToken}`, accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", "user-agent": "vanguard-ui-feedback-setup" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

// Checks the token reaches the repository and makes the form's labels there.
// Returns the labels it made.
export async function checkGitHub(fetchFn, cfg) {
  const repo = await gh(fetchFn, cfg, "GET", `/repos/${cfg.repo}`);
  if (repo.status !== 200) throw new SetupError(`FEEDBACK_GITHUB_TOKEN can't see ${cfg.repo} (HTTP ${repo.status}). Make a fine-grained token with only that repository and Issues: Read and write.`);
  if (repo.data.private === false) console.log(`::warning::${cfg.repo} is public: players' reports will be public. The form is meant for a private repository.`);
  const made = [];
  for (const name of [...new Set(Object.values(LABELS).flat())]) {
    if ((await gh(fetchFn, cfg, "GET", `/repos/${cfg.repo}/labels/${encodeURIComponent(name)}`)).status === 200) continue;
    const res = await gh(fetchFn, cfg, "POST", `/repos/${cfg.repo}/labels`, { name, color: LABEL_COLORS[name] || "ededed" });
    if (res.status !== 201) throw new SetupError(`FEEDBACK_GITHUB_TOKEN can't make the label "${name}" in ${cfg.repo} (HTTP ${res.status}): it needs Issues: Read and write.`);
    made.push(name);
  }
  return made;
}

// The feedback KV namespace's id, made if missing.
export async function kvNamespace(fetchFn, cfg) {
  const list = await cf(fetchFn, cfg, "GET", "/storage/kv/namespaces?per_page=100", undefined, "Workers KV Storage: Edit");
  const found = list.find((n) => n.title === KV_TITLE);
  if (found) return { id: found.id, made: false };
  const made = await cf(fetchFn, cfg, "POST", "/storage/kv/namespaces", { title: KV_TITLE }, "Workers KV Storage: Edit");
  return { id: made.id, made: true };
}

// The Turnstile widget's sitekey and secret: made if missing, else its
// hostnames brought up to date.
export async function turnstileWidget(fetchFn, cfg) {
  const perm = "Turnstile: Edit";
  const list = await cf(fetchFn, cfg, "GET", "/challenges/widgets?per_page=50", undefined, perm);
  const found = list.find((w) => w.name === WIDGET_NAME);
  if (!found) {
    const made = await cf(fetchFn, cfg, "POST", "/challenges/widgets", { name: WIDGET_NAME, domains: cfg.domains, mode: "managed" }, perm);
    return { sitekey: made.sitekey, secret: made.secret, made: true };
  }
  const domains = [...new Set([...(found.domains || []), ...cfg.domains])];
  let widget = await cf(fetchFn, cfg, "PUT", `/challenges/widgets/${found.sitekey}`, { name: WIDGET_NAME, domains, mode: found.mode || "managed" }, perm);
  if (!widget?.secret) widget = await cf(fetchFn, cfg, "GET", `/challenges/widgets/${found.sitekey}`, undefined, perm);
  if (!widget?.secret) throw new SetupError("Cloudflare didn't return the Turnstile widget's secret.");
  return { sitekey: found.sitekey, secret: widget.secret, made: false };
}

// The Pages project's production settings for the form. RL_SALT is left out
// when the project has one already, so rate caps carry over.
export function projectSettings(project, cfg, kvId, widget) {
  const existing = project.deployment_configs?.production?.env_vars || {};
  const vars = {
    GITHUB_TOKEN: { type: "secret_text", value: cfg.ghToken },
    TURNSTILE_SECRET: { type: "secret_text", value: widget.secret },
    TURNSTILE_SITEKEY: { type: "plain_text", value: widget.sitekey },
    FEEDBACK_REPO: { type: "plain_text", value: cfg.repo },
  };
  if (!existing.RL_SALT) vars.RL_SALT = { type: "secret_text", value: crypto.randomBytes(32).toString("hex") };
  return { deployment_configs: { production: { env_vars: vars, kv_namespaces: { FEEDBACK_KV: { namespace_id: kvId } } } } };
}

// The whole setup; returns what it did, one line each.
export async function setup(fetchFn, cfg) {
  const lines = [];
  const labels = await checkGitHub(fetchFn, cfg);
  lines.push(`GitHub: ${cfg.repo} reachable${labels.length ? `; made the labels ${labels.join(", ")}` : "; labels in place"}.`);
  const project = await cf(fetchFn, cfg, "GET", `/pages/projects/${PROJECT}`, undefined, "Cloudflare Pages: Edit");
  const kv = await kvNamespace(fetchFn, cfg);
  lines.push(`KV namespace ${KV_TITLE}: ${kv.made ? "made" : "already there"}.`);
  const widget = await turnstileWidget(fetchFn, cfg);
  console.log(`::add-mask::${widget.secret}`);
  lines.push(`Turnstile widget "${WIDGET_NAME}" for ${cfg.domains.join(", ")}: ${widget.made ? "made" : "already there, hostnames updated"}.`);
  const settings = projectSettings(project, cfg, kv.id, widget);
  if (settings.deployment_configs.production.env_vars.RL_SALT) console.log(`::add-mask::${settings.deployment_configs.production.env_vars.RL_SALT.value}`);
  await cf(fetchFn, cfg, "PATCH", `/pages/projects/${PROJECT}`, settings, "Cloudflare Pages: Edit");
  lines.push(`Pages project ${PROJECT}: production settings ${Object.keys(settings.deployment_configs.production.env_vars).join(", ")} and the FEEDBACK_KV binding set.`);
  return lines;
}

// Run as a script: set up, or show the error and fail.
if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  try {
    for (const line of await setup(fetch, readEnv(process.env))) console.log(line);
  } catch (err) {
    console.log(`::error::${err instanceof SetupError ? err.message : err.stack}`);
    process.exitCode = 1;
  }
}
