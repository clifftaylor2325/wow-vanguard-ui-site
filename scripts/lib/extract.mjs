// Turns one ref of the addon repo into plain data the pages are built from:
// TOC metadata, slash commands (help text verbatim), modules, options pages
// and rows (with defaults where the Lua has a literal one), theme colors and
// the setup wizard's choices. Extraction is deliberately narrow; the test
// suite fails if anything the Lua defines doesn't reach the site.
import { mask, findTable, blocks, parseTable, parseValue, splitTop, matchBracket, readString, plain } from "./lua.mjs";
import { tocFiles, tocMeta, tocRetailOnly, tocForeverOnly } from "./source.mjs";

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
      out.push({ name, file, defaults: moduleDefaults(m, def), live: def?.fields?.live === true });
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

// O.MODULE_INFO: module -> [name shown, description] (absent before it existed). The table in
// Core/Options.lua comes first; a module file adds its own row with
// `ns.Options.MODULE_INFO.Key = { ... }`, read from every file in `files`.
export function extractModuleInfo(reader, files = []) {
  const m = luaFile(reader, "Core/Options.lua");
  const t = m && findTable(m, "O.MODULE_INFO");
  return { ...(t ? plain(t) : {}), ...moduleFileInfo(reader, files) };
}

// The MODULE_INFO rows that module files assign one at a time: key -> [name, description].
function moduleFileInfo(reader, files) {
  const out = {};
  for (const file of files) {
    const m = luaFile(reader, file);
    if (!m) continue;
    for (const hit of m.bare.matchAll(/(?:^|\n)\s*((?:ns\.Options|O)\.MODULE_INFO\.(\w+))\s*=\s*\{/g)) {
      const row = findTable(m, hit[1]);
      if (row) out[hit[2]] = plain(row);
    }
  }
  return out;
}

// O.MODULE_LINKS: module -> { keys: its own switches, page } (absent before it existed).
export function extractModuleLinks(reader) {
  const m = luaFile(reader, "Core/Options.lua");
  const t = m && findTable(m, "O.MODULE_LINKS");
  return t ? plain(t) : {};
}

// CX.OVERLAPS (Modules/Coexist.lua): the other addons Vanguard notices at login, each with the
// module it overlaps and what both do; `part` when only some of the module's settings go
// (keys), `reload` when that needs one, and `also` the card's extra sentence. [] before it existed.
export function extractOverlaps(reader) {
  const m = luaFile(reader, "Modules/Coexist.lua");
  const t = m && findTable(m, "CX.OVERLAPS");
  if (!t) return [];
  return Object.entries(t.fields).map(([addon, v]) => {
    const row = plain(v);
    const [module, what] = Array.isArray(row) ? row : row._array;
    return { addon, module, what, part: !Array.isArray(row) && row.keys !== undefined, reload: row.reload === true, also: Array.isArray(row) ? null : row.also || null };
  }).filter((o) => typeof o.module === "string" && typeof o.what === "string");
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

// A literal number written after `name =` in code, or null when it is an expression (T.TEXT_SCALE.min).
function literalField(code, name) {
  const hit = code.match(new RegExp(`\\b${name}\\s*=\\s*(-?\\d+(?:\\.\\d+)?)\\s*[,}\\n]`));
  return hit ? Number(hit[1]) : null;
}

// The code of the table a slider's range expression names: a local table, or the function (glowPercentSlider())
// that returns one, as choicesOf follows a name. "" when there is none.
function rangeCode(ctx, v) {
  const { m, defs } = ctx;
  if (v?.fields) return m.code.slice(v.from, v.to);
  const call = v?.expr?.match(/^(\w+)\(\s*\)$/);
  if (call && defs.has(call[1])) return m.code.slice(defs.get(call[1]).from, defs.get(call[1]).to);
  const t = v?.expr ? findTable(m, `local ${v.expr}`) : null;
  return t ? m.code.slice(t.from, t.to) : "";
}

// A slider's range { min, max, step, percent }; a bound the code does not write as a number is null (the text
// size slider takes its limits from the theme), percent is true when its value is shown as "%d%%". null when
// the row's expression is not a table the build can find.
function rangeOf(ctx, v) {
  const code = rangeCode(ctx, v);
  if (!code) return null;
  const percent = /%%/.test(code);
  const [min, max, step] = ["min", "max", "step"].map((name) => literalField(code, name));
  return min === null && max === null && !percent ? null : { min, max, step, percent };
}

// Where a row's value lives: { scope, key, reload } (restart: true for O.RestartSetting, which applies at once
// while its module is live and needs a reload otherwise: applyRestart sets that) from the setter expression
// text, following small helper functions (themeSetting("x"), stripSetting("x"),
// enchantSetting()) into their bodies.
function settingRef(ctx, text, depth = 0) {
  const { m, defs, fileModule } = ctx;
  let hit = text.match(/\bO\.RestartSetting\(\s*"(\w+)"\s*,\s*"(\w+)"/);
  if (hit) return { scope: hit[1], key: hit[2], reload: true, restart: true };
  hit = text.match(/\b(reloadSetting|setting|liveSetting)\(\s*"(\w+)"\s*,\s*"(\w+)"\s*(,\s*true)?/);
  if (hit) return { scope: hit[2], key: hit[3], reload: hit[1] === "reloadSetting" || !!hit[4] };
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
    const viaKey = call[2] ? body.replace(/\bkey\b/g, `"${call[2]}"`) : body;
    let inner = null;
    if (call[2] && /ns\.MoverOptions\(\)\[key\]/.test(body)) inner = { scope: "movers", key: call[2], reload: false };
    else if (call[2] && /T\.Settings\(\)\[key\]/.test(body)) inner = { scope: "theme", key: call[2], reload: false };
    else inner = settingRef(ctx, viaKey, depth + 1);
    if (inner) return inner;
  }
  return null;
}

// The names a file calls O.ReloadRow by: "O.ReloadRow" itself and each local assigned it
// (`local essential, reloadRow = O.Essential, O.ReloadRow`).
function reloadRowNames(code) {
  const names = new Set(["O.ReloadRow"]);
  for (const decl of code.matchAll(/^local\s+([\w\s,]+?)\s*=\s*([^\n]+)$/gm)) {
    const values = decl[2].split(",").map((v) => v.trim());
    decl[1].split(",").forEach((name, i) => { if (values[i] === "O.ReloadRow") names.add(name.trim()); });
  }
  return names;
}

// Whether the row starting at `at` is the argument of O.ReloadRow (or a local alias of it), however many
// calls (essential(...)) sit between: the options window gives such a row the Needs reload tag. The
// release before v0.9.6 has no O.ReloadRow, so this reads nothing there.
function wrappedInReloadRow(ctx, at) {
  ctx.reloadNames ??= reloadRowNames(ctx.m.code);
  const before = ctx.m.code.slice(Math.max(0, at - 160), at);
  const call = before.match(/((?:[\w.]+\(\s*)+)$/);
  if (!call) return false;
  return call[1].split("(").some((name) => ctx.reloadNames.has(name.trim()));
}

// One row: kind, caption (with "<n>"-style placeholders for concatenated
// values), choices or range, and where its value lives.
function makeRow(ctx, kind, caption, extraParts, loop, wrapped = false) {
  const { m, defs } = ctx;
  const row = { kind, caption };
  const rest = extraParts.map(([a, b]) => m.code.slice(a, b)).join(", ");
  if (kind === "cycle" && extraParts[0]) row.choices = choicesOf(m, defs, parseValue(m, extraParts[0][0], extraParts[0][1]));
  if (kind === "slider" && extraParts[0]) row.range = rangeOf(ctx, parseValue(m, extraParts[0][0], extraParts[0][1]));
  if (kind === "check" || kind === "cycle" || kind === "slider") {
    row.ref = settingRef(ctx, rest);
    const last = extraParts.length >= 3 ? parseValue(m, ...extraParts[extraParts.length - 1]) : undefined;
    if (kind === "check" && typeof last === "boolean") row.literalDefault = last;
  }
  if (loop) row.loop = loop;
  row.reload = / \(reload\)$/.test(caption) || wrapped || !!row.ref?.reload;
  return row;
}

// The start of a caption written as ns.Format("…{slot}…", { slot = value }).
const FORMAT_CALL = /^ns\.Format\(\s*/;
// How a caption's placeholder reads on the site, by its name.
const SHOWN = { n: "n", p: "phrase" };
// The same for a value joined onto a caption with `..`, by its last name (BS.MAX, SI.LABELS[name]):
// worded as the next release's ns.Format version of the caption words it, so the two are one row.
const JOINED_SHOWN = { MAX: "count", LABELS: "situation" };

// A caption's text with each {slot} shown as <slot>, the way the site lists it.
export function showSlots(text) {
  return text.replace(/\{(\w+)\}/g, (_, name) => `<${SHOWN[name] || name}>`);
}

// Reads an ns.Format caption's text at code[i], once past `ns.Format(`: the first argument is a quoted
// string, or a name captionChoices can resolve. Each {slot} shows as <slot>, and its variable is the identifier
// the first slot's value starts with ({ n = n } gives n), so a row in a numeric loop is still seen as one.
// `key` is the string as the game looks it up in the language files. One caption for each string the first
// argument can be (a name with two choices gives two); null when it can't be told from the code.
function formatCaptions(ctx, i) {
  const { m } = ctx;
  const quoted = /["']/.test(m.code[i]);
  const named = quoted ? null : m.code.slice(i).match(/^[A-Za-z_]\w*/);
  if (!quoted && !named) return null;
  const strings = quoted ? [readString(m.code, i)] : (captionChoices(ctx, named[0], i) || []).map((value) => ({ value, end: i + named[0].length }));
  return strings.length ? strings.map((s) => formatCaption(m, s)) : null;
}

// One ns.Format caption: its string s ({ value, end }) and the values table that follows it.
function formatCaption(m, s) {
  const values = (m.code.slice(s.end).match(/^\s*,\s*\{([^}]*)\}/) || [])[1] || "";
  const first = (s.value.match(/\{(\w+)\}/) || [])[1];
  const variable = first ? (values.match(new RegExp(`\\b${first}\\s*=\\s*([A-Za-z_]\\w*)`)) || [])[1] || null : null;
  return { caption: showSlots(s.value), key: s.value, variable, end: s.end };
}

// A value joined onto a caption string with `..`: a name, maybe dotted or indexed, such as `BS.MAX`.
const JOINED_VALUE = /^\s*\.\.\s*([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)(?:\[[^\]]*\])?/;

// Reads a caption string at code[i] with the values and strings joined on after it (`"Clear " .. SI.LABELS[name]`),
// or an ns.Format caption (formatCaptions). Always a list: more than one when the caption is a name with
// several choices, empty when it can't be read.
function captionAt(ctx, i) {
  const { m } = ctx;
  const call = m.code.slice(i).match(FORMAT_CALL);
  if (call) return formatCaptions(ctx, i + call[0].length) || [];
  if (!/["']/.test(m.code[i])) return captionNames(ctx, i);
  const s = readString(m.code, i);
  const joined = m.code.slice(s.end).match(JOINED_VALUE);
  if (!joined) return [{ caption: s.value, variable: null, end: s.end }];
  const name = joined[1];
  const last = name.split(".").pop();
  const shown = `<${JOINED_SHOWN[last] || SHOWN[last] || last}>`;
  const after = m.code.slice(s.end + joined[0].length).match(/^\s*\.\.\s*(?=["'])/);
  const tail = after ? readString(m.code, s.end + joined[0].length + after[0].length) : null;
  return [{ caption: `${s.value}${shown}${tail ? tail.value : ""}`, variable: name.includes(".") ? null : name, end: tail ? tail.end : s.end }];
}

// Rows that show a note or a heading: a constant caption is left off for them, since a note kept in a
// constant is usually one the window shows only in some state (CG.OFF, CG.EMPTY).
const TEXT_KINDS = new Set(["text", "header"]);

// A caption that is a name (portraitRow's `label`, a loop's `g[2]`) rather than a string: one caption for
// each string captionChoices finds for it; none when the name can't be resolved.
function captionNames(ctx, i) {
  const text = ctx.m.code.slice(i).match(/^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*(?:\[\d+\])?/);
  if (!text) return [];
  const entries = fieldEntries(ctx, text[0], i);
  if (entries) return entries.map((e) => ({ caption: e.value, variable: null, end: i + text[0].length, entryKey: e.key }));
  const own = (flag) => new Set((ctx.constants?.get(text[0]) || []).filter((c) => c[flag]).map((c) => c.text));
  const [retail, forever] = [own("retail"), own("forever")];
  const constant = ctx.constants?.has(text[0]);
  return (captionChoices(ctx, text[0], i) || []).map((value) => ({ caption: value, variable: null, end: i + text[0].length, retail: retail.has(value), forever: forever.has(value), constant }));
}

// The rows of a constant table a loop walks, when the caption is one field of its loop variable
// (`for _, cat in ipairs(CF.Available()) ... check(cat.switch, setting("ChatFilter", cat.key))`): one
// { value, key } for each entry that has the field as a string, key being the entry's own `key`; null otherwise.
function fieldEntries(ctx, text, at) {
  const field = text.match(/^([A-Za-z_]\w*)\.([A-Za-z_]\w*)$/);
  if (!field || ctx.constants?.has(text)) return null;
  const loops = [...ctx.m.bare.slice(0, at).matchAll(new RegExp(`\\bfor\\s+\\w+\\s*,\\s*${field[1]}\\s+in\\s+ipairs\\(\\s*([\\w.]+(?:\\(\\))?)\\s*\\)`, "g"))];
  const table = loops.length ? loopTable(ctx, loops.pop()[1]) : null;
  const rows = (table?.array || []).map((row) => ({ value: row.fields?.[field[2]], key: row.fields?.key })).filter((e) => typeof e.value === "string");
  return rows.length && rows.length === table.array.length ? rows : null;
}

// The table a loop's ipairs() argument names: the constant table itself, or the one the named function filters.
function loopTable(ctx, expr) {
  const contexts = ctx.contexts || [ctx];
  const fn = expr.endsWith("()") ? expr.slice(0, -2) : null;
  const body = fn ? contexts.map((c) => (c.defs.has(fn) ? c.m.bare.slice(c.defs.get(fn).from, c.defs.get(fn).to) : null)).find(Boolean) : null;
  const name = fn ? (body?.match(/ipairs\(\s*([\w.]+)\s*\)/) || [])[1] : expr;
  return name ? contexts.map((c) => findTable(c.m, name)).find(Boolean) || null : null;
}

// The strings a name can stand for at code[at], read from the code: a local of the function around it (an
// and/or choice gives both strings), a parameter (what each call of the function passes), or `g[2]` in a loop
// over a table of rows. null when any part can't be told from the code alone.
function captionChoices(ctx, text, at, depth = 0) {
  const { m } = ctx;
  if (depth > 3) return null;
  const literal = text.trim().match(/^(["'])/);
  if (literal) return [readString(text.trim(), 0).value];
  const constant = ctx.constants?.get(text.trim());
  if (constant) return constant.map((c) => c.text);
  const entry = text.trim().match(/^([A-Za-z_]\w*)\[(\d+)\]$/);
  if (entry) return loopTableStrings(ctx, entry[1], Number(entry[2]), at);
  const name = text.trim().match(/^[A-Za-z_]\w*$/);
  if (!name) return null;
  const fn = enclosingFunction(ctx, at);
  if (!fn) return null;
  const body = m.code.slice(fn.from, at);
  const local = [...body.matchAll(new RegExp(`\\blocal\\s+${name[0]}\\s*=\\s*([^\\n]+)`, "g"))].pop();
  if (local) return choicesOfExpression(ctx, local[1], at, depth);
  const index = fn.params.indexOf(name[0]);
  return index < 0 || fn.name === "check" ? null : callArguments(ctx, fn.name, index, depth);
}

// An expression of strings joined by and/or (comparisons dropped): every string it can give.
function choicesOfExpression(ctx, expr, at, depth) {
  const parts = expr.replace(/\b\w+\s*[=~]=\s*(?:"[^"]*"|'[^']*'|\w+)/g, "").split(/\band\b|\bor\b/).map((p) => p.trim()).filter(Boolean);
  const found = parts.map((p) => captionChoices(ctx, p, at, depth + 1));
  return found.length && found.every(Boolean) ? found.flat() : null;
}

// The function around code[at] that the file defines: { name, params, from } (null when at is in none).
function enclosingFunction(ctx, at) {
  const { m, defs } = ctx;
  const inside = [...defs].filter(([, d]) => d.kind === "function" && d.from <= at && at < d.to).sort((a, b) => b[1].from - a[1].from)[0];
  if (!inside) return null;
  const open = m.bare.lastIndexOf("(", inside[1].from);
  return { name: inside[0], params: m.bare.slice(open + 1, inside[1].from).replace(/\)\s*$/, "").split(",").map((p) => p.trim()), from: inside[1].from };
}

// The strings every call of a function in this file gives its parameter number `index`; null when one is no string.
function callArguments(ctx, name, index, depth) {
  const { m } = ctx;
  const names = [name.split(".").pop(), ...[...m.bare.matchAll(new RegExp(`\\blocal\\s+(\\w+)\\s*=\\s*${name.split(".").pop()}\\s*(?:\\n|$)`, "g"))].map((x) => x[1])];
  const calls = names.flatMap((n) => [...m.bare.matchAll(new RegExp(`(?<![\\w.:])${n}\\(`, "g"))]).filter((c) => !/function\s+$/.test(m.bare.slice(Math.max(0, c.index - 12), c.index)));
  const found = calls.map((c) => {
    const open = c.index + c[0].length - 1;
    const part = splitTop(m.bare, open + 1, matchBracket(m.bare, open) - 1)[index];
    return part ? captionChoices(ctx, m.code.slice(part[0], part[1]), c.index, depth + 1) : null;
  });
  return found.length && found.every(Boolean) ? found.flat() : null;
}

// Item number `index` of each row of the table a loop `for _, name in ipairs(TABLE)` above code[at] walks; null when not a literal table of strings.
function loopTableStrings(ctx, name, index, at) {
  const { m } = ctx;
  const loops = [...m.bare.slice(0, at).matchAll(new RegExp(`\\bfor\\s+\\w+\\s*,\\s*${name}\\s+in\\s+ipairs\\(\\s*([A-Za-z_]\\w*)\\s*\\)`, "g"))];
  const table = loops.length ? findTable(m, `local ${loops.pop()[1]}`) : null;
  const strings = table?.array.map((row) => plain(row)?.[index - 1]);
  return strings?.length && strings.every((v) => typeof v === "string") ? strings : null;
}

// Expands the rows reachable from code[from..to): row literals, check(...)
// calls, visibility rows, and (recursively) the functions and tables it uses.
function expandRows(ctx, from, to, stack = [], loop = null) {
  const { m, defs } = ctx;
  const found = [];
  const lit = /\{\s*"(header|check|cycle|slider|button|text)"\s*,\s*/g;
  const chk = /(?<![\w.]|function\s)(?:O\.)?[Cc]heck\(\s*/g;
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
  for (const g of otherFileRefs(ctx, from, to, defs)) found.push(g);
  found.sort((a, b) => a.at - b.at);
  const rows = [];
  for (const f of found) {
    const lineStart = m.code.lastIndexOf("\n", f.at) + 1;
    const line = m.code.slice(lineStart, m.code.indexOf("\n", f.at));
    const loopHit = line.match(/\bfor\s+(\w+)\s*=\s*(\d+)\s*,\s*(\d+)\s+do\b/);
    const here = loopHit ? { variable: loopHit[1], from: Number(loopHit[2]), to: Number(loopHit[3]) } : loop;
    if (f.type === "global") {
      const g = ctx.globals.get(f.name);
      if (!stack.includes(f.name)) rows.push(...expandRows(g.ctx, g.def.from, g.def.to, [...stack, f.name], here));
      continue;
    }
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
    const kind = f.type === "lit" ? f.h[1] : f.type === "check" ? "check" : "visibility";
    const caps = captionAt(ctx, capStart).filter((c) => !(c.constant && TEXT_KINDS.has(kind)));
    if (!caps.length) ctx.skipped.push(`${ctx.m.file}:${m.code.slice(0, f.at).split("\n").length}`);
    for (const cap of caps) {
      const loopFor = cap.variable && here && here.variable === cap.variable ? here : null;
      const row = makeRow(ctx, kind, cap.caption, parts.slice(capIdx + 1), loopFor, wrappedInReloadRow(ctx, f.at));
      if (cap.key) row.key = cap.key;
      if (cap.retail) Object.assign(row, { clientOnly: "retail", retailName: true });
      if (cap.forever) row.clientOnly = "forever";
      if (cap.entryKey) row.ref ??= entryRef(m.code.slice(open, close), cap.entryKey);
      if (kind === "visibility") row.choices = ctx.visibility(m.code.slice(open, close));
      if (here && !loopFor) row.repeated = here;
      rows.push(row);
    }
  }
  return rows;
}

// Where a row made for a table entry keeps its value: setting("Module", cat.key) with cat.key read from the entry.
function entryRef(callText, key) {
  const hit = callText.match(/\bsetting\(\s*"(\w+)"\s*,\s*\w+\.key\b/);
  return hit && typeof key === "string" ? { scope: hit[1], key, reload: false } : undefined;
}

// The rows functions of other files that code[from..to) names (O.CalmRows(), ns.QuestGuide.Rows,
// ns.GetModule("QuestArrow").Rows()): { at, type: "global", name } for each, by the names in ctx.globals.
function otherFileRefs(ctx, from, to, defs) {
  if (!ctx.globals) return [];
  const { m } = ctx;
  const found = [];
  const named = /ns\.GetModule\("\w+"\)\.\w+|[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)+/g;
  named.lastIndex = from;
  let r;
  while ((r = named.exec(m.code)) && r.index < to) {
    if (ctx.globals.has(r[0]) && !defs.has(r[0])) found.push({ at: r.index, type: "global", name: r[0] });
  }
  return found;
}

// The rows without a heading that has nothing under it (its rows were captions the extractor can't read).
function withoutEmptyGroups(rows) {
  return rows.filter((r, i) => r.kind !== "header" || (rows[i + 1] && rows[i + 1].kind !== "header"));
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
// The options window's row tips from Core/OptionsNames.lua: O.RENAMED (a short name -> the longer caption it had, which
// the window keeps as the row's tip) and O.GAME_SETTING_TIPS (a name -> its tip), each as Map English -> English.
// Empty maps before the file existed. The reader has already unwrapped L["…"] to "…"; either form is read.
export function extractRowTips(reader) {
  const code = reader.read("Core/OptionsNames.lua") || "";
  const table = (name) => {
    const body = (code.match(new RegExp(`^O\\.${name} = \\{([\\s\\S]*?)^\\}`, "m")) || [])[1] || "";
    return new Map([...body.matchAll(/\["((?:[^"\\]|\\.)*)"\]\s*=\s*(?:L\[)?"((?:[^"\\]|\\.)*)"/g)].map((m) => [m[1].replace(/\\"/g, '"'), m[2].replace(/\\"/g, '"')]));
  };
  return { renamed: table("RENAMED"), game: table("GAME_SETTING_TIPS") };
}

export function extractPages(reader, files, modules, skipped = []) {
  const visibility = visibilityChoices(reader);
  const contexts = files.map((file) => pageContext(reader, file, visibility, skipped)).filter(Boolean);
  const toc = reader.read("Vanguard.toc") || reader.read("ForeverUI.toc") || "";
  const [retailOnly, foreverOnly] = [tocRetailOnly(toc), tocForeverOnly(toc)];
  for (const ctx of contexts) Object.assign(ctx, { retailOnly: retailOnly.has(ctx.file), foreverOnly: foreverOnly.has(ctx.file) });
  const globals = rowFunctions(contexts);
  const constants = captionConstants(contexts);
  for (const ctx of contexts) Object.assign(ctx, { globals, constants, contexts });
  const pages = contexts.flatMap((ctx) => filePages(ctx));
  for (const ctx of contexts) addedRows(ctx, pages);
  markForeverModules(pages, modules.filter((m) => foreverOnly.has(m.file)).map((m) => m.name));
  for (const p of pages) p.rows = withoutEmptyGroups(dedupe(p.rows));
  pages.sort((a, b) => a.order - b.order);
  applyDefaults(pages, modules, reader);
  applyRestart(pages, modules);
  return pages;
}

// One file's reading context for its option pages (null when the ref has no such file).
function pageContext(reader, file, visibility, skipped) {
  const m = luaFile(reader, file);
  if (!m) return null;
  const fileModule = (m.code.match(/ns\.Module\(\s*"(\w+)"/) || [])[1] || null;
  return { file, m, defs: blocks(m), fileModule, visibility, skipped };
}

// The string constants rows take their captions from, across the TOC's files: name -> [{ text, retail }].
// `DC.NAME = "Dungeon card"` (also under the name the file publishes the table as, ns.DungeonCard), and
// `O.NAME = ns.ClientData({ forever = "...", retail = "..." })`, which gives the Forever text and the
// Retail one (retail: true, so its row shows for Retail only).
function captionConstants(contexts) {
  const out = new Map();
  for (const { m } of contexts) {
    const published = new Map([...m.code.matchAll(/^ns\.(\w+)\s*=\s*(\w+)\s*$/gm)].map((x) => [x[2], `ns.${x[1]}`]));
    const plainOnes = [...m.code.matchAll(/^([A-Za-z_]\w*)\.([A-Za-z_]\w*)\s*=\s*"((?:[^"\\\n]|\\.)*)"\s*$/gm)].map((x) => [x[1], x[2], [{ text: x[3], retail: false }]]);
    const perClient = [...m.code.matchAll(/^([A-Za-z_]\w*)\.([A-Za-z_]\w*)\s*=\s*ns\.ClientData\(\{\s*forever\s*=\s*"((?:[^"\\\n]|\\.)*)",\s*retail\s*=\s*"((?:[^"\\\n]|\\.)*)",?\s*\}\)/gm)].map((x) => [x[1], x[2], [{ text: x[3], retail: false, forever: true }, { text: x[4], retail: true }]]);
    for (const [table, field, values] of [...plainOnes, ...perClient]) {
      for (const name of [table, published.get(table)].filter(Boolean)) out.set(`${name}.${field}`, values);
    }
  }
  return out;
}

// The functions of any file that build option rows, by every name other files call them by (O.CalmRows,
// ns.QuestGuide.Rows, ns.GetModule("QuestGuide").Rows): name -> { ctx, def }.
function rowFunctions(contexts) {
  const out = new Map();
  const makesRows = /\{\s*"(?:header|check|cycle|slider|button|text)"\s*,|(?<![\w.])(?:O\.)?[Cc]heck\(/;
  for (const ctx of contexts) {
    for (const [name, def] of ctx.defs) {
      if (def.kind !== "function" || !name.includes(".") || !makesRows.test(ctx.m.code.slice(def.from, def.to))) continue;
      const last = name.split(".").pop();
      const names = [name, ...(ctx.fileModule ? [`ns.${ctx.fileModule}.${last}`, `ns.GetModule("${ctx.fileModule}").${last}`] : [])];
      for (const n of names) if (!out.has(n)) out.set(n, { ctx, def });
    }
  }
  return out;
}

// The pages one file declares (Core/Options.lua's PAGES and every AddPage({...})): key, title, order, rows.
function filePages(ctx) {
  const { m, file } = ctx;
  const tables = [];
  if (file === "Core/Options.lua") {
    const t = findTable(m, "local PAGES");
    if (t) tables.push(...t.array);
  }
  for (const hit of m.bare.matchAll(/AddPage\(\s*\{/g)) tables.push(parseTable(m, hit.index + hit[0].length - 1));
  const pages = [];
  for (const t of tables) {
    if (!t?.fields) continue;
    const f = t.fields;
    const rowsV = f.rows;
    if (!rowsV || typeof f.title !== "string") continue;
    const key = typeof f.key === "string" ? f.key : f.key?.expr ? resolveConst(m, f.key.expr) : f.title.toLowerCase();
    const range = rowsV.expr !== undefined ? [rowsV.from, rowsV.to] : [t.from, t.to];
    const rows = expandRows(ctx, range[0], range[1]);
    const page = { key, title: f.title, order: typeof f.order === "number" ? f.order : 999, file };
    pages.push(ctx.foreverOnly ? { ...page, clientOnly: "forever", rows } : { ...page, rows: fromClient(ctx, rows) });
  }
  return pages;
}

// Rows from a file only one client loads (read from the TOC's load flags) carry clientOnly: "retail" or "forever".
function fromClient(ctx, rows) {
  const only = ctx.retailOnly ? "retail" : ctx.foreverOnly ? "forever" : null;
  return only ? rows.map((r) => ({ ...r, clientOnly: only })) : rows;
}

// A row whose setting belongs to a module only WoW Forever loads is a Forever-only row, wherever its page is
// (the threat readouts on Unit frames, the swing timer): it carries clientOnly "forever" unless its page already does.
function markForeverModules(pages, names) {
  const forever = new Set(names);
  for (const p of pages.filter((x) => !x.clientOnly)) {
    p.rows = p.rows.map((r) => (!r.clientOnly && forever.has(r.ref?.scope) ? { ...r, clientOnly: "forever" } : r));
  }
}

// Rows a file adds to another file's page: ns.Options.AddRows("page", Fn[, true]) (after the page's own rows, or
// before them with true), and ns.RetailRows(function() ... end) (on the Game windows page, above its Reset button).
function addedRows(ctx, pages) {
  const { m } = ctx;
  for (const hit of m.code.matchAll(/(?:ns\.Options|O)\.AddRows\(\s*"(\w+)"\s*,\s*([\w.]+)\s*(,\s*true)?\s*\)/g)) {
    const def = ctx.defs.get(hit[2]);
    const page = pages.find((p) => p.key === hit[1]);
    if (!def || !page) continue;
    const rows = fromClient(ctx, expandRows(ctx, def.from, def.to, [hit[2]]));
    page.rows = hit[3] ? [...rows, ...page.rows] : [...page.rows, ...rows];
  }
  for (const hit of m.bare.matchAll(/ns\.RetailRows\(\s*function\s*\(/g)) {
    const page = pages.find((p) => p.key === "windows");
    if (!page) continue;
    const open = m.bare.indexOf("(", hit.index);
    const rows = fromClient(ctx, expandRows(ctx, open, matchBracket(m.bare, m.bare.indexOf("(", hit.index))));
    const at = page.rows.findIndex((r) => r.kind === "button" && r.caption === "Reset window positions");
    page.rows.splice(at < 0 ? page.rows.length : at, 0, ...rows);
  }
}

// The literal string a file-level `local NAME = "..."` holds.
function resolveConst(m, name) {
  const hit = m.code.match(new RegExp(`local\\s+${name}\\s*=\\s*"([^"]*)"`));
  return hit ? hit[1] : name.toLowerCase();
}

// A row set by O.RestartSetting applies at once when its module declares live = true, and needs a reload
// otherwise; appliesLive tells the page to draw its caption without the "(reload)" words.
function applyRestart(pages, modules) {
  const live = new Set(modules.filter((x) => x.live).map((x) => x.name));
  for (const r of pages.flatMap((p) => p.rows)) {
    if (!r.ref?.restart) continue;
    r.appliesLive = live.has(r.ref.scope);
    r.reload = !r.appliesLive;
  }
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

// A "%d%%" slider's default: a fraction of one (a limit of 2 or less, else the default itself when the
// limits are unknown) is shown as a percent of it, any other number is already one.
function percentLabel(row) {
  const fraction = (row.range.max ?? row.default) <= 2;
  return `${fraction ? Math.round(row.default * 100) : row.default}%`;
}

// The text a player sees for a row's default ("On", "Off", a choice label, a number).
export function defaultLabel(row) {
  if (row.default === undefined) return null;
  if (row.kind === "check") return row.default ? "On" : "Off";
  if (row.kind === "cycle" && row.choices) {
    const c = row.choices.find((x) => x[0] === row.default);
    return c ? String(c[1]) : null;
  }
  if (row.kind === "slider") return row.range?.percent ? percentLabel(row) : String(row.default);
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

// Core/SetupGuide.lua (from 0.9.4): what each guided step asks and its rows, read as the addon writes
// them. A row's mark: "yes" when it is recommended outright, "some" when the role or the client decides
// (recommend is a function), "" when it is offered and not recommended. Null before the file existed.
function extractGuide(reader) {
  const text = reader.read("Core/SetupGuide.lua");
  if (!text) return null;
  const rowsAt = text.indexOf("G.ROWS = {");
  const rowsBlock = rowsAt < 0 ? "" : text.slice(rowsAt, text.indexOf("\n}\n", rowsAt));
  const steps = {};
  for (const [, key, body] of rowsBlock.matchAll(/\n  (\w+) = \{\n([\s\S]*?)\n  \},/g)) {
    steps[key] = { rows: [...body.matchAll(/\{ key = "(\w+)", caption = "([^"]+)"([\s\S]*?)(?=\n    \{ key = |$)/g)].map((m) => ({ key: m[1], caption: m[2], mark: /recommend = true/.test(m[3]) ? "yes" : /recommend = \w+/.test(m[3]) ? "some" : "" })) };
  }
  const qAt = text.indexOf("local QUESTIONS = {");
  const qBlock = qAt < 0 ? "" : text.slice(qAt, text.indexOf("\n}", qAt));
  for (const [, key, q] of qBlock.matchAll(/\n  (\w+) = "([^"]+)"/g)) if (steps[key]) steps[key].question = q;
  const line = (name) => (text.match(new RegExp(`local ${name} = "([^"]+)"`)) || [])[1] || null;
  return { steps, doneChanged: line("DONE_CHANGED"), doneSame: line("DONE_SAME") };
}

// Core/Setup.lua: steps, layouts, screen presets (with the hint each shows), styles and texts. Null before it existed.
export function extractSetup(reader) {
  const m = luaFile(reader, "Core/Setup.lua");
  if (!m) return null;
  // STEPS holds page keys named by NAMES once a new character's profile step came in; before that, the names.
  const names = /local NAMES\s*=/.test(m.code) ? plain(findTable(m, "local NAMES")) : null;
  const steps = plain(findTable(m, "local STEPS")).map((k) => (names && names[k]) || k);
  const stepKeys = plain(findTable(m, "local STEPS"));
  const guide = extractGuide(reader);
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
  for (const s of screens) {
    s.hint = luaFormat(fmt, [pct(s.ui), s.button, s.tile[0], s.tile[1], pct(s.textScale)]);
    // The values of the named sentence, for the site to fill the addon's translation of it.
    s.values = { scale: pct(s.ui), button: s.button, width: s.tile[0], height: s.tile[1], text: pct(s.textScale) };
  }
  // The Screen step's own Keep button ("Keep my current sizes"); the first "keep" in the file is the Layout step's.
  const keepText = (m.code.match(/out\[#out \+ 1\]\s*=\s*\{\s*key\s*=\s*"keep"\s*,\s*text\s*=\s*"([^"]+)"/) || m.code.match(/key\s*=\s*"keep"\s*,\s*text\s*=\s*"([^"]+)"/) || [])[1];
  const pixelText = (m.code.match(/S\.PIXEL\s*=\s*\{\s*key\s*=\s*"pixel"\s*,\s*text\s*=\s*"([^"]+)"/) || [])[1] || null;
  const keepHint = keepScreenHint(m);
  // The named sentences as the string table keys them (null before it came in), for their translations.
  const keepNamed = (m.code.match(/if not p then return ns\.Format\(L\["([^"]+)"/) || m.code.match(/if not p then return ns\.Format\("([^"]+)"/) || [])[1] || null;
  const keepOwner = (m.code.match(/return "(the game's UI Scale slider[^"]*)"/) || [])[1] || null;
  // Each step's question, found by the list it offers: [layout, screen]; the profile step's apart.
  const question = (list) => (m.code.match(new RegExp(`choicePage\\(page,\\s*"([^"]+)",\\s*${list}`)) || [])[1];
  const questions = [question("(?:S\\.LAYOUTS|layoutChoices\\(\\))"), question("screenChoices\\(\\)")];
  const profileQuestion = question("profileChoices\\(\\)") || null;
  const profileName = (names && names.profile) || null;
  // In chat when setup ends: finished (AGAIN), or closed while still owed (LATER).
  const again = (m.code.match(/local AGAIN\s*=\s*"([^"]+)"/) || [])[1] || null;
  const later = (m.code.match(/local LATER\s*=\s*"([^"]+)"/) || [])[1] || null;
  const moveLines = plain(findTable(m, "local texts") || findTable(m, "local lines")) || [];
  const combat = (m.code.match(/ns\.Chat\("(Setup opens[^"]*)"\)/) || [])[1];
  const reloadModule = (m.code.match(/if state\.reload then return "([^"]+)"/) || [])[1];
  const reloadTile = (m.code.match(/if state\.retile then return "([^"]+)"/) || [])[1];
  const keepBelow = Number((m.code.match(/if h < (\d+) then return "keep"/) || [])[1]);
  const yourScreen = (m.code.match(/"(\{screen\} \(\{width\} x \{height\}\)\s+·\s+your screen)"/) || [])[1];
  const oldCaption = (m.code.match(/string\.format\("(Step %d of %d · %s)"/) || [])[1];
  const namedCaption = (m.code.match(/"(Step \{step\} of \{count\} · \{name\})"/) || [])[1];
  const caption = oldCaption || (namedCaption && positional(namedCaption));
  const title = (m.code.match(/"title",\s*"text",\s*"([^"]+)"/) || m.code.match(/ns\.WindowTitle\(f,\s*"([^"]+)"/) || [])[1];
  const sentences = { hint: named || null, caption: namedCaption || null, keep: keepNamed, owner: keepOwner };
  return { steps, stepKeys, guide, layouts, screens, styles, keepText, pixelText, keepHint, questions, profileQuestion, profileName, again, later, moveLines, combat, reloadModule, reloadTile, keepBelow, yourScreen, caption, title, named: sentences };
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
  const skipped = [];
  return {
    ref: reader.ref,
    commit: reader.commit,
    meta,
    files,
    commands: extractCommands(reader),
    modules,
    moduleInfo: extractModuleInfo(reader, files),
    moduleLinks: extractModuleLinks(reader),
    overlaps: extractOverlaps(reader),
    pages: extractPages(reader, files, modules, skipped),
    skippedRows: [...new Set(skipped)],
    rowTips: extractRowTips(reader),
    theme: extractTheme(reader),
    setup: extractSetup(reader),
    readme: specText(reader),
    license: reader.read("LICENSE") || "",
    has: (file) => reader.read(file) != null,
  };
}
