// Latent gaps in the generators, called on small source strings (no build needed).
import { test } from "node:test";
import assert from "node:assert/strict";
import { valuesText } from "../scripts/lib/pages-main.mjs";
import { EN } from "../scripts/lib/i18n-site.mjs";

test("valuesText shows a next-only range when the release's range is not a literal", () => {
  const row = { inRel: true, inNext: true, relRange: { min: null, max: 5, step: 1 }, range: { min: 1, max: 5, step: 1 } };
  const html = valuesText(row, EN);
  assert.match(html, /1/);
  assert.match(html, /next/i);
});

test("reloadRowNames reads a call with commas before the alias, and ignores a predeclare above it", async () => {
  const { reloadRowNames } = await import("../scripts/lib/extract.mjs");
  const call = reloadRowNames("local a, reloadRow = f(x, y), O.ReloadRow\n");
  assert.ok(call.has("reloadRow"));
  const predeclare = reloadRowNames("local a, b\nlocal essential, reloadRow = O.Essential, O.ReloadRow\n");
  assert.ok(predeclare.has("reloadRow"));
  assert.ok(!predeclare.has("essential"));
});

test("percentLabel guards a non-number default and reads a whole-percent step", async () => {
  const { percentLabel } = await import("../scripts/lib/extract.mjs");
  const range = (step) => ({ min: null, max: null, step, percent: true });
  assert.equal(percentLabel({ default: "auto", range: range(null) }), "auto");
  assert.equal(percentLabel({ default: 1, range: range(5) }), "1%");
  assert.equal(percentLabel({ default: 0.5, range: range(0.05) }), "50%");
  assert.equal(percentLabel({ default: 1, range: { min: 0.5, max: 2, step: 0.1, percent: true } }), "100%");
});
