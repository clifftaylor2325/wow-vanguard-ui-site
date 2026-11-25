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
