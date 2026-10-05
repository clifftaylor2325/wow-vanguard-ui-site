#!/usr/bin/env node
// Converts the addon's bundled TTF fonts (Media/Fonts at the current release)
// to WOFF2 in src/fonts/, with wawoff2 (Google's woff2 encoder compiled to
// WebAssembly, so it runs the same on every OS). The .woff2 files are
// committed; the build copies them into dist/fonts/ next to the TTFs.
// Run `npm run fetch` first, then whenever the addon's fonts change:
//   npm run fonts
import fs from "node:fs";
import path from "node:path";
import { compress } from "wawoff2";
import { loadConfig, root } from "./lib/config.mjs";
import { gitReader } from "./lib/source.mjs";
import { FONTS, WOFF2_DIR } from "./lib/fonts.mjs";

const cfg = loadConfig();
if (!fs.existsSync(cfg.releaseJson) || !fs.existsSync(path.join(cfg.sourcePath, ".git"))) {
  console.error("fonts: no addon source or release metadata; run `npm run fetch` first");
  process.exit(1);
}
const tag = JSON.parse(fs.readFileSync(cfg.releaseJson, "utf8")).current;
const reader = gitReader(cfg.sourcePath, tag);
const outDir = path.join(root, WOFF2_DIR);
fs.mkdirSync(outDir, { recursive: true });
for (const name of FONTS) {
  const ttf = reader.readBuffer(`Media/Fonts/${name}.ttf`);
  const woff2 = Buffer.from(await compress(ttf));
  fs.writeFileSync(path.join(outDir, `${name}.woff2`), woff2);
  console.log(`${name}: ttf ${ttf.length} bytes -> woff2 ${woff2.length} bytes (${Math.round((woff2.length / ttf.length) * 100)}%) · from ${tag}`);
}
