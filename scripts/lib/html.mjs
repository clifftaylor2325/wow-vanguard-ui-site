// HTML helpers and the shared page layout (header, sidebar nav, footer).

// Escapes text for HTML.
export function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// A stable anchor id from a title ("Raid frames" -> "raid-frames").
export function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Inline markdown-ish code: `x` -> <code>x</code> (text otherwise escaped).
export function md(s) {
  return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

// Every page in nav order: path, nav label, title. `group` is its heading in
// the sidebar.
export const NAV = [
  { path: "/", label: "Home", title: "Vanguard" },
  { path: "/install/", label: "Install", title: "Install & Update", group: "Get started" },
  { path: "/start/", label: "Getting started", title: "Getting started", group: "Get started" },
  { path: "/features/", label: "Features", title: "Features", group: "Learn" },
  { path: "/commands/", label: "Commands", title: "Commands", group: "Reference" },
  { path: "/settings/", label: "Settings", title: "Settings", group: "Reference" },
  { path: "/profiles/", label: "Profiles & sharing", title: "Profiles & sharing", group: "Learn" },
  { path: "/help/", label: "Troubleshooting", title: "Troubleshooting & FAQ", group: "Help" },
  { path: "/feedback/", label: "Feedback", title: "Feedback", group: "Help" },
  { path: "/changelog/", label: "Changelog", title: "Changelog", group: "About" },
  { path: "/credits/", label: "Credits & license", title: "Credits & license", group: "About" },
];

// The sidebar's groups, in order.
export const NAV_GROUPS = ["Get started", "Learn", "Reference", "Help", "About"];

// Vanguard's CurseForge page. Vanguard isn't listed yet, so there's no URL:
// every CurseForge call to action renders as a "Coming soon" badge, not a link.
// When the listing is live, put its URL here (for example
// "https://www.curseforge.com/wow/addons/<slug>") and rebuild: the badges
// become links and the tests switch to checking for the link.
export const CURSEFORGE_URL = null;

// Ways to support Vanguard's development, in the order shown. Each stays off the site until its
// url is set (an https:// address): then a "Support Vanguard" line appears in every page's footer
// and a Support section on the Credits page. Donations stay on the website, never in the
// addon itself.
export const SUPPORT = [
  { name: "Patreon", url: null, what: "a monthly pledge" },
  { name: "Ko-fi", url: "https://ko-fi.com/cliftontaylor", what: "a one-off tip" },
];

// The support links that are switched on (their url is set).
export function supportOn(links = SUPPORT) {
  return links.filter((l) => typeof l.url === "string" && /^https:\/\//.test(l.url));
}

// The "Support Vanguard" line: each switched-on link with what it is for; "" when none is.
export function supportLine(links = SUPPORT) {
  const on = supportOn(links);
  if (!on.length) return "";
  const items = on.map((l) => `<a href="${esc(l.url)}" rel="noopener">${esc(l.name)}</a> <span class="small">(${esc(l.what)})</span>`);
  return `<p class="support">Support Vanguard: ${items.join(" · ")}</p>`;
}

// The CurseForge call to action: a link once CURSEFORGE_URL is set, until then
// a styled, non-interactive "Coming soon on CurseForge" badge.
export function curseforgeCta({ size = "" } = {}) {
  const cls = `cf-cta${size ? ` cf-cta-${size}` : ""}`;
  const gem = `<svg class="cf-gem" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 1 L15 8 L8 15 L1 8 Z"/><path d="M8 4.5 L11.5 8 L8 11.5 L4.5 8 Z"/></svg>`;
  if (CURSEFORGE_URL) return `<a class="${cls}" data-curseforge="live" href="${esc(CURSEFORGE_URL)}">${gem}<span>Get Vanguard on CurseForge</span></a>`;
  return `<span class="${cls} is-soon" data-curseforge="soon">${gem}<span>Coming soon on CurseForge</span></span>`;
}

// A decorative divider: a fine brass rule with linked diamonds in the middle.
export function ornament(cls = "") {
  return `<svg class="ornament${cls ? ` ${cls}` : ""}" viewBox="0 0 240 16" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><path class="orn-line" d="M4 8 H92 M148 8 H236"/><path class="orn-line" d="M28 8 l4 -3 l4 3 l-4 3 Z M204 8 l4 -3 l4 3 l-4 3 Z"/><path class="orn-gem" d="M111 8 L119 1 L127 8 L119 15 Z"/><path class="orn-line" d="M101 8 L109 1.5 L117 8 L109 14.5 Z M121 8 L129 1.5 L137 8 L129 14.5 Z"/></svg>`;
}

// The brass frame with corner pieces drawn inside a hero panel (decorative;
// it sits in an aria-hidden .hero-art layer). Shared by the Home hero and the
// inner-page heroes.
export function heroFrame() {
  const corner = `<path d="M2 46 V12 L12 2 H46"/><path d="M8 40 V15 L15 8 H40" class="fr-thin"/><path d="M2 2 l7 0 l-7 7 Z" class="fr-gem"/><path d="M18 18 l5 -5 l5 5 l-5 5 Z" class="fr-gem"/><path d="M46 2 l6 0" class="fr-thin"/><path d="M2 46 l0 6" class="fr-thin"/>`;
  return `<div class="hero-frame">${["tl", "tr", "bl", "br"].map((c) => `<svg class="fr fr-${c}" viewBox="0 0 54 54" focusable="false">${corner}</svg>`).join("")}</div>`;
}

// The top of every inner page: the page's h1 and its one-line lede in a slim
// band that carries the Home hero's sky, brass frame and ornament. title and
// lede are HTML (already escaped by the caller); lede is optional.
export function pageHero(title, lede = "") {
  return `<div class="page-hero">
<div class="hero-art" aria-hidden="true"><div class="hero-sky"></div>${heroFrame()}</div>
<div class="page-hero-inner">
<h1 class="page-title">${title}</h1>
${ornament("page-orn")}
${lede ? `<p class="lede">${lede}</p>` : ""}
</div>
</div>`;
}

// The compact facts strip under a page's hero: a few short items (HTML).
export function glance(items) {
  const list = items.filter(Boolean);
  // An item that only the next release has (from nextOnly) marks its whole pill.
  // Its text sits in one span so the pill can center it.
  const li = (i) => { const m = i.match(/^<span data-avail="next">([\s\S]*)<\/span>$/); return m ? `<li data-avail="next"><span>${m[1]}</span></li>` : `<li><span>${i}</span></li>`; };
  return list.length ? `<ul class="glance">${list.map(li).join("")}</ul>` : "";
}

// A collapsed section: the heading (with its id) is the summary, the body
// opens on click. `open` sections start open (and data-open lets the search
// put them back). `next` marks a section only the next release has.
export function disclosure({ id, title, body, level = 2, open = false, next = false, meta = "", cls = "", attrs = "" }) {
  const h = `h${level}`;
  return `<details class="disclosure${cls ? ` ${cls}` : ""}"${open ? " open data-open" : ""}${next ? ' data-avail="next"' : ""}${attrs}>
<summary><${h} id="${id}">${title}</${h}>${meta ? `<span class="dis-meta">${meta}</span>` : ""}</summary>
<div class="dis-body">
${body}
</div>
</details>`;
}

// The two linked diamonds of the Vanguard logo, as a small inline SVG.
const MARK = `<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M11 4 L20 16 L11 28 L2 16 Z" fill="none" stroke="var(--accent)" stroke-width="2.5"/><path d="M21 4 L30 16 L21 28 L12 16 Z" fill="none" stroke="var(--text)" stroke-width="2.5"/></svg>`;

// One nav link, marked when it's the page being shown.
function navLink(n, path) {
  return `<li${n.path === path ? ' class="is-here"' : ""}><a href="${n.path}"${n.path === path ? ' aria-current="page"' : ""}>${esc(n.label)}</a></li>`;
}

// The sidebar list: Home, then every page under its group heading.
function sidebarList(path) {
  const groups = NAV_GROUPS.map((g) => {
    const id = `nav-g-${slug(g)}`;
    return `<li class="nav-group"><span class="nav-group-h" id="${id}">${esc(g)}</span><ul aria-labelledby="${id}">${NAV.filter((n) => n.group === g).map((n) => navLink(n, path)).join("")}</ul></li>`;
  });
  return `<ul id="nav-list">${navLink(NAV[0], path)}${groups.join("")}</ul>`;
}

// The sidebar's switch that shows what the next release adds (only while a
// next release is in the works).
function nextSwitch() {
  return `<div class="nav-foot"><label class="switch"><input type="checkbox" data-pref="next"> <span>Show what's coming in the next release</span></label></div>`;
}

// A full HTML page with the shared header, sidebar and footer. Every page, Home
// included, has the same grouped sidebar; it's the only nav (the header holds
// the brand and the Menu button, the footer no links).
export function layout({ path, title, description, body, site, scripts = [] }) {
  const fullTitle = path === "/" ? `Vanguard: a UI suite for WoW Forever` : `${title} · Vanguard`;
  const toggle = `<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-list">Menu</button>`;
  const nav = `<nav class="nav sidebar" aria-label="Main" id="site-nav">${sidebarList(path)}${site.hasNext ? nextSwitch() : ""}</nav>`;
  const main = `<main id="main" tabindex="-1">\n${body}\n</main>`;
  // An asset's URL with the build's version query (the plain path if it has none).
  const asset = (p) => site.assets?.[p] || p;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="${esc(site.theme.bg)}">
<link rel="icon" href="${esc(asset("/assets/favicon.svg"))}" type="image/svg+xml">
<link rel="stylesheet" href="${esc(asset("/assets/theme.css"))}">
<link rel="stylesheet" href="${esc(asset("/assets/site.css"))}">
<script>(function (d) { d.className += " js"; try { if (localStorage.getItem("vg-show-next") === "1") d.className += " show-next"; } catch (e) {} })(document.documentElement);</script>
</head>
<body class="has-sidebar">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="header-inner">
    <a class="brand" href="/">${MARK}<span>Vanguard</span></a>
    ${toggle}
  </div>
</header>
<div class="shell">
${nav}
${main}
</div>
<footer class="site-footer">
  ${ornament("footer-orn")}
  <div class="footer-inner">
    ${supportLine()}
    <p>Vanguard is an addon for WoW Forever, made by ${esc(site.author)}. It is an early release: parts have been tested in game, and some features are still being polished.</p>
    <p>Current release: Vanguard ${esc(site.version)} · ${CURSEFORGE_URL ? `<a href="${esc(CURSEFORGE_URL)}">On CurseForge</a>` : "Coming soon on CurseForge"} · ${COPYRIGHT}</p>
  </div>
</footer>
<script src="${esc(asset("/assets/site.js"))}" defer></script>
${scripts.map((s) => `<script type="module" src="${esc(asset(s))}"></script>\n`).join("")}</body>
</html>
`;
}

// The footer's copyright line, for the site and Vanguard alike. The license of each release
// (v0.4.0 and before were MIT) is on the Credits page, read from that release's LICENSE.
export const COPYRIGHT = "© 2026 Clifton Taylor. All rights reserved.";

// The "Next release" tag.
export const NEXT_BADGE = `<span class="badge next">Next release</span>`;

// Availability badge for something by where it exists. Being in the current
// release is the default and gets no tag; only the exceptions are marked.
export function badge(inRel, inNext, version) {
  if (inRel && inNext) return "";
  if (inNext) return NEXT_BADGE;
  if (inRel) return `<span class="badge old">v${esc(version)} only</span>`;
  return "";
}

// Wraps HTML that only applies to the next release, so the page hides it until
// the reader asks to see what's coming.
export function nextOnly(html, tag = "span", attrs = "") {
  return `<${tag} data-avail="next"${attrs}>${html}</${tag}>`;
}

// The availability key used by filters.
export function avail(inRel, inNext) {
  return inRel && inNext ? "rel" : inNext ? "next" : "old";
}

// A labelled screenshot placeholder.
export function shot(label) {
  return `<figure class="shot" role="img" aria-label="Screenshot coming: ${esc(label)}"><div><strong>Screenshot coming</strong>${esc(label)}</div></figure>`;
}
