// The palette contract between the build and the CSS: every custom property site.css reads
// without a fallback must be defined by the generated theme.css or by site.css itself, so a
// preset the addon renames can't silently blank a title again. Run after a build.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { loadConfig, root } from "../scripts/lib/config.mjs";

const cfg = loadConfig();

// CSS with its comments blanked out (newlines kept, so line numbers still match).
function withoutComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "));
}

// The custom properties a stylesheet defines (`--name:`), as a set of names.
function definedIn(css) {
  return new Set([...withoutComments(css).matchAll(/(?:^|[\s;{])(--[\w-]+)\s*:/g)].map((m) => m[1]));
}

// Every `var(--name)` with no fallback argument: its name and first line number.
function withoutFallback(css) {
  const uses = new Map();
  const text = withoutComments(css);
  for (const m of text.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)) {
    if (!uses.has(m[1])) uses.set(m[1], text.slice(0, m.index).split("\n").length);
  }
  return uses;
}

test("site.css reads only colours the theme or the site defines, or gives a fallback", () => {
  const theme = fs.readFileSync(path.join(cfg.outDir, "assets/theme.css"), "utf8");
  const site = fs.readFileSync(path.join(root, "src/assets/site.css"), "utf8");
  const defined = new Set([...definedIn(theme), ...definedIn(site)]);
  const missing = [...withoutFallback(site)].filter(([name]) => !defined.has(name));
  assert.deepEqual(missing.map(([name, line]) => `${name} (site.css line ${line})`), [], "site.css uses a variable that theme.css and site.css don't define, with no fallback");
});

// The WCAG contrast ratio of two #rrggbb colours.
function contrast(a, b) {
  const lum = (hex) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

test("the search placeholder uses a theme token that reads at 4.5:1 on the field", () => {
  const theme = fs.readFileSync(path.join(cfg.outDir, "assets/theme.css"), "utf8");
  const site = fs.readFileSync(path.join(root, "src/assets/site.css"), "utf8");
  const rule = site.match(/\.search input\[type=search\]::placeholder \{ color: var\((--[\w-]+)\); opacity: 1; \}/);
  assert.ok(rule, "the placeholder has its own colour and full opacity");
  const colour = (name) => theme.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`))[1];
  assert.ok(contrast(colour(rule[1]), colour("--raised")) >= 4.5, `${rule[1]} on --raised is under 4.5:1`);
});
