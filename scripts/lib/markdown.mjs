// A page's main content as Markdown, for the plain-text copies beside each page
// (/install/index.md) and the list of them in /llms.txt. The site's own HTML is
// small and regular, so this reads it with a little tokenizer instead of a
// library: headings, paragraphs, lists, tables, definition lists, links, code,
// images and folded sections. Controls (buttons, inputs, the search boxes),
// drawings and anything hidden are left out.

const VOID = new Set(["br", "img", "input", "meta", "link", "hr", "source", "wbr"]);
const SKIP = new Set(["script", "style", "svg", "button", "input", "select", "option", "textarea", "label", "noscript", "template", "form"]);
const BLOCK = new Set(["p", "div", "section", "article", "header", "main", "aside", "ul", "ol", "li", "table", "thead", "tbody", "tr", "h1", "h2", "h3", "h4", "h5", "h6", "details", "summary", "figure", "figcaption", "dl", "dt", "dd", "blockquote", "pre", "fieldset", "nav", "footer"]);

// HTML entities the site writes, decoded.
function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, e) => {
    if (e[0] === "#") return String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rarr: "→", hellip: "…", middot: "·", mdash: "—", ndash: "–" }[e.toLowerCase()] ?? all;
  });
}

// One tag's attributes as an object.
function attrsOf(text) {
  const out = {};
  for (const m of text.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) out[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? "");
  return out;
}

// The HTML as a tree of { tag, attrs, kids } and text strings.
export function parseHtml(html) {
  const root = { tag: "#root", attrs: {}, kids: [] };
  const stack = [root];
  for (const m of html.matchAll(/<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>|([^<]+)/g)) {
    const top = stack[stack.length - 1];
    if (m[5] !== undefined) { top.kids.push(decode(m[5])); continue; }
    if (!m[2]) continue;
    const tag = m[2].toLowerCase();
    if (m[1]) {
      const at = stack.map((n) => n.tag).lastIndexOf(tag);
      if (at > 0) stack.length = at;
      continue;
    }
    const node = { tag, attrs: attrsOf(m[3]), kids: [] };
    top.kids.push(node);
    if (!VOID.has(tag) && !m[4]) stack.push(node);
  }
  return root;
}

// Whether a node is left out of the Markdown.
function skipped(n) {
  if (SKIP.has(n.tag) || "hidden" in n.attrs || n.attrs["aria-hidden"] === "true") return true;
  const cls = ` ${n.attrs.class || ""} `;
  return [" visually-hidden ", " search ", " dis-meta ", " skip ", " count ", " filters "].some((c) => cls.includes(c));
}

// A link's address as an absolute URL on the site.
function absolute(href, ctx) {
  if (/^[a-z]+:/i.test(href)) return href;
  if (href.startsWith("#")) return `${ctx.base}${ctx.path}${href}`;
  return `${ctx.base}${href}`;
}

// Markdown's special characters in plain text (and "<", which would start a tag), escaped.
const escText = (s) => s.replace(/([\\`*_[\]<])/g, "\\$1");

// A node's inline Markdown (text, links, code, emphasis).
function inline(n, ctx) {
  if (typeof n === "string") return escText(n.replace(/\s+/g, " "));
  if (skipped(n)) return "";
  const kids = () => n.kids.map((k) => inline(k, ctx)).reduce((s, piece) => s + (/\*\*$/.test(s) && /^\w/.test(piece) ? " " : "") + piece, "");
  switch (n.tag) {
    case "br": return "\\\n";
    case "code": case "kbd": { const t = text(n).replace(/\s+/g, " "); return t ? `\`${t}\`` : ""; }
    case "strong": case "b": { const t = kids().trim(); return t ? `**${t}**` : ""; }
    case "em": { const t = kids().trim(); return t ? `*${t}*` : ""; }
    case "a": {
      const t = kids().trim();
      return t && n.attrs.href ? `[${t}](${absolute(n.attrs.href, ctx)})` : t;
    }
    case "img": return n.attrs.alt ? `![${escText(n.attrs.alt)}](${absolute(n.attrs.src, ctx)})` : "";
    case "span": return spanText(n, kids());
    default: return kids();
  }
}

// A span's Markdown: a tag ("Needs reload", "Next release") in brackets, a setting's kind after a
// dot, anything else as it is.
function spanText(n, inner) {
  const t = inner.trim();
  const cls = ` ${n.attrs.class || ""} `;
  if (!t) return inner;
  if (cls.includes(" badge ")) return ` [${t}] `;
  if (cls.includes(" opt-kind ")) return ` · ${t}`;
  return inner;
}

// A node's plain text.
function text(n) {
  if (typeof n === "string") return n;
  if (skipped(n)) return "";
  return n.kids.map(text).join("");
}

// Whether a node holds block content (so it isn't one run of inline text).
function isBlock(n) {
  return typeof n !== "string" && BLOCK.has(n.tag) && !skipped(n);
}

// One table as a Markdown table; a row with a single wide cell (a group heading) is bold across.
function table(n, ctx) {
  const rows = [];
  const walk = (x) => { for (const k of x.kids) if (typeof k !== "string" && !skipped(k)) (k.tag === "tr" ? rows.push(k) : walk(k)); };
  walk(n);
  // A cell's blocks and line breaks become <br>, which a Markdown table allows inside a cell.
  const cellText = (c) => blocks(c, ctx).join("<br>").replace(/\\\n/g, "<br>").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
  const cells = (tr) => tr.kids.filter((k) => typeof k !== "string" && (k.tag === "th" || k.tag === "td") && !skipped(k)).map((c) => ({ text: cellText(c), heading: c.tag === "th" && Number(c.attrs.colspan || 1) > 1 }));
  const grid = rows.map(cells).filter((r) => r.length);
  if (!grid.length) return [];
  const width = Math.max(...grid.map((r) => r.length));
  const line = (r) => `| ${Array.from({ length: width }, (_, i) => r[i]?.text ?? "").join(" | ")} |`;
  const [head, ...body] = grid;
  const out = [line(head), `| ${Array.from({ length: width }, () => "---").join(" | ")} |`];
  for (const r of body) out.push(r.length === 1 && r[0].heading && r[0].text ? line([{ text: `**${r[0].text}**` }]) : line(r));
  return [out.join("\n")];
}

// A list's items; an item's own blocks are indented under its marker.
function list(n, ctx, depth) {
  const items = n.kids.filter((k) => typeof k !== "string" && k.tag === "li" && !skipped(k));
  const out = items.map((li, i) => {
    const marker = n.tag === "ol" ? `${i + 1}.` : "-";
    const parts = blocks(li, ctx, depth + 1);
    const pad = " ".repeat(marker.length + 1);
    return `${marker} ${parts.join("\n\n").split("\n").join(`\n${pad}`)}`.trimEnd();
  });
  return out.length ? [out.join("\n")] : [];
}

// A definition list as a list of "**term**: definition".
function defs(n, ctx) {
  const out = [];
  for (const k of n.kids) {
    if (typeof k === "string" || skipped(k)) continue;
    if (k.tag === "dt") out.push(`- **${inline(k, ctx).trim()}**:`);
    if (k.tag === "dd" && out.length) out[out.length - 1] += ` ${inline(k, ctx).trim()}`;
  }
  return out.length ? [out.join("\n")] : [];
}

// A node's Markdown blocks, in order.
function blocks(n, ctx, depth = 0) {
  const out = [];
  let run = "";
  const flush = () => { const t = run.replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").trim(); if (t) out.push(t); run = ""; };
  for (const k of n.kids) {
    if (!isBlock(k)) {
      const piece = inline(k, ctx);
      run += /\)$/.test(run) && /^!?\[/.test(piece) ? ` ${piece}` : piece;
      continue;
    }
    flush();
    out.push(...block(k, ctx, depth));
  }
  flush();
  return out;
}

// One block element's Markdown blocks.
function block(n, ctx, depth) {
  const level = /^h([1-6])$/.exec(n.tag);
  if (level) { const t = inline(n, ctx).trim(); return t ? [`${"#".repeat(Number(level[1]))} ${t}`] : []; }
  if (n.tag === "ul" || n.tag === "ol") return list(n, ctx, depth);
  if (n.tag === "table") return table(n, ctx);
  if (n.tag === "dl") return defs(n, ctx);
  if (n.tag === "pre") return [`\`\`\`\n${text(n).replace(/\n$/, "")}\n\`\`\``];
  if (n.tag === "summary" && !n.kids.some(isBlock)) { const t = inline(n, ctx).trim(); return t ? [`**${t}**`] : []; }
  // A "Source" fold says "Source: …" inside, so its summary would only repeat it.
  if (n.tag === "details" && / src /.test(` ${n.attrs.class || ""} `)) return blocks({ ...n, kids: n.kids.filter((k) => k.tag !== "summary") }, ctx, depth);
  return blocks(n, ctx, depth);
}

// A page's main content (the HTML inside <main>) as Markdown, with its title on top and
// links made absolute against the site's address. `path` is the page's own path.
export function pageMarkdown({ title, description, main, path, base }) {
  const ctx = { base, path };
  const parts = blocks(parseHtml(main), ctx);
  const h1 = parts.findIndex((b) => b.startsWith("# "));
  const heading = h1 >= 0 && h1 < 3 ? parts.splice(h1, 1)[0] : `# ${title}`;
  const lines = [heading, description ? `> ${description}` : "", ...parts, `Web page: ${base}${path}`].filter(Boolean);
  return `${lines.join("\n\n").replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n")}\n`;
}

// /llms.txt (llmstxt.org): the site's name, what Vanguard is, and each page's Markdown copy.
export function llmsTxt({ base, summary, pages, languages }) {
  const line = (p) => `- [${p.title}](${base}${p.path}index.md)${p.description ? `: ${p.description}` : ""}`;
  return `# Vanguard

> ${summary}

Vanguard is an addon for WoW Forever. Every page of this site is generated from the addon's own source, and each one has a plain Markdown copy at the same address with index.md on the end.${languages.length ? ` The site is also published in ${languages.join(", ")}; the Markdown copies are English.` : ""}

## Pages

${pages.map(line).join("\n")}
`;
}
