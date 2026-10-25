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
import { extractAddon, specReader } from "./lib/extract.mjs";
import { buildModel } from "./lib/model.mjs";
import { layout, pageHero, NAV } from "./lib/html.mjs";
import { FONTS, WOFF2_DIR } from "./lib/fonts.mjs";
import { homePage, installPage, startPage, featuresPage, commandsPage, settingsPage } from "./lib/pages-main.mjs";
import { profilesPage, helpPage, feedbackPage, changelogPage, creditsPage, supportPage, screenshotsPage } from "./lib/pages-more.mjs";
import { longerGaps } from "./lib/features-content.mjs";
import { faviconSvg } from "./lib/brand.mjs";
import { publishedLocales, siteLocale, addonTranslations, alternates } from "./lib/i18n-site.mjs";

const FEEDBACK_SHARED = ["fields.js", "sanitize.js", "report.js", "body.js", "fill.js"];

// The brand rasters shipped under /assets/ (the social preview stays in src/, for GitHub's settings).
const BRAND_RASTER = ["og-image.png", "apple-touch-icon.png", "favicon-32.png"];

const SITE_AUTHOR = "Clifton Taylor";
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
// The stamped files are the exception: a page always asks for them by their
// ?v=<hash> URL, so a copy can be kept for a year ("! Cache-Control" drops the
// no-cache from /assets/*). Fonts keep their names when `npm run fonts` remakes
// them, so they are kept for a week, not forever.
// Every page also gets the plain security headers (no CSP yet: it needs a browser pass over the
// feedback form's Turnstile frame first).
function headersFile(stamped) {
  const forever = stamped.map((f) => `${f}\n  ! Cache-Control\n  Cache-Control: public, max-age=31536000, immutable\n`).join("\n");
  return `/assets/*\n  Cache-Control: no-cache\n\n${forever}\n/fonts/*\n  Cache-Control: public, max-age=604800\n\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: DENY\n`;
}

// sitemap.xml: every page in NAV in every published language, under siteUrl from
// site.config.json. Every page is regenerated from the current release, so each
// one's lastmod is that release's date.
function sitemapXml(base, publishedAt, locales) {
  const lastmod = new Date(publishedAt).toISOString().slice(0, 10);
  const urls = locales.flatMap((l) => NAV.map((n) => alternates([l], n.path, base)[0].url)).map((url) => `  <url><loc>${url}</loc><lastmod>${lastmod}</lastmod></url>`).join("\n");
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

// The not-found page in one language. Cloudflare Pages serves the 404.html
// nearest the missing path, so /de/nothing gets the German one.
function notFoundPage(site, loc) {
  const home = `<a href="/">${loc.t("notFound.home")}</a>`;
  return layout({ path: "/404", title: loc.english ? "Not found" : loc.text("notFound.title"), description: loc.text("notFound.title"), site, loc, translated: true, body: pageHero(loc.t("notFound.title"), loc.t("notFound.lede", { home })) });
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
  const base = cfg.siteUrl.replace(/\/+$/, "");
  const site = { theme: theme.vars, author: SITE_AUTHOR, version: rel.meta.Version, hasNext: !model.same, url: base };
  const read = { rel: specReader(relReader), next: specReader(nextReader) };

  fs.rmSync(cfg.outDir, { recursive: true, force: true });
  write("assets/theme.css", theme.css);
  write("assets/favicon.svg", faviconSvg(theme.vars));
  // The crest as raster, for the places that can't take SVG or CSS: the Open Graph image, the
  // iOS home-screen icon and the PNG favicon fallback (src/assets/brand/, made from the crest).
  for (const f of BRAND_RASTER) write(`assets/${f}`, fs.readFileSync(path.join(root, "src/assets/brand", f)));
  // The screenshots (webp, cropped and blurred where a player's name was in frame).
  for (const f of fs.readdirSync(path.join(root, "src/assets/shots"))) write(`assets/shots/${f}`, fs.readFileSync(path.join(root, "src/assets/shots", f)));
  const locales = publishedLocales(cfg.locales);
  write("sitemap.xml", sitemapXml(base, release.publishedAt, locales));
  write("robots.txt", robotsTxt(base));
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
  write("_headers", headersFile(Object.keys(site.assets)));

  const readers = [relReader, nextReader];
  let pages = [];
  for (const locale of locales) {
    const loc = siteLocale(locale, addonTranslations(readers, locale.addon));
    pages = [
      homePage(model), installPage(model), startPage(model, read), featuresPage(model, loc), screenshotsPage(model), commandsPage(model, loc), settingsPage(model, read, loc),
      profilesPage(model, read), helpPage(model, read), feedbackPage(model, read), changelogPage(model), creditsPage(model, site), supportPage(),
    ];
    for (const p of pages) write(path.join(loc.prefix, p.path, "index.html"), layout({ ...p, site, loc, alts: alternates(locales, p.path, base) }));
    write(path.join(loc.prefix, "404.html"), notFoundPage(site, loc));
  }

  const data = {
    source: { release: release.tag, releaseCommit: rel.commit, nextCommit: next.commit },
    release: { tag: release.tag, publishedAt: release.publishedAt },
    commands: model.commands.entries.map((e) => ({ id: e.id, keys: e.keys, inRelease: e.inRel, inNext: e.inNext, release: e.relLines?.map((l) => l.line) || null, next: e.nextLines?.map((l) => l.line) || null })),
    modules: model.modules.map((m) => ({ key: m.key, name: m.name, description: m.desc, inRelease: m.inRel, inNext: m.inNext })),
    settings: model.pages.map((p) => ({ key: p.key, title: p.title, inRelease: p.inRel, inNext: p.inNext, rows: p.rows.map((r) => ({ kind: r.kind, caption: r.caption, reload: r.reload, inRelease: r.inRel, inNext: r.inNext, releaseDefault: r.relDefault, nextDefault: r.nextDefault })) })),
  };
  write("site-data.json", JSON.stringify(data, null, 1));
  const nCmd = new Set([...model.commands.relKeys, ...model.commands.nextKeys]).size;
  console.log(`built ${pages.length} pages${locales.length > 1 ? ` in ${locales.length} languages (${locales.map((l) => l.code).join(", ")})` : ""} into ${path.relative(process.cwd(), cfg.outDir)}/ · release ${release.tag} (${rel.commit.slice(0, 7)}) · next ${next.commit.slice(0, 7)} · ${nCmd} command words · ${model.modules.length} modules · ${model.pages.length} options pages`);
}

main();
