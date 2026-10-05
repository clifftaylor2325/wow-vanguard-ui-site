// Reads what a player pastes from the game: a `/vg report` block (between
// "### Vanguard report v1 ###" and "### end ###"), or the lines of
// `/vg status` and `/vg errors` copied from chat, or the two status lines
// v0.3.0 prints. Pastes from before the rename (ForeverUI 0.3.0 and earlier:
// "### ForeverUI report v1 ###", "ForeverUI:" chat lines) read the same. It finds the version, client, build and interface, the caught
// errors, and the error fingerprint used to spot the same bug twice.
// The line formats are Core/Slash.lua's (statusCommand, errorsCommand,
// clientLine) and Core/Events.lua's chat prefix.

export const REPORT_START = "### Vanguard report v1 ###";
// The report header before the addon was renamed from ForeverUI.
export const OLD_REPORT_START = "### ForeverUI report v1 ###";
export const REPORT_END = "### end ###";

// One pasted line without the game's color codes, a chat timestamp, or the
// "Vanguard: " (or, before the rename, "ForeverUI: ") prefix chat puts in front of each line.
function plainLine(line) {
  return line
    .replace(/\|c[0-9a-fA-F]{8}/g, "")
    .replace(/\|r/g, "")
    .replace(/^\s*\[?\d{1,2}:\d{2}(?::\d{2})?\]?\s+(?=(?:Vanguard|ForeverUI):)/, "")
    .replace(/^(?:Vanguard|ForeverUI): ?/, "");
}

// The lines to read: inside the report markers when they are there.
function reportLines(text) {
  const lines = String(text ?? "").replace(/\r\n?/g, "\n").split("\n").map(plainLine);
  const start = lines.findIndex((l) => l.trim() === REPORT_START || l.trim() === OLD_REPORT_START);
  if (start < 0) return { format: "chat", lines };
  const end = lines.findIndex((l, i) => i > start && l.trim() === REPORT_END);
  return { format: "v1", lines: lines.slice(start + 1, end < 0 ? undefined : end) };
}

// A short value read from a line, or "" when it isn't there.
function grab(lines, re) {
  for (const l of lines) {
    const m = l.match(re);
    if (m) return m[1];
  }
  return "";
}

// The caught errors: an unindented line ending in "(xN)" (optionally "[n] "
// in front), then its indented stack lines.
function readErrors(lines) {
  const errors = [];
  let current = null;
  for (const l of lines) {
    const m = l.match(/^(?:\[\d+\]\s+)?(\S.*?)\s+\(x(\d+)\)\s*$/);
    if (m && !/^\s/.test(l)) {
      current = { text: m[1], count: Number(m[2]), stack: [] };
      errors.push(current);
    } else if (current && /^\s+\S/.test(l)) {
      current.stack.push(l.trim());
    } else if (l.trim()) {
      current = null;
    }
  }
  return errors;
}

// What the paste says: format ("v1", "chat" or "empty"), version, client,
// release, build, iface (each "" when not found) and errors.
export function parseReport(text) {
  if (!String(text ?? "").trim()) return { format: "empty", version: "", client: "", release: "", build: "", iface: "", errors: [] };
  const { format, lines } = reportLines(text);
  const build = lines.map((l) => l.match(/\bbuild (\S+) \((\d+)\)/)).find(Boolean);
  return {
    format,
    version: grab(lines, /^\s*(?:Vanguard|ForeverUI) v?(\d[\w.-]*)\b/),
    client: grab(lines, /^\s*Client (WoW Forever|Retail)\b/),
    release: build ? build[1] : "",
    build: build ? build[2] : "",
    iface: grab(lines, /\binterface (\d+)\b/),
    errors: readErrors(lines),
  };
}

// An error text or stack line without what changes between two players who
// hit the same bug: line numbers (`file.lua:123:`, `[string "..."]:123:`),
// addresses (`0x...`, `table: 0000...`), counts like `(x3)`, and extra spaces.
export function normalize(value) {
  return String(value ?? "")
    .replace(/\s*\(x\d+\)/g, "")
    .replace(/\b(table|function|userdata|thread|cdata): (?:0x)?[0-9a-fA-F]+/g, "$1: ?")
    .replace(/\b0x[0-9a-fA-F]+\b/g, "0x?")
    .replace(/:\d+:/g, "::")
    .replace(/\s+/g, " ")
    .trim();
}

// Lowercase hex SHA-256 of a string (Web Crypto: browsers and Cloudflare).
export async function sha256Hex(value) {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

// The error fingerprint: the first 8 hex of
// sha256(normalize(first error text) + normalize(top stack frame)),
// or "" when the paste has no caught error.
export async function fingerprint(parsed) {
  const first = parsed.errors[0];
  if (!first) return "";
  return (await sha256Hex(normalize(first.text) + normalize(first.stack[0] || ""))).slice(0, 8);
}
