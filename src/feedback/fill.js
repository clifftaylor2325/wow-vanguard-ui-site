// Reads the block `/vg feedback` makes in game (between
// "### Vanguard feedback v1 ###" and "### end feedback ###"): the kind, the
// title, a feature's area, each text under its "--- name ---" line, and for
// a bug the `/vg report` block inside it. Pasted into the /feedback/ form,
// the block fills the fields (assets/feedback.js). The lines are
// Core/Feedback.lua's (FB.Text): a typed line that would read as a marker
// is set off there by one space, which is taken back here.

export const FEEDBACK_START = "### Vanguard feedback v1 ###";
export const FEEDBACK_END = "### end feedback ###";

// The texts a block may hold, each under "--- name ---".
const SECTIONS = new Set(["did", "expected", "happened", "want", "why", "report"]);

// Whether the text holds a feedback block.
export function hasFeedback(text) {
  return String(text ?? "").includes(FEEDBACK_START);
}

// The block's fields: { kind, title, area, did, expected, happened, want, why, report },
// "" where the block has none (kind "" when it isn't bug or feature); null when
// the text holds no block. A block with no end marker reads to the end.
export function parseFeedback(text) {
  const lines = String(text ?? "").replace(/\r\n?/g, "\n").split("\n");
  const start = lines.findIndex((l) => l.trim() === FEEDBACK_START);
  if (start < 0) return null;
  const end = lines.findIndex((l, i) => i > start && l.trim() === FEEDBACK_END);
  const out = { kind: "", title: "", area: "", did: "", expected: "", happened: "", want: "", why: "", report: "" };
  const parts = {};
  let section = null;
  for (const l of lines.slice(start + 1, end < 0 ? undefined : end)) {
    const marker = l.match(/^--- (\w+) ---$/);
    if (marker && SECTIONS.has(marker[1])) {
      section = marker[1];
      parts[section] = [];
    } else if (section) {
      parts[section].push(l.replace(/^ (?= *(?:--- \w+ ---$|###))/, ""));
    } else {
      const head = l.match(/^(kind|title|area): ?(.*)$/);
      if (head) out[head[1]] = head[2].trim();
    }
  }
  for (const [name, part] of Object.entries(parts)) out[name] = part.join("\n").trim();
  if (out.kind !== "bug" && out.kind !== "feature") out.kind = "";
  return out;
}
