// The feedback form's fields, their limits, and the checks both the
// /feedback/ page and the Pages Function run. The Function's check is the one
// that counts; the page runs the same code so its messages match.

// [min, max] characters for each text field (min 0: optional).
export const LIMITS = {
  title: [8, 100],
  contact: [0, 100],
  report: [0, 20000],
  did: [1, 2000],
  expected: [0, 1000],
  happened: [1, 2000],
  want: [1, 2000],
  why: [1, 2000],
};

// The "Part of ForeverUI" choices after the addon's modules: [value, label].
export const FALLBACK_AREAS = [
  ["command", "A command"],
  ["setting", "A setting"],
  ["new", "Something new"],
  ["not-sure", "Not sure"],
];

const TEXT = ["title", "contact", "report", "did", "expected", "happened", "want", "why", "area"];
const FLAGS = ["contact_ok", "public_ack", "no_report"];

// Fields the form never has in v1 (no uploads): a request carrying one is refused.
export const REFUSED = ["screenshot", "mockup", "file", "attachment"];

// The form's values as plain strings and booleans: text with "\n" line ends,
// trimmed; checkboxes true only for true, "on" or "true".
export function readFields(input) {
  const src = input && typeof input === "object" ? input : {};
  const out = { kind: src.kind === "bug" || src.kind === "feature" ? src.kind : "" };
  for (const k of TEXT) out[k] = typeof src[k] === "string" ? src[k].replace(/\r\n?/g, "\n").trim() : "";
  for (const k of FLAGS) out[k] = src[k] === true || src[k] === "on" || src[k] === "true";
  if (!out.contact_ok) out.contact = "";
  return out;
}

// "2,000" for 2000.
function count(n) {
  return n.toLocaleString("en-US");
}

// A message when a text field is missing, too short or too long, else "".
function lengthError(name, value, label) {
  const [min, max] = LIMITS[name];
  if (min > 0 && !value) return `${label} is required.`;
  if (value && value.length < min) return `${label} needs at least ${count(min)} characters.`;
  if (value.length > max) return `${label} can be at most ${count(max)} characters (it has ${count(value.length)}).`;
  return "";
}

// The checks for one kind: [field, label] pairs.
const SHARED = [["title", "The short summary"], ["contact", "Contact"]];
const BUG = [["report", "The pasted report"], ["did", "What you did"], ["expected", "What you expected"], ["happened", "What happened instead"]];
const FEATURE = [["want", "What you want"], ["why", "Why it would help"]];

// Every problem with the fields: { field: message }; empty when they're fine.
// areas: the allowed "Part of ForeverUI" values (a Set or array).
export function validate(f, areas) {
  const errors = {};
  if (!f.kind) errors.kind = "Choose Report a bug or Request a feature.";
  const checks = [...SHARED, ...(f.kind === "bug" ? BUG : f.kind === "feature" ? FEATURE : [])];
  for (const [name, label] of checks) {
    const e = lengthError(name, f[name], label);
    if (e) errors[name] = e;
  }
  if (f.kind === "bug" && !f.report && !f.no_report) errors.no_report = "Paste your report, or tick the box to say you couldn't get one.";
  if (f.kind === "feature" && !new Set(areas).has(f.area)) errors.area = "Choose the part of ForeverUI it's about.";
  if (!f.public_ack) errors.public_ack = "Please tick this to say you understand where the report goes.";
  return errors;
}
