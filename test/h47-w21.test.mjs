// H47 wave 21: the website's UI bugs. Reads the sources (src/) and the built pages (dist/).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../scripts/lib/config.mjs";

const dist = loadConfig().outDir;
const src = (f) => fs.readFileSync(fileURLToPath(new URL(`../src/assets/${f}`, import.meta.url)), "utf8");

test("H47-21-1: a linked Settings row lands below the page's sticky heading", () => {
  assert.match(src("site.css"), /@media \(min-width: 900px\) \{[^@]*\.opt-page \.opt-row\[id\] \{ scroll-margin-top: 48px; \}/);
});

test("H47-21-104: a folded card's summary fills the card so names on a row line up", () => {
  const css = src("site.css");
  assert.match(css, /\.dis-grid > details\.disclosure:not\(\[open\]\) \{ display: flex; flex-direction: column; \}/);
  assert.match(css, /\.dis-grid > details\.disclosure:not\(\[open\]\) > summary \{ flex: 1; \}/);
});

test("H47-21-105: the sidebar leaves room on its left for the focus ring of its links", () => {
  assert.match(src("site.css"), /\.sidebar \{ position: sticky;[^}]*overflow-y: auto; padding: var\(--sp-5\) var\(--sp-3\) var\(--sp-5\) 4px;/);
});
