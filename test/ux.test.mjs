// The desktop and mobile changes of 2026-10-28: content pages that stay open on a phone, the
// smaller screenshot copies, the Settings tags beside their caption and the drawer's Close
// button. Run after a build.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../scripts/lib/config.mjs";
import { SHOT_GROUPS } from "../scripts/lib/shots-content.mjs";
import { SMALL_SHOT_W } from "../scripts/lib/html.mjs";
import { publishedLocales } from "../scripts/lib/i18n-site.mjs";

const cfg = loadConfig();
const dist = cfg.outDir;
const SHOTS = fileURLToPath(new URL("../src/assets/shots/", import.meta.url));
const html = (p) => fs.readFileSync(path.join(dist, p, "index.html"), "utf8");
const LANG_DIRS = publishedLocales(cfg.locales).map((l) => (l.code === "en" ? "" : `${l.code}/`));
const ALL_SHOTS = SHOT_GROUPS.flatMap((g) => g.shots);

// A WebP file's width, from its VP8, VP8L or VP8X header.
function webpWidth(file) {
  const b = fs.readFileSync(file);
  const kind = b.toString("ascii", 12, 16);
  if (kind === "VP8 ") return b.readUInt16LE(26) & 0x3fff;
  if (kind === "VP8L") return 1 + (((b[22] & 0x3f) << 8) | b[21]);
  return 1 + b.readUIntLE(24, 3);
}

test("every screenshot wider than the small size has a small copy of that width, and no copy is left over", () => {
  for (const s of ALL_SHOTS.filter((x) => x.w > SMALL_SHOT_W)) {
    const small = path.join(SHOTS, `${s.file}-${SMALL_SHOT_W}w.webp`);
    assert.ok(fs.existsSync(small), `${s.file} has no ${SMALL_SHOT_W}w copy`);
    assert.equal(webpWidth(small), SMALL_SHOT_W, `${s.file}-${SMALL_SHOT_W}w.webp`);
  }
  const listed = new Set(ALL_SHOTS.map((s) => s.file));
  for (const f of fs.readdirSync(SHOTS).filter((x) => x.endsWith(`-${SMALL_SHOT_W}w.webp`))) {
    assert.ok(listed.has(f.slice(0, -`-${SMALL_SHOT_W}w.webp`.length)), `${f} belongs to no listed screenshot`);
  }
});

test("each srcset on the site names files that ship", () => {
  for (const p of ["", "screenshots", "features", "de/screenshots"]) {
    for (const [, set] of html(p).matchAll(/srcset="([^"]+)"/g)) {
      for (const url of set.split(",").map((x) => x.trim().split(/\s+/)[0])) assert.ok(fs.existsSync(path.join(dist, url)), `/${p}: ${url}`);
    }
  }
});

test("Home, Install, Getting started and Screenshots keep their sections open on a phone; reference pages fold", () => {
  const stay = (p) => (html(p).match(/<details[^>]*data-stay-open/g) || []).length;
  for (const d of LANG_DIRS) {
    assert.ok(html(d).includes('id="mock-h"') && stay(d) === 1, `/${d}: the default layout's screenshot`);
    assert.equal(stay(`${d}install`), 2, `/${d}install: the two ways to install`);
    assert.ok(stay(`${d}start`) >= 4, `/${d}start: the steps`);
    assert.equal(stay(`${d}screenshots`), SHOT_GROUPS.length, `/${d}screenshots: every group`);
    for (const p of ["commands", "settings", "help", "features", "changelog", "credits"]) assert.equal(stay(`${d}${p}`), 0, `/${d}${p}`);
  }
});

test("Settings shows a setting's reload tag beside its caption, in three columns", () => {
  const settings = html("settings");
  assert.match(settings, /<th scope="row" class="opt-cap">[^<]*<span class="badge reload"/);
  const head = settings.match(/<table class="opt-table"[^>]*><thead><tr>([\s\S]*?)<\/tr><\/thead>/)[1];
  assert.equal((head.match(/<th scope="col">/g) || []).length, 3);
});

test("the menu drawer has its own Close button in every language", () => {
  for (const d of LANG_DIRS) assert.match(html(d), /<nav class="nav sidebar"[^>]*><button class="nav-close" type="button">[^<]+<\/button>/, `/${d}`);
});
