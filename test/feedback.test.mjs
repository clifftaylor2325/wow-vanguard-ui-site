// Tests for the feedback form: the shared report code (sanitize, parse,
// fingerprint, issue bodies, checks), the Pages Function with a mock GitHub
// and an in-memory KV (nothing is ever sent to GitHub or Cloudflare), and the
// built /feedback/ page. Run after `npm run build` (npm run check does both).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { clean, cleanLine, titleLine, cell, fence, block, inline } from "../src/feedback/sanitize.js";
import { parseReport, normalize, fingerprint } from "../src/feedback/report.js";
import { parseFeedback, hasFeedback, FEEDBACK_START, FEEDBACK_END } from "../src/feedback/fill.js";
import { readFields, validate, english, FALLBACK_AREAS } from "../src/feedback/fields.js";
import { bugIssue, featureIssue, duplicateComment, refIn } from "../src/feedback/body.js";
import { handlePost, handleGet, configProblem, MESSAGES } from "../functions/_lib/handler.js";
import { playerNet, capKeys } from "../functions/_lib/ratelimit.js";
import { apiBase, gitHub } from "../functions/_lib/github.js";
import { SITEVERIFY } from "../functions/_lib/turnstile.js";
import { startStub } from "../scripts/github-stub.mjs";
import { memoryKV } from "../scripts/lib/memory-kv.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = (name) => fs.readFileSync(path.join(root, "test/fixtures", name), "utf8");
const STATUS = fixture("vg-status-next.txt");
const ERRORS = fixture("vg-errors-next.txt");
const STATUS_030 = fixture("vg-status-0.3.0.txt");
const REPORT_V1 = fixture("vg-report-v1.txt");
// The blocks /vg feedback makes in game, for a bug and for a feature.
const FEEDBACK_BUG = fixture("vg-feedback-bug.txt");
const FEEDBACK_FEATURE = fixture("vg-feedback-feature.txt");
// The same pastes as the addon printed them before it was renamed from ForeverUI.
const OLD = ["fui-status-next.txt", "fui-errors-next.txt", "fui-status-0.3.0.txt", "fui-report-v1.txt"].map(fixture);
const REPO = "owner/private-feedback";
const SECRET_TOKEN = "test-token-not-real-0123";

// ---------------------------------------------------------------- sanitize

test("clean strips HTML and breaks mentions, autolinks and images", () => {
  const out = clean("<script>alert(1)</script><b>hi</b> <!-- hidden --> @someone fixes #12 and GH-3 ![x](http://e/i.png) &amp; a < b");
  assert.ok(!/<script|<b>|<!--/.test(out), out);
  assert.match(out, /@\u200bsomeone/);
  assert.match(out, /#\u200b12/);
  assert.match(out, /GH\u200b-3/);
  assert.match(out, /!\u200b\[x\]/);
  assert.match(out, /&amp;amp;/);
  assert.match(out, /a &lt; b/);
});

test("cleanLine and cell make one safe line", () => {
  assert.equal(cleanLine("a\n b\t c"), "a b c");
  assert.equal(cell("x | y"), "x \\| y");
});

test("fence is longer than any backtick run in the paste", () => {
  const f = fence("a ```` b\n```\nc");
  const ticks = f.match(/^`+/)[0];
  assert.equal(ticks.length, 5);
  assert.ok(f.endsWith(`\n${ticks}`));
  assert.ok(fence("plain").startsWith("```text\n"));
});

// ------------------------------------------------------------------ parser

test("parses real /vg status and /vg errors chat lines", () => {
  const p = parseReport(`${STATUS}\n${ERRORS}`);
  assert.equal(p.format, "chat");
  assert.equal(p.version, "0.3.0");
  assert.equal(p.client, "WoW Forever");
  assert.equal(p.release, "1.16.0");
  assert.equal(p.build, "65000");
  assert.equal(p.iface, "16001");
  assert.equal(p.errors.length, 2);
  assert.equal(p.errors[0].text, "RaidFrames: eval:2: attempt to index a nil value (local 't')");
  assert.equal(p.errors[0].count, 2);
  assert.equal(p.errors[0].stack[0], "Core/Events.lua:136: in metamethod '__index'");
  assert.equal(p.errors[0].stack.length, 5);
  assert.equal(p.errors[1].count, 1);
});

test("parses chat lines copied without color codes, with timestamps", () => {
  const plainCopy = ERRORS.replace(/\|cffd9a441Vanguard:\|r /g, "21:04:11 Vanguard: ");
  const p = parseReport(plainCopy);
  assert.equal(p.version, "0.3.0");
  assert.equal(p.errors.length, 2);
});

test("pastes from before the rename (ForeverUI) read the same as Vanguard's", () => {
  const [status, errors, status030, report] = OLD;
  assert.deepEqual(parseReport(`${status}\n${errors}`), parseReport(`${STATUS}\n${ERRORS}`));
  assert.deepEqual(parseReport(status030), parseReport(STATUS_030));
  assert.deepEqual(parseReport(report), parseReport(REPORT_V1));
  assert.equal(parseReport(report).format, "v1");
  assert.equal(parseReport(errors.replace(/\|cffd9a441ForeverUI:\|r /g, "21:04:11 ForeverUI: ")).errors.length, 2);
});

test("parses the v1 report block between its markers", () => {
  const p = parseReport(`chatter before\n${REPORT_V1}\nchatter after (x9)`);
  assert.equal(p.format, "v1");
  assert.equal(p.version, "0.3.0");
  assert.equal(p.iface, "16001");
  assert.equal(p.release, "1.16.0");
  assert.equal(p.errors.length, 2);
  assert.equal(p.errors[0].text, "RaidFrames: eval:2: attempt to index a nil value (local 't')");
  assert.equal(p.errors[0].count, 2);
});

test("old clients: v0.3.0 status lines parse with no errors and no fingerprint", async () => {
  const p = parseReport(STATUS_030);
  assert.equal(p.version, "0.3.0");
  assert.equal(p.client, "");
  assert.deepEqual(p.errors, []);
  assert.equal(await fingerprint(p), "");
  assert.equal(parseReport("").format, "empty");
});

// --------------------------------------------------------- /vg feedback block

test("parseFeedback reads a bug's block: kind, title, the texts, and the /vg report whole", async () => {
  assert.ok(hasFeedback(FEEDBACK_BUG) && !hasFeedback(REPORT_V1) && !hasFeedback(""));
  const f = parseFeedback(FEEDBACK_BUG);
  assert.equal(f.kind, "bug");
  assert.equal(f.title, "Raid frames go blank after a reload");
  assert.equal(f.area, "");
  // A typed line that reads as a marker was set off by a space in game; it comes back as typed.
  assert.equal(f.did, "Typed /reload in a raid group.\n--- happened ---\n### not a marker");
  assert.equal(f.expected, "The raid frames to come back as they were.");
  assert.equal(f.happened, "The raid frames stayed empty until I left the group.");
  assert.equal(f.want, "");
  assert.equal(f.why, "");
  assert.ok(f.report.startsWith("### Vanguard report v1 ###\n") && f.report.endsWith("\n### end ###"), f.report);
  const env = parseReport(f.report);
  assert.equal(env.format, "v1");
  assert.equal(env.errors.length, 2);
  assert.equal(env.errors[0].count, 2);
  assert.match(await fingerprint(env), /^[0-9a-f]{8}$/);
  // The filled fields pass the form's checks as they are (with the acknowledgement ticked).
  assert.deepEqual(validate(readFields({ ...f, public_ack: true }), []), {});
});

test("parseFeedback reads a feature's block, with its area", () => {
  const f = parseFeedback(FEEDBACK_FEATURE);
  assert.equal(f.kind, "feature");
  assert.equal(f.title, "A bigger minimap");
  assert.equal(f.area, "Minimap");
  assert.equal(f.want, "A minimap twice the size, or a size slider.");
  assert.equal(f.why, "I keep missing herb nodes on the edge of it.");
  assert.equal(f.did + f.expected + f.happened + f.report, "");
  assert.deepEqual(validate(readFields({ ...f, public_ack: true }), ["Minimap"]), {});
});

test("parseFeedback: no block is null; a bad kind is blank; CRLF, chat around it and a missing end are fine", () => {
  assert.equal(parseFeedback(""), null);
  assert.equal(parseFeedback(REPORT_V1), null);
  const crlf = parseFeedback(`hello\r\n${FEEDBACK_START}\r\nkind: idea\r\ntitle:  Spaced  \r\n--- want ---\r\nline one\r\n\r\nline two\r\n--- oops ---\r\nstill want\r\n${FEEDBACK_END}\r\ntrailing`);
  assert.equal(crlf.kind, "");
  assert.equal(crlf.title, "Spaced");
  assert.equal(crlf.want, "line one\n\nline two\n--- oops ---\nstill want");
  const open = parseFeedback(`${FEEDBACK_START}\nkind: bug\ntitle: No end marker\n--- happened ---\nit broke`);
  assert.equal(open.kind, "bug");
  assert.equal(open.happened, "it broke");
  assert.equal(open.report, "");
});

// ------------------------------------------------------------- fingerprint

test("normalize drops line numbers, addresses, counts and extra spaces", () => {
  assert.equal(normalize('[string "x"]:12: boom  (x3)'), '[string "x"]:: boom');
  assert.equal(normalize("table: 0000021C5E3A8F10 and 0xDEADbeef"), "table: ? and 0x?");
});

test("the same error with other line numbers, addresses and counts has the same fingerprint", async () => {
  const a = await fingerprint(parseReport(ERRORS));
  const changed = ERRORS.replace("(x2)", "(x17)").replace(/Events\.lua:136:/g, "Events.lua:140:");
  const b = await fingerprint(parseReport(changed));
  assert.match(a, /^[0-9a-f]{8}$/);
  assert.equal(a, b);
  const addrA = await fingerprint(parseReport("X: bad table: 0x00ff12 (x1)\n    \tA.lua:1: in f"));
  const addrB = await fingerprint(parseReport("X: bad table: 0x7a7a7a (x4)\n    \tA.lua:99: in f"));
  assert.equal(addrA, addrB);
  assert.equal(await fingerprint(parseReport(REPORT_V1)), a, "the v1 block and the chat lines agree");
});

test("a different top error has a different fingerprint", async () => {
  const a = await fingerprint(parseReport(ERRORS));
  const other = ERRORS.split("\n").slice(0, 2).concat(ERRORS.split("\n").slice(8)).join("\n");
  const b = await fingerprint(parseReport(other));
  assert.match(b, /^[0-9a-f]{8}$/);
  assert.notEqual(a, b);
});

// ------------------------------------------------------------ fields, body

const AREAS = new Map([["RaidFrames", "Raid frames"], ...FALLBACK_AREAS]);
const bugFields = (extra = {}) => ({ kind: "bug", title: "Raid frames go blank", report: `${STATUS}\n${ERRORS}`, did: "Reloaded in a raid @boss #4", expected: "", happened: "Frames <i>vanished</i>", public_ack: true, ...extra });
const featureFields = (extra = {}) => ({ kind: "feature", title: "Bigger raid frames", want: "A size slider", area: "RaidFrames", why: "Hard to read", public_ack: true, ...extra });

test("validate: required fields, limits, report-or-tick, area and acknowledgement", () => {
  const empty = validate(readFields({}), AREAS.keys());
  assert.ok(empty.kind && empty.title && empty.public_ack);
  const bug = validate(readFields(bugFields({ report: "", no_report: false })), AREAS.keys());
  assert.ok(bug.no_report);
  assert.deepEqual(validate(readFields(bugFields({ report: "", no_report: true })), AREAS.keys()), {});
  assert.ok(validate(readFields(bugFields({ title: "short" })), AREAS.keys()).title);
  assert.ok(validate(readFields(bugFields({ did: "x".repeat(2001) })), AREAS.keys()).did);
  assert.ok(validate(readFields(featureFields({ area: "Nope" })), AREAS.keys()).area);
  assert.deepEqual(validate(readFields(featureFields()), AREAS.keys()), {});
  assert.equal(readFields({ contact: "me@example.com", contact_ok: false }).contact, "", "contact needs the box ticked");
});

test("length messages write their numbers in the language they are shown in, and in en-US for the Function", () => {
  const long = readFields(bugFields({ did: "x".repeat(2001) }));
  assert.equal(validate(long, AREAS.keys()).did, "What you did can be at most 2,000 characters (it has 2,001).");
  const german = (text, values) => english(text, values, "de");
  assert.equal(validate(long, AREAS.keys(), german).did, "What you did can be at most 2.000 characters (it has 2.001).");
  assert.equal(english("{n} / {label}", { n: 20000, label: "20000" }, "fr").replace(/\s/g, " "), "20 000 / 20000", "only numbers are formatted");
});

test("bug issue: marker, title, env table, fenced report, footer, labels", async () => {
  const issue = await bugIssue(readFields(bugFields()), "FUI-ABCDEF");
  assert.deepEqual(issue.labels, ["bug", "from-site"]);
  assert.equal(issue.title, "[Bug] Raid frames go blank (v0.3.0, WoW Forever)");
  assert.ok(issue.body.startsWith(`<!-- fui-feedback v1 kind=bug fp=${issue.fp} src=site -->\n`));
  assert.ok(issue.body.includes(`_Sent from the Vanguard site. Error fingerprint fp:${issue.fp}._`));
  assert.ok(issue.body.includes("| 0.3.0 | WoW Forever | 1.16.0 (65000) | 16001 |"));
  assert.ok(issue.body.includes("```text\n"), "the report is fenced");
  assert.ok(issue.body.includes("in function <eval:2>"), "the paste is kept as typed inside the fence");
  assert.ok(issue.body.includes("**What I did**\n```text\nReloaded in a raid @boss #4\n```"), "free text is fenced");
  assert.ok(issue.body.includes("**What happened instead**\n```text\nFrames <i>vanished</i>\n```"), "HTML shows as typed inside its fence");
  assert.equal(refIn(issue.body), "FUI-ABCDEF");
});

test("issue titles are plain text: no entities, no stripped tags, at most 256 characters", async () => {
  const bug = await bugIssue(readFields(bugFields({ title: "Tooltip shows <nil> & a > b" })), "FUI-ABCDEF");
  assert.equal(bug.title, "[Bug] Tooltip shows <nil> & a > b (v0.3.0, WoW Forever)");
  assert.equal(titleLine("raid\u202e frames @boss #4 GH-5 ![x]"), "raid frames @\u200bboss #\u200b4 GH\u200b-5 !\u200b[x]");
  for (const bracket of ["<", "&"]) {
    const long = await bugIssue(readFields(bugFields({ title: bracket.repeat(100) })), "FUI-ABCDEF");
    assert.ok(long.title.length <= 256, `${long.title.length} characters`);
    assert.ok(long.title.endsWith("(v0.3.0, WoW Forever)"), "the version and client suffix is kept");
  }
  const idea = featureIssue(readFields(featureFields({ title: "x".repeat(400) })), "Raid frames", "FUI-ABCDEF");
  assert.equal(idea.title.length, 256);
  assert.equal(featureIssue(readFields(featureFields({ title: "A & B" })), "Raid frames", "FUI-ABCDEF").title, "[Idea] A & B");
});

test("bug issue without a report or error: fp=none and a note", async () => {
  const issue = await bugIssue(readFields(bugFields({ report: "", no_report: true })), "FUI-ABCDEF");
  assert.equal(issue.fp, "");
  assert.ok(issue.body.startsWith("<!-- fui-feedback v1 kind=bug fp=none src=site -->"));
  assert.ok(issue.body.includes("No report pasted"));
  assert.ok(issue.body.includes("| not found | not found | not found | not found |"));
});

test("feature issue: labels, area, footer without a vote prompt", () => {
  const issue = featureIssue(readFields(featureFields()), "Raid frames", "FUI-ABCDEF");
  assert.deepEqual(issue.labels, ["feature-request", "from-site"]);
  assert.equal(issue.title, "[Idea] Bigger raid frames");
  assert.ok(issue.body.startsWith("<!-- fui-feedback v1 kind=feature area=raid-frames src=site -->"));
  assert.ok(issue.body.includes("_Sent from the Vanguard site._"));
  assert.ok(!/vote|👍/i.test(issue.body));
});

test("duplicate comment: the spike's sentence and the notes, nothing else", async () => {
  const f = readFields(bugFields({ contact_ok: true, contact: "me@example.com" }));
  const issue = await bugIssue(f, "FUI-ABCDEF");
  const c = duplicateComment(f, issue.env, issue.fp, "FUI-ZZZZZZ");
  assert.equal(refIn(c), "FUI-ZZZZZZ", "the comment carries the repeat reporter's own reference");
  assert.ok(c.includes("Reference: FUI-ZZZZZZ"));
  assert.ok(c.startsWith("Another player hit this. Vanguard 0.3.0, WoW Forever 1.16.0 (65000). Occurrences in their session: 2."));
  assert.ok(c.includes("<details><summary>their notes</summary>"));
  assert.ok(!c.includes("me@example.com"));
  assert.ok(!issue.body.includes("me@example.com"));
});

// ---------------------------------------------------------------- Function

// A mock GitHub (issues in memory) and Turnstile siteverify behind one fetch.
// Every call is recorded; nothing leaves the process.
function mockServices({ turnstile = true, fail = {} } = {}) {
  const issues = [];
  const calls = [];
  const reply = (status, data) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
  async function fetchFn(url, init = {}) {
    const u = new URL(url);
    calls.push({ method: init.method || "GET", url: String(url), auth: init.headers?.authorization || "" });
    if (String(url) === SITEVERIFY) {
      const form = init.body;
      const ok = turnstile && form.get("response") === "XXXX.DUMMY.TOKEN.XXXX";
      return reply(200, ok ? { success: true, hostname: "example.com", metadata: { result_with_testing_key: true } } : { success: false, "error-codes": ["invalid-input-response"] });
    }
    assert.equal(u.origin, "https://api.github.com", "only GitHub's API is called");
    const what = u.pathname.startsWith("/search") ? "search" : u.pathname.endsWith("/comments") ? "comment" : init.method === "POST" ? "create" : "get";
    if (fail[what]) return reply(fail[what], { message: "nope" });
    const body = init.body ? JSON.parse(init.body) : {};
    if (what === "create") {
      const issue = { number: issues.length + 1, state: "open", title: body.title, body: body.body, labels: body.labels, comments: [], html_url: `https://github.com/${REPO}/issues/${issues.length + 1}` };
      issues.push(issue);
      return reply(201, issue);
    }
    if (what === "comment") {
      const issue = issues[Number(u.pathname.split("/")[5]) - 1];
      issue.comments.push(body.body);
      return reply(201, { id: 1 });
    }
    if (what === "get") {
      const issue = issues[Number(u.pathname.split("/")[5]) - 1];
      return issue ? reply(200, issue) : reply(404, { message: "Not Found" });
    }
    const q = u.searchParams.get("q");
    const phrase = q.match(/"([^"]+)"/)[1];
    assert.ok(q.includes(`repo:${REPO}`) && q.includes("is:issue") && q.includes("is:open"), q);
    return reply(200, { items: issues.filter((i) => i.state === "open" && i.body.includes(phrase)) });
  }
  return { issues, calls, fetchFn };
}

// A Function environment like .dev.vars.example (test keys, local only).
function testEnv(clock, extra = {}) {
  return { GITHUB_TOKEN: SECRET_TOKEN, TURNSTILE_SECRET: "1x0000000000000000000000000000000AA", TURNSTILE_SITEKEY: "1x00000000000000000000AA", RL_SALT: "test-salt", FEEDBACK_REPO: REPO, FEEDBACK_KV: memoryKV(clock), ...extra };
}

// POSTs fields to the handler the way the page does.
async function send(env, services, fields, { clock, at, host = "localhost", ip = "203.0.113.7", extra = {}, raw } = {}) {
  const now = at ?? clock.now;
  const t0 = now - 10_000;
  const body = raw ?? JSON.stringify({ ...fields, turnstile: "XXXX.DUMMY.TOKEN.XXXX", fui_hp: "", t0, t1: now, ...extra });
  const req = new Request(`http://${host}:8788/api/feedback`, { method: "POST", headers: { "content-type": "application/json", "cf-connecting-ip": ip }, body });
  const res = await handlePost(req, env, { fetchFn: services.fetchFn, now: () => now, areas: AREAS });
  const text = await res.text();
  return { status: res.status, text, data: JSON.parse(text), headers: res.headers };
}

const newClock = () => ({ now: Date.UTC(2026, 9, 5, 12, 0, 0) });

// Nothing a player gets back may name the repo, link an issue, or hold the token.
function assertNoLeak(text) {
  assert.ok(!/github|https?:|owner\/|private-feedback|html_url|number/i.test(text), `response leaks: ${text}`);
  assert.ok(!text.includes(SECRET_TOKEN));
}

test("a bug report creates one issue with the bug labels and returns only a reference", async () => {
  const clock = newClock();
  const env = testEnv(clock);
  const s = mockServices();
  const r = await send(env, s, bugFields(), { clock });
  assert.equal(r.status, 200, r.text);
  assert.match(r.data.reference, /^VG-[A-HJ-NP-Z2-9]{6}$/);
  assert.deepEqual(Object.keys(r.data).sort(), ["duplicate", "reference"]);
  assert.equal(r.data.duplicate, false);
  assertNoLeak(r.text);
  assert.equal(s.issues.length, 1);
  assert.deepEqual(s.issues[0].labels, ["bug", "from-site"]);
  assert.equal(refIn(s.issues[0].body), r.data.reference);
  assert.ok(s.calls.filter((c) => c.url.startsWith("https://api.github.com")).every((c) => c.auth === `Bearer ${SECRET_TOKEN}`));
});

test("a feature request creates an issue with the feature labels, no search", async () => {
  const clock = newClock();
  const s = mockServices();
  const r = await send(testEnv(clock), s, featureFields(), { clock });
  assert.equal(r.status, 200, r.text);
  assert.deepEqual(s.issues[0].labels, ["feature-request", "from-site"]);
  assert.ok(!s.calls.some((c) => c.url.includes("/search/")));
});

test("two identical error reports: one issue, one comment, each with its own reference", async () => {
  const clock = newClock();
  const env = testEnv(clock);
  const s = mockServices();
  const first = await send(env, s, bugFields(), { clock });
  clock.now += 60_000;
  const second = await send(env, s, bugFields({ did: "Same thing, different player", contact_ok: true, contact: "dup@example.com" }), { clock, ip: "198.51.100.9" });
  assert.equal(first.status, 200);
  assert.equal(second.status, 200, second.text);
  assert.equal(s.issues.length, 1);
  assert.equal(s.issues[0].comments.length, 1);
  assert.ok(s.issues[0].comments[0].startsWith("Another player hit this."));
  assert.ok(!s.issues[0].comments[0].includes("dup@example.com"));
  assert.match(second.data.reference, /^VG-[A-HJ-NP-Z2-9]{6}$/);
  assert.notEqual(second.data.reference, first.data.reference, "a repeat reporter never gets the first reporter's reference");
  assert.equal(refIn(s.issues[0].body), first.data.reference);
  assert.equal(refIn(s.issues[0].comments[0]), second.data.reference);
  assert.ok(!s.issues[0].comments[0].includes(first.data.reference));
  assert.equal(second.data.duplicate, true);
  assertNoLeak(second.text);
});

test("dedupe falls back to search when KV has no fingerprint (index found it)", async () => {
  const clock = newClock();
  const env = testEnv(clock);
  const s = mockServices();
  await send(env, s, bugFields(), { clock });
  for (const k of [...env.FEEDBACK_KV.map.keys()]) if (k.startsWith("fp:")) env.FEEDBACK_KV.map.delete(k);
  const again = await send(env, s, bugFields(), { clock, ip: "198.51.100.10" });
  assert.equal(again.status, 200);
  assert.equal(s.issues.length, 1);
  assert.equal(s.issues[0].comments.length, 1);
  assert.ok(s.calls.some((c) => c.url.includes("/search/issues")));
});

test("a closed issue or a body that only mentions the fingerprint is not a match", async () => {
  const clock = newClock();
  const env = testEnv(clock);
  const s = mockServices();
  await send(env, s, bugFields(), { clock });
  s.issues[0].state = "closed";
  const fp = s.issues[0].body.match(/fp=([0-9a-f]{8})/)[1];
  await send(env, s, featureFields({ want: `please fix fp:${fp} and kind=bug fp=${fp} src=site` }), { clock, ip: "198.51.100.11" });
  const r = await send(env, s, bugFields(), { clock, ip: "198.51.100.12" });
  assert.equal(r.status, 200);
  assert.equal(s.issues.length, 3, "a new bug issue is filed");
  assert.equal(s.issues[1].comments.length, 0);
});

test("a bug without an error never dedupes", async () => {
  const clock = newClock();
  const env = testEnv(clock);
  const s = mockServices();
  await send(env, s, bugFields({ report: STATUS_030 }), { clock });
  await send(env, s, bugFields({ report: STATUS_030 }), { clock, ip: "198.51.100.13" });
  assert.equal(s.issues.length, 2);
  assert.ok(!s.calls.some((c) => c.url.includes("/search/")));
});

test("a failed comment on a confirmed match never creates a second issue", async () => {
  const clock = newClock();
  const env = testEnv(clock);
  const s = mockServices();
  await send(env, s, bugFields(), { clock });
  const failing = mockServices({ fail: { comment: 500 } });
  failing.issues.push(...s.issues);
  const r = await send(env, failing, bugFields(), { clock, ip: "198.51.100.14" });
  assert.equal(r.status, 503);
  assert.equal(failing.issues.length, 1);
  assertNoLeak(r.text);
});

test("a failed search (not a token problem) still files the report", async () => {
  const clock = newClock();
  const s = mockServices({ fail: { search: 500 } });
  const r = await send(testEnv(clock), s, bugFields(), { clock });
  assert.equal(r.status, 200);
  assert.equal(s.issues.length, 1);
});

test("a bad token gives a friendly 503 and leaks nothing", async () => {
  const clock = newClock();
  const s = mockServices({ fail: { create: 401, search: 401 } });
  const r = await send(testEnv(clock), s, featureFields(), { clock });
  assert.equal(r.status, 503);
  assert.equal(r.data.error, "unavailable");
  assertNoLeak(r.text);
});

test("contact is kept in KV for 90 days and never in the issue", async () => {
  const clock = newClock();
  const env = testEnv(clock);
  const s = mockServices();
  const r = await send(env, s, bugFields({ contact_ok: true, contact: "player@example.com" }), { clock });
  assert.equal(r.status, 200);
  assert.ok(!s.issues[0].body.includes("player@example.com"));
  const [key, entry] = [...env.FEEDBACK_KV.map.entries()].find(([k]) => k.startsWith("contact:"));
  assert.ok(key.startsWith(`contact:${r.data.reference}:`));
  assert.equal(JSON.parse(entry.value).contact, "player@example.com");
  assert.equal(entry.until - clock.now, 90 * 86400 * 1000);
});

test("no raw IP is stored anywhere", async () => {
  const clock = newClock();
  const env = testEnv(clock);
  const s = mockServices();
  await send(env, s, bugFields(), { clock, ip: "203.0.113.77" });
  const all = JSON.stringify([...env.FEEDBACK_KV.map.entries()]) + JSON.stringify(s.issues);
  assert.ok(!all.includes("203.0.113.77"));
});

test("honeypot, too-fast sends and missing timing are refused as spam", async () => {
  const clock = newClock();
  const env = testEnv(clock);
  const s = mockServices();
  assert.equal((await send(env, s, bugFields(), { clock, extra: { fui_hp: "http://spam" } })).data.error, "spam");
  assert.equal((await send(env, s, bugFields(), { clock, extra: { t0: clock.now - 1000 } })).data.error, "spam");
  assert.equal((await send(env, s, bugFields(), { clock, extra: { t0: undefined } })).data.error, "spam");
  assert.equal(s.issues.length, 0);
});

test("bad requests: not JSON, too big, or carrying a screenshot", async () => {
  const clock = newClock();
  const env = testEnv(clock);
  const s = mockServices();
  assert.equal((await send(env, s, {}, { clock, raw: "title=x" })).status, 400);
  assert.equal((await send(env, s, bugFields({ report: "x".repeat(70_000) }), { clock })).data.error, "bad_request");
  assert.equal((await send(env, s, bugFields({ screenshot: "data:image/png;base64,AAAA" }), { clock })).data.error, "bad_request");
  const invalid = await send(env, s, bugFields({ happened: "" }), { clock });
  assert.equal(invalid.status, 400);
  assert.ok(invalid.data.fields.happened);
  assert.equal(s.issues.length, 0);
});

test("a bad Turnstile token writes nothing to KV: no rate slots, fingerprint or contact", async () => {
  const clock = newClock();
  const env = testEnv(clock);
  const writes = [];
  const kv = env.FEEDBACK_KV;
  const put = kv.put.bind(kv);
  kv.put = async (key, ...rest) => { writes.push(key); return put(key, ...rest); };
  const s = mockServices({ turnstile: false });
  const r = await send(env, s, bugFields({ contact_ok: true, contact: "player@example.com" }), { clock });
  assert.equal(r.status, 403);
  assert.deepEqual(writes, [], "no KV writes at all");
  assert.deepEqual([...kv.map.keys()], [], "KV is still empty");
  assert.equal(s.issues.length, 0);
});

test("a failed Turnstile check is refused before GitHub is called", async () => {
  const clock = newClock();
  const s = mockServices({ turnstile: false });
  const r = await send(testEnv(clock), s, bugFields(), { clock });
  assert.equal(r.status, 403);
  assert.equal(r.data.error, "turnstile");
  assert.ok(!s.calls.some((c) => c.url.startsWith("https://api.github.com")));
});

test("60 new issues a day for everyone, then 429", async () => {
  const clock = newClock();
  const env = testEnv(clock);
  const s = mockServices();
  for (let i = 0; i < 60; i++) assert.equal((await send(env, s, featureFields(), { clock, at: clock.now + i, ip: `198.51.100.${i}` })).status, 200);
  assert.equal((await send(env, s, featureFields(), { clock, at: clock.now + 60, ip: "192.0.2.1" })).status, 429);
  assert.equal(s.issues.length, 60);
});

test("not configured, or test keys and the stub off localhost: GET says not accepting, POST 503", async () => {
  const clock = newClock();
  const s = mockServices();
  const missing = testEnv(clock, { GITHUB_TOKEN: "" });
  assert.equal((await send(missing, s, bugFields(), { clock })).status, 503);
  const get = await handleGet(new Request("http://localhost/api/feedback"), missing).json();
  assert.deepEqual(get, { accepting: false, sitekey: null });
  assert.ok(configProblem(testEnv(clock), "vanguard-ui.pages.dev"), "test keys refused on the live host");
  assert.equal(configProblem(testEnv(clock), "localhost"), "");
  assert.ok(configProblem(testEnv(clock, { TURNSTILE_SECRET: "real", TURNSTILE_SITEKEY: "real", GITHUB_API_URL: "http://127.0.0.1:8789" }), "vanguard-ui.pages.dev"));
  assert.equal(configProblem(testEnv(clock, { TURNSTILE_SECRET: "real", TURNSTILE_SITEKEY: "real" }), "vanguard-ui.pages.dev"), "");
  const ok = await handleGet(new Request("http://localhost/api/feedback"), testEnv(clock)).json();
  assert.deepEqual(ok, { accepting: true, sitekey: "1x00000000000000000000AA" });
});

test("the token only ever goes to api.github.com or this machine", () => {
  assert.equal(apiBase({}), "https://api.github.com");
  assert.equal(apiBase({ GITHUB_API_URL: "http://127.0.0.1:8789" }), "http://127.0.0.1:8789");
  assert.equal(apiBase({ GITHUB_API_URL: "https://evil.example" }), null);
  assert.equal(apiBase({ GITHUB_API_URL: "http://127.0.0.1.evil.example" }), null);
});

test("the local GitHub stub answers the client's calls", async () => {
  const { server, issues } = await startStub(0);
  try {
    const gh = gitHub({ base: `http://127.0.0.1:${server.address().port}`, token: "stub", repo: "local/feedback-stub" });
    const made = await gh.createIssue("t", "<!-- fui-feedback v1 kind=bug fp=0011aabb src=site -->\nbody", ["bug"]);
    assert.equal(made.number, 1);
    assert.equal((await gh.search('"fp:0011aabb" is:open')).length, 0);
    assert.equal((await gh.search('"fp=0011aabb" is:open')).length, 1);
    await gh.addComment(1, "again");
    assert.equal((await gh.getIssue(1)).comments.length, 1);
    assert.equal(issues.length, 1);
    await assert.rejects(gitHub({ base: `http://127.0.0.1:${server.address().port}`, token: "", repo: "a/b" }).getIssue(1));
  } finally {
    server.close();
  }
});

// -------------------------------------------------------------- built page

const dist = path.join(root, "dist");
const page = () => fs.readFileSync(path.join(dist, "feedback/index.html"), "utf8");

test("the /feedback/ page has the form, preview, confirmation and no file input", () => {
  const html = page();
  for (const name of ["kind", "title", "report", "no_report", "did", "expected", "happened", "want", "area", "why", "contact_ok", "contact", "public_ack", "fui_hp"]) {
    assert.ok(html.includes(`name="${name}"`), `field ${name}`);
  }
  for (const id of ["fb-form", "fb-preview", "fb-done", "fb-ref", "fb-turnstile", "fb-send"]) assert.ok(html.includes(`id="${id}"`), id);
  assert.ok(!/type="file"/.test(html), "no uploads in v1");
  assert.match(html, /<textarea id="fb-paste" rows="3" aria-describedby="fb-paste-hint fb-filled"><\/textarea>/, "the paste box, with no name so it is never sent");
  assert.ok(html.includes('id="fb-filled"'), "and its notice line");
  assert.ok(/<script type="module" src="\/assets\/feedback\.js\?v=[0-9a-f]{8}"><\/script>/.test(html));
  assert.ok(html.includes('id="bug-template"'), "the copyable templates stay for no-JS players");
  assert.ok(!/turnstile\/v0\/siteverify|GITHUB_TOKEN|FEEDBACK_REPO/.test(html));
});

test("the page's shared code is the Function's code, byte for byte", () => {
  for (const f of fs.readdirSync(path.join(root, "src/feedback"))) {
    assert.equal(fs.readFileSync(path.join(dist, "assets/feedback", f), "utf8"), fs.readFileSync(path.join(root, "src/feedback", f), "utf8"), f);
  }
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dist, "_routes.json"), "utf8")), { version: 1, include: ["/api/*"], exclude: [] });
});

test("no client file names the repository or a token", () => {
  for (const f of ["assets/feedback.js", ...fs.readdirSync(path.join(dist, "assets/feedback")).map((x) => `assets/feedback/${x}`)]) {
    const t = fs.readFileSync(path.join(dist, f), "utf8");
    assert.ok(!/wow-forever-ui|clifftaylor|GITHUB_TOKEN|github_pat|ghp_/i.test(t), f);
  }
});

// ------------------------------------------------------- hostile markdown

// Starts as ordinary text, so the fence it opens later is inside the player's text.
const HOSTILE = [
  "Ordinary words first, then a HOSTILE fence opener:",
  "```",
  "# HOSTILE heading",
  "| HOSTILE | table |",
  "|---|---|",
  "> HOSTILE quote",
  "- HOSTILE item",
  "* HOSTILE star",
  "+ HOSTILE plus",
  "1. HOSTILE numbered",
  "---",
  "HOSTILE setext",
  "===",
  "<details open><summary>HOSTILE</summary>",
  "<!-- HOSTILE hidden -->",
  "@HOSTILEuser fixes #1 and GH-2 ![HOSTILE](http://x.invalid/y.png) [HOSTILE](http://x.invalid)",
  "~~~",
  "HOSTILE after a tilde fence",
  "   ```````` HOSTILE long run",
  "    indented HOSTILE",
  "</details>",
  "````",
].join("\n");

// The lines of a markdown text that are outside fenced code blocks
// (CommonMark: a fence closes with a run of the same character at least as
// long, indented at most 3 spaces). Fails if a fence is left open.
function outsideFences(md) {
  const out = [];
  let open = null;
  for (const line of md.split("\n")) {
    if (open) {
      const close = line.match(/^ {0,3}(`{3,}|~{3,})\s*$/);
      if (close && close[1][0] === open[0] && close[1].length >= open.length) open = null;
      continue;
    }
    const start = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (start) {
      open = start[1];
      continue;
    }
    out.push(line);
  }
  assert.equal(open, null, "a fence is left open");
  return out;
}

test("block: player text is fenced as typed and can't close its fence", () => {
  const b = block(HOSTILE);
  const outside = outsideFences(b);
  assert.deepEqual(outside, [], "nothing outside the fence");
  assert.ok(b.includes("# HOSTILE heading"), "the text is kept, inside the fence");
});

test("inside a fence nothing that only looks like HTML is stripped", () => {
  assert.equal(block("a<b and c>d"), "```text\na<b and c>d\n```");
  assert.equal(block("<details><summary>x</summary>"), "```text\n<details><summary>x</summary>\n```", "real tags show as typed in a fence too");
});

// The player text the builder fenced under a section label: the label line,
// then the builder's opening fence (```…text), then its closing fence (the
// same run of backticks on its own line). Fails if the label isn't followed
// by a fence the builder opened.
function builderBlock(md, label) {
  const lines = md.split("\n");
  const at = lines.indexOf(label);
  assert.ok(at >= 0, `label ${label}`);
  const open = (lines[at + 1] || "").match(/^(`{3,})text$/);
  assert.ok(open, `${label}: the builder didn't open a fence (next line: ${JSON.stringify(lines[at + 1])})`);
  const close = lines.indexOf(open[1], at + 2);
  assert.ok(close > at, `${label}: the builder's fence is never closed`);
  return { text: lines.slice(at + 2, close).join("\n"), start: at + 1, end: close };
}

test("hostile text appears only inside the fences the builder opened", async () => {
  const bugF = readFields(bugFields({ did: HOSTILE, expected: HOSTILE, happened: HOSTILE }));
  const bug = await bugIssue(bugF, "FUI-ABCDEF");
  const feat = featureIssue(readFields(featureFields({ want: HOSTILE, why: HOSTILE })), "Raid frames", "FUI-ABCDEF");
  const comment = duplicateComment(bugF, bug.env, bug.fp, "FUI-ZZZZZZ");
  const cases = [
    ["bug", bug.body, ["**What I did**", "**What I expected**", "**What happened instead**"]],
    ["feature", feat.body, ["**What I want**", "**Why it would help**"]],
    ["comment", comment, ["**What they did**", "**What happened instead**"]],
  ];
  for (const [name, md, labels] of cases) {
    const lines = md.split("\n");
    const inside = new Set();
    for (const label of labels) {
      const b = builderBlock(md, label);
      assert.equal(b.text, HOSTILE, `${name} ${label}: the fenced text is the player's text, unchanged`);
      for (let i = b.start; i <= b.end; i++) inside.add(i);
    }
    const leaked = lines.filter((l, i) => !inside.has(i) && l.includes("HOSTILE"));
    assert.deepEqual(leaked, [], `${name}: player text outside the builder's fences`);
  }
});

test("bare URLs in one-line body values don't autolink", async () => {
  assert.equal(inline("see https://evil.example/x"), "see https:\u200b//evil.example/x");
  assert.equal(inline("www.evil.example"), "www\u200b.evil.example");
  const report = "Client WoW Forever  ·  build https://evil.example/pwn (65000)  ·  x\nVanguard 0.3.0  ·  interface 16001";
  const issue = await bugIssue(readFields(bugFields({ report })), "FUI-ABCDEF");
  const row = issue.body.split("\n").find((l) => l.startsWith("| 0.3.0 |"));
  assert.ok(row.includes("https:\u200b//evil.example/pwn (65000)"), row);
  assert.ok(!/https:\/\//.test(row), "no unbroken URL in the table");
});
test("inline: one-line values can't add code, emphasis, links or table cells", () => {
  assert.equal(inline("a|b *c* _d_ `e` [f](g) ~~h~~ \\i"), "a\\|b \\*c\\* \\_d\\_ \\`e\\` \\[f\\](g) \\~\\~h\\~\\~ \\\\i");
  assert.equal(inline("<b>x</b> @y #3"), "x @\u200by #\u200b3");
});

test("hostile text in every free-text field stays inside fences in every issue and comment", async () => {
  const bugF = readFields(bugFields({ title: `# ${HOSTILE.slice(0, 60)}`, did: HOSTILE, expected: HOSTILE, happened: HOSTILE, report: `${HOSTILE}\n${ERRORS}` }));
  const featF = readFields(featureFields({ want: HOSTILE, why: HOSTILE }));
  const bug = await bugIssue(bugF, "FUI-ABCDEF");
  const feat = featureIssue(featF, "Raid frames", "FUI-ABCDEF");
  const comment = duplicateComment(bugF, bug.env, bug.fp, "FUI-ZZZZZZ");
  for (const [name, md] of [["bug", bug.body], ["feature", feat.body], ["comment", comment]]) {
    const outside = outsideFences(md);
    const leaked = outside.filter((l) => l.includes("HOSTILE"));
    assert.deepEqual(leaked, [], `${name}: player text outside a fence`);
    assert.ok(outside.every((l) => !/^ {0,3}(#|>|\||[-*+] |\d+\. |===)/.test(l) || /^\| (Vanguard|0\.3\.0|not found)|^\|---/.test(l)), `${name}: an unexpected block marker outside fences`);
  }
  assert.ok(!/@HOSTILEuser/.test(bug.title), "mentions in the title are broken");
  assert.equal(refIn(bug.body), "FUI-ABCDEF");
  assert.equal(refIn(comment), "FUI-ZZZZZZ");
});

test("the shared builder gives the page's preview and the Function the same text", async () => {
  const clock = newClock();
  const s = mockServices();
  const fields = bugFields({ did: HOSTILE });
  const r = await send(testEnv(clock), s, fields, { clock });
  const preview = await bugIssue(readFields(fields), r.data.reference);
  assert.equal(s.issues[0].body, preview.body);
  assert.equal(s.issues[0].title, preview.title);
});

// ------------------------------------------------------------- rate caps

const slots = (env, kind) => [...env.FEEDBACK_KV.map.keys()].filter((k) => k.startsWith(`rl:${kind}:`));

test("10 sends at once from one player: no more than 5 get through", async () => {
  const clock = newClock();
  const env = testEnv(clock);
  const s = mockServices();
  // Ten requests side by side, a millisecond apart; KV calls interleave.
  const results = await Promise.all(Array.from({ length: 10 }, (_, i) => send(env, s, featureFields(), { clock, at: clock.now + i })));
  const ok = results.filter((r) => r.status === 200).length;
  assert.equal(ok, 5, results.map((r) => r.status).join(","));
  assert.ok(results.filter((r) => r.status !== 200).every((r) => r.status === 429));
  assert.equal(s.issues.length, 5);
  assert.equal(slots(env, "p").length, 5, "refused sends leave no slot behind");
});

test("10 sends at once with the same timestamp never exceed 5", async () => {
  const clock = newClock();
  const env = testEnv(clock);
  const s = mockServices();
  await send(env, s, featureFields(), { clock: { now: clock.now - 60_000 } });
  const results = await Promise.all(Array.from({ length: 10 }, () => send(env, s, featureFields(), { clock })));
  assert.ok(results.filter((r) => r.status === 200).length <= 4, results.map((r) => r.status).join(","));
});

test("5 sends in a rolling hour: the turn of the hour doesn't reset it", async () => {
  const clock = { now: Date.UTC(2026, 9, 5, 12, 59, 50) };
  const env = testEnv(clock);
  const s = mockServices();
  for (let i = 0; i < 5; i++) assert.equal((await send(env, s, featureFields(), { clock, at: clock.now + i })).status, 200);
  clock.now = Date.UTC(2026, 9, 5, 13, 0, 10);
  const sixth = await send(env, s, featureFields(), { clock });
  assert.equal(sixth.status, 429, "a fixed hourly bucket would have let this through");
  assert.equal(Number(sixth.headers.get("retry-after")), 3580, "free again when the oldest send is an hour old");
  assert.equal((await send(env, s, featureFields(), { clock, ip: "198.51.100.20" })).status, 200, "another player can still send");
  clock.now = Date.UTC(2026, 9, 5, 13, 59, 50);
  assert.equal((await send(env, s, featureFields(), { clock })).status, 200, "an hour after the first send there's room again");
  assert.equal((await send(env, s, featureFields(), { clock })).status, 429, "but only for the one that aged out");
});

test("the rolling hour holds across midnight, when the player key changes", async () => {
  const clock = { now: Date.UTC(2026, 9, 5, 23, 50, 0) };
  const env = testEnv(clock);
  const s = mockServices();
  for (let i = 0; i < 5; i++) assert.equal((await send(env, s, featureFields(), { clock, at: clock.now + i })).status, 200);
  clock.now = Date.UTC(2026, 9, 6, 0, 10, 0);
  assert.equal((await send(env, s, featureFields(), { clock })).status, 429);
});

test("a send that fails or is refused by GitHub doesn't use up the player's sends", async () => {
  const clock = newClock();
  const env = testEnv(clock);
  const down = mockServices({ fail: { create: 500 } });
  for (let i = 0; i < 6; i++) assert.equal((await send(env, down, featureFields(), { clock, at: clock.now + i })).status, 503);
  assert.deepEqual(slots(env, "p"), []);
  assert.deepEqual(slots(env, "d"), []);
  assert.equal((await send(env, mockServices(), featureFields(), { clock, at: clock.now + 10 })).status, 200);
});

test("a duplicate counts against the player but not against the day's new issues", async () => {
  const clock = newClock();
  const env = testEnv(clock);
  const s = mockServices();
  await send(env, s, bugFields(), { clock });
  await send(env, s, bugFields(), { clock, at: clock.now + 1, ip: "198.51.100.30" });
  assert.equal(s.issues.length, 1);
  assert.equal(slots(env, "d").length, 1);
  assert.equal(slots(env, "p").length, 2);
});

test("60 new issues at once from 70 players: no more than 60 get through", async () => {
  const clock = newClock();
  const env = testEnv(clock);
  const s = mockServices();
  const results = await Promise.all(Array.from({ length: 70 }, (_, i) => send(env, s, featureFields(), { clock, at: clock.now + i, ip: `198.51.100.${i}` })));
  assert.equal(results.filter((r) => r.status === 200).length, 60);
  assert.equal(s.issues.length, 60);
});

test("a request that announces a body over 64 KB is refused without reading it", async () => {
  const clock = newClock();
  const env = testEnv(clock);
  const req = new Request("http://localhost:8788/api/feedback", { method: "POST", headers: { "content-type": "application/json", "content-length": "70000", "cf-connecting-ip": "203.0.113.7" }, body: "{}" });
  const res = await handlePost(req, env, { fetchFn: mockServices().fetchFn, now: () => clock.now, areas: AREAS });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, "bad_request");
});

test("the rate caps count an IPv6 /64 as one player, and an IPv4 address as itself", async () => {
  assert.equal(playerNet("203.0.113.7"), "203.0.113.7");
  assert.equal(playerNet("::ffff:203.0.113.7"), "203.0.113.7");
  assert.equal(playerNet("2001:db8:85a3:8d3:1319:8a2e:370:7344"), "2001:db8:85a3:8d3::/64");
  assert.equal(playerNet("2001:0DB8:85a3:08d3::7344"), "2001:db8:85a3:8d3::/64");
  assert.equal(playerNet("2001:db8::1"), "2001:db8:0:0::/64");
  assert.equal(playerNet("::1"), "0:0:0:0::/64");
  const now = Date.UTC(2026, 9, 5, 12, 0, 0);
  const a = await capKeys("2001:db8:85a3:8d3:1:2:3:4", "salt", now);
  const b = await capKeys("2001:db8:85a3:8d3:ffff:ffff:ffff:ffff", "salt", now);
  const c = await capKeys("2001:db8:85a3:8d4:1:2:3:4", "salt", now);
  assert.equal(a.player, b.player);
  assert.notEqual(a.player, c.player);
});

test("the page says each of the Function's error messages itself (unavailable is its fallback), so a translation reaches the player", () => {
  const script = fs.readFileSync(path.join(root, "src/assets/feedback.js"), "utf8");
  const literals = new Set([...script.matchAll(/\btr\("((?:[^"\\]|\\.)*)"/g)].map((m) => JSON.parse(`"${m[1]}"`)));
  for (const [code, message] of Object.entries(MESSAGES)) {
    if (code === "invalid") continue;
    assert.ok(literals.has(message), `feedback.js needs tr("${message}") for ${code}`);
    if (code !== "unavailable") assert.ok(script.includes(`${code}: () => tr(`), `FAILURES answers ${code}`);
  }
  assert.ok(!/data\.message/.test(script), "the Function's English message is never shown");
});
