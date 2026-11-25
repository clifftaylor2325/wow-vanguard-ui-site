// H48 wave 9: the Settings page's defaults are the addon's, whichever helper the addon's row goes through.
// Reads the built site-data.json and the addon's code at the pinned source ref (run after a build).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { loadConfig } from "../scripts/lib/config.mjs";
import { publishedLocales } from "../scripts/lib/i18n-site.mjs";

const cfg = loadConfig();
const data = JSON.parse(fs.readFileSync(path.join(cfg.outDir, "site-data.json"), "utf8"));

// The addon's file at the pinned source ref, with L["…"] lookups read as their English.
function addonFile(file) {
  const text = execFileSync("git", ["show", `${cfg.sourceRef}:${file}`], { cwd: cfg.sourcePath, maxBuffer: 64 << 20, stdio: ["ignore", "pipe", "ignore"] }).toString();
  return text.replace(/\bL\[("(?:[^"\\]|\\.)*")\]/g, "$1");
}

// The default the Settings page shows for a row of a page: "On", "Off", a number, or null when blank.
function shown(page, caption) {
  const row = data.settings.find((p) => p.key === page).rows.find((r) => r.caption === caption && r.kind !== "header");
  assert.ok(row, `${page}: ${caption} is on the page`);
  return row.releaseDefault;
}

// The literal value a `defaults = { key = value }` (or `DEFAULTS`) table of an addon file gives a key.
function addonDefault(file, key) {
  const code = addonFile(file);
  const table = code.match(/\b(?:defaults|DEFAULTS)\s*=\s*\{([^}]*)\}/);
  const hit = (table?.[1] ?? "").match(new RegExp(`\\b${key}\\s*=\\s*(true|false|-?[\\d.]+)`));
  assert.ok(hit, `${file}: no literal default for ${key}`);
  return hit[1] === "true" ? "On" : hit[1] === "false" ? "Off" : hit[1];
}

test("H48-9-2: rows built with setting(key, after) and the slider helper show the module's default", () => {
  for (const [caption, key] of [["Cast bar", "castBar"], ["Tag marks", "tagMarks"], ["Names only on friendly plates", "friendlyNames"], ["Timer numbers on your debuffs", "timers"], ["Width", "width"], ["Name text size", "nameSize"]]) {
    assert.equal(shown("nameplates", caption), addonDefault("Modules/Nameplates.lua", key), `Nameplates: ${caption}`);
  }
  for (const [caption, key] of [["Show the quest arrow", "show"], ["Follow the nearest quest", "auto"]]) {
    assert.equal(shown("quests", caption), addonDefault("Modules/QuestArrow.lua", key), `Quests: ${caption}`);
  }
});

test("H48-9-3: rows whose default a helper, a loop table or a module's defaults field gives show it", () => {
  assert.equal(shown("general", "Show a grid while moving"), addonDefault("Core/Movers.lua", "grid"));
  assert.equal(shown("general", "Grid spacing"), addonDefault("Core/Movers.lua", "gridSize"));
  assert.equal(shown("quests", "Remember who finished each quest"), addonDefault("Modules/QuestHistory.lua", "track"));
  assert.equal(shown("windows", "Popups (reload)"), addonDefault("Modules/Windows.lua", "popups"), "a loop over { key, caption } pairs");
  assert.equal(shown("windows", "Drag game windows by their title bar (reload)"), addonDefault("Modules/Windows.lua", "movable"));
  assert.equal(shown("quests", "Quest spots on the minimap"), addonDefault("Modules/QuestMinimap.lua", "show"), "QM.defaults.show");
  assert.equal(shown("map", "Arrow to a Ctrl-clicked waypoint"), addonDefault("Modules/Waypoints.lua", "follow"), "followSetting()");
  assert.equal(shown("tools", "Soft-reserve list"), addonDefault("Modules/OfficerLoot.lua", "on"), "ns.Options.LiveSetting");
});

test("H48-9-4: Troubleshooting names no colour for the error count by the addons button, in any language", () => {
  const badge = addonFile("Core/ErrorBadge.lua");
  assert.match(badge, /T\.Capsule\(b, BADGE_H, "accent"/, "the badge is a capsule in the accent colour, not a red one");
  assert.match(badge, /SetPoint\("RIGHT", button, "LEFT"/, "and it sits beside the addons button");
  const colours = /\b(red|rot|rote|rouge|rojo|rosso|vermelho)\b|красн|빨간|红色|紅色/i;
  for (const l of publishedLocales(cfg.locales)) {
    const page = fs.readFileSync(path.join(cfg.outDir, l.code === "en" ? "" : l.code, "help", "index.html"), "utf8");
    const question = page.match(/errors-badge-q">\s*([^<\s][^<]*)</)[1];
    assert.doesNotMatch(question, colours, `${l.code}: ${question}`);
  }
});

// Every file of the addon at the source ref whose path matches.
function addonFiles(pattern) {
  const list = execFileSync("git", ["ls-tree", "-r", "--name-only", cfg.sourceRef], { cwd: cfg.sourcePath, maxBuffer: 64 << 20 }).toString().split("\n");
  return list.filter((f) => pattern.test(f));
}

// Each module's literal on/off defaults, by module name, read from the `ns.Module("Name", { defaults = { ... } })` calls.
function moduleDefaults() {
  const out = new Map();
  for (const file of addonFiles(/^(Core|Modules)\/[\w]+\.lua$/)) {
    for (const hit of addonFile(file).matchAll(/ns\.Module\(\s*"(\w+)"\s*,[^\n]{0,200}?defaults\s*=\s*\{([^{}]*)\}/g)) {
      out.set(hit[1], Object.fromEntries([...hit[2].matchAll(/\b(\w+)\s*=\s*(true|false)\b/g)].map((x) => [x[1], x[2] === "true" ? "On" : "Off"])));
    }
  }
  return out;
}

test("H48-9-5: every switch the options files tie to a module setting shows that module's default on the Settings page", () => {
  const defaults = moduleDefaults();
  const rows = data.settings.flatMap((p) => p.rows.filter((r) => r.kind === "check"));
  const wrong = [];
  let compared = 0;
  for (const file of addonFiles(/^Core\/Options\w*\.lua$/)) {
    for (const hit of addonFile(file).matchAll(/\bcheck\(\s*"([^"]+)"\s*,\s*(?:reload|live)?[sS]etting\(\s*"(\w+)"\s*,\s*"(\w+)"\s*\)/g)) {
      const want = defaults.get(hit[2])?.[hit[3]];
      const page = rows.filter((r) => r.caption === hit[1]);
      if (!want || !page.length) continue;
      compared++;
      for (const r of page) if (r.releaseDefault !== want) wrong.push(`${hit[1]}: page ${r.releaseDefault}, ${hit[2]}.${hit[3]} is ${want}`);
    }
  }
  assert.deepEqual(wrong, []);
  assert.ok(compared >= 40, `only ${compared} switches compared`);
});
