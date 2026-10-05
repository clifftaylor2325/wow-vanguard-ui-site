#!/usr/bin/env node
// Builds the site into dist/ from the addon repo:
//   - the current release (latest, or FUI_RELEASE): its code is what the site
//     calls "the current release". The site hosts no zip and offers no
//     download: ForeverUI is going to be installed through CurseForge.
//   - the pinned newer source (sourceRef, or FUI_REF): what the next release
//     will hold, marked "Next release" wherever it differs
// Run `npm run fetch` first (npm run build does) so .cache/ has both.
import fs from "node:fs";
import path from "node:path";
import { loadConfig, root } from "./lib/config.mjs";
import { gitReader } from "./lib/source.mjs";
import { extractAddon } from "./lib/extract.mjs";
import { buildModel } from "./lib/model.mjs";
import { layout } from "./lib/html.mjs";
import { homePage, installPage, startPage, featuresPage, commandsPage, settingsPage } from "./lib/pages-main.mjs";
import { profilesPage, helpPage, feedbackPage, changelogPage, creditsPage } from "./lib/pages-more.mjs";

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
  const rel = extractAddon(relReader);
  const next = extractAddon(nextReader);
  need(`v${rel.meta.Version}` === release.tag, `release ${release.tag} has TOC version ${rel.meta.Version}`);
  const model = buildModel({ rel, next, release, releases: meta });
  const theme = themeCss(next.theme);
  const site = { theme: theme.vars, author: rel.meta.Author, version: rel.meta.Version, licenseName: rel.meta["X-License"] || "MIT" };
  const read = { rel: relReader.read, next: nextReader.read };

  fs.rmSync(cfg.outDir, { recursive: true, force: true });
  write("assets/theme.css", theme.css);
  for (const f of ["site.css", "site.js"]) write(`assets/${f}`, fs.readFileSync(path.join(root, "src/assets", f)));
  for (const f of ["FiraSansCondensed-Medium.ttf", "FiraSansCondensed-SemiBold.ttf", "OFL.txt"]) write(`fonts/${f}`, relReader.readBuffer(`Media/Fonts/${f}`));

  const pages = [
    homePage(model), installPage(model), startPage(model), featuresPage(model), commandsPage(model), settingsPage(model, read),
    profilesPage(model, read), helpPage(model, read), feedbackPage(model, read), changelogPage(model), creditsPage(model),
  ];
  for (const p of pages) write(path.join(p.path, "index.html"), layout({ ...p, site }));
  write("404.html", layout({ path: "/404", title: "Not found", description: "Page not found", site, body: `<h1>Page not found</h1><p>Try the <a href="/">home page</a>.</p>` }));

  const data = {
    source: { repo: cfg.addonRepo, release: release.tag, releaseCommit: rel.commit, nextCommit: next.commit },
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
