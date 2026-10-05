// Makes player text safe to post: no HTML, no @mentions, no #123 or GH-123
// autolinks, no embedded images, no control characters. Shared by the
// /feedback/ page (its preview) and the Pages Function (what is posted), so
// the preview is exactly what is sent. No dependencies: it runs in browsers
// and in Cloudflare's runtime.

const ZWSP = "\u200b";

// Text with Windows and old Mac line ends as "\n", and control characters
// (other than tab and newline) removed.
export function plain(value) {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
}

// Free text for an issue body: HTML comments and tags stripped, any `<` or `>`
// left over written as entities, entity-looking `&` escaped, and mentions,
// issue autolinks and markdown images broken with a zero-width space.
export function clean(value) {
  return plain(value)
    .replace(/<!--[\s\S]*?(?:-->|$)/g, "")
    .replace(/<\/?[A-Za-z][^>]*>/g, "")
    .replace(/&(?=#?\w+;)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/@(?=[\w-])/g, `@${ZWSP}`)
    .replace(/#(?=\d)/g, `#${ZWSP}`)
    .replace(/\b(GH)-(?=\d)/gi, `$1${ZWSP}-`)
    .replace(/!\[/g, `!${ZWSP}[`)
    .trim();
}

// A one-line version of clean() for titles and table cells.
export function cleanLine(value) {
  return clean(String(value ?? "").replace(/\s+/g, " "));
}

// A table cell: one clean line with `|` escaped.
export function cell(value) {
  return cleanLine(value).replace(/\|/g, "\\|");
}

// Pasted text in a fenced block whose fence is longer than any run of
// backticks inside it, so nothing in the paste can close the block. Text in a
// fenced block is shown as typed: no HTML, mentions or autolinks.
export function fence(value, lang = "text") {
  const text = plain(value).replace(/\s+$/, "");
  const longest = Math.max(0, ...(text.match(/`+/g) || []).map((run) => run.length));
  const ticks = "`".repeat(Math.max(3, longest + 1));
  return `${ticks}${lang}\n${text}\n${ticks}`;
}
