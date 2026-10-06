// /start/ and /profiles/: the steps, labels and messages a player follows are the
// addon's own. Like site.test.mjs, this reads the Lua itself (git show at the pinned
// source) instead of reusing the build's extraction. Run after a build.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { loadConfig } from "../scripts/lib/config.mjs";

const cfg = loadConfig();
const dist = cfg.outDir;
const meta = JSON.parse(fs.readFileSync(cfg.releaseJson, "utf8"));
const NEXT = cfg.sourceRef;
const REL = meta.current;
const html = (p) => fs.readFileSync(path.join(dist, p, "index.html"), "utf8");

// A file of the addon at a ref (empty string when missing).
function show(ref, file) {
  try {
    return execFileSync("git", ["show", `${ref}:${file}`], { cwd: cfg.sourcePath, maxBuffer: 64 << 20, stdio: ["ignore", "pipe", "ignore"] }).toString();
  } catch {
    return "";
  }
}

// Visible text of some HTML: tags dropped, entities decoded, whitespace collapsed.
function text(h) {
  return h.replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, "&")
    .replace(/\s+/g, " ").trim();
}

// The HTML from the element with this id up to the next h2 (one page section).
function section(h, id) {
  const at = h.indexOf(`id="${id}"`);
  assert.ok(at >= 0, `section #${id} missing`);
  const end = h.indexOf("<h2", at + 1);
  return h.slice(at, end < 0 ? undefined : end);
}

// Every string literal in a Lua snippet.
const literals = (lua) => [...lua.matchAll(/"([^"]*)"/g)].map((m) => m[1]);

// A multi-line Lua table: from its opening line to the first line that starts with "}".
function block(lua, start) {
  const at = lua.indexOf(start);
  assert.ok(at >= 0, `${start} not found in the addon source`);
  return lua.slice(at, lua.indexOf("\n}", at) + 2);
}

// A Lua table written as { ... } with no nested braces (it may span lines).
function inline(lua, start) {
  const m = lua.match(new RegExp(start.replace(/[.]/g, "\\.") + "\\s*=\\s*\\{([^{}]*)\\}"));
  assert.ok(m, `${start} not found in the addon source`);
  return m[1];
}

const setup = show(NEXT, "Core/Setup.lua");

test("/start/: the setup wizard's title, steps in order, caption, questions and move lines", { skip: !setup && "no setup wizard in the source" }, () => {
  const t = text(html("start"));
  const steps = literals(inline(setup, "local STEPS"));
  assert.ok(steps.length >= 4, "STEPS read from Core/Setup.lua");
  let last = -1;
  steps.forEach((s, i) => {
    const at = t.indexOf(`Step ${i + 1} · ${s}`);
    assert.ok(at > last, `wizard heading "Step ${i + 1} · ${s}" missing or out of order`);
    last = at;
  });
  assert.ok(t.includes(`Step 1 of ${steps.length} · ${steps[0]}`), "the wizard's caption, as the addon formats it");
  const title = (setup.match(/"title",\s*"text",\s*"([^"]+)"/) || [])[1];
  assert.ok(title && t.includes(`“${title}”`), `wizard title "${title}"`);
  for (const [, q] of setup.matchAll(/choicePage\(page,\s*"([^"]+)"/g)) assert.ok(t.includes(`“${q}”`), `step question "${q}"`);
  for (const line of literals(inline(setup, "local lines"))) assert.ok(t.includes(`“${line}”`), `move-step line "${line}"`);
  for (const b of ["Next", "Back", "Done"]) assert.ok(setup.includes(`"${b}"`) && t.includes(b), `button ${b}`);
});

test("/start/: the layout and screen-preset tables match the wizard's own lists", { skip: !setup && "no setup wizard in the source" }, () => {
  const t = text(section(html("start"), "setup-wizard"));
  const layouts = [...block(setup, "S.LAYOUTS = {").matchAll(/text = "([^"]+)", hint = "([^"]+)"/g)];
  assert.ok(layouts.length >= 3, "layouts read from Core/Setup.lua");
  for (const [, name, hint] of layouts) assert.ok(t.includes(name) && t.includes(hint), `layout ${name}`);
  const screens = [...block(setup, "S.SCREENS = {").matchAll(/text = "([^"]+)", w = (\d+), h = (\d+)/g)];
  assert.ok(screens.length >= 4, "screen presets read from Core/Setup.lua");
  for (const [, name, w, h] of screens) assert.ok(t.includes(`${name} (${w} x ${h})`), `screen preset ${name} (${w} x ${h})`);
  const keep = (setup.match(/key = "keep", text = "([^"]+)"/) || [])[1];
  assert.ok(keep && t.includes(keep), `"${keep}"`);
});

test("/start/: the Escape-menu button is at the top of the menu, or just under it", () => {
  const gm = show(NEXT, "Core/GameMenu.lua");
  const h = html("start");
  const li = (h.match(/<li[^>]*>[^\n]*?<kbd>Escape<\/kbd> to open the game menu[\s\S]*?<\/li>/) || [])[0];
  assert.ok(li, "the Escape-menu way to open the options");
  const t = text(li);
  assert.ok(t.includes("at the top of the Escape menu, or just under it where your client's menu can't take new buttons"), t);
  assert.doesNotMatch(text(h), /at the top of the (game )?menu/, "no flat 'at the top of the menu' claim");
  if (gm) {
    // The addon places it first in a menu that lays out its buttons, else under the menu.
    assert.match(gm, /b\.layoutIndex = FIRST/);
    assert.match(gm, /SetPoint\("TOP", menu, "BOTTOM"/);
    assert.ok(gm.includes('"Vanguard"') && t.includes("Vanguard"), "button label");
  }
  if (gm && !show(REL, "Core/GameMenu.lua")) assert.ok(li.includes("Next release"), "marked Next release while only the source has it");
});

test("/changelog/: the Escape-menu line says top of the menu, or just under it", () => {
  const t = text(html("changelog"));
  assert.ok(t.includes("at the top of the Escape menu, or just under it where your client's menu can't take new buttons"), "the changelog's Game menu line lost its Escape-menu wording");
});

test("/profiles/: Edit Mode is framed as 'where your client supports Edit Mode'", () => {
  const prof = show(NEXT, "Core/Profiles.lua");
  const sec = section(html("profiles"), "edit-mode");
  const paras = [...sec.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => text(m[1]));
  const switching = paras.find((p) => /switches Edit Mode/.test(p));
  assert.ok(switching, "the paragraph on switching layouts");
  assert.ok(switching.startsWith("Where your client supports Edit Mode,"), switching);
  assert.ok(prof.includes('"Edit Mode layout "') && switching.includes("“Edit Mode layout <layout>, from profile <name>.”"), "the switch message");
  assert.ok(prof.includes(", which this account doesn't have.") && text(sec).includes(", which this account doesn't have.”"), "the missing-layout message");
  const carried = text(section(html("profiles"), "string"));
  assert.ok(carried.includes("Where your client supports Edit Mode, the name of the game's Edit Mode layout"), "what the string carries");
});

test("/profiles/: the chat commands table has every profile action and its messages", () => {
  const slash = show(NEXT, "Core/Slash.lua");
  const actions = block(slash, "local PROFILE_ACTIONS");
  const table = (section(html("profiles"), "manage").match(/<table[\s\S]*?<\/table>/) || [])[0];
  assert.ok(table, "commands table");
  const rows = [...table.matchAll(/<tr><td[\s\S]*?<\/tr>/g)].map((m) => text(m[0]));
  for (const key of [...actions.matchAll(/^\s{2}(\w+) = function/gm)].map((m) => m[1])) {
    assert.ok(rows.some((r) => r.startsWith(`/vg profile ${key}`)), `row for /vg profile ${key}`);
  }
  const t = text(table);
  for (const lit of literals(actions).map((s) => s.trim()).filter((s) => s.length > 3)) assert.ok(t.includes(lit), `message text "${lit}"`);
  assert.ok(t.includes("Reload the UI now to apply it?"), "the reload question after copy and reset");
});

test("/profiles/: export and import steps use the addon's buttons and window titles, in order", () => {
  const opts = show(NEXT, "Core/Options.lua");
  const slash = show(NEXT, "Core/Slash.lua");
  const sec = section(html("profiles"), "share");
  const steps = [...((sec.match(/<ol class="steps">([\s\S]*?)<\/ol>/) || [])[1] || "").matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => text(m[1]));
  assert.equal(steps.length, 3, "three steps");
  assert.match(steps[0], /^Export\./);
  assert.match(steps[2], /^Import\./);
  for (const b of ["Export profile", "Import"]) assert.ok(opts.includes(`{ "button", "${b}"`) , `Profiles page button ${b}`);
  assert.ok(steps[0].includes("Export profile") && steps[0].includes("/vg export"), steps[0]);
  const exportTitle = (opts.match(/ns\.ShowText\("(Vanguard export[^"]+)", ns\.ExportProfile\(\)\)/) || [])[1];
  assert.ok(exportTitle && steps[0].includes(`“${exportTitle.replace(/\s+/g, " ")}”`), `export window title "${exportTitle}"`);
  const importTitle = (slash.match(/ns\.AskText\("([^"]+)"/) || [])[1];
  assert.ok(importTitle && steps[2].includes(`“${importTitle}”`), `import window title "${importTitle}"`);
  assert.ok(steps[2].includes("/vg import"), steps[2]);
  assert.match(sec, /<kbd>Ctrl<\/kbd>\+<kbd>C<\/kbd>/);
  assert.match(sec, /<kbd>Ctrl<\/kbd>\+<kbd>V<\/kbd>/);
});

test("/start/ and /profiles/: no GitHub username and no untested-style wording", () => {
  const banned = /(not|never) (been )?(checked|tested) in game|checked in game yet|untested|nothing has been (checked|tested)/i;
  for (const p of ["start", "profiles"]) {
    const h = html(p);
    assert.doesNotMatch(h, /clifftaylor2325/i, `/${p}/ shows the GitHub username`);
    assert.doesNotMatch(text(h), banned, `/${p}/ has untested-style wording`);
  }
});
