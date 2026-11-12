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
