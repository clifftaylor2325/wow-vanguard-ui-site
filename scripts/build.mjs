#!/usr/bin/env node
// Builds the site into dist/ from the addon repo:
//   - the current release (latest, or FUI_RELEASE): its code is what the site
//     calls "the current release". The site hosts no zip and offers no
//     download: Vanguard is going to be installed through CurseForge.
//   - the pinned newer source (sourceRef, or FUI_REF): what the next release
//     will hold, marked "Next release" wherever it differs
// Run `npm run fetch` first (npm run build does) so .cache/ has both.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { loadConfig, root } from "./lib/config.mjs";
import { gitReader } from "./lib/source.mjs";
import { extractAddon } from "./lib/extract.mjs";
import { buildModel } from "./lib/model.mjs";
import { layout, pageHero, NAV } from "./lib/html.mjs";
import { FONTS, WOFF2_DIR } from "./lib/fonts.mjs";
import { homePage, installPage, startPage, featuresPage, commandsPage, settingsPage } from "./lib/pages-main.mjs";
import { profilesPage, helpPage, feedbackPage, changelogPage, creditsPage } from "./lib/pages-more.mjs";
import { longerGaps } from "./lib/features-content.mjs";

const FEEDBACK_SHARED = ["fields.js", "sanitize.js", "report.js", "body.js"];

const SITE_AUTHOR = "Cliff Hearthvale";
const OLD_AUTHOR = "clifftaylor2325";
const publicText = (text) => String(text ?? "").replaceAll(OLD_AUTHOR, SITE_AUTHOR);
const publicAddon = (addon) => ({
  ...addon,
  meta: { ...addon.meta, Author: SITE_AUTHOR },
  readme: publicText(addon.readme),
  license: publicText(addon.license),
});

const cfg = loadConfig();

// Fails with a message that says what to run.
function need(ok, msg) {
  if (!ok) {
    console.error(`build: ${msg}`);
    process.exit(1);
  }
}

// Writes a file, making its folder.
function write(rel, data) {
  const file = path.join(cfg.outDir, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
}

// The theme CSS custom properties, from Core/Theme.lua tokens and presets.
function themeCss(theme) {
  const t = (k) => theme.tokens[k].hex;
  const vars = {
    bg: t("void"), panel: t("panel"), raised: t("raised"), divider: t("divider"),
    text: t("text"), text2: t("text2"), muted: t("muted"), accent: theme.presets.brass,
    good: t("good"), warn: t("warn"), bad: t("bad"),
  };
  const lines = Object.entries(vars).map(([k, v]) => `  --${k}: ${v};`);
  for (const k of theme.presetOrder) lines.push(`  --accent-${k}: ${theme.presets[k]};`);
  return { css: `/* Generated from Core/Theme.lua (TOKENS, PRESETS). Do not edit. */\n:root {\n${lines.join("\n")}\n}\n`, vars };
}

// The favicon: the two linked diamonds of the Vanguard mark, in the theme colors.
function faviconSvg(vars) {
  const diamond = (d, color) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.5"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="${vars.bg}"/>${diamond("M11 4 L20 16 L11 28 L2 16 Z", vars.accent)}${diamond("M21 4 L30 16 L21 28 L12 16 Z", vars.text)}</svg>\n`;
}

// The pages' asset URLs with a short hash of the built file in the query
// (/assets/site.css?v=1a2b3c4d), so a browser that kept an old copy fetches
// the new one after a deploy instead of pairing new HTML with old CSS/JS.
function stampAssets(files) {
  const hash = (rel) => crypto.createHash("sha256").update(fs.readFileSync(path.join(cfg.outDir, rel))).digest("hex").slice(0, 8);
  return Object.fromEntries(files.map((rel) => [`/${rel}`, `/${rel}?v=${hash(rel)}`]));
}

// _headers (Cloudflare Pages): browsers check back before reusing a copy of
// an asset, so files the pages load by a fixed name (the feedback form's
// modules) never stay stale either. Unchanged files still come back as 304.
function headersFile() {
  return `/assets/*\n  Cache-Control: no-cache\n`;
}

// sitemap.xml: every page in NAV, under siteUrl from site.config.json.
function sitemapXml(base) {
  const urls = NAV.map((n) => `  <url><loc>${base}${n.path}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

// robots.txt: everything may be crawled, and where the sitemap is.
function robotsTxt(base) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
}

// Release metadata (no zip: the site doesn't host one).
function loadRelease() {
  need(fs.existsSync(cfg.releaseJson), "no release metadata; run `npm run fetch` first");
  const meta = JSON.parse(fs.readFileSync(cfg.releaseJson, "utf8"));
  const rel = meta.releases.find((r) => r.tagName === meta.current);
  need(rel, `release ${meta.current} missing from the metadata; run \`npm run fetch -- --force\``);
  return { meta, release: { tag: rel.tagName, publishedAt: rel.publishedAt } };
}

// Entry point.
function main() {
  need(fs.existsSync(path.join(cfg.sourcePath, ".git")), `no addon clone at ${cfg.sourcePath}; run \`npm run fetch\` or set FUI_SRC`);
  const { meta, release } = loadRelease();
  const relReader = gitReader(cfg.sourcePath, release.tag);
  const nextReader = gitReader(cfg.sourcePath, cfg.sourceRef);
  const rel = publicAddon(extractAddon(relReader));
  const next = publicAddon(extractAddon(nextReader));
  need(`v${rel.meta.Version}` === release.tag, `release ${release.tag} has TOC version ${rel.meta.Version}`);
  const releases = { ...meta, releases: meta.releases.map((r) => ({ ...r, body: publicText(r.body) })) };
  const model = buildModel({ rel, next, release, releases });
  const gaps = longerGaps(model.next.readme);
  need(!gaps.length, `the README no longer says what the Features longer text is written from:\n  ${gaps.join("\n  ")}`);
  const theme = themeCss(next.theme);
  const site = { theme: theme.vars, author: SITE_AUTHOR, version: rel.meta.Version, hasNext: !model.same };
  const read = { rel: relReader.read, next: nextReader.read };

  fs.rmSync(cfg.outDir, { recursive: true, force: true });
  write("assets/theme.css", theme.css);
  write("assets/favicon.svg", faviconSvg(theme.vars));
  const base = cfg.siteUrl.replace(/\/+$/, "");
  write("sitemap.xml", sitemapXml(base));
  write("robots.txt", robotsTxt(base));
  write("_headers", headersFile());
  for (const f of ["site.css", "site.js", "feedback.js"]) write(`assets/${f}`, fs.readFileSync(path.join(root, "src/assets", f)));
  // The feedback form's shared code: the same files the Pages Function imports (functions/_lib/handler.js).
  for (const f of FEEDBACK_SHARED) write(`assets/feedback/${f}`, fs.readFileSync(path.join(root, "src/feedback", f)));
  // Only /api/* runs the Pages Function; every other path is a static file.
  write("_routes.json", JSON.stringify({ version: 1, include: ["/api/*"], exclude: [] }, null, 1) + "\n");
  for (const f of [...FONTS.map((n) => `${n}.ttf`), "OFL.txt"]) write(`fonts/${f}`, relReader.readBuffer(`Media/Fonts/${f}`));
  for (const n of FONTS) {
    const woff2 = path.join(root, WOFF2_DIR, `${n}.woff2`);
    need(fs.existsSync(woff2), `${WOFF2_DIR}/${n}.woff2 missing; run \`npm run fonts\``);
    write(`fonts/${n}.woff2`, fs.readFileSync(woff2));
  }

  site.assets = stampAssets(["assets/theme.css", "assets/site.css", "assets/site.js", "assets/feedback.js", "assets/favicon.svg"]);

  const pages = [
    homePage(model), installPage(model), startPage(model, read), featuresPage(model), commandsPage(model), settingsPage(model, read),
    profilesPage(model, read), helpPage(model, read), feedbackPage(model, read), changelogPage(model), creditsPage(model, site),
  ];
  for (const p of pages) write(path.join(p.path, "index.html"), layout({ ...p, site }));
  write("404.html", layout({ path: "/404", title: "Not found", description: "Page not found", site, body: pageHero("Page not found", `Try the <a href="/">home page</a>.`) }));

  const data = {
    source: { release: release.tag, releaseCommit: rel.commit, nextCommit: next.commit },
    release: { tag: release.tag, publishedAt: release.publishedAt },
    commands: model.commands.entries.map((e) => ({ id: e.id, keys: e.keys, inRelease: e.inRel, inNext: e.inNext, release: e.relLines?.map((l) => l.line) || null, next: e.nextLines?.map((l) => l.line) || null })),
    modules: model.modules.map((m) => ({ key: m.key, name: m.name, description: m.desc, inRelease: m.inRel, inNext: m.inNext })),
    settings: model.pages.map((p) => ({ key: p.key, title: p.title, inRelease: p.inRel, inNext: p.inNext, rows: p.rows.map((r) => ({ kind: r.kind, caption: r.caption, reload: r.reload, inRelease: r.inRel, inNext: r.inNext, releaseDefault: r.relDefault, nextDefault: r.nextDefault })) })),
  };
  write("site-data.json", JSON.stringify(data, null, 1));
  const nCmd = new Set([...model.commands.relKeys, ...model.commands.nextKeys]).size;
  console.log(`built ${pages.length} pages into ${path.relative(process.cwd(), cfg.outDir)}/ · release ${release.tag} (${rel.commit.slice(0, 7)}) · next ${next.commit.slice(0, 7)} · ${nCmd} command words · ${model.modules.length} modules · ${model.pages.length} options pages`);
}

main();
