// Vanguard's crest: the painted shield (a navy field, a brass rim, a large gold V) that the addon
// shows as its icon (the addon's `art/painted/icon/C2.png`, made by Cliff Hearthvale with
// Leonardo.ai). The site ships it as rasters in `src/assets/brand/`: `crest.webp` (198 x 255) for
// the header mark and the Home hero, and the favicons, the Open Graph card and the press PNG made
// from the same picture.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BRAND = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../src/assets/brand");

// The crest picture's pixel size, so the browser reserves its box before it loads.
const CREST = { src: "/assets/crest.webp", w: 198, h: 255 };

// The crest as an <img>. Decorative (empty alt) unless `label` names it.
export function crestImg({ cls = "crest", label = "" } = {}) {
  return `<img class="${cls}" src="${CREST.src}" width="${CREST.w}" height="${CREST.h}" alt="${label}" decoding="async">`;
}

// The SVG favicon: the crest picture inside an SVG, so browsers that prefer an SVG icon get the
// same mark as the PNG fallback.
export function faviconSvg() {
  const data = fs.readFileSync(path.join(BRAND, "crest.webp")).toString("base64");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CREST.h} ${CREST.h}"><image x="${(CREST.h - CREST.w) / 2}" y="0" width="${CREST.w}" height="${CREST.h}" href="data:image/webp;base64,${data}"/></svg>\n`;
}
