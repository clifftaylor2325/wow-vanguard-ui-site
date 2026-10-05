// Features page v1.1 (clifftaylor2325/wow-forever-ui#107): the longer text
// under each module. Run after a build (`npm run check` does both).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { loadConfig } from "../scripts/lib/config.mjs";
import { LONGER, MORE, longerGaps } from "../scripts/lib/features-content.mjs";

const cfg = loadConfig();

// A file of the addon at the pinned source ref (empty string when missing).
function show(file) {
  try {
    return execFileSync("git", ["show", `${cfg.sourceRef}:${file}`], { cwd: cfg.sourcePath, maxBuffer: 64 << 20, stdio: ["ignore", "pipe", "ignore"] }).toString();
  } catch {
    return "";
  }
}

const decode = (s) => s.replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const html = fs.readFileSync(path.join(cfg.outDir, "features", "index.html"), "utf8");
const all = Object.entries(LONGER).flatMap(([key, list]) => list.map((x) => [key, x]));

test("the README still has every phrase the longer text is written from", () => {
  const readme = show("README.md");
  assert.ok(readme.length > 1000, "no README at the source ref");
  assert.deepEqual(longerGaps(readme), []);
});

test("a sentence checked against the addon's code still matches that code", () => {
  const missing = all.filter(([, x]) => x.code).flatMap(([key, x]) => {
    const lua = show(x.code.file);
    return x.code.has.filter((h) => !lua.includes(h)).map((h) => `${key} (${x.code.file}): ${h}`);
  });
  assert.deepEqual(missing, []);
});

test("every longer sentence has one kind of source: README phrases or addon code", () => {
  for (const [key, x] of all) assert.ok(Boolean(x.readme && x.readme.length) !== Boolean(x.code && x.code.has.length), `${key}: ${x.s}`);
});

test("every module card on /features/ shows 2 to 4 longer sentences, in order", () => {
  const keys = [...html.matchAll(/data-module="(\w+)"/g)].map((m) => m[1]);
  assert.ok(keys.length >= 40, `only ${keys.length} module cards`);
  for (const key of keys) {
    const list = LONGER[key] || [];
    assert.ok(list.length >= 2 && list.length <= 4, `${key}: ${list.length} longer sentences`);
    const at = html.indexOf(`data-module="${key}"`);
    const card = html.slice(at, html.indexOf("</article>", at));
    const p = (card.match(/<p class="mod-longer">([^<]*)<\/p>/) || [])[1];
    assert.ok(p, `${key}: no longer text in its card`);
    assert.equal(decode(p), list.map((x) => x.s).join(" "));
  }
  assert.deepEqual(Object.keys(LONGER).filter((k) => !keys.includes(k)), [], "longer text for a module that has no card");
});

test("the longer text keeps the site's wording rules", () => {
  const banned = /clifftaylor2325|tested in game|checked in game|\.lua\b|\.md\b|\bAPI\b|\bLua\b|\bsecure\b|snippet|backend|\bID\b|\bnil\b|\btrue\b|\bfalse\b|override/i;
  for (const [key, x] of all) {
    assert.doesNotMatch(x.s, banned, `${key}: ${x.s}`);
    assert.match(x.s, /[.)"]$/, `${key}: a sentence ends in a full stop: ${x.s}`);
    assert.ok(!(MORE[key] && MORE[key].more.includes(x.s)), `${key}: repeats the short paragraph: ${x.s}`);
  }
});

test("parts that depend on the client say where your client has them", () => {
  for (const [key, x] of all) {
    if (/Edit Mode|key ring|own click casting/.test(x.s)) assert.match(x.s, /[Ww]here your client has/, `${key}: ${x.s}`);
  }
});
