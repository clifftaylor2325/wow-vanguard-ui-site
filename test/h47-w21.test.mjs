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
test("H47-21-4: Expand all counts and toggles only the sections the reader can see", () => {
  const js = src("site.js");
  assert.ok(js.includes("d.getClientRects().length > 0"));
  assert.ok(js.includes("if (seen(all[i]) && !all[i].open) return false;"));
  assert.ok(js.includes("if (seen(all[i])) all[i].open = open;"));
});
test("H47-21-5: the open drawer also hides the skip link and the notice from Tab", () => {
  assert.match(src("site.js"), /var BEHIND_DRAWER = "\.skip, \.site-notice, /);
});
test("H47-21-6: opening the drawer focuses its first control, not the Discord link", () => {
  assert.ok(src("site.js").includes('nav.querySelector("button, input, a")'));
});
test("H47-21-102: switches and sliders built with liveMethod, direct or through a helper, list their default", () => {
  const html = fs.readFileSync(path.join(dist, "settings/index.html"), "utf8");
  const defaultOf = (name) => html.match(new RegExp(`<th scope="row" class="opt-cap">${name}[\\s\\S]*?data-label="Default">([^<]*)`))?.[1];
  assert.equal(defaultOf("Red when out of range"), "On", "liveMethod(\"ActionBars\", \"rangeTint\", ...)");
  assert.equal(defaultOf("Fade players out of range"), "On", "statusSetting(\"rangeFade\") wraps liveMethod");
  assert.equal(defaultOf("Button spacing"), "2", "a slider through liveMethod");
});

test("H47-21-101: search entries keep a setting's tip out of its title, the table heads out of snippets, and stops single", () => {
  const read = (dir) => JSON.parse(fs.readFileSync(path.join(dist, dir, "search.json"), "utf8"));
  const en = read("");
  const deck = en.find((e) => e.u === "/settings/#unit-frames-versus-deck");
  assert.equal(deck.t, "Versus deck");
  assert.match(deck.x, /^Versus deck: your frame/, "the tip leads the snippet");
  assert.ok(!en.some((e) => /^Setting Values Default/.test(e.x)), "no column heads in a section snippet");
  assert.ok(!en.some((e) => /soonThe/.test(e.x)), "a figure's text is not glued to the next");
  assert.ok(!en.find((e) => e.u === "/commands/#entry-help").x.endsWith(".."));
  assert.ok(!read("ru").some((e) => /Вкл\.\.|Выкл\.\./.test(e.x)), "no doubled stop after Вкл.");
  const zh = read("zh-cn").find((e) => /^默认：/.test(e.x));
  assert.match(zh.x, /^默认：[^.]*。$/, "Chinese labels use full-width marks");
});

test("H47-21-106: German and Italian feedback errors quote the field's label, so a label ending in the verb reads right", () => {
  const prose = (code) => JSON.parse(fs.readFileSync(fileURLToPath(new URL(`../scripts/lib/i18n-prose/${code}.json`, import.meta.url)), "utf8"));
  for (const [code, open, close] of [["de", "„", "“"], ["it", "«", "»"]]) {
    for (const key of ["{label} is required.", "{label} needs at least {min} characters.", "{label} can be at most {max} characters (it has {length})."]) {
      assert.ok(prose(code)[key].includes(`${open}{label}${close}`), `${code}: ${key}`);
    }
  }
});
