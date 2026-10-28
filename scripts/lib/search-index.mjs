// The site-wide search's index for one language (/search.json, /de/search.json, …), read from
// the built pages so it holds exactly what they say: each page, each section with an id (an h2
// or h3), each module card and each Settings or Commands row with its own link. assets/site.js
// loads it the first time a reader uses the search box.
import { parseHtml } from "./markdown.mjs";

// The longest snippet of an entry's text that the index keeps.
const SNIPPET = 120;

// Elements whose text is a separate run from what's next to it.
const BLOCKS = new Set(["p", "div", "li", "ul", "ol", "td", "th", "tr", "dt", "dd", "h2", "h3", "figcaption", "details", "section", "article", "table", "tbody", "thead", "br"]);
// Elements a snippet leaves out: controls, drawings, and the summaries of folds ("More").
const UNSAID = new Set(["script", "style", "svg", "button", "input", "select", "option", "textarea", "template", "summary"]);

// A node's text for a snippet (controls, fold summaries and hidden parts left out).
function textOf(n) {
  if (typeof n === "string") return n;
  if (UNSAID.has(n.tag) || "hidden" in n.attrs || /\bvisually-hidden\b/.test(n.attrs.class || "")) return "";
  return n.kids.map(textOf).join(BLOCKS.has(n.tag) ? " " : "");
}

// A heading's or row caption's own words: its tags ("Needs reload"), a setting's kind, buttons
// (Copy) and screen-reader text left out.
function nameOf(n) {
  if (typeof n === "string") return n;
  if (/\b(badge|opt-kind|visually-hidden)\b/.test(n.attrs.class || "") || (UNSAID.has(n.tag) && n.tag !== "summary")) return "";
  return n.kids.map(nameOf).join("");
}

// Whitespace collapsed, and none left before punctuation.
const clean = (s) => s.replace(/\s+/g, " ").replace(/ ([,.;:!?)])/g, "$1").trim();

// Text shortened to the snippet length at a word, with an ellipsis.
function snippet(s) {
  if (s.length <= SNIPPET) return s;
  return `${s.slice(0, SNIPPET).replace(/\s+\S*$/, "")}…`;
}

// Gives every element its parent, so a heading can find the section around it.
function link(n, parent = null) {
  if (typeof n === "string") return;
  n.parent = parent;
  for (const k of n.kids) link(k, n);
}

// Whether a node or one of its ancestors is only in the next release.
function isNext(n) {
  for (let x = n; x; x = x.parent) if (x.attrs?.["data-avail"] === "next") return true;
  return false;
}

// The text that belongs to a heading: its whole section when it's a folded section's summary,
// else what follows it in its parent.
function sectionText(h) {
  const details = h.parent?.tag === "summary" ? h.parent.parent : null;
  if (details) return clean(details.kids.map(textOf).join(" "));
  const after = h.parent.kids.slice(h.parent.kids.indexOf(h) + 1);
  const stop = after.findIndex((k) => typeof k !== "string" && /^h[1-3]$/.test(k.tag));
  return clean((stop < 0 ? after : after.slice(0, stop)).map(textOf).join(" "));
}

// The name of the folded section around a node (an options page, a feature area), or "".
function sectionOf(n) {
  const own = n.parent?.tag === "summary" ? n.parent.parent : null;
  for (let x = n.parent; x; x = x.parent) {
    if (x === own) continue;
    if (x.tag !== "details") continue;
    const summary = x.kids.find((k) => typeof k !== "string" && k.tag === "summary");
    const h = summary?.kids.find((k) => typeof k !== "string" && /^h[23]$/.test(k.tag));
    if (h) return clean(nameOf(h));
  }
  return "";
}

// One entry: what was found (t), where it is (p: the page, and the section around it), its
// address (u), a snippet (x), and n when only the next release has it.
function entry(title, page, url, body, node) {
  const section = sectionOf(node);
  const e = { t: clean(title), p: section ? `${page} › ${section}` : page, u: url, x: snippet(clean(body)) };
  if (isNext(node)) e.n = 1;
  return e;
}

// One element's entry, when it's something a reader can land on.
function entryFor(n, page, url) {
  const id = n.attrs.id;
  if (/^h[23]$/.test(n.tag)) return entry(nameOf(n), page, `${url}#${id}`, sectionText(n), n);
  if (n.tag === "article") {
    const h = n.kids.find((k) => typeof k !== "string" && k.tag === "h3");
    return h && entry(nameOf(h), page, `${url}#${id}`, clean(n.kids.filter((k) => k !== h).map(textOf).join(" ")), n);
  }
  if (n.tag === "tr") {
    const [first, ...rest] = n.kids.filter((k) => typeof k !== "string");
    // A cell with a card label (Values, Default) says it, as the phone layout does.
    const cell = (c) => { const said = clean(textOf(c)); return said && c.attrs["data-label"] ? `${c.attrs["data-label"]}: ${said}.` : said; };
    return first && entry(nameOf(first), page, `${url}#${id}`, rest.map(cell).join(" "), n);
  }
  return null;
}

// One page's entries: the page itself, then everything in it with an id worth linking.
export function pageEntries({ title, description, main, url }) {
  const root = parseHtml(main);
  link(root);
  const out = [{ t: title, p: "", u: url, x: snippet(description || "") }];
  const walk = (n) => {
    if (typeof n === "string") return;
    if (n.attrs.id) {
      const e = entryFor(n, title, url);
      if (e && e.t) out.push(e);
    }
    n.kids.forEach(walk);
  };
  walk(root);
  return out;
}
