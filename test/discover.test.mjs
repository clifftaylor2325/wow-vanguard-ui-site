// Finding things on the site: the site-wide search and its index, the page per feature area,
// and the Markdown copies with /llms.txt. Run after a build.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { loadConfig } from "../scripts/lib/config.mjs";
import { slug } from "../scripts/lib/html.mjs";
import { AREAS } from "../scripts/lib/model.mjs";
import { pageMarkdown } from "../scripts/lib/markdown.mjs";
import { publishedLocales } from "../scripts/lib/i18n-site.mjs";

const cfg = loadConfig();
const dist = cfg.outDir;
const base = cfg.siteUrl.replace(/\/+$/, "");
const html = (p) => fs.readFileSync(path.join(dist, p, "index.html"), "utf8");
const LANG_DIRS = publishedLocales(cfg.locales).map((l) => (l.code === "en" ? "" : `${l.code}/`));
const AREA_DIRS = AREAS.map(([a]) => `features/${slug(a)}`);
const ids = (h) => new Set([...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

test("a page's Markdown copy keeps its headings, lists, tables, links and code, and drops controls and hidden parts", () => {
  const main = `<section class="page-hero"><h1 class="page-title">Install</h1></section>
<details class="disclosure" open><summary><h2 id="steps">Steps</h2><span class="dis-meta">3</span></summary><div class="dis-body">
<ol class="steps"><li><strong>Unzip</strong> the file.</li><li>Type <code>/vg</code>, see <a href="/start/">Getting started</a>.</li></ol>
<table><thead><tr><th>Setting</th><th>Default</th></tr></thead><tbody><tr class="h"><th colspan="2">Look</th></tr><tr><th>Scale <span class="badge reload">Needs reload</span></th><td>1 | 2</td></tr></tbody></table>
<button class="copy">Copy</button><p hidden>secret</p><div class="search"><input></div><p>See <a href="#steps">above</a>.</p>
</div></details>`;
  const out = pageMarkdown({ title: "Install & Update", description: "How to install.", main, path: "/install/", base: "https://example.com" });
  assert.equal(out, `# Install

> How to install.

## Steps

1. **Unzip** the file.
2. Type \`/vg\`, see [Getting started](https://example.com/start/).

| Setting | Default |
| --- | --- |
| **Look** |  |
| Scale [Needs reload] | 1 \\| 2 |

See [above](https://example.com/install/#steps).

Web page: https://example.com/install/
`);
});

test("/llms.txt lists every English page's Markdown copy, and each copy ships", () => {
  const llms = fs.readFileSync(path.join(dist, "llms.txt"), "utf8");
  assert.match(llms, /^# Vanguard\n\n> \S/);
  const links = [...llms.matchAll(/\]\((https:[^)]+)\)/g)].map((m) => m[1]);
  assert.ok(links.length >= 13 + AREA_DIRS.length, "every page is listed");
  for (const url of links) {
    assert.ok(url.startsWith(`${base}/`) && url.endsWith("/index.md"), url);
    const md = fs.readFileSync(path.join(dist, url.slice(base.length)), "utf8");
    assert.match(md, /^# \S/, `${url} starts with its title`);
    assert.doesNotMatch(md, /github\.com/i, `${url} has no GitHub link`);
  }
});

test("each Markdown copy has every section heading its page has", () => {
  for (const d of ["install", "help", "settings", "features/chat"]) {
    const md = fs.readFileSync(path.join(dist, d, "index.md"), "utf8");
    for (const m of html(d).split("<main")[1].matchAll(/<h2 id="[^"]+">([^<]+)</g)) assert.ok(md.includes(`## ${m[1].replace(/&amp;/g, "&").replace(/&#39;/g, "'")}`), `${d}: ${m[1]}`);
  }
});

test("each language's search index links only to pages and anchors that exist, and holds every setting", () => {
  for (const d of LANG_DIRS) {
    const index = JSON.parse(fs.readFileSync(path.join(dist, d, "search.json"), "utf8"));
    const pages = {};
    for (const e of index) {
      assert.ok(e.t && typeof e.p === "string" && typeof e.x === "string", JSON.stringify(e));
      assert.ok(e.u.startsWith(`/${d}`), `${e.u} stays in /${d}`);
      const [p, hash] = e.u.split("#");
      pages[p] ??= ids(html(p.slice(1)));
      if (hash) assert.ok(pages[p].has(hash), `/${d}search.json: ${e.u}`);
    }
    const urls = new Set(index.map((e) => e.u));
    for (const m of html(`${d}settings`).matchAll(/<tr class="opt-row opt-item" id="([^"]+)"/g)) assert.ok(urls.has(`/${d}settings/#${m[1]}`), `/${d}search.json: setting ${m[1]}`);
  }
});

test("every page has the site search in its header and its Menu drawer, reading its language's index", () => {
  for (const d of LANG_DIRS) {
    for (const p of [d, `${d}settings`, `${d}${AREA_DIRS[0]}`]) {
      const h = html(p);
      assert.equal((h.match(/<form class="site-search ss-(head|nav)" role="search" data-index="\/[a-z-/]*search\.json"/g) || []).length, 2, `/${p}`);
      assert.ok(h.includes(`data-index="/${d}search.json"`), `/${p} reads /${d}search.json`);
    }
  }
});

test("each feature area has its own page, linked from Features, and every module is on exactly one", () => {
  for (const d of LANG_DIRS) {
    const features = html(`${d}features`);
    const seen = [];
    for (const a of AREA_DIRS) {
      assert.ok(features.includes(`href="/${d}${a}/"`), `/${d}features links /${d}${a}/`);
      const page = html(`${d}${a}`);
      assert.ok(page.includes('class="page-hero') && page.includes('<nav class="nav sidebar"'), `/${d}${a} has the hero and sidebar`);
      seen.push(...[...page.matchAll(/data-module="([^"]+)"/g)].map((m) => m[1]));
    }
    const all = [...features.matchAll(/data-module="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual([...seen].sort(), [...all].sort(), `/${d}: the area pages hold Features' modules once each`);
  }
});
