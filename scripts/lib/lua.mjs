// A small, narrow Lua reader: enough to pull literal tables, string lists and
// function bodies out of the addon source. It never runs Lua. Anything it
// can't read as a literal comes back as { expr } so callers can skip it.

// Masks a Lua source: `code` has comments blanked (same length, newlines kept);
// `bare` also blanks the inside of string literals (quotes kept).
export function mask(src) {
  const code = src.split("");
  const bare = src.split("");
  const blank = (arr, from, to) => {
    for (let i = from; i < to; i++) if (arr[i] !== "\n") arr[i] = " ";
  };
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "-" && src[i + 1] === "-") {
      const long = src.slice(i + 2).match(/^\[(=*)\[/);
      let end;
      if (long) {
        const close = "]" + long[1] + "]";
        end = src.indexOf(close, i + 2 + long[0].length);
        end = end < 0 ? src.length : end + close.length;
      } else {
        end = src.indexOf("\n", i);
        if (end < 0) end = src.length;
      }
      blank(code, i, end);
      blank(bare, i, end);
      i = end;
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== c && src[j] !== "\n") j += src[j] === "\\" ? 2 : 1;
      blank(bare, i + 1, j);
      i = j + 1;
      continue;
    }
    const long = c === "[" ? src.slice(i).match(/^\[(=*)\[/) : null;
    if (long) {
      const close = "]" + long[1] + "]";
      let end = src.indexOf(close, i + long[0].length);
      end = end < 0 ? src.length : end + close.length;
      blank(bare, i + long[0].length, end - close.length);
      i = end;
      continue;
    }
    i++;
  }
  return { src, code: code.join(""), bare: bare.join("") };
}

// Index just past the bracket matching the one at `open` ({, ( or [), using bare text.
export function matchBracket(bare, open) {
  const pairs = { "{": "}", "(": ")", "[": "]" };
  const stack = [];
  for (let i = open; i < bare.length; i++) {
    const c = bare[i];
    if (pairs[c]) stack.push(pairs[c]);
    else if (c === "}" || c === ")" || c === "]") {
      if (stack.pop() !== c) throw new Error(`unbalanced bracket at ${i}`);
      if (stack.length === 0) return i + 1;
    }
  }
  throw new Error(`unclosed bracket at ${open}`);
}

// Index just past the `end` that closes a function body starting at `from` (after its parameter list).
export function matchEnd(bare, from) {
  const re = /\b(function|if|do|repeat|end|until)\b/g;
  re.lastIndex = from;
  let depth = 1;
  let m;
  while ((m = re.exec(bare))) {
    const w = m[1];
    if (w === "function" || w === "if" || w === "do" || w === "repeat") depth++;
    else if (w === "end" || w === "until") depth--;
    if (depth === 0) return m.index + w.length;
  }
  throw new Error(`function body at ${from} never ends`);
}

// Decodes one Lua short string literal starting at src[i] (a quote). Returns { value, end }.
export function readString(src, i) {
  const q = src[i];
  let out = "";
  let j = i + 1;
  while (j < src.length && src[j] !== q) {
    if (src[j] === "\\") {
      const n = src[j + 1];
      const map = { n: "\n", t: "\t", r: "\r", "\\": "\\", '"': '"', "'": "'", a: "\x07", b: "\b", f: "\f", v: "\v" };
      const dec = src.slice(j + 1).match(/^\d{1,3}/);
      if (dec) {
        out += String.fromCharCode(Number(dec[0]));
        j += 1 + dec[0].length;
        continue;
      }
      out += map[n] ?? n;
      j += 2;
      continue;
    }
    out += src[j++];
  }
  return { value: out, end: j + 1 };
}

// Splits the inside of a table constructor or argument list (from..to in bare
// text) at depth-0 commas/semicolons. Returns [start, end] ranges.
export function splitTop(bare, from, to) {
  const parts = [];
  let depth = 0;
  let start = from;
  for (let i = from; i < to; i++) {
    const c = bare[i];
    if (c === "{" || c === "(" || c === "[") depth++;
    else if (c === "}" || c === ")" || c === "]") depth--;
    else if ((c === "," || c === ";") && depth === 0) {
      parts.push([start, i]);
      start = i + 1;
    }
    // `function ... end` inside a list holds commas of its own.
    if (depth === 0 && bare.startsWith("function", i) && /\W/.test(bare[i - 1] || " ") && /\W/.test(bare[i + 8] || " ")) {
      const params = bare.indexOf("(", i);
      const close = matchBracket(bare, params);
      i = matchEnd(bare, close) - 1;
    }
  }
  if (bare.slice(start, to).trim()) parts.push([start, to]);
  return parts;
}

// Parses the Lua value in m.code[from..to). Literals become JS values; a table
// becomes { array: [...], fields: {...} }; anything else { expr, from, to }.
export function parseValue(m, from, to) {
  const text = m.code.slice(from, to);
  const lead = text.length - text.trimStart().length;
  const s = from + lead;
  const t = text.trim();
  if (/^(true|false)$/.test(t)) return t === "true";
  if (t === "nil") return null;
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  if (/^["']/.test(t)) {
    const r = readString(m.code, s);
    if (m.code.slice(r.end, to).trim() === "") return r.value;
  }
  if (t.startsWith("{") && matchBracket(m.bare, s) === s + t.length) return parseTable(m, s);
  return { expr: t, from: s, to: s + t.length };
}

// Parses the table constructor whose `{` is at m.code[open].
export function parseTable(m, open) {
  const close = matchBracket(m.bare, open) - 1;
  const out = { array: [], fields: {}, from: open, to: close + 1 };
  for (const [a, b] of splitTop(m.bare, open + 1, close)) {
    const piece = m.bare.slice(a, b);
    const named = piece.match(/^\s*([A-Za-z_]\w*)\s*=(?!=)/);
    const bracketed = piece.match(/^\s*\[\s*["']/);
    if (named) {
      out.fields[named[1]] = parseValue(m, a + named[0].length, b);
    } else if (bracketed) {
      const ks = m.code.indexOf("[", a);
      const key = readString(m.code, m.code.slice(ks).search(/["']/) + ks);
      const eq = m.bare.indexOf("=", key.end);
      out.fields[key.value] = parseValue(m, eq + 1, b);
    } else {
      out.array.push(parseValue(m, a, b));
    }
  }
  return out;
}

// The table assigned to `name` (e.g. "local HELP", "O.MODULE_INFO", "S.SCREENS").
export function findTable(m, name) {
  const esc = name.replace(/[.]/g, "\\.").replace(/\s+/g, "\\s+");
  const re = new RegExp(`(?:^|\\n)\\s*${esc}\\s*=\\s*\\{`, "g");
  const hit = re.exec(m.bare);
  if (!hit) return null;
  return parseTable(m, hit.index + hit[0].length - 1);
}

// Every function and table defined in a file: name -> { from, to, kind }.
export function blocks(m) {
  const out = new Map();
  const fn = /(?:^|\n)(?:local\s+)?function\s+([A-Za-z_][\w.:]*)\s*\(/g;
  let hit;
  while ((hit = fn.exec(m.bare))) {
    const open = hit.index + hit[0].length - 1;
    const close = matchBracket(m.bare, open);
    out.set(hit[1].replace(":", "."), { from: close, to: matchEnd(m.bare, close), kind: "function" });
  }
  const tbl = /(?:^|\n)(?:local\s+)?([A-Za-z_][\w.]*)\s*=\s*\{/g;
  while ((hit = tbl.exec(m.bare))) {
    const open = hit.index + hit[0].length - 1;
    if (!out.has(hit[1])) out.set(hit[1], { from: open, to: matchBracket(m.bare, open), kind: "table", extra: appends(m, hit[1]) });
  }
  return out;
}

// Top-level `for ... do NAME[#NAME + 1] = ... end` statements that add rows to
// the table NAME after it is made: [from, to] ranges.
function appends(m, name) {
  const out = [];
  const esc = name.replace(/[.]/g, "\\.");
  const re = new RegExp(`(?:^|\\n)for\\b`, "g");
  let hit;
  while ((hit = re.exec(m.bare))) {
    const start = hit.index + (m.bare[hit.index] === "\n" ? 1 : 0);
    const doAt = m.bare.slice(start).search(/\bdo\b/);
    if (doAt < 0) continue;
    const end = matchEnd(m.bare, start + doAt + 2);
    if (new RegExp(`${esc}\\[#${esc}\\s*\\+\\s*1\\]`).test(m.bare.slice(start, end))) out.push([start, end]);
  }
  return out;
}

// Plain JS from a parsed table: arrays and fields merged, nested tables converted.
export function plain(v) {
  if (v === null || typeof v !== "object") return v;
  if (v.expr !== undefined) return undefined;
  const hasFields = Object.keys(v.fields).length > 0;
  if (!hasFields) return v.array.map(plain);
  const o = {};
  for (const [k, x] of Object.entries(v.fields)) o[k] = plain(x);
  if (v.array.length) o._array = v.array.map(plain);
  return o;
}
