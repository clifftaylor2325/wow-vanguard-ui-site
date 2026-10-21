// Screenshot slots: a slot with no capture renders a labelled placeholder, a slot with a file
// renders the real shot, and a slot that names a file shots-content doesn't have stops the build.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { loadConfig } from "../scripts/lib/config.mjs";
import { SLOTS, slotByKey } from "../scripts/lib/shots-content.mjs";
import { slotFigure } from "../scripts/lib/html.mjs";

const home = () => fs.readFileSync(path.join(loadConfig().outDir, "index.html"), "utf8");

test("a slot with no file is a placeholder that shows the caption of what will go there", () => {
  const slot = { key: "fake-empty", file: null, aspect: "16 / 10", want: "A crop of the thing, framed 16:10.", caption: "The thing." };
  const html = slotFigure(slot);
  assert.match(html, /^<figure class="shot-slot" data-slot="fake-empty" style="--slot-aspect: 16 \/ 10">/);
  assert.match(html, /role="img" aria-label="Screenshot to come: The thing\."/);
  assert.match(html, /<span class="shot-slot-kicker">Screenshot coming<\/span><span class="shot-slot-want">The thing\.<\/span>/);
  assert.ok(!/<img|<figcaption|<svg/.test(html), "a placeholder draws no picture and no interface");
});

test("a slot with a file renders that real shot", () => {
  const html = slotFigure({ key: "fake-filled", file: "01-hud-overview", aspect: "16 / 9", want: "unused", caption: "The slot's own caption." });
  assert.match(html, /<img src="\/assets\/shots\/01-hud-overview\.webp"[^>]* alt="[^"]+"/);
  assert.match(html, /<figcaption>The slot's own caption\.<\/figcaption>/);
  assert.ok(!/shot-slot/.test(html), "a filled slot is the shot, not the placeholder");
  assert.ok(!/<figcaption/.test(slotFigure({ key: "fake-filled", file: "01-hud-overview", aspect: "16 / 9", want: "x", caption: "c" }, { caption: false })), "caption: false leaves the caption out");
});

test("a slot that names a file shots-content does not have throws, naming the slot and the file", () => {
  assert.throws(() => slotFigure({ key: "fake-missing", file: "99-not-a-shot", aspect: "16 / 9", want: "x", caption: "c" }), /slot fake-missing: no shot 99-not-a-shot in shots-content\.mjs/);
});

test("the slots are keyed once each, and every filled one names a shot that exists", () => {
  const keys = SLOTS.map((s) => s.key);
  assert.deepEqual(keys.filter((k, i) => keys.indexOf(k) !== i), [], "duplicate slot keys");
  for (const s of SLOTS) {
    assert.equal(slotByKey(s.key), s);
    assert.doesNotThrow(() => slotFigure(s), `slot ${s.key} does not render`);
  }
  assert.equal(slotByKey("no-such-slot"), null);
});

test("Home shows every slot: a placeholder while its file is null, the real shot once it is set", () => {
  const html = home();
  for (const slot of SLOTS) {
    if (slot.file) assert.ok(html.includes(`<img src="/assets/shots/${slot.file}.webp"`), `Home does not show ${slot.file} for slot ${slot.key}`);
    else assert.ok(html.includes(`<figure class="shot-slot" data-slot="${slot.key}"`), `Home has no placeholder for slot ${slot.key}`);
  }
});

test("the tour is a folded section with one row per module that has a slot, and the accent presets last", () => {
  const html = home();
  const tour = html.match(/<details class="disclosure"[^>]*>\s*<summary><h2 id="hl-h">[\s\S]*?<\/details>/)?.[0] || "";
  assert.ok(tour && !/<details[^>]*\sopen\b/.test(tour.slice(0, tour.indexOf(">") + 1)), "the tour starts folded");
  const rows = [...tour.matchAll(/<li class="tour-row[^"]*"(?: data-module="([^"]+)")?/g)].map((m) => m[1] || "presets");
  assert.equal(rows.at(-1), "presets", "the accent presets row comes last");
  for (const key of rows.slice(0, -1)) assert.ok(slotByKey(`tour-${key}`), `tour row ${key} has no slot`);
  assert.ok(rows.length > 1, "the tour has module rows");
  assert.ok(/class="swatch"/.test(tour), "the presets row has swatches");
});
