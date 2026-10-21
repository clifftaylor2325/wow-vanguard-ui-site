// Screenshot slots: a slot with no capture renders a labelled placeholder, a slot with a file
// renders the real shot, and a slot that names a file shots-content doesn't have stops the build.
import { test } from "node:test";
import assert from "node:assert/strict";
import { SLOTS, slotByKey } from "../scripts/lib/shots-content.mjs";
import { slotFigure } from "../scripts/lib/html.mjs";

test("a slot with no file is a placeholder that says what will go there", () => {
  const slot = { key: "fake-empty", file: null, aspect: "16 / 10", want: "A crop of the thing, framed 16:10.", caption: "The thing." };
  const html = slotFigure(slot);
  assert.match(html, /^<figure class="shot-slot" data-slot="fake-empty" style="--slot-aspect: 16 \/ 10">/);
  assert.match(html, /role="img" aria-label="Screenshot to come: A crop of the thing, framed 16:10\."/);
  assert.match(html, /<span class="shot-slot-kicker">Screenshot coming<\/span><span class="shot-slot-want">A crop of the thing, framed 16:10\.<\/span>/);
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
