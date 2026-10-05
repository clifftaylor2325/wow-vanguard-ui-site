// Drift guard: the generated site must cover everything the addon's Lua
// defines, in both the current release and the newer source.
// Run after a build (`npm run check` does both). The extraction here is
// deliberately separate from the build's, so a parser bug can't hide itself.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { loadConfig, root } from "../scripts/lib/config.mjs";
import { CURSEFORGE_URL, esc } from "../scripts/lib/html.mjs";
import { helpPage } from "../scripts/lib/pages-more.mjs";
import { FACTS, SECTIONS } from "../scripts/lib/help-content.mjs";
import { NEXT_RELEASE } from "../scripts/lib/changelog-content.mjs";
import { featuresPage } from "../scripts/lib/pages-main.mjs";
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
    for (const m of lua.matchAll(/\{\s*key\s*=\s*[^,]+,\s*title\s*=\s*"([^"]+)"/g)) titles.add(m[1]);
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
      return !html.includes(`/fui ${syntax.replace(/\s+/g, " ")}`) || (text && !html.includes(text.replace(/\s+/g, " ")));
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

test("every page links the favicon, and it is shipped", () => {
  for (const d of ["", "install", "start", "features", "commands", "settings", "profiles", "help", "feedback", "changelog", "credits"]) {
    assert.ok(page(d).includes('<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">'), `/${d} has no favicon link`);
  }
  assert.ok(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(fs.readFileSync(path.join(dist, "assets/favicon.svg"), "utf8")), "dist/assets/favicon.svg missing or not an SVG");
});

test("sitemap.xml lists every page under siteUrl, and robots.txt points to it", () => {
  const base = cfg.siteUrl.replace(/\/+$/, "");
  const xml = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
  const want = ["", "install", "start", "features", "commands", "settings", "profiles", "help", "feedback", "changelog", "credits"].map((d) => `${base}/${d ? d + "/" : ""}`);
  assert.ok(/^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/.test(xml), "sitemap.xml has no urlset");
  assert.deepEqual([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort(), want.sort(), "sitemap.xml must list exactly the 11 pages");
  assert.match(fs.readFileSync(path.join(dist, "robots.txt"), "utf8"), new RegExp(`^Sitemap: ${base.replace(/[.]/g, "\\.")}/sitemap\\.xml$`, "m"));
});

// The rows of the Settings page that the search counter counts, by availability.
function countedRows(html) {
  const tags = [...html.matchAll(/<tr\b[^>]*>/g)].map((m) => m[0]).filter((t) => /\sdata-count[\s>]/.test(t));
  return { tags, avail: (...a) => tags.filter((t) => a.some((x) => t.includes(`data-avail="${x}"`))).length };
}

test("the Settings counter counts only setting rows, so it matches the header", () => {
  const html = page("settings");
  const head = html.match(/<strong>(\d+)<\/strong> settings in v[^<]*<strong>(\d+)<\/strong> in the next release/);
  const rows = countedRows(html);
  assert.ok(head, "the header count is missing");
  assert.ok(rows.tags.every((t) => /class="opt-row opt-item"/.test(t)), "only setting rows may carry data-count (no notes or headings)");
  assert.equal(rows.avail("rel", "old"), Number(head[1]), "rows counted with next-release hidden must match the header's release count");
  assert.equal(rows.avail("rel", "next"), Number(head[2]), "rows counted with v-only hidden must match the header's next-release count");
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
  assert.ok(heads.length > 0, "the Changelog has no next-release heading");
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
    } else {
      assert.ok(/<span class="cf-cta[^"]*" data-curseforge="soon">[\s\S]*?Coming soon on CurseForge/.test(html), `/${p} has no "Coming soon on CurseForge" badge`);
      assert.ok(!/<a\b[^>]*data-curseforge/.test(html), `/${p}: the CurseForge badge must not be a link while there's no URL`);
      assert.ok(!/curseforge\.com/i.test(html), `/${p} links to curseforge.com before CURSEFORGE_URL is set`);
    }
  }
  assert.ok(/install and update it through CurseForge/i.test(page("install")), "/install doesn't explain installing through CurseForge");
});

test("the home page decoration is hidden from screen readers and the mock is labeled", () => {
  const html = page("");
  assert.ok(/<div class="hero-art" aria-hidden="true">/.test(html), "hero decoration must be aria-hidden");
  assert.ok(/class="mock" role="img" aria-label="Illustration, not a screenshot/.test(html), "UI mock must be labeled as an illustration");
  assert.ok(!/<img\b/.test(html), "the home page uses no images");
  assert.ok(!/https?:\/\/(?!foreverui\.pages\.dev)[^"']+\.(png|jpe?g|webp|gif|svg|woff2?|ttf|otf)/i.test(fs.readFileSync(path.join(dist, "assets/site.css"), "utf8") + html), "no external images or fonts");
});

test("player-facing copy describes the early release honestly", () => {
  const banned = /checked in game yet|not checked in game|nothing has been checked/i;
  const bad = distFiles()
    .filter((f) => /\.html$/.test(f))
    .filter((f) => banned.test(fs.readFileSync(f, "utf8")))
    .map((f) => path.relative(dist, f));
  assert.deepEqual(bad, [], `old unverified wording found in dist/: ${bad.join(", ")}`);
  assert.match(page(""), /Parts have been tested in game, and some features are still being polished/);
  assert.doesNotMatch(page(""), /None of this has been checked in game yet/);
});

test("pages are well formed: one h1, skip link, shared nav and footer", () => {
  const dirs = ["", "install", "start", "features", "commands", "settings", "profiles", "help", "feedback", "changelog", "credits"];
  for (const d of dirs) {
    const html = page(d);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `/${d} needs exactly one h1`);
    assert.ok(html.includes('class="skip"'), `/${d} has no skip link`);
    assert.ok(html.includes('aria-label="Main"'), `/${d} has no main nav`);
    assert.ok(/fan addon for WoW Forever/.test(html), `/${d} footer missing`);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
    assert.deepEqual(dup, [], `/${d} has duplicate ids`);
  }
});

test("internal links point at pages and anchors that exist", () => {
  const dirs = ["", "install", "start", "features", "commands", "settings", "profiles", "help", "feedback", "changelog", "credits"];
  const ids = Object.fromEntries(dirs.map((d) => [`/${d ? d + "/" : ""}`, new Set([...page(d).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));
  const bad = [];
  for (const d of dirs) {
    for (const m of page(d).matchAll(/href="([^"]+)"/g)) {
      const href = m[1];
      if (/^https?:/.test(href)) continue;
      const [p, hash] = href.split("#");
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

// Cutting any quoted fact out of the addon must take its FAQ entries off the page.
test("an FAQ entry is dropped when the addon no longer has its quote", () => {
  const full = helpWithout(null);
  let checked = 0;
  for (const fact of FACTS) {
    const shown = entriesUsing(fact[0]).filter((e) => full.includes(`id="${e.id}"`));
    if (!shown.length) continue;
    const body = helpWithout(fact);
    for (const e of shown) assert.ok(!body.includes(`id="${e.id}"`), `"${e.id}" still shown without ${fact[0]}`);
    checked++;
  }
  assert.ok(checked >= 25, `only ${checked} facts were checked`);
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
  return (body.match(new RegExp(`<article class="card mod" id="[^"]+" data-module="${key}">[\\s\\S]*?</article>`)) || [""])[0];
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
