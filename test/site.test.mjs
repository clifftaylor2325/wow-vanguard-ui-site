// Drift guard: the generated site must cover everything the addon's Lua
// defines, in both the current release and the newer source.
// Run after a build (`npm run check` does both). The extraction here is
// deliberately separate from the build's, so a parser bug can't hide itself.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { loadConfig } from "../scripts/lib/config.mjs";
import { CURSEFORGE_URL } from "../scripts/lib/html.mjs";

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

test("both searches have singular and plural nouns and a no-match message", () => {
  for (const [d, one, many] of [["settings", "setting", "settings"], ["commands", "command", "commands"]]) {
    assert.ok(page(d).includes(`data-noun="${many}" data-noun-one="${one}"`), `/${d} search needs data-noun and data-noun-one`);
  }
  const js = fs.readFileSync(path.join(dist, "assets/site.js"), "utf8");
  assert.ok(js.includes('"No " + noun + " match \\u201c" + query') && js.includes("Clear search"), "site.js must show a no-match message with a Clear search button");
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
    if (/SHA-256|sha256|checksum/i.test(t)) bad.push(`${rel}: shows a checksum`);
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
