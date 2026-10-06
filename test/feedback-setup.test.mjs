// Tests for scripts/feedback-setup.mjs against an in-memory Cloudflare and
// GitHub (nothing is sent anywhere): a first run makes everything, a rerun
// reuses it and keeps RL_SALT, and each failure names what to fix.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readEnv, setup, SetupError, KV_TITLE, WIDGET_NAME, PROJECT } from "../scripts/feedback-setup.mjs";

const ENV = { CLOUDFLARE_API_TOKEN: "cf-test-token", CLOUDFLARE_ACCOUNT_ID: "acct1", FEEDBACK_GITHUB_TOKEN: "gh-test-token", FEEDBACK_REPO: "owner/private-feedback" };

// A fake of the API calls the script makes, with its state open to the test.
function fakeApis({ cfDenied = [], ghStatus = 200, labelStatus = 201 } = {}) {
  const state = { kv: [], widgets: [], project: { name: PROJECT, deployment_configs: { production: {} } }, labels: new Set(), calls: [] };
  const reply = (status, result) => ({ ok: status < 300, status, json: async () => (status < 300 ? { success: true, result } : { success: false, errors: [{ message: "denied" }] }) });
  const fetchFn = async (url, { method, body }) => {
    const data = body ? JSON.parse(body) : undefined;
    state.calls.push(`${method} ${url}`);
    const u = new URL(url);
    if (u.host === "api.github.com") {
      if (u.pathname === "/repos/owner/private-feedback") return { status: ghStatus, json: async () => ({ private: true }) };
      const label = u.pathname.match(/\/labels\/(.+)$/);
      if (label) return { status: state.labels.has(decodeURIComponent(label[1])) ? 200 : 404, json: async () => ({}) };
      if (labelStatus === 201) state.labels.add(data.name);
      return { status: labelStatus, json: async () => ({}) };
    }
    const path = u.pathname.replace("/client/v4/accounts/acct1", "");
    if (cfDenied.some((p) => path.startsWith(p))) return reply(403);
    if (path === "/storage/kv/namespaces") {
      if (method === "GET") return reply(200, state.kv);
      state.kv.push({ id: `kv${state.kv.length + 1}`, title: data.title });
      return reply(200, state.kv.at(-1));
    }
    if (path === "/challenges/widgets" && method === "GET") return reply(200, state.widgets.map(({ secret, ...w }) => w));
    if (path === "/challenges/widgets") {
      state.widgets.push({ ...data, sitekey: "0x4AAAsite", secret: "0x4AAAsecret" });
      return reply(200, state.widgets.at(-1));
    }
    if (path.startsWith("/challenges/widgets/") && method === "PUT") {
      Object.assign(state.widgets[0], data);
      return reply(200, state.widgets[0]);
    }
    if (path === `/pages/projects/${PROJECT}` && method === "GET") return reply(200, state.project);
    if (path === `/pages/projects/${PROJECT}` && method === "PATCH") {
      const prod = state.project.deployment_configs.production;
      const next = data.deployment_configs.production;
      prod.env_vars = { ...prod.env_vars, ...next.env_vars };
      prod.kv_namespaces = next.kv_namespaces;
      return reply(200, state.project);
    }
    return reply(404);
  };
  return { state, fetchFn };
}

test("readEnv: names the missing secrets, checks the repo, adds extra hostnames", () => {
  assert.throws(() => readEnv({ CLOUDFLARE_API_TOKEN: "x" }), /Missing repository secrets: CLOUDFLARE_ACCOUNT_ID, FEEDBACK_GITHUB_TOKEN, FEEDBACK_REPO/);
  assert.throws(() => readEnv({ ...ENV, FEEDBACK_REPO: "https://github.com/a/b" }), /owner\/name/);
  assert.deepEqual(readEnv({ ...ENV, SITE_DOMAINS: " Example.COM, vanguard-ui.pages.dev ," }).domains, ["vanguard-ui.pages.dev", "example.com"]);
});

test("a first run makes the labels, KV namespace and widget, and sets the project", async () => {
  const { state, fetchFn } = fakeApis();
  const lines = await setup(fetchFn, readEnv(ENV));
  assert.deepEqual([...state.labels].sort(), ["bug", "feature-request", "from-site"]);
  assert.deepEqual(state.kv.map((n) => n.title), [KV_TITLE]);
  assert.deepEqual(state.widgets.map((w) => [w.name, w.domains, w.mode]), [[WIDGET_NAME, ["vanguard-ui.pages.dev"], "managed"]]);
  const prod = state.project.deployment_configs.production;
  assert.deepEqual(prod.kv_namespaces, { FEEDBACK_KV: { namespace_id: "kv1" } });
  assert.deepEqual(prod.env_vars.GITHUB_TOKEN, { type: "secret_text", value: "gh-test-token" });
  assert.deepEqual(prod.env_vars.TURNSTILE_SECRET, { type: "secret_text", value: "0x4AAAsecret" });
  assert.deepEqual(prod.env_vars.TURNSTILE_SITEKEY, { type: "plain_text", value: "0x4AAAsite" });
  assert.deepEqual(prod.env_vars.FEEDBACK_REPO, { type: "plain_text", value: "owner/private-feedback" });
  assert.match(prod.env_vars.RL_SALT.value, /^[0-9a-f]{64}$/);
  assert.equal(prod.env_vars.RL_SALT.type, "secret_text");
  assert.ok(lines.every((l) => !l.includes("gh-test-token") && !l.includes("0x4AAAsecret") && !l.includes(prod.env_vars.RL_SALT.value)), "no secret in the output");
});

test("a rerun reuses everything, keeps RL_SALT and adds new hostnames", async () => {
  const { state, fetchFn } = fakeApis();
  await setup(fetchFn, readEnv(ENV));
  const salt = state.project.deployment_configs.production.env_vars.RL_SALT.value;
  const lines = await setup(fetchFn, readEnv({ ...ENV, SITE_DOMAINS: "vanguardui.com" }));
  assert.equal(state.kv.length, 1);
  assert.equal(state.widgets.length, 1);
  assert.deepEqual(state.widgets[0].domains, ["vanguard-ui.pages.dev", "vanguardui.com"]);
  assert.equal(state.project.deployment_configs.production.env_vars.RL_SALT.value, salt);
  assert.match(lines.join("\n"), /labels in place[\s\S]*already there[\s\S]*already there, hostnames updated/);
  assert.doesNotMatch(lines.at(-1), /RL_SALT/);
});

test("failures name what to fix", async () => {
  const cfg = readEnv(ENV);
  await assert.rejects(setup(fakeApis({ ghStatus: 404 }).fetchFn, cfg), (e) => e instanceof SetupError && /can't see owner\/private-feedback/.test(e.message));
  await assert.rejects(setup(fakeApis({ labelStatus: 403 }).fetchFn, cfg), /Issues: Read and write/);
  await assert.rejects(setup(fakeApis({ cfDenied: ["/storage/kv"] }).fetchFn, cfg), /"Workers KV Storage: Edit" permission/);
  await assert.rejects(setup(fakeApis({ cfDenied: ["/challenges"] }).fetchFn, cfg), /"Turnstile: Edit" permission/);
  await assert.rejects(setup(fakeApis({ cfDenied: ["/pages"] }).fetchFn, cfg), /"Cloudflare Pages: Edit" permission/);
});
