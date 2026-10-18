// Drift guard: the generated site must cover everything the addon's Lua
// defines, in both the current release and the newer source.
// Run after a build (`npm run check` does both). The extraction here is
// deliberately separate from the build's, so a parser bug can't hide itself.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { loadConfig, root } from "../scripts/lib/config.mjs";
import { CURSEFORGE_URL, WAGO_URL, esc, NAV, COPYRIGHT, SUPPORT, supportOn, supportLine } from "../scripts/lib/html.mjs";
import { helpPage, licenseSummary } from "../scripts/lib/pages-more.mjs";
import { FACTS, SECTIONS } from "../scripts/lib/help-content.mjs";
import { NEXT_RELEASE } from "../scripts/lib/changelog-content.mjs";
import { featuresPage, startsOff } from "../scripts/lib/pages-main.mjs";
import { MORE } from "../scripts/lib/features-content.mjs";
import { gitReader } from "../scripts/lib/source.mjs";
import { extractAddon } from "../scripts/lib/extract.mjs";
import { buildModel } from "../scripts/lib/model.mjs";
import { repoTextFiles, scanFiles } from "../scripts/lib/encoding.mjs";

const cfg = loadConfig();
if (!fs.existsSync(path.join(cfg.sourcePath, ".git"))) {
  throw new Error(`No addon checkout at ${cfg.sourcePath}: run \`npm run build\` first, with the same FUI_SRC as here.`);
}
const dist = cfg.outDir;
const page = (p) => fs.readFileSync(path.join(dist, p, "index.html"), "utf8");
const meta = JSON.parse(fs.readFileSync(cfg.releaseJson, "utf8"));
const refs = { release: meta.current, next: cfg.sourceRef };

// A file of the addon at a ref (empty string when missing).
function show(ref, file) {
  try {
    return execFileSync("git", ["show", `${ref}:${file}`], { cwd: cfg.sourcePath, maxBuffer: 64 << 20, stdio: ["ignore", "pipe", "ignore"] }).toString();
  } catch {
    return "";
  }
}

// The keys of `local COMMANDS = { ... }` in Core/Slash.lua.
function commandKeys(ref) {
  const lua = show(ref, "Core/Slash.lua");
  const block = lua.slice(lua.indexOf("local COMMANDS = {"), lua.indexOf("\n}\n", lua.indexOf("local COMMANDS = {")));
  return [...block.matchAll(/^\s{2}([a-z]+)\s*=/gm)].map((m) => m[1]);
}

// Module names: ns.Module("X") in every Lua file, plus O.MODULE_INFO keys.
function moduleKeys(ref) {
  const files = execFileSync("git", ["ls-tree", "-r", "--name-only", ref], { cwd: cfg.sourcePath }).toString().split("\n").filter((f) => /^(Core|Modules)\/.*\.lua$/.test(f));
  const names = new Set();
  for (const f of files) for (const m of show(ref, f).matchAll(/ns\.Module\("(\w+)"/g)) names.add(m[1]);
  const opts = show(ref, "Core/Options.lua");
  const at = opts.indexOf("O.MODULE_INFO = {");
  if (at >= 0) for (const m of opts.slice(at, opts.indexOf("\n}\n", at)).matchAll(/^\s{2}(\w+)\s*=\s*\{/gm)) names.add(m[1]);
  return [...names];
}

// Options page titles: Core/Options.lua PAGES entries and every AddPage call.
function pageTitles(ref) {
  const files = execFileSync("git", ["ls-tree", "-r", "--name-only", ref], { cwd: cfg.sourcePath }).toString().split("\n").filter((f) => /^(Core|Modules)\/.*\.lua$/.test(f));
  const titles = new Set();
  for (const f of files) {
    const lua = show(ref, f);
    // A table column ({ key, title, width, ... }, the auction tables) isn't a page.
    for (const m of lua.matchAll(/\{\s*key\s*=\s*[^,]+,\s*title\s*=\s*"([^"]+)"(?!\s*,\s*width\s*=)/g)) titles.add(m[1]);
    for (const m of lua.matchAll(/AddPage\(\{[\s\S]*?title\s*=\s*"([^"]+)"/g)) titles.add(m[1]);
  }
  return [...titles];
}

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');

test("dist/ exists (run npm run build first)", () => {
  assert.ok(fs.existsSync(path.join(dist, "index.html")), "dist/index.html missing: run `npm run build`");
});

for (const [label, ref] of Object.entries(refs)) {
  test(`every slash command in ${label} (${ref.slice(0, 9)}) is on the Commands page`, () => {
    const html = page("commands");
    const keys = commandKeys(ref);
    assert.ok(keys.length >= 10, `only ${keys.length} commands read from Core/Slash.lua`);
    const missing = keys.filter((k) => !html.includes(`id="cmd-${k}"`));
    assert.deepEqual(missing, [], `commands missing from /commands/: ${missing.join(", ")}`);
  });

  test(`every help line in ${label} is quoted verbatim on the Commands page`, () => {
    const html = decode(page("commands").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
    const lua = show(ref, "Core/Slash.lua");
    const block = lua.slice(lua.indexOf("local HELP = {"), lua.indexOf("\n}\n", lua.indexOf("local HELP = {")));
    const lines = [...block.matchAll(/^\s+"((?:[^"\\]|\\.)*)",?$/gm)].map((m) => m[1]);
    const missing = lines.slice(1).filter((l) => {
      const [syntax, text] = l.split(/\s{2,}(?=\S)/);
      return !html.includes(`/vg ${syntax.replace(/\s+/g, " ")}`) || (text && !html.includes(text.replace(/\s+/g, " ")));
    });
    assert.deepEqual(missing, [], `help lines not on /commands/: ${missing.join(" || ")}`);
  });

  test(`every module in ${label} has a section on the Features page`, () => {
    const html = page("features");
    const keys = moduleKeys(ref);
    assert.ok(keys.length >= 10, `only ${keys.length} modules read`);
    const missing = keys.filter((k) => !html.includes(`data-module="${k}"`));
    assert.deepEqual(missing, [], `modules missing from /features/: ${missing.join(", ")}`);
  });

  test(`every options page in ${label} is on the Settings page`, () => {
    const html = decode(page("settings"));
    const missing = pageTitles(ref).filter((t) => !new RegExp(`<h2 id="[^"]+">${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(html));
    assert.deepEqual(missing, [], `options pages missing from /settings/: ${missing.join(", ")}`);
  });
}

test("the Settings page is a table with column and row headers", () => {
  const html = page("settings");
  assert.ok(/<table class="opt-table"/.test(html), "/settings/ has no settings table");
  assert.ok(/<th scope="col">Setting<\/th>/.test(html), "/settings/ tables need <th scope=\"col\"> headers");
  assert.ok(/<tr class="opt-row opt-item" id="[^"]+"[^>]*><th scope="row"/.test(html), "/settings/ rows need an id and a <th scope=\"row\"> caption");
});

test("the Settings page quotes what a Reload button built in combat says", () => {
  const line = (show(refs.next, "Core/Dialog.lua").match(/ns\.Chat\("(Type \/reload in chat[^"]*)"\)/) || [])[1];
  const html = decode(page("settings"));
  if (!line) return assert.ok(!html.includes('id="reload-in-combat"'), "reload note shown but Core/Dialog.lua has no such line");
  assert.ok(html.includes(line), `/settings/ doesn't quote "${line}"`);
});

// The rows of the Commands table, as [entry id, row html], duplicates kept.
function commandRows(html) {
  const at = html.indexOf('<table class="opt-table cmd-table"');
  const table = at < 0 ? "" : html.slice(at, html.indexOf("</table>", at));
  return [...table.matchAll(/<tr class="cmd[^"]*" id="entry-([^"]+)"[\s\S]*?<\/tr>/g)].map((m) => [m[1], m[0]]);
}

// What a site-data.json command is missing from its table row ([] when nothing).
function rowGaps(c, row) {
  if (!row) return [`${c.id}: no row`];
  const text = decode(row.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
  const keys = c.keys.filter((k) => !row.includes(`id="cmd-${k}"`)).map((k) => `${c.id}: word ${k}`);
  const parts = [...(c.release || []), ...(c.next || [])].flatMap((l) => l.split(/\s{2,}(?=\S)/)).map((p) => p.replace(/\s+/g, " "));
  return [...keys, ...parts.filter((p) => !text.includes(p)).map((p) => `${c.id}: "${p}"`)];
}

// Every command in site-data.json has its own row in the Commands table, with its words and help lines.
test("the Commands table has a row for every command in site-data.json", () => {
  const html = page("commands");
  const data = JSON.parse(fs.readFileSync(path.join(dist, "site-data.json"), "utf8"));
  const rows = commandRows(html);
  assert.ok(/<th scope="col">Command<\/th>/.test(html), "the Commands table needs column headers");
  assert.ok(/<table class="opt-table cmd-table"[^>]*><caption>[^<]+<\/caption>/.test(html), "the Commands table needs a visible caption");
  assert.ok(data.commands.length >= 10, `only ${data.commands.length} commands in site-data.json`);
  const counts = data.commands.map((c) => [c.id, rows.filter(([id]) => id === String(c.id)).length]);
  assert.deepEqual(counts.filter(([, n]) => n !== 1), [], "every command needs exactly one row: [id, rows]");
  assert.equal(rows.length, data.commands.length, "the table's row count must equal the number of commands");
  assert.deepEqual(data.commands.flatMap((c) => rowGaps(c, new Map(rows).get(String(c.id)))), []);
});

test("every page links the favicon, and it is shipped", () => {
  for (const d of ["", "install", "start", "features", "commands", "settings", "profiles", "help", "feedback", "changelog", "credits", "support", "screenshots"]) {
    assert.ok(/<link rel="icon" href="\/assets\/favicon\.svg\?v=[0-9a-f]{8}" type="image\/svg\+xml">/.test(page(d)), `/${d} has no favicon link`);
  }
  assert.ok(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(fs.readFileSync(path.join(dist, "assets/favicon.svg"), "utf8")), "dist/assets/favicon.svg missing or not an SVG");
});

test("sitemap.xml lists every page under siteUrl, and robots.txt points to it", () => {
  const base = cfg.siteUrl.replace(/\/+$/, "");
  const xml = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
  const want = ["", "install", "start", "features", "commands", "settings", "profiles", "help", "feedback", "changelog", "credits", "support", "screenshots"].map((d) => `${base}/${d ? d + "/" : ""}`);
  assert.ok(/^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/.test(xml), "sitemap.xml has no urlset");
  assert.deepEqual([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort(), want.sort(), "sitemap.xml must list exactly the 13 pages");
  assert.match(fs.readFileSync(path.join(dist, "robots.txt"), "utf8"), new RegExp(`^Sitemap: ${base.replace(/[.]/g, "\\.")}/sitemap\\.xml$`, "m"));
});

// The rows of the Settings page that the search counter counts, by availability.
function countedRows(html) {
  const tags = [...html.matchAll(/<tr\b[^>]*>/g)].map((m) => m[0]).filter((t) => /\sdata-count[\s>]/.test(t));
  return { tags, avail: (...a) => tags.filter((t) => a.some((x) => t.includes(`data-avail="${x}"`))).length };
}

test("the Settings counter counts only setting rows, so it matches the header", () => {
  const html = page("settings");
  // "N settings in vX · M in the next release", or just "N settings in vX" when the pinned source is the release.
  // Greedy up to the next tag: a lazy run here let the optional next-release group match nothing, so it was never read.
  const head = html.match(/<strong>(\d+)<\/strong> settings in v[^<]*(?:<strong>(\d+)<\/strong> in the next release)?/);
  const rows = countedRows(html);
  assert.ok(head, "the header count is missing");
  assert.ok(rows.tags.every((t) => /class="opt-row opt-item"/.test(t)), "only setting rows may carry data-count (no notes or headings)");
  assert.equal(rows.avail("rel", "old"), Number(head[1]), "rows counted with next-release hidden must match the header's release count");
  assert.equal(rows.avail("rel", "next"), Number(head[2] ?? head[1]), "rows counted with v-only hidden must match the header's next-release count");
  if (!head[2]) assert.equal(rows.avail("next", "old"), 0, "with no next-release count, no row is next-release or release-only");
  assert.ok(fs.readFileSync(path.join(dist, "assets/site.js"), "utf8").includes('hasAttribute("data-count")'), "site.js must count data-count rows only");
});

test("both searches have singular and plural nouns, a no-match message and a Clear search button", () => {
  for (const [d, one, many] of [["settings", "setting", "settings"], ["commands", "command", "commands"]]) {
    assert.ok(page(d).includes(`data-noun="${many}" data-noun-one="${one}"`), `/${d} search needs data-noun and data-noun-one`);
  }
  const js = fs.readFileSync(path.join(dist, "assets/site.js"), "utf8");
  assert.ok(js.includes('"No " + noun + " match \\u201c" + query'), "site.js must show a no-match message");
  assert.match(js, /<button class="search-clear" type="button">Clear search<\/button>/, "the no-match message must render a Clear search button element");
});

test("the Settings repeat heading describes the table rows, not cards (#3)", () => {
  const html = page("settings");
  assert.ok(!html.includes("one card each"), "/settings/ still says (one card each)");
  const heads = html.match(/The rows below repeat for (each &lt;\w+&gt; from|each of) \d+ to \d+/g) || [];
  assert.ok(heads.length > 0, "/settings/ has no heading over the repeated rows");
});

test("the in-combat reload note says /reload exactly once (#3)", () => {
  const note = (page("settings").match(/<div class="notice info" id="reload-in-combat">([\s\S]*?)<\/div>/) || [])[1];
  if (!/ns\.Chat\("Type \/reload in chat/.test(show(refs.next, "Core/Dialog.lua"))) return assert.equal(note, undefined);
  assert.ok(note, "/settings/ has no in-combat reload note");
  assert.equal((note.match(/\/reload/g) || []).length, 1, "the in-combat reload note must say /reload once");
});

test("the Changelog has no badge on a next-release heading and no repo-only notes (#10)", () => {
  const html = page("changelog");
  const heads = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => m[1]).filter((h) => /next release/i.test(h.replace(/<[^>]+>/g, " ")));
  // Right after a release the pinned source is the release itself: there's no next release to show.
  const hasNext = meta.current === NEXT_RELEASE.after && NEXT_RELEASE.groups.length > 0;
  assert.ok(!hasNext || heads.length > 0, "the Changelog has no next-release heading");
  assert.ok(heads.every((h) => !/<span class="badge\b/.test(h)), `a next-release heading carries a badge: ${heads.join(" | ")}`);
  assert.ok(!/Release workflow/i.test(html), "a release note mentions the release workflow");
});

// Every file in dist/, as paths relative to it.
function distFiles(dir = dist) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? distFiles(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

test("dist contains no old author name", () => {
  const oldName = Buffer.from("clifftaylor2325", "utf8");
  const bad = distFiles().filter((f) => fs.readFileSync(f).includes(oldName)).map((f) => path.relative(dist, f));
  assert.deepEqual(bad, [], `old author name found in dist/: ${bad.join(", ")}`);
});

test("no zip is shipped and nothing offers a download", () => {
  const files = distFiles();
  const zips = files.filter((f) => /\.zip$/i.test(f)).map((f) => path.relative(dist, f));
  assert.deepEqual(zips, [], `dist/ must not contain a zip: ${zips.join(", ")}`);
  assert.ok(!fs.existsSync(path.join(dist, "download")), "dist/download/ must not exist");
  const bad = [];
  for (const f of files.filter((x) => /\.(html|js|json)$/.test(x))) {
    const t = fs.readFileSync(f, "utf8");
    const rel = path.relative(dist, f);
    for (const m of t.matchAll(/<a\b[^>]*>/g)) {
      if (/\sdownload(?=[\s>=])/.test(m[0]) || /href="[^"]*(\.zip|\/download\/)/i.test(m[0])) bad.push(`${rel}: ${m[0]}`);
    }
    if (/\/download\//.test(t)) bad.push(`${rel}: mentions /download/`);
    // The feedback form's shared code hashes error lines (Web Crypto "SHA-256") for the
    // bug fingerprint; that is not a download checksum, so assets/feedback/ is skipped.
    if (!rel.split(path.sep).join("/").startsWith("assets/feedback/") && /SHA-256|sha256|checksum/i.test(t)) bad.push(`${rel}: shows a checksum`);
  }
  assert.deepEqual(bad, [], `download links or checksums found: ${bad.join(" | ")}`);
});

test("Home and Install have the CurseForge call to action", () => {
  for (const p of ["", "install"]) {
    const html = page(p);
    if (CURSEFORGE_URL) {
      assert.ok(html.includes(`data-curseforge="live" href="${CURSEFORGE_URL}"`), `/${p} has no CurseForge link`);
      if (WAGO_URL) assert.ok(html.includes(`data-wago="live" href="${WAGO_URL}"`), `/${p} has no Wago link`);
    } else {
      assert.ok(!/data-wago=/.test(html), `/${p} shows a Wago link before CurseForge is live`);
      assert.ok(/<span class="cf-cta[^"]*" data-curseforge="soon">[\s\S]*?Coming soon on CurseForge/.test(html), `/${p} has no "Coming soon on CurseForge" badge`);
      assert.ok(!/<a\b[^>]*data-curseforge/.test(html), `/${p}: the CurseForge badge must not be a link while there's no URL`);
      assert.ok(!/curseforge\.com/i.test(html), `/${p} links to curseforge.com before CURSEFORGE_URL is set`);
    }
  }
  assert.ok(/install and update it through CurseForge/i.test(page("install")), "/install doesn't explain installing through CurseForge");
});

test("the home page decoration is hidden from screen readers and the layout section is a real screenshot", () => {
  const html = page("");
  assert.ok(/<div class="hero-art" aria-hidden="true">/.test(html), "hero decoration must be aria-hidden");
  assert.ok(/<img src="\/assets\/shots\/01-hud-overview\.webp"[^>]* alt="[^"]+"/.test(html), "the layout section shows the real screenshot, with alt text");
  assert.ok(!/class="mock"/.test(html), "no illustration standing in for a screenshot");
  const own = new RegExp(`https?://(?!vanguard-ui\\.pages\\.dev|${cfg.siteUrl.replace(/^https?:\/\//, "").replace(/\./g, "\\.")})[^"']+\\.(png|jpe?g|webp|gif|svg|woff2?|ttf|otf)`, "i");
  assert.ok(!own.test(fs.readFileSync(path.join(dist, "assets/site.css"), "utf8") + html), "no external images or fonts (the site's own Open Graph image is fine)");
});

test("every page carries its canonical URL and the Open Graph card, with the crest's image shipped", () => {
  const dirs = ["", "install", "start", "features", "commands", "settings", "profiles", "help", "feedback", "changelog", "credits", "support", "screenshots"];
  const base = cfg.siteUrl.replace(/\/+$/, "");
  for (const d of dirs) {
    const html = page(d);
    const url = `${base}/${d ? d + "/" : ""}`;
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`), `/${d} has no canonical link`);
    assert.ok(html.includes(`<meta property="og:url" content="${url}">`), `/${d} has no og:url`);
    assert.ok(/<meta property="og:title" content="[^"]+">/.test(html) && /<meta property="og:description" content="[^"]+">/.test(html), `/${d} lacks og:title or og:description`);
    assert.ok(html.includes(`<meta property="og:image" content="${base}/assets/og-image.png">`), `/${d} has no og:image`);
    assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image">'), `/${d} has no twitter:card`);
    assert.ok(html.includes('<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">'), `/${d} has no apple-touch-icon`);
    assert.ok(html.includes('<link rel="icon" href="/assets/favicon-32.png" sizes="32x32" type="image/png">'), `/${d} has no PNG favicon`);
  }
  const notFound = fs.readFileSync(path.join(dist, "404.html"), "utf8");
  assert.ok(!/rel="canonical"|property="og:/.test(notFound), "the 404 page has no canonical or Open Graph tags");
  for (const f of ["og-image.png", "apple-touch-icon.png", "favicon-32.png"]) {
    const buf = fs.readFileSync(path.join(dist, "assets", f));
    assert.ok(buf.subarray(1, 4).toString("latin1") === "PNG", `dist/assets/${f} missing or not a PNG`);
  }
});

test("the crest is the brand mark on every page and sits above the Home title", () => {
  const dirs = ["", "install", "start", "features", "commands", "settings", "profiles", "help", "feedback", "changelog", "credits", "support", "screenshots"];
  for (const d of dirs) {
    const header = page(d).match(/<header class="site-header">[\s\S]*?<\/header>/)[0];
    assert.ok(/<a class="brand" href="\/"><svg class="brand-mark" viewBox="215 115 594 870" aria-hidden="true"/.test(header), `/${d}: the header's brand mark is not the crest`);
  }
  const home = page("");
  assert.ok(/<svg class="hero-crest" viewBox="215 115 594 870" role="img" aria-label="Vanguard's crest[^"]*"/.test(home), "Home's hero has no labelled crest");
  assert.equal((home.match(/<clipPath id="vg-crest-letter">/g) || []).length, 1, "the engraved V's clip is defined once on Home");
});

test("player-facing copy describes the early release honestly", () => {
  const banned = /checked in game yet|not checked in game|nothing has been checked/i;
  const bad = distFiles()
    .filter((f) => /\.html$/.test(f))
    .filter((f) => banned.test(fs.readFileSync(f, "utf8")))
    .map((f) => path.relative(dist, f));
  assert.deepEqual(bad, [], `old unverified wording found in dist/: ${bad.join(", ")}`);
  assert.match(page(""), /Not everything has been checked in the game yet, and some features are still being polished/);
  assert.doesNotMatch(page(""), /None of this has been checked in game yet/);
});

test("pages are well formed: one h1, skip link, shared nav and footer", () => {
  const dirs = ["", "install", "start", "features", "commands", "settings", "profiles", "help", "feedback", "changelog", "credits", "support", "screenshots"];
  for (const d of dirs) {
    const html = page(d);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `/${d} needs exactly one h1`);
    assert.ok(html.includes('class="skip"'), `/${d} has no skip link`);
    assert.ok(html.includes('aria-label="Main"'), `/${d} has no main nav`);
    assert.ok(/an addon for WoW Forever/.test(html), `/${d} footer missing`);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
    assert.deepEqual(dup, [], `/${d} has duplicate ids`);
  }
});

test("internal links point at pages and anchors that exist", () => {
  const dirs = ["", "install", "start", "features", "commands", "settings", "profiles", "help", "feedback", "changelog", "credits", "support", "screenshots"];
  const ids = Object.fromEntries(dirs.map((d) => [`/${d ? d + "/" : ""}`, new Set([...page(d).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));
  const bad = [];
  for (const d of dirs) {
    for (const m of page(d).matchAll(/href="([^"]+)"/g)) {
      const href = m[1];
      if (/^https?:/.test(href)) continue;
      const [p, hash] = href.split("?")[0].split("#");
      const target = p === "" ? `/${d ? d + "/" : ""}` : p;
      if (target.startsWith("/assets/") || target.startsWith("/fonts/")) {
        if (!fs.existsSync(path.join(dist, target))) bad.push(`${d}: ${href}`);
        continue;
      }
      if (!ids[target]) bad.push(`${d}: ${href}`);
      else if (hash && !ids[target].has(hash)) bad.push(`${d}: ${href}`);
    }
  }
  assert.deepEqual(bad, [], `broken links: ${bad.join(", ")}`);
});

test("no GitHub links in the output", () => {
  const bad = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(html|css|js|json)$/.test(e.name)) {
        const t = fs.readFileSync(p, "utf8");
        if (/github\.com/i.test(t)) bad.push(`${p}: github.com link`);
      }
    }
  };
  walk(dist);
  assert.deepEqual(bad, []);
});

test("fonts: WOFF2 first with the TTF as fallback, and the committed WOFF2 files ship", () => {
  const css = fs.readFileSync(path.join(dist, "assets/site.css"), "utf8");
  const faces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);
  assert.ok(faces.length >= 2, "expected the @font-face rules");
  for (const f of faces) {
    const m = f.match(/src:\s*url\("([^"]+)\.woff2"\)\s*format\("woff2"\),\s*url\("([^"]+)\.ttf"\)\s*format\("truetype"\)/);
    assert.ok(m && m[1] === m[2], `@font-face must list WOFF2 then the same font as TTF: ${f.trim()}`);
    assert.ok(/font-display:\s*swap/.test(f), "font-display: swap must stay");
    for (const ext of ["woff2", "ttf"]) assert.ok(fs.existsSync(path.join(dist, `${m[1]}.${ext}`)), `${m[1]}.${ext} missing from dist/`);
    const woff2 = fs.readFileSync(path.join(dist, `${m[1]}.woff2`));
    assert.equal(woff2.subarray(0, 4).toString("latin1"), "wOF2", `${m[1]}.woff2 is not a WOFF2 file`);
    assert.ok(woff2.equals(fs.readFileSync(path.join(root, "src", `${m[1]}.woff2`))), `${m[1]}.woff2 in dist/ differs from src/`);
  }
});

test("every inner page and the 404 page open with the shared page hero, and the skip link comes first", () => {
  const dirs = ["", "install", "start", "features", "commands", "settings", "profiles", "help", "feedback", "changelog", "credits", "support", "screenshots"];
  for (const d of [...dirs, "404"]) {
    const html = d === "404" ? fs.readFileSync(path.join(dist, "404.html"), "utf8") : page(d);
    const body = html.slice(html.indexOf("<body"));
    const first = body.match(/<(a|button|input|select|textarea)\b[^>]*>/);
    assert.ok(first && /class="skip" href="#main"/.test(first[0]), `/${d}: the skip link must be the first focusable element`);
    assert.ok(/<main id="main"/.test(html), `/${d}: the skip link target must be the main landmark`);
    if (!d) continue;
    assert.ok(/<div class="page-hero">\s*<div class="hero-art" aria-hidden="true">[\s\S]*?<h1 class="page-title">/.test(html), `/${d}: no page hero with the h1`);
  }
});

// The help page's body built from the addon, with one fact's text cut out of
// its file (in both refs) when `cut` is given.
function helpWithout(cut) {
  const read = (ref) => (file) => {
    const text = show(ref, file) || null;
    return cut && text && file === cut[2] ? text.replace(cut[3], "") : text;
  };
  return helpPage({ version: meta.current.replace(/^v/, ""), same: true }, { rel: read(refs.release), next: read(refs.next) }).body;
}

// The FAQ entries that quote a fact.
function entriesUsing(key) {
  return SECTIONS.flatMap((s) => s.entries).filter((e) => [e.a, ...e.src].some((t) => t.includes(`{${key}}`)));
}

// The FAQ entries on the page that quote a fact; each must leave the page once
// that fact is cut from the addon.
function dropsFor(fact, full) {
  const shown = entriesUsing(fact[0]).filter((e) => full.includes(`id="${e.id}"`));
  const body = shown.length ? helpWithout(fact) : "";
  for (const e of shown) assert.ok(!body.includes(`id="${e.id}"`), `"${e.id}" still shown without ${fact[0]}`);
  return shown.map((e) => e.id);
}

// Cuts each quoted fact in turn. Returns how many FAQ entries on the page and
// how many quotes were checked that way.
function faqDrops() {
  const full = helpWithout(null);
  const hits = FACTS.map((f) => dropsFor(f, full)).filter((ids) => ids.length);
  return { entries: new Set(hits.flat()).size, quotes: hits.length };
}

// Cutting any quoted fact out of the addon must take its FAQ entries off the
// page. The minimum counts rendered FAQ entries checked this way (16 today).
test("an FAQ entry is dropped when the addon no longer has its quote", () => {
  const { entries, quotes } = faqDrops();
  assert.ok(entries >= 14, `only ${entries} FAQ entries on the page were checked`);
  assert.ok(quotes >= 25, `only ${quotes} quotes were checked`);
});

// Each published release's section on the Changelog page.
function releaseSections(html) {
  return [...html.matchAll(/<section aria-labelledby="rel-[^"]+">[\s\S]*?<\/section>/g)].map((m) => m[0]);
}

// What's coming lists next-release items; no published release's section may.
test("next-release items stay out of the current release's section", () => {
  const html = page("changelog");
  const items = NEXT_RELEASE.groups.flatMap((g) => g.items);
  const current = releaseSections(html).find((s) => s.includes("Current release"));
  assert.ok(current, "no Current release section on /changelog/");
  for (const s of releaseSections(html)) for (const i of items) assert.ok(!s.includes(esc(i.text)), `"${i.label}" is inside a release section`);
  const next = html.match(/<section class="card" aria-labelledby="next-h">[\s\S]*?<\/section>/);
  if (meta.current === NEXT_RELEASE.after) for (const i of items) assert.ok(next && next[0].includes(esc(i.text)), `"${i.label}" missing from What's coming`);
});

// Garbled characters or a byte-order mark in any text file of the repo or the built site.
test("no garbled characters or byte-order marks in the source or the built site", () => {
  const built = distFiles().filter((f) => /\.(html|js|css|xml|txt|json)$/.test(f)).map((f) => path.relative(root, f));
  const bad = scanFiles(root, [...repoTextFiles(root), ...built]);
  assert.deepEqual(bad, [], `encoding problems (see CONTRIBUTING.md):\n${bad.join("\n")}`);
});

// A planted bad file is caught, with its file and line: a BOM, a garbled line and a UTF-16 file.
test("the encoding check catches planted bad files", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "fui-encoding-"));
  fs.writeFileSync(path.join(dir, "planted.md"), Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from("fine\nshows \u0393\u00c7\u00aa and \u00c3\u00a9 here\n", "utf8")]));
  fs.writeFileSync(path.join(dir, "out-file.txt"), Buffer.from("\ufeffhello", "utf16le"));
  fs.writeFileSync(path.join(dir, "clean.mjs"), "// \u2026 \u201cquoted\u201d \u2192 \u00b7\n");
  const found = scanFiles(dir, ["planted.md", "out-file.txt", "clean.mjs"]);
  assert.deepEqual(found, ["planted.md:1: UTF-8 byte-order mark (save without BOM)", "planted.md:2: garbled characters", "out-file.txt:1: UTF-16 file (save it as UTF-8)"]);
  fs.rmSync(dir, { recursive: true, force: true });
});

// The site's model of the release and the newer source, made as the build makes it.
function siteModel() {
  const r = meta.releases.find((x) => x.tagName === meta.current);
  const rel = extractAddon(gitReader(cfg.sourcePath, meta.current));
  const next = extractAddon(gitReader(cfg.sourcePath, cfg.sourceRef));
  return buildModel({ rel, next, release: { tag: r.tagName, publishedAt: r.publishedAt }, releases: meta });
}

// One module's card in a Features page body ("" when it isn't there).
function featureCardOf(body, key) {
  return (body.match(new RegExp(`<article class="card mod" id="[^"]+" data-module="${key}"[^>]*>[\\s\\S]*?</article>`)) || [""])[0];
}

// Taking any one checked phrase out of the README must drop that module's longer text.
test("a Features paragraph drops out when its README phrase disappears", () => {
  const model = siteModel();
  const full = featuresPage(model).body;
  for (const [key, entry] of Object.entries(MORE)) {
    assert.ok(featureCardOf(full, key).includes("mod-more"), `${key} has no longer text with the full README`);
    for (const phrase of entry.check) {
      const cut = { ...model, next: { ...model.next, readme: model.next.readme.replaceAll(phrase, "") } };
      assert.ok(!featureCardOf(featuresPage(cut).body, key).includes("mod-more"), `${key} keeps its text without "${phrase}"`);
    }
  }
});

// O.MODULE_INFO in Core/Options.lua: key -> [name, one-liner], read here on its own.
function moduleInfo(ref) {
  const lua = show(ref, "Core/Options.lua");
  const at = lua.indexOf("O.MODULE_INFO = {");
  const block = lua.slice(at, lua.indexOf("\n}\n", at));
  const str = '"((?:[^"\\\\]|\\\\.)*)"';
  const rows = [...block.matchAll(new RegExp(`^\\s{2}(\\w+)\\s*=\\s*\\{\\s*${str},\\s*${str}`, "gm"))];
  return Object.fromEntries(rows.map((m) => [m[1], [m[2], m[3]].map((t) => t.replace(/\\(.)/g, "$1"))]));
}

// Each Features card quotes the addon's one-liner for that module word for word.
test("the Features one-liners match the addon word for word", () => {
  const html = page("features");
  const info = Object.entries(moduleInfo(refs.next));
  assert.ok(info.length >= 40, `only ${info.length} modules read from O.MODULE_INFO`);
  const bad = info.filter(([key, [, desc]]) => !featureCardOf(html, key).includes(`<p>${esc(desc)}</p>`)).map(([key]) => key);
  assert.deepEqual(bad, [], `one-liners not quoted verbatim: ${bad.join(", ")}`);
});

// Every Core/Modules Lua file's text at a ref, read once.
const luaTexts = new Map();
function luaFiles(ref) {
  if (!luaTexts.has(ref)) {
    const files = execFileSync("git", ["ls-tree", "-r", "--name-only", ref], { cwd: cfg.sourcePath }).toString().split("\n").filter((f) => /^(Core|Modules)\/.*\.lua$/.test(f));
    luaTexts.set(ref, files.map((f) => show(ref, f)));
  }
  return luaTexts.get(ref);
}

// A module's top-level on/off defaults from its ns.Module(...) call, read here on its own.
function moduleFlags(ref, key) {
  const lua = luaFiles(ref).find((t) => t.includes(`ns.Module("${key}"`)) || "";
  const start = lua.indexOf("defaults = {", lua.indexOf(`ns.Module("${key}"`));
  if (start < 0) return [];
  let depth = 0, i = lua.indexOf("{", start), body = "";
  do { const c = lua[i++]; depth += c === "{" ? 1 : c === "}" ? -1 : 0; body += depth === 1 && c !== "{" ? c : depth > 1 ? " " : ""; } while (depth > 0 && i < lua.length);
  return [...body.matchAll(/\b\w+\s*=\s*(true|false)\b/g)].map((m) => m[1] === "true");
}

// "Off until you switch it on" shows exactly where every switch defaults off and the addon says it starts off.
test("the Features 'Off until you switch it on' labels match the addon defaults", () => {
  const html = page("features");
  const info = moduleInfo(refs.next);
  const expected = Object.keys(info).filter((k) => { const f = moduleFlags(refs.next, k); return f.length && f.every((v) => !v) && /off until|switch it on/i.test(info[k][1]); });
  const shown = Object.keys(info).filter((k) => featureCardOf(html, k).includes("Off until you switch it on"));
  assert.ok(expected.length >= 1, "no module starts off: the defaults weren't read");
  assert.deepEqual(shown.sort(), expected.sort());
});

// A made-up module with these switch defaults, as startsOff reads it.
function offCase(defaults, desc = "Off until you switch it on.") {
  return startsOff({ key: "Made", desc }, { next: { modules: [{ name: "Made", defaults }] } });
}

// The label needs every switch off, not just one: one switch on means no label.
test("'Off until you switch it on' needs every switch off, not any", () => {
  assert.equal(offCase({ a: false, b: false, c: false }), true, "all switches off: the label must show");
  assert.equal(offCase({ a: false, b: true, c: false }), false, "one switch on: no label");
  assert.equal(offCase({ a: true, b: false }), false, "first switch on: no label");
  assert.equal(offCase({ a: false, b: false }, "Shows a frame."), false, "the addon doesn't say it starts off: no label");
  assert.equal(offCase({ size: 3 }), false, "no switches at all: no label");
});

// ---------------------------------------------------------------- The shell, the folded sections and the "show what's coming" switch

const PAGE_DIRS = ["", "install", "start", "features", "commands", "settings", "profiles", "help", "feedback", "changelog", "credits", "support", "screenshots"];
const pageHtml = (d) => fs.readFileSync(path.join(dist, d, "index.html"), "utf8");

test("the current release is the default: nothing is tagged 'In vX', and next-release parts hide behind one switch", () => {
  const js = fs.readFileSync(path.join(dist, "assets/site.js"), "utf8");
  assert.ok(js.includes('"vg-show-next"'), "site.js keeps the switch's choice as vg-show-next");
  assert.ok(js.includes('data-pref="next"') && js.includes('data-filter="next"'), "site.js must drive the sidebar switch and the search boxes' version box together");
  for (const d of PAGE_DIRS) {
    const html = pageHtml(d);
    assert.ok(!/<span class="badge rel">In v/.test(html), `/${d}: being in the current release gets no tag`);
    if (html.includes('data-avail="next"')) {
      assert.ok(html.includes('data-pref="next"') || html.includes('data-filter="next"'), `/${d} hides next-release parts, so it needs the switch that shows them`);
    }
  }
});

test("every page, Home included, has the grouped sidebar with all 13 pages, and it's the only nav", () => {
  for (const d of PAGE_DIRS) {
    const html = pageHtml(d);
    const nav = (html.match(/<nav class="nav sidebar" aria-label="Main" id="site-nav">[\s\S]*?<\/nav>/) || [])[0];
    assert.ok(nav, `/${d} needs the shared sidebar`);
    for (const n of NAV) assert.ok(nav.includes(`href="${n.path}"`), `/${d} sidebar links ${n.path}`);
    assert.equal((nav.match(/class="nav-group-h"/g) || []).length, 5, `/${d} sidebar has five groups`);
    assert.equal((html.match(/<nav\b/g) || []).length, 1, `/${d} has one nav`);
    // The header links only Home (the brand) and Support; the footer links no pages.
    const header = (html.match(/<header class="site-header">[\s\S]*?<\/header>/) || [""])[0];
    assert.deepEqual([...header.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((m) => m[1]), supportOn().length ? ["/", "/support/"] : ["/"], `/${d}: the header links only the brand and the Support page`);
    const footer = (html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/) || [""])[0];
    assert.ok(!/class="footer-links"/.test(footer), `/${d}: the footer has no page links`);
  }
});

test("folded sections start closed unless the page marks them open by default; Features and Settings start fully folded", () => {
  for (const d of PAGE_DIRS) {
    const html = pageHtml(d);
    const main = html.slice(html.indexOf('<main id="main"'), html.indexOf("</main>"));
    for (const tag of main.match(/<details class="disclosure[^>]*>/g) || []) {
      if (/\sopen\b/.test(tag)) assert.ok(/\sdata-open\b/.test(tag), `/${d}: a section open by default must say so with data-open: ${tag}`);
    }
    if (d === "features" || d === "settings") assert.ok(!/<details[^>]*\sopen\b/.test(main), `/${d} starts with every section folded`);
  }
});

test("pages load their CSS and JS by a versioned URL, and assets are revalidated", () => {
  const html = page("install");
  for (const f of ["theme.css", "site.css", "site.js"]) {
    const m = html.match(new RegExp(`"/assets/${f.replace(".", "\\.")}\\?v=([0-9a-f]{8})"`));
    assert.ok(m, `/install/ must load /assets/${f}?v=<hash>`);
    const want = crypto.createHash("sha256").update(fs.readFileSync(path.join(dist, "assets", f))).digest("hex").slice(0, 8);
    assert.equal(m[1], want, `${f}'s version must be the hash of the built file`);
  }
  assert.match(fs.readFileSync(path.join(dist, "_headers"), "utf8"), /^\/assets\/\*\n  Cache-Control: no-cache\n/);
  assert.match(fs.readFileSync(path.join(dist, "_headers"), "utf8"), /\n\/\*\n(  [A-Za-z-]+: .+\n)*  X-Content-Type-Options: nosniff\n/);
});

// The addon's license as the footer and Credits page say it: MIT (v0.4.0 and before) or all rights reserved.
test("the footer says all rights reserved; Credits names each release's own license", () => {
  for (const d of PAGE_DIRS) {
    const footer = (pageHtml(d).match(/<footer class="site-footer">[\s\S]*?<\/footer>/) || [""])[0];
    assert.ok(footer.includes(COPYRIGHT), `/${d}: the footer carries the copyright line`);
    assert.ok(!/Code under the|MIT/.test(footer), `/${d}: the footer names no code license`);
  }
  assert.deepEqual(licenseSummary("MIT License\n\nCopyright (c) 2026 Clifton Taylor\n\nPermission is hereby granted"), { head: "MIT License", line: "Copyright (c) 2026 Clifton Taylor", released: "released under the MIT License" });
  assert.deepEqual(licenseSummary("Copyright (c) 2026 Clifton Taylor. All rights reserved.\n\nVanguard, an addon for World of Warcraft, and"), { head: "Copyright (c) 2026 Clifton Taylor. All rights reserved.", line: "", released: "" });
  const credits = page("credits");
  assert.ok(/<strong>(MIT License|Copyright \(c\) [^<]*All rights reserved\.)<\/strong>/.test(credits), "the Credits page names the current release's license");
});

test("support links render only once a URL is set, and only https ones", () => {
  const fake = [
    { name: "Patreon", url: "https://www.patreon.com/example", what: "a monthly pledge" },
    { name: "Ko-fi", url: "https://ko-fi.com/a\"b", what: "a one-off tip" },
    { name: "Plain", url: "http://example.com", what: "no https" },
    { name: "Empty", url: null, what: "not set" },
  ];
  assert.deepEqual(supportOn(fake).map((l) => l.name), ["Patreon", "Ko-fi"]);
  const line = supportLine(fake);
  assert.ok(line.includes('href="https://www.patreon.com/example"') && line.includes(">Patreon</a>"), "Patreon renders as a link");
  assert.ok(line.includes('href="https://ko-fi.com/a&quot;b"'), "URLs are escaped");
  assert.ok(!/Plain|Empty/.test(line), "links without an https URL stay out");
  assert.equal(supportLine(fake.slice(2)), "", "no line at all when nothing is switched on");
  const on = supportOn(SUPPORT).length > 0;
  for (const d of PAGE_DIRS) {
    const html = pageHtml(d);
    const footer = (html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/) || [""])[0];
    assert.equal(/class="support"/.test(footer), on, `/${d}: the footer's support line shows exactly when a support URL is set`);
    assert.ok(!/class="support"/.test(html.replace(footer, "")), `/${d}: the support line is only in the footer`);
    if (!on) assert.ok(!/patreon\.com|ko-fi\.com/i.test(html), `/${d} links to a donation site before its URL is set`);
  }
  assert.equal(/id="support"/.test(page("credits")), on, "Credits has a Support section exactly when a support URL is set");
});

test("every page has its own search title and description, and Home carries SoftwareApplication data without ratings", () => {
  const dirs = ["", "install", "start", "features", "commands", "settings", "profiles", "help", "feedback", "changelog", "credits", "support", "screenshots"];
  const titles = new Set(), descs = new Set();
  for (const d of dirs) {
    const html = page(d);
    const title = html.match(/<title>([^<]+)<\/title>/)[1], desc = html.match(/<meta name="description" content="([^"]+)">/)[1];
    assert.ok(title.length <= 62, `/${d} title is ${title.length} characters`);
    assert.ok(!titles.has(title) && !descs.has(desc), `/${d} repeats another page's title or description`);
    titles.add(title); descs.add(desc);
    if (d) assert.ok(desc.length <= 170, `/${d} description is ${desc.length} characters`);
    assert.equal(/application\/ld\+json/.test(html), d === "", `/${d} JSON-LD only belongs on Home`);
  }
  const ld = JSON.parse(page("").match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const app = ld["@graph"].find((n) => n["@type"] === "SoftwareApplication");
  assert.equal(app.offers.price, "0");
  assert.ok(app.softwareVersion && app.url === `${cfg.siteUrl.replace(/\/+$/, "")}/`);
  assert.ok(!("aggregateRating" in app) && !("review" in app) && !("downloadUrl" in app), "no invented ratings, no download URL");
});

test("Support: a page, a header button, and one UTM-tagged Ko-fi ask each on Install, Changelog and Troubleshooting", () => {
  const on = supportOn(SUPPORT).length > 0;
  const kofi = (h) => [...h.matchAll(/href="(https:\/\/ko-fi\.com\/[^"]+)"/g)].map((m) => m[1]);
  for (const [d, campaign] of [["install", "install"], ["changelog", "changelog"], ["help", "help"], ["support", "support-page"]]) {
    const links = kofi(page(d)).filter((u) => u.includes("utm_campaign="));
    assert.deepEqual(links.map((u) => u.match(/utm_campaign=([^&"]+)/)[1]), on ? [campaign] : [], `/${d}: its Ko-fi ask`);
    assert.ok(links.every((u) => u.includes("utm_source=vanguardui&amp;utm_medium=site")), `/${d}: UTM source and medium`);
  }
  assert.ok(!/storage\.ko-fi\.com/.test(page("support")), "no Ko-fi script on the Support page");
  for (const d of ["start", "features", "commands", "settings", "profiles", "feedback", "credits"]) assert.ok(!/utm_campaign=/.test(page(d)), `/${d} carries no ask`);
  assert.equal(on, /class="support-btn" href="\/support\/"/.test(page("")), "the header button shows exactly when Ko-fi is on");
});

test("/feedback/: the copyable bug template only sends players to chat for errors when /vg errors does not exist", () => {
  const h = page("feedback");
  const hasErrors = /Type <code>\/vg errors<\/code>/.test(h);
  assert.equal(/failed to load/.test(h.slice(h.indexOf("Vanguard bug report"))), !hasErrors, "template and steps agree about /vg errors");
});

test("a page footer does not claim in-game testing the addon's own notes deny", () => {
  assert.doesNotMatch(page(""), /have been tested in game/i);
});
