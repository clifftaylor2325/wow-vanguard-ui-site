// The /vg commands a text types, read the way the addon's own translation check reads them
// (scripts/lib/i18n.mjs in the addon), so a translation can be held to typing every command
// exactly as the English does.

// The words each /vg command takes after its name, from the help table in Core/Slash.lua
// ({ "profile new|copy|delete <name>, profile reset", L[...] }), and every name its COMMANDS
// table answers to (move, options, ...): Map command -> Set of words. The site's reader has
// already unwrapped L[...], so the help text may follow the syntax bare.
export function commandWords(slashLua) {
  const table = (/^local COMMANDS = \{\n([\s\S]*?)\n\}/m.exec(slashLua) || [])[1] || "";
  const words = new Map([...table.matchAll(/^\s*(\w+) =/gm)].map((m) => [m[1], new Set()]));
  for (const [, syntax] of slashLua.matchAll(/^\s*\{ "([^"]+)", (?:L\[)?"/gm)) {
    for (const part of syntax.split(/,\s*|\s+\|\s+/)) {
      const [name, ...rest] = part.replace(/<[^>]*>/g, " ").split(/[^a-z0-9]+/).filter(Boolean);
      if (!words.has(name)) words.set(name, new Set());
      for (const w of rest) words.get(name).add(w);
    }
  }
  return words;
}

// The [bracketed group] at text[i] (brackets may nest), or null when it never closes.
function groupAt(text, i) {
  for (let depth = 0, j = i; j < text.length; j++) {
    depth += text[j] === "[" ? 1 : text[j] === "]" ? -1 : 0;
    if (depth === 0) return text.slice(i, j + 1);
  }
  return null;
}

// The argument at text[i]: a <placeholder>, a [bracketed group] or a word with |-alternatives;
// null when none starts there. An HTML tag is not a placeholder.
function argumentAt(text, i) {
  if (text[i] === "[") return groupAt(text, i);
  if (text[i] === "<") return (/^<(?!\/|(?:a|b|br|code|em|i|kbd|span|strong)[ >])[^>\n]*>/.exec(text.slice(i)) || [])[0] || null;
  return (/^[a-z0-9][a-z0-9_-]*(?:\|(?:<[^>\s]*>|[a-z0-9_-]+))*/.exec(text.slice(i)) || [])[0] || null;
}

// Whether an argument belongs to the command: a placeholder or group, or words the help table gives it.
function takes(arg, known) {
  return /^[<[]/.test(arg) || arg.split("|").every((w) => w.startsWith("<") || /^\d+$/.test(w) || known.has(w));
}

// The command typed from text[i] on, after its slash word: the slash word, the name and its arguments.
function commandAt(text, i, slash, words) {
  let span = slash, name = null;
  for (let arg; text[i] === " " && (arg = argumentAt(text, i + 1)); i += 1 + arg.length) {
    if (name === null ? !words.has(arg) && !arg.startsWith("<") : !takes(arg, words.get(name) || new Set())) break;
    name ??= arg;
    span += ` ${arg}`;
  }
  return span;
}

// The /vg commands a text holds, as typed: "/vg graphics apply", "/vg reset <frame|all>"; sorted.
export function commandsIn(text, words) {
  const plain = String(text).replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  return [...plain.matchAll(/\/(?:vg|vanguard)(?![a-z])/g)].map((m) => commandAt(plain, m.index + m[0].length, m[0], words)).sort();
}
