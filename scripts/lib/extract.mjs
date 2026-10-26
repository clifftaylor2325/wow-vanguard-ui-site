// Turns one ref of the addon repo into plain data the pages are built from:
// TOC metadata, slash commands (help text verbatim), modules, options pages
// and rows (with defaults where the Lua has a literal one), theme colors and
// the setup wizard's choices. Extraction is deliberately narrow; the test
// suite fails if anything the Lua defines doesn't reach the site.
import { mask, findTable, blocks, parseTable, parseValue, splitTop, matchBracket, readString, plain } from "./lua.mjs";
import { tocFiles, tocMeta } from "./source.mjs";

// Reads and masks a Lua file (null when the ref doesn't have it).
function luaFile(reader, file) {
  const text = reader.read(file);
  return text == null ? null : { file, ...mask(text) };
}

// ---------------------------------------------------------------- commands

// Help lines split into the syntax column and the description: at a run of 2+
// spaces, or (when the line has a single space there) after the command word
// and its bracketed arguments.
export function splitHelp(line) {
  const m = line.match(/^(\S(?:.*?\S)?)\s{2,}(\S.*)$/);
  if (m) return { syntax: m[1], text: m[2] };
  let i = line.search(/\s|$/);
  for (;;) {
    const rest = line.slice(i).match(/^\s+(?=[[<])/);
    if (!rest) break;
    let depth = 0;
    let j = i + rest[0].length;
    for (; j < line.length; j++) {
      if (line[j] === "[" || line[j] === "<") depth++;
      else if (line[j] === "]" || line[j] === ">") depth--;
      if (depth === 0) break;
    }
    i = j + 1;
  }
  const text = line.slice(i).trim();
  return text ? { syntax: line.slice(0, i), text } : { syntax: line, text: "" };
}

// The command words a help line's syntax column names ("unlock | lock" -> unlock, lock).
function syntaxWords(syntax) {
  const head = syntax.split(/\s+(?=[[<])/)[0];
  return head.split(/\s\|\s/).map((w) => w.trim().split(/\s+/)[0]).filter((w) => /^[a-z]+$/.test(w));
}

// The /vg help lines as the game prints them, each split into its syntax column and description:
// the intro, then one line per command. Since the string table came in, HELP holds { syntax, text }
// pairs after a separate HELP_INTRO, and the game pads the syntax to a column of 20 ("%-20s %s");
// before, each line was one string, split here at its spaces (splitHelp).
function helpLines(m) {
  const help = plain(findTable(m, "local HELP"));
  const intro = (m.code.match(/local HELP_INTRO\s*=\s*"([^"]+)"/) || [])[1];
  if (intro == null) return help.map((line) => ({ line, ...splitHelp(line) }));
  const pairs = help.map(([syntax, text]) => ({ line: `${syntax.padEnd(20)} ${text}`, syntax, text }));
  return [{ line: intro, ...splitHelp(intro) }, ...pairs];
}

// Slash registrations, help lines and the COMMANDS table, with the module each command reaches.
export function extractCommands(reader) {
  const m = luaFile(reader, "Core/Slash.lua");
  const parsed = helpLines(m);
  const help = parsed.map((h) => h.line);
  const table = findTable(m, "local COMMANDS");
  const defs = blocks(m);
  const slashes = [...m.code.matchAll(/SLASH_(\w+?)(\d+)\s*=\s*"([^"]+)"/g)].map((x) => x[3]);
  const commands = Object.entries(table.fields).map(([key, v]) => {
    const handler = v.expr ?? String(v);
    const body = defs.has(handler) ? m.code.slice(defs.get(handler).from, defs.get(handler).to) : handler;
    const mod = body.match(/GetModule\("(\w+)"\)/);
    return { key, handler: handler.replace(/\s+/g, " "), module: mod ? mod[1] : null };
  });
  const lines = parsed.map((h, i) => ({ index: i, ...h }));
  for (const c of commands) c.helpIndex = helpFor(c, commands, lines);
  const unknown = (m.code.match(/chat\("(Unknown command[^"]*)"\)/) || [])[1] || null;
  return { slashes, help, lines, commands, unknown };
}

// The help line that documents a command: its own syntax line, a line that
// names it in the text ("snap on|off", "enable|disable"), or the line of the
// command it shares a handler with. -1 for none.
function helpFor(c, commands, lines) {
  const owns = (l, i, key) => i > 0 && syntaxWords(l.syntax).includes(key);
  const own = lines.findIndex((l, i) => owns(l, i, c.key));
  if (own >= 0) return own;
  const twin = commands.find((o) => o !== c && o.handler === c.handler && lines.some((l, i) => owns(l, i, o.key)));
  if (twin) return lines.findIndex((l, i) => owns(l, i, twin.key));
  const word = new RegExp(`(^|;\\s*|\\|)${c.key}(\\s|\\||$)`);
  return lines.findIndex((l, i) => i > 0 && word.test(l.text));
}

// ---------------------------------------------------------------- modules

// Every module registered with ns.Module("Name", def) in the TOC's files, in
// load order, with its literal defaults.
export function extractModules(reader, files) {
  const out = [];
  for (const file of files) {
    const m = luaFile(reader, file);
    if (!m) continue;
    for (const hit of m.bare.matchAll(/ns\.Module\(\s*"/g)) {
      const name = readString(m.code, hit.index + hit[0].length - 1).value;
      const open = m.bare.indexOf("{", hit.index);
      const def = open >= 0 && open < m.bare.indexOf(")", hit.index + hit[0].length + name.length + 1) + 2 ? parseTable(m, open) : null;
      out.push({ name, file, defaults: moduleDefaults(m, def) });
    }
  }
  return out;
}

// A module's defaults table as plain JS (literal values only).
function moduleDefaults(m, def) {
  const d = def?.fields?.defaults;
  if (!d) return {};
  if (d.expr) {
    const t = findTable(m, `local ${d.expr}`);
    return t ? plain(t) : {};
  }
  return plain(d) || {};
}

// O.MODULE_INFO: module -> [name shown, description] (absent before it existed).
export function extractModuleInfo(reader) {
  const m = luaFile(reader, "Core/Options.lua");
  const t = m && findTable(m, "O.MODULE_INFO");
  return t ? plain(t) : {};
}

// O.MODULE_LINKS: module -> { keys: its own switches, page } (absent before it existed).
export function extractModuleLinks(reader) {
  const m = luaFile(reader, "Core/Options.lua");
  const t = m && findTable(m, "O.MODULE_LINKS");
  return t ? plain(t) : {};
}

// ---------------------------------------------------------------- options pages

// Literal choices from a cycle's choice expression: [[value, label], ...] or null.
function choicesOf(m, defs, v, depth = 0) {
  if (!v || depth > 3) return null;
  if (v.array) return v.array.map((c) => (c && c.array ? [plain(c.array[0]), plain(c.array[1])] : null)).filter(Boolean);
  if (v.expr) {
    const call = v.expr.match(/^[\w.]+\s*\(\s*"[^"]*"\s*,\s*([A-Z_]+)\s*\)$/); // T.SharedChoices("font", FONT_CHOICES)
    const name = call ? call[1] : v.expr;
    const t = findTable(m, `local ${name}`) || findTable(m, name);
    if (t) return choicesOf(m, defs, t, depth + 1);
  }
  return null;
}

// A slider's literal range { min, max, step } or null.
function rangeOf(m, v) {
  const t = v?.fields ? v : v?.expr ? findTable(m, `local ${v.expr}`) : null;
  if (!t) return null;
  const r = plain(t);
  const percent = /%%/.test(m.code.slice(t.from, t.to));
  return typeof r?.min === "number" && typeof r?.max === "number" ? { min: r.min, max: r.max, step: r.step, percent } : null;
}

// Where a row's value lives: { scope, key, reload } from the setter expression
// text, following small helper functions (themeSetting("x"), stripSetting("x"),
// enchantSetting()) into their bodies.
function settingRef(ctx, text, depth = 0) {
  const { m, defs, fileModule } = ctx;
  let hit = text.match(/\b(?:setting|liveSetting)\(\s*"(\w+)"\s*,\s*"(\w+)"\s*(,\s*true)?/);
  if (hit) return { scope: hit[1], key: hit[2], reload: !!hit[3] };
  hit = text.match(/\b(?:setting|switch)\(\s*"(\w+)"\s*(,\s*true)?\s*\)/);
  if (hit && fileModule) return { scope: fileModule, key: hit[1], reload: !!hit[2] };
  hit = text.match(/T\.Settings\(\)\.(\w+)/);
  if (hit) return { scope: "theme", key: hit[1], reload: false };
  hit = text.match(/moduleSettings\("(\w+)"\)\.(\w+)/);
  if (hit) return { scope: hit[1], key: hit[2], reload: /NeedReload/.test(text) };
  if (depth > 3) return null;
  for (const call of text.matchAll(/\b([A-Za-z_]\w*)\(\s*(?:"(\w+)")?\s*\)/g)) {
    if (!defs.has(call[1]) || call[1] === "check") continue;
    const body = m.code.slice(defs.get(call[1]).from, defs.get(call[1]).to);
    const reload = /NeedReload\(\)/.test(body) && !/if reload/.test(body);
    const viaKey = call[2] ? body.replace(/\bkey\b/g, `"${call[2]}"`) : body;
    let inner = null;
    if (call[2] && /ns\.MoverOptions\(\)\[key\]/.test(body)) inner = { scope: "movers", key: call[2], reload: false };
    else if (call[2] && /T\.Settings\(\)\[key\]/.test(body)) inner = { scope: "theme", key: call[2], reload: false };
    else inner = settingRef(ctx, viaKey, depth + 1);
    if (inner) return { ...inner, reload: inner.reload || reload };
  }
  return null;
}

// One row: kind, caption (with "<n>"-style placeholders for concatenated
// values), choices or range, and where its value lives.
function makeRow(ctx, kind, caption, extraParts, loop) {
  const { m, defs } = ctx;
  const row = { kind, caption };
  const rest = extraParts.map(([a, b]) => m.code.slice(a, b)).join(", ");
  if (kind === "cycle" && extraParts[0]) row.choices = choicesOf(m, defs, parseValue(m, extraParts[0][0], extraParts[0][1]));
  if (kind === "slider" && extraParts[0]) row.range = rangeOf(m, parseValue(m, extraParts[0][0], extraParts[0][1]));
  if (kind === "check" || kind === "cycle" || kind === "slider") {
    row.ref = settingRef(ctx, rest);
    const last = extraParts.length >= 3 ? parseValue(m, ...extraParts[extraParts.length - 1]) : undefined;
    if (kind === "check" && typeof last === "boolean") row.literalDefault = last;
  }
  if (loop) row.loop = loop;
  row.reload = /\(reload\)/.test(caption) || !!row.ref?.reload;
  return row;
}

// The start of a caption written as ns.Format("…{slot}…", { slot = value }).
const FORMAT_CALL = /^ns\.Format\(\s*/;
// How a caption's placeholder reads on the site, by its name.
const SHOWN = { n: "n", p: "phrase" };

// Reads an ns.Format caption's string at code[i]: each {slot} shows as <slot>, and its variable is the identifier
// the first slot's value starts with ({ n = n } gives n), so a row in a numeric loop is still seen as one.
function formatCaption(m, i) {
  const s = readString(m.code, i);
  const values = (m.code.slice(s.end).match(/^\s*,\s*\{([^}]*)\}/) || [])[1] || "";
  const first = (s.value.match(/\{(\w+)\}/) || [])[1];
  const variable = first ? (values.match(new RegExp(`\\b${first}\\s*=\\s*([A-Za-z_]\\w*)`)) || [])[1] || null : null;
  return { caption: s.value.replace(/\{(\w+)\}/g, (_, name) => `<${SHOWN[name] || name}>`), variable, end: s.end };
}

// Reads a caption string at code[i] and an optional `.. name` after it, or an ns.Format caption (formatCaption).
function captionAt(m, i) {
  const call = m.code.slice(i).match(FORMAT_CALL);
  if (call) return formatCaption(m, i + call[0].length);
  const s = readString(m.code, i);
  const cat = m.code.slice(s.end).match(/^\s*\.\.\s*([A-Za-z_]\w*)/);
  return { caption: cat ? `${s.value}<${SHOWN[cat[1]] || cat[1]}>` : s.value, variable: cat ? cat[1] : null, end: s.end };
}

// Expands the rows reachable from code[from..to): row literals, check(...)
// calls, visibility rows, and (recursively) the functions and tables it uses.
function expandRows(ctx, from, to, stack = [], loop = null) {
  const { m, defs } = ctx;
  const found = [];
  const lit = /\{\s*"(header|check|cycle|slider|button|text)"\s*,\s*(?=["']|ns\.Format\()/g;
  const chk = /\bcheck\(\s*(?=["']|ns\.Format\()/g;
  const vis = /\b(?:visibilityRows|ns\.Visibility\.Rows)\(\s*(?=["'])/g;
  const ref = /\b[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*\b/g;
  for (const [re, type] of [[lit, "lit"], [chk, "check"], [vis, "vis"]]) {
    re.lastIndex = from;
    let h;
    while ((h = re.exec(m.code)) && h.index < to) found.push({ at: h.index, type, h });
  }
  ref.lastIndex = from;
  let r;
  while ((r = ref.exec(m.bare)) && r.index < to) {
    const name = r[0];
    if (defs.has(name) && !stack.includes(name) && !/function\s+$/.test(m.bare.slice(Math.max(0, r.index - 12), r.index))) found.push({ at: r.index, type: "ref", name });
  }
  found.sort((a, b) => a.at - b.at);
  const rows = [];
  for (const f of found) {
    const lineStart = m.code.lastIndexOf("\n", f.at) + 1;
    const line = m.code.slice(lineStart, m.code.indexOf("\n", f.at));
    const loopHit = line.match(/\bfor\s+(\w+)\s*=\s*(\d+)\s*,\s*(\d+)\s+do\b/);
    const here = loopHit ? { variable: loopHit[1], from: Number(loopHit[2]), to: Number(loopHit[3]) } : loop;
    if (f.type === "ref") {
      const b = defs.get(f.name);
      rows.push(...expandRows(ctx, b.from, b.to, [...stack, f.name], here));
      for (const [a, z] of b.extra || []) rows.push(...expandRows(ctx, a, z, [...stack, f.name], here));
      continue;
    }
    const open = f.type === "lit" ? f.at : m.code.indexOf("(", f.at);
    const close = matchBracket(m.bare, open) - 1;
    const parts = splitTop(m.bare, open + 1, close);
    const capIdx = f.type === "lit" ? 1 : 0;
    if (!parts[capIdx]) continue;
    const capStart = parts[capIdx][0] + (m.code.slice(parts[capIdx][0]).length - m.code.slice(parts[capIdx][0]).trimStart().length);
    if (!/["']/.test(m.code[capStart]) && !FORMAT_CALL.test(m.code.slice(capStart))) continue;
    const cap = captionAt(m, capStart);
    const kind = f.type === "lit" ? f.h[1] : f.type === "check" ? "check" : "visibility";
    const loopFor = cap.variable && here && here.variable === cap.variable ? here : null;
    const row = makeRow(ctx, kind, cap.caption, parts.slice(capIdx + 1), loopFor);
    if (kind === "visibility") row.choices = ctx.visibility(m.code.slice(open, close));
    if (here && !loopFor && f.type !== "lit") row.repeated = here;
    if (here && !loopFor && f.type === "lit") row.repeated = here;
    rows.push(row);
  }
  return rows;
}

// Removes repeated rows (same kind and caption) within a page.
function dedupe(rows) {
  const seen = new Set();
  return rows.filter((r) => {
    const k = `${r.kind}|${r.caption}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// The visibility row choices from Core/Visibility.lua (V.MODES / V.MENU_MODES).
function visibilityChoices(reader) {
  const m = luaFile(reader, "Core/Visibility.lua");
  if (!m) return () => null;
  const modes = plain(findTable(m, "V.MODES")) || [];
  const menuT = findTable(m, "V.MENU_MODES");
  const menu = menuT ? menuT.array.map((v) => (v.expr ? modes[Number((v.expr.match(/\[(\d+)\]/) || [])[1]) - 1] : plain(v))) : modes;
  return (callText) => (/MENU_MODES/.test(callText) ? menu : modes).filter(Boolean).map((c) => [c[0], c[1]]);
}

// Options pages from Core/Options.lua PAGES and every AddPage({...}) in the
// TOC's files: key, title, order, rows.
export function extractPages(reader, files, modules) {
  const visibility = visibilityChoices(reader);
  const pages = [];
  for (const file of files) {
    const m = luaFile(reader, file);
    if (!m) continue;
    const defs = blocks(m);
    const fileModule = (m.code.match(/ns\.Module\(\s*"(\w+)"/) || [])[1] || null;
    const ctx = { m, defs, fileModule, visibility };
    const tables = [];
    if (file === "Core/Options.lua") {
      const t = findTable(m, "local PAGES");
      if (t) tables.push(...t.array);
    }
    for (const hit of m.bare.matchAll(/AddPage\(\s*\{/g)) tables.push(parseTable(m, hit.index + hit[0].length - 1));
    for (const t of tables) {
      if (!t?.fields) continue;
      const f = t.fields;
      const rowsV = f.rows;
      if (!rowsV || typeof f.title !== "string") continue;
      const title = f.title;
      const key = typeof f.key === "string" ? f.key : f.key?.expr ? resolveConst(m, f.key.expr) : title.toLowerCase();
      const range = rowsV.expr !== undefined ? [rowsV.from, rowsV.to] : [t.from, t.to];
      const rows = dedupe(expandRows(ctx, range[0], range[1]));
      pages.push({ key, title, order: typeof f.order === "number" ? f.order : 999, file, rows });
    }
  }
  pages.sort((a, b) => a.order - b.order);
  applyDefaults(pages, modules, reader);
  return pages;
}

// The literal string a file-level `local NAME = "..."` holds.
function resolveConst(m, name) {
  const hit = m.code.match(new RegExp(`local\\s+${name}\\s*=\\s*"([^"]*)"`));
  return hit ? hit[1] : name.toLowerCase();
}

// Fills row.default from the module/theme/mover defaults tables (literal values only).
function applyDefaults(pages, modules, reader) {
  const scopes = Object.fromEntries(modules.map((x) => [x.name, x.defaults]));
  for (const [scope, file] of [["theme", "Core/Theme.lua"], ["movers", "Core/Movers.lua"]]) {
    const m = luaFile(reader, file);
    const t = m && findTable(m, "local DEFAULTS");
    if (t) scopes[scope] = plain(t);
  }
  for (const p of pages) {
    for (const r of p.rows) {
      let d;
      if (r.ref && scopes[r.ref.scope] && Object.prototype.hasOwnProperty.call(scopes[r.ref.scope], r.ref.key)) d = scopes[r.ref.scope][r.ref.key];
      if (d === undefined && r.literalDefault !== undefined) d = r.literalDefault;
      if (d !== undefined && (typeof d === "boolean" || typeof d === "number" || typeof d === "string")) r.default = d;
    }
  }
}

// The text a player sees for a row's default ("On", "Off", a choice label, a number).
export function defaultLabel(row) {
  if (row.default === undefined) return null;
  if (row.kind === "check") return row.default ? "On" : "Off";
  if (row.kind === "cycle" && row.choices) {
    const c = row.choices.find((x) => x[0] === row.default);
    return c ? String(c[1]) : null;
  }
  if (row.kind === "slider") return row.range?.percent && row.range.max <= 2 ? `${Math.round(row.default * 100)}%` : String(row.default);
  return null;
}

// ---------------------------------------------------------------- theme

// Theme tokens and accent presets as "#rrggbb".
export function extractTheme(reader) {
  const m = luaFile(reader, "Core/Theme.lua");
  const tokens = {};
  const t = findTable(m, "local TOKENS");
  for (const [k, v] of Object.entries(t.fields)) {
    const hex = typeof v === "string" ? v : v?.array?.[0];
    const alpha = v?.array?.[1];
    if (typeof hex === "string") tokens[k] = { hex: `#${hex}`, alpha: typeof alpha === "number" ? alpha : 1 };
  }
  const presets = {};
  const p = findTable(m, "T.PRESETS");
  for (const [k, v] of Object.entries(p.fields)) {
    const hit = v.expr?.match(/fromHex\("([0-9a-fA-F]{6})"\)/);
    if (hit) presets[k] = `#${hit[1]}`;
  }
  const order = plain(findTable(m, "T.PRESET_ORDER")) || Object.keys(presets);
  return { tokens, presets, presetOrder: order };
}

// ---------------------------------------------------------------- setup wizard

// Formats a Lua string.format pattern with %d / %s / %% only.
function luaFormat(fmt, args) {
  let i = 0;
  return fmt.replace(/%(%|d|s)/g, (_, k) => (k === "%" ? "%" : String(k === "d" ? Math.floor(args[i++]) : args[i++])));
}

// A setup text with named slots ({scale}%, {button}, ...) as the %d pattern it was before the string table:
// the slots in the order luaFormat fills them.
function positional(text) {
  return text.replace(/\{(?:scale|text)\}%/g, "%d%%").replace(/\{(?:step|count|button|width|height)\}/g, "%d").replace(/\{name\}/g, "%s");
}

// The Screen step's Keep hint: since the string table came in, one sentence naming who sets the UI scale
// ({owner}), filled with the game's slider (the owner unless Vanguard's pixel-perfect scale is on).
function keepScreenHint(m) {
  const named = (m.code.match(/if not p then return ns\.Format\("([^"]+)"/) || [])[1];
  if (!named) return (m.code.match(/if not p then return "([^"]+)"/) || [])[1];
  const owner = (m.code.match(/return "(the game's UI Scale slider[^"]*)"/) || [])[1];
  return owner ? named.replace("{owner}", owner) : undefined;
}

// Core/Setup.lua: steps, layouts, screen presets (with the hint each shows), styles and texts. Null before it existed.
export function extractSetup(reader) {
  const m = luaFile(reader, "Core/Setup.lua");
  if (!m) return null;
  // STEPS holds page keys named by NAMES once a new character's profile step came in; before that, the names.
  const names = /local NAMES\s*=/.test(m.code) ? plain(findTable(m, "local NAMES")) : null;
  const steps = plain(findTable(m, "local STEPS")).map((k) => (names && names[k]) || k);
  const layouts = plain(findTable(m, "S.LAYOUTS"));
  const screens = plain(findTable(m, "S.SCREENS"));
  const styles = plain(findTable(m, "S.STYLES"));
  // Before the Pixel-perfect choice the hint was one format string; after it, a scale sentence plus a tail.
  const oldFmt = (m.code.match(/string\.format\("(UI scale %d%%[^"]*)"/) || [])[1];
  const moves = (m.code.match(/or "(Moves the game's UI Scale slider to %d%%[^"]*)"/) || [])[1];
  const tail = (m.code.match(/scale \.\. "([^"]+)"/) || [])[1];
  // Since the string table came in, one whole sentence with named slots, in the same order.
  const named = (m.code.match(/"(Moves the game's UI Scale slider to \{scale\}%[^"]*)"/) || [])[1];
  const fmt = oldFmt || (named ? positional(named) : `${moves}${tail}`);
  const pct = (v) => Math.floor(v * 100 + 0.5);
  for (const s of screens) s.hint = luaFormat(fmt, [pct(s.ui), s.button, s.tile[0], s.tile[1], pct(s.textScale)]);
  // The Screen step's own Keep button ("Keep my current sizes"); the first "keep" in the file is the Layout step's.
  const keepText = (m.code.match(/out\[#out \+ 1\]\s*=\s*\{\s*key\s*=\s*"keep"\s*,\s*text\s*=\s*"([^"]+)"/) || m.code.match(/key\s*=\s*"keep"\s*,\s*text\s*=\s*"([^"]+)"/) || [])[1];
  const pixelText = (m.code.match(/S\.PIXEL\s*=\s*\{\s*key\s*=\s*"pixel"\s*,\s*text\s*=\s*"([^"]+)"/) || [])[1] || null;
  const keepHint = keepScreenHint(m);
  // Each step's question, found by the list it offers: [layout, screen]; the profile step's apart.
  const question = (list) => (m.code.match(new RegExp(`choicePage\\(page,\\s*"([^"]+)",\\s*${list}`)) || [])[1];
  const questions = [question("(?:S\\.LAYOUTS|layoutChoices\\(\\))"), question("screenChoices\\(\\)")];
  const profileQuestion = question("profileChoices\\(\\)") || null;
  const profileName = (names && names.profile) || null;
  // In chat when setup ends: finished (AGAIN), or closed while still owed (LATER).
  const again = (m.code.match(/local AGAIN\s*=\s*"([^"]+)"/) || [])[1] || null;
  const later = (m.code.match(/local LATER\s*=\s*"([^"]+)"/) || [])[1] || null;
  const moveLines = plain(findTable(m, "local lines")) || [];
  const combat = (m.code.match(/ns\.Chat\("(Setup opens[^"]*)"\)/) || [])[1];
  const reloadModule = (m.code.match(/if state\.reload then return "([^"]+)"/) || [])[1];
  const reloadTile = (m.code.match(/if state\.retile then return "([^"]+)"/) || [])[1];
  const keepBelow = Number((m.code.match(/if h < (\d+) then return "keep"/) || [])[1]);
  const yourScreen = (m.code.match(/·\s*(your screen)"/) || [])[1];
  const oldCaption = (m.code.match(/string\.format\("(Step %d of %d · %s)"/) || [])[1];
  const namedCaption = (m.code.match(/"(Step \{step\} of \{count\} · \{name\})"/) || [])[1];
  const caption = oldCaption || (namedCaption && positional(namedCaption));
  const title = (m.code.match(/"title",\s*"text",\s*"([^"]+)"/) || m.code.match(/ns\.WindowTitle\(f,\s*"([^"]+)"/) || [])[1];
  return { steps, layouts, screens, styles, keepText, pixelText, keepHint, questions, profileQuestion, profileName, again, later, moveLines, combat, reloadModule, reloadTile, keepBelow, yourScreen, caption, title };
}

// ---------------------------------------------------------------- everything

// The addon's behaviour spec as one text: README.md first (the tagline, Install,
// License and Credits are read from it), then the pages it moved into docs/ in
// the docs split (one feature page per area, the command reference, the API
// and development notes). A ref from before the split has only the README.
const SPEC_DOCS = ["docs/COMMANDS.md", "docs/API.md", "docs/DEVELOPMENT.md"];
export function specText(reader) {
  const features = (reader.list ? reader.list("docs/features") : []).filter((f) => f.endsWith(".md")).map((f) => `docs/features/${f}`);
  const pages = features.length ? [...features, ...SPEC_DOCS] : [];
  return ["README.md", ...pages].map((f) => reader.read(f) || "").join("\n\n");
}

// A read(file) for one ref where "README.md" means the whole spec (specText).
export function specReader(reader) {
  return (file) => (file === "README.md" ? specText(reader) : reader.read(file));
}

// All data for one ref.
export function extractAddon(reader) {
  // Vanguard.toc from 0.4.0; ForeverUI.toc in releases made before the rename.
  const tocText = reader.read("Vanguard.toc") || reader.read("ForeverUI.toc");
  const meta = tocMeta(tocText);
  const files = tocFiles(tocText);
  const modules = extractModules(reader, files);
  return {
    ref: reader.ref,
    commit: reader.commit,
    meta,
    files,
    commands: extractCommands(reader),
    modules,
    moduleInfo: extractModuleInfo(reader),
    moduleLinks: extractModuleLinks(reader),
    pages: extractPages(reader, files, modules),
    theme: extractTheme(reader),
    setup: extractSetup(reader),
    readme: specText(reader),
    license: reader.read("LICENSE") || "",
    has: (file) => reader.read(file) != null,
  };
}
