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

test("H47-21-2: an emptied search box drops its old results, and Enter and Down act only on a shown list", () => {
  const js = src("site.js");
  assert.ok(js.includes('if (!q) { list.replaceChildren(); note.textContent = ""; '), "the list is cleared with the query");
  assert.ok(js.includes("var first = box.hidden ? null : links()[0];"), "Enter needs a shown list");
  assert.ok(js.includes('e.key === "ArrowDown" && all.length && !box.hidden'), "Down needs a shown list");
});

test("H47-21-3: tabbing out of the site search closes its result box", () => {
  assert.ok(src("site.js").includes('form.addEventListener("focusout", function (e) { if (e.relatedTarget && !form.contains(e.relatedTarget)) setShown(false); });'));
});

test("H47-21-7: the site search says how many results it found, and tells assistive tech when its box is open", () => {
  const js = src("site.js");
  assert.ok(js.includes('say("results", "Results: {n}", { n: hits.length })'));
  assert.ok(js.includes('note.classList.toggle("visually-hidden", hits.length > 0)'), "the count is for screen readers only");
  assert.ok(js.includes('input.setAttribute("aria-expanded"'));
  const page = fs.readFileSync(path.join(dist, "settings/index.html"), "utf8");
  assert.match(page, /<input id="ss-head" type="search" aria-controls="ss-box-head" aria-expanded="false"/);
  assert.ok(page.includes('<div class="ss-results" id="ss-box-head" hidden>'));
});
test("H47-21-103: a next-release-only search result carries the Next release badge in its language", () => {
  const js = src("site.js");
  assert.ok(js.includes('resultItem(e, form.getAttribute("data-next"))') && js.includes('if (e.n && nextLabel)'));
  for (const [dir, word] of [["", "Next release"], ["de/", "Nächste Version"]]) {
    const page = fs.readFileSync(path.join(dist, dir, "settings/index.html"), "utf8");
    assert.match(page, /<form class="site-search ss-head"[^>]* data-next="([^"]+)"/);
    if (dir === "") assert.ok(page.includes(`data-next="${word}"`));
  }
});