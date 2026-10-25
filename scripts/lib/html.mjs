// HTML helpers and the shared page layout (header, sidebar nav, footer).

import { crestSvg } from "./brand.mjs";
import { EN, scriptStrings, localiseLinks } from "./i18n-site.mjs";

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
// the sidebar. Other languages say them through scripts/lib/i18n-site.mjs
// (nav.<path>, title.<path>, group.<group>).
export const NAV = [
  { path: "/", label: "Home", title: "Vanguard" },
  { path: "/install/", label: "Install", title: "Install & Update", group: "Get started" },
  { path: "/start/", label: "Getting started", title: "Getting started", group: "Get started" },
  { path: "/features/", label: "Features", title: "Features", group: "Learn" },
  { path: "/screenshots/", label: "Screenshots", title: "Screenshots", group: "Learn" },
  { path: "/commands/", label: "Commands", title: "Commands", group: "Reference" },
  { path: "/settings/", label: "Settings", title: "Settings", group: "Reference" },
  { path: "/profiles/", label: "Profiles & sharing", title: "Profiles & sharing", group: "Learn" },
  { path: "/help/", label: "Troubleshooting", title: "Troubleshooting & FAQ", group: "Help" },
  { path: "/feedback/", label: "Feedback", title: "Feedback", group: "Help" },
  { path: "/changelog/", label: "Changelog", title: "Changelog", group: "About" },
  { path: "/credits/", label: "Credits & license", title: "Credits & license", group: "About" },
  { path: "/support/", label: "Support", title: "Support Vanguard", group: "About" },
];

// The sidebar's groups, in order.
export const NAV_GROUPS = ["Get started", "Learn", "Reference", "Help", "About"];

// Vanguard's CurseForge page. While this is null (before the listing was live)
// every CurseForge call to action renders as a "Coming soon" badge, not a link;
// with the URL set, the badges are links and the tests check for the link.
export const CURSEFORGE_URL = "https://www.curseforge.com/wow/addons/vanguard-ui";

// Vanguard's Wago Addons page: the second place to get it. Shown as a smaller
// link next to each CurseForge call to action and in the footer; null hides it.
export const WAGO_URL = "https://addons.wago.io/addons/wow-vanguard-ui";

// Vanguard's Discord server: a permanent invite, linked from every page's
// footer. null takes the link off the site.
export const DISCORD_URL = "https://discord.gg/8ChnJfyww";

// Ways to support Vanguard's development, in the order shown. Each stays off the site until its
// url is set (an https:// address): then the header gets a Support button (to the Support page)
// and the Credits page a Support section. Donations stay on the website, never in the addon itself.
export const SUPPORT = [
  { name: "Ko-fi", url: "https://ko-fi.com/cliftontaylor", what: "a one-off tip" },
];

// The support links that are switched on (their url is set).
export function supportOn(links = SUPPORT) {
  return links.filter((l) => typeof l.url === "string" && /^https:\/\//.test(l.url));
}

// A short, one-sentence ask on a page where a player has just been helped, linking Ko-fi with a
// `utm_campaign` naming the page so Ko-fi's analytics say which placement brings people. "" while
// Ko-fi is off. Never in the addon itself, and never a popup.
export function supportAsk(campaign, lead, links = SUPPORT) {
  const kofi = supportOn(links).find((l) => l.name === "Ko-fi");
  if (!kofi) return "";
  const url = `${kofi.url}?utm_source=vanguardui&utm_medium=site&utm_campaign=${encodeURIComponent(campaign)}`;
  return `<p class="ask small">${lead} <a href="${esc(url)}" rel="noopener">Say thanks on Ko-fi</a>.</p>`;
}

// The header's Support button: a link to the Support page, not straight to Ko-fi.
export function supportButton(links = SUPPORT, loc = EN) {
  return supportOn(links).length ? `<a class="support-btn" href="/support/">${loc.t("supportButton")}</a>` : "";
}

// The CurseForge call to action: a link once CURSEFORGE_URL is set, until then
// a styled, non-interactive "Coming soon on CurseForge" badge.
export function curseforgeCta({ size = "" } = {}) {
  const cls = `cf-cta${size ? ` cf-cta-${size}` : ""}`;
  const gem = `<svg class="cf-gem" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 1 L15 8 L8 15 L1 8 Z"/><path d="M8 4.5 L11.5 8 L8 11.5 L4.5 8 Z"/></svg>`;
  if (CURSEFORGE_URL) return `<a class="${cls}" data-curseforge="live" href="${esc(CURSEFORGE_URL)}">${gem}<span>Get Vanguard on CurseForge</span></a>`;
  return `<span class="${cls} is-soon" data-curseforge="soon">${gem}<span>Coming soon on CurseForge</span></span>`;
}

// The Wago call to action: the same button as CurseForge's, so the two stores are equal.
export function wagoLink({ size = "" } = {}) {
  const cls = `cf-cta${size ? ` cf-cta-${size}` : ""}`;
  const gem = `<svg class="cf-gem" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 1 L15 8 L8 15 L1 8 Z"/><path d="M8 4.5 L11.5 8 L8 11.5 L4.5 8 Z"/></svg>`;
  if (!WAGO_URL) return `<span class="${cls} is-soon" data-wago="soon">${gem}<span>Coming soon on Wago</span></span>`;
  return `<a class="${cls}" data-wago="live" href="${esc(WAGO_URL)}" rel="noopener">${gem}<span>Get Vanguard on Wago</span></a>`;
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

// The Vanguard crest, as the small inline mark beside the brand name (scripts/lib/brand.mjs).
const MARK = crestSvg({ cls: "brand-mark" });

// One nav link, marked when it's the page being shown.
function navLink(n, path, loc) {
  return `<li${n.path === path ? ' class="is-here"' : ""}><a href="${n.path}"${n.path === path ? ' aria-current="page"' : ""}>${loc.t(`nav.${n.path}`)}</a></li>`;
}

// The sidebar list: Home, then every page under its group heading.
function sidebarList(path, loc) {
  const groups = NAV_GROUPS.map((g) => {
    const id = `nav-g-${slug(g)}`;
    return `<li class="nav-group"><span class="nav-group-h" id="${id}">${loc.t(`group.${g}`)}</span><ul aria-labelledby="${id}">${NAV.filter((n) => n.group === g).map((n) => navLink(n, path, loc)).join("")}</ul></li>`;
  });
  return `<ul id="nav-list">${navLink(NAV[0], path, loc)}${groups.join("")}</ul>`;
}

// The sidebar's switch that shows what the next release adds (only while a
// next release is in the works).
function nextSwitch(loc) {
  return `<div class="nav-foot"><label class="switch"><input type="checkbox" data-pref="next"> <span>${loc.t("nextSwitch")}</span></label></div>`;
}

// The language switcher at the sidebar's foot (only when the site is published
// in more than one language): a select that site.js turns into navigation, and
// plain links for a browser without scripts. Each option carries, in its own
// language, the line site.js offers a reader whose browser asks for it.
export function langSwitch(alts, loc) {
  if (alts.length < 2) return "";
  const own = (a) => `lang="${esc(a.lang)}" data-offer="${esc(a.strings["lang.offer"])}" data-dismiss="${esc(a.strings["lang.dismiss"])}"`;
  const option = (a) => `<option value="${esc(a.href)}" ${own(a)}${a.code === loc.code ? " selected" : ""}>${esc(a.name)}</option>`;
  const link = (a) => `<li><a href="${esc(a.href)}" lang="${esc(a.lang)}" hreflang="${esc(a.lang)}"${a.code === loc.code ? ' aria-current="true"' : ""}>${esc(a.name)}</a></li>`;
  return `<div class="nav-lang"><label for="lang-select">${loc.t("lang.label")}</label>
<select id="lang-select" data-lang-switch>${alts.map(option).join("")}</select>
<noscript><ul class="lang-links">${alts.map(link).join("")}</ul></noscript></div>`;
}

// The sidebar's foot: the next-release switch and the language switcher, whichever apply.
function navFoot(site, alts, loc) {
  return `${site.hasNext ? nextSwitch(loc) : ""}${langSwitch(alts, loc)}`;
}

// A <link rel="alternate" hreflang> for every published language of the page,
// plus x-default (English), so a search engine shows each reader their own.
export function hreflangTags(alts) {
  if (alts.length < 2) return "";
  const tags = alts.map((a) => `<link rel="alternate" hreflang="${esc(a.lang)}" href="${esc(a.url)}">`);
  return `${[...tags, `<link rel="alternate" hreflang="x-default" href="${esc(alts[0].url)}">`].join("\n")}\n`;
}

// The page's canonical URL and the Open Graph and Twitter card tags, so a link pasted in Discord,
// Reddit or a forum unfurls with the crest. Only real pages get them (the 404 page has no URL of
// its own); every page shares the one Open Graph image.
export function socialTags({ path, title, description, site }) {
  if (!site.url || path === "/404") return "";
  const url = `${site.url}${path}`;
  return [
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Vanguard">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:image" content="${esc(site.url)}/assets/og-image.png">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="Vanguard's crest, two swords crossed behind a shield bearing a V, beside the name">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ].join("\n") + "\n";
}

// What a search result and a link preview say about each page: a title that names the task and
// the game, and a description of about 150 characters. The brand always has a qualifier ("for WoW
// Forever"), never the bare word. The page's own h1 and `description` are unchanged. Home's
// description is the addon's own TOC Notes line, so it is not overridden here.
const SEO = {
  "/": { title: "Vanguard: All-in-One UI Addon for WoW Forever" },
  "/install/": { title: "Install Vanguard in WoW Forever", description: "How to install, update and remove the Vanguard UI addon in WoW Forever, through CurseForge or by hand." },
  "/start/": { title: "Getting Started with Vanguard in WoW Forever", description: "Open the Vanguard options, run the setup wizard, move your frames and pick an accent color in the all-in-one UI addon for WoW Forever." },
  "/features/": { title: "Vanguard Features: Unit Frames, Bags, Action Bars", description: "Every Vanguard module for WoW Forever: unit and raid frames, action bars, bags, nameplates, click casting and more, with settings and commands." },
  "/screenshots/": { title: "Vanguard Screenshots: the UI in WoW Forever", description: "Real in-game screenshots of Vanguard in WoW Forever: the layout, options, looks, bags, quests, raid frames, nameplates and more." },
  "/commands/": { title: "Vanguard Slash Commands for WoW Forever", description: "Every /vg slash command in the Vanguard UI addon for WoW Forever, with its help text verbatim from the addon." },
  "/settings/": { title: "Vanguard Settings for WoW Forever", description: "Every page and setting in the Vanguard options window for WoW Forever, with defaults and which changes need a reload." },
  "/profiles/": { title: "Vanguard Profiles: Share a UI Layout in WoW Forever", description: "Share one Vanguard layout across characters, or export it as text and import it on another PC, in WoW Forever." },
  "/help/": { title: "Vanguard Troubleshooting and FAQ for WoW Forever", description: "Fixes for common Vanguard problems in WoW Forever, using the addon's own commands and messages." },
  "/changelog/": { title: "Vanguard Changelog: What Changed in Each Release", description: "What changed in each Vanguard release for WoW Forever, newest first, written for players, and what is coming next." },
  "/feedback/": { title: "Send Vanguard Feedback or Report a Bug", description: "Report a Vanguard bug or request a feature for the WoW Forever UI addon." },
  "/support/": { title: "Support Vanguard, the Free WoW Forever UI Addon", description: "Vanguard is free and built by one person. Here is what support pays for, how to give it, and other ways to help." },
  "/credits/": { title: "Vanguard Credits and License", description: "Vanguard's license, who made it, and the fonts, libraries and art the WoW Forever UI addon uses." },
};

// The Home page's schema.org data for search engines: the app and the site. No rating or review
// is claimed, because there are none; the site only links to the CurseForge and Wago listings.
export function homeJsonLd(site, description) {
  const app = { "@type": "SoftwareApplication", name: "Vanguard", description, url: `${site.url}/`, image: `${site.url}/assets/og-image.png`,
    applicationCategory: "GameApplication", operatingSystem: "Windows, macOS", softwareVersion: site.version,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, author: { "@type": "Person", name: site.author } };
  const web = { "@type": "WebSite", name: "Vanguard", url: `${site.url}/` };
  return `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": [app, web] }).replace(/</g, "\\u003c")}</script>\n`;
}

// The page's <title>: in English the search title from SEO, elsewhere the
// page's own title in that language (Home's is its search title).
function pageTitle(path, title, loc) {
  if (loc.english) return SEO[path]?.title || `${title} · Vanguard`;
  if (path === "/") return loc.text("title./");
  const key = `title.${path}`;
  return `${key in loc.strings ? loc.text(key) : title} · Vanguard`;
}

// The footer's links line: the current release, the two stores, Discord and the copyright.
// A store without a URL says it's coming soon; Discord drops out while DISCORD_URL is null.
export function footerLinks(site, loc = EN, { curseforge = CURSEFORGE_URL, wago = WAGO_URL, discord = DISCORD_URL } = {}) {
  const link = (url, name) => `<a href="${esc(url)}" rel="noopener">${name}</a>`;
  const store = (url, name) => (url ? link(url, name) : loc.t("footer.soon", { store: name }));
  const items = [loc.t("footer.release", { version: esc(site.version) }), store(curseforge, "CurseForge"), store(wago, "Wago")];
  if (discord) items.push(link(discord, "Discord"));
  return `<p class="footer-meta">${[...items, COPYRIGHT].join(" · ")}</p>`;
}

// The footer's two lines: who made Vanguard, then the links line.
function footerLines(site, loc) {
  return `<p>${loc.t("footer.about", { author: esc(site.author) })}</p>
    ${footerLinks(site, loc)}`;
}

// A full HTML page with the shared header, sidebar and footer. Every page, Home
// included, has the same grouped sidebar; it's the only nav (the header holds
// the brand and the Menu button, the footer no links).
// `loc` is the language (scripts/lib/i18n-site.mjs) and `alts` every published
// language's copy of the page. A page that isn't `translated` keeps its English
// body, marked lang="en", inside the translated shell.
export function layout({ path, title, description, body, site, scripts = [], loc = EN, alts = [], translated = false }) {
  const fullTitle = pageTitle(path, title, loc);
  if (loc.english || !translated) description = SEO[path]?.description || description;
  const toggle = `<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-list">${loc.t("menu")}</button>`;
  const nav = `<nav class="nav sidebar" aria-label="Main" id="site-nav">${localiseLinks(sidebarList(path, loc), loc)}${navFoot(site, alts, loc)}</nav>`;
  const main = `<main id="main" tabindex="-1"${loc.english || translated ? "" : ' lang="en"'}>\n${localiseLinks(body, loc)}\n</main>`;
  // An asset's URL with the build's version query (the plain path if it has none).
  const asset = (p) => site.assets?.[p] || p;
  return `<!doctype html>
<html lang="${esc(loc.lang)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="${esc(site.theme.bg)}">
${socialTags({ path: path === "/404" ? path : loc.href(path), title: fullTitle, description, site })}${hreflangTags(alts)}<link rel="icon" href="${esc(asset("/assets/favicon.svg"))}" type="image/svg+xml">
<link rel="icon" href="/assets/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
${path === "/" && loc.english && site.url ? homeJsonLd(site, description) : ""}<link rel="preload" href="/fonts/FiraSansCondensed-Medium.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${esc(asset("/assets/theme.css"))}">
<link rel="stylesheet" href="${esc(asset("/assets/site.css"))}">
<script>(function (d) { d.className += " js"; try { if (localStorage.getItem("vg-show-next") === "1") d.className += " show-next"; } catch (e) {} })(document.documentElement);</script>
</head>
<body class="has-sidebar">
<a class="skip" href="#main">${loc.t("skip")}</a>
<header class="site-header">
  <div class="header-inner">
    <a class="brand" href="${loc.href("/")}">${MARK}<span>Vanguard</span></a>
    ${localiseLinks(supportButton(SUPPORT, loc), loc)}
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
    ${footerLines(site, loc)}
  </div>
</footer>
${scriptStrings(loc)}<script src="${esc(asset("/assets/site.js"))}" defer></script>
${scripts.map((s) => `<script type="module" src="${esc(asset(s))}"></script>\n`).join("")}</body>
</html>
`;
}

// The footer's copyright line, for the site and Vanguard alike. The license of each release
// (v0.4.0 and before were MIT) is on the Credits page, read from that release's LICENSE.
export const COPYRIGHT = "© 2026 Clifton Taylor. All rights reserved.";

// The "Next release" tag.
export const NEXT_BADGE = `<span class="badge next">Next release</span>`;

// The "Next release" tag in a language.
export function nextBadge(loc = EN) {
  return `<span class="badge next">${loc.t("badge.next")}</span>`;
}

// The "Needs reload" tag in a language.
export function reloadBadge(loc = EN) {
  return `<span class="badge reload">${loc.t("badge.reload")}</span>`;
}

// Availability badge for something by where it exists. Being in the current
// release is the default and gets no tag; only the exceptions are marked.
export function badge(inRel, inNext, version, loc = EN) {
  if (inRel && inNext) return "";
  if (inNext) return nextBadge(loc);
  if (inRel) return `<span class="badge old">${loc.t("badge.old", { version: esc(version) })}</span>`;
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

// A real in-game screenshot as a figure that opens the full-size image (a `shot` from
// scripts/lib/shots-content.mjs). A shot that shows something only the next release has hides
// with the rest of it.
export function shotFigure(s, { caption = true } = {}) {
  const img = `<img src="/assets/shots/${esc(s.file)}.webp" width="${s.w}" height="${s.h}" alt="${esc(s.alt)}" loading="lazy" decoding="async">`;
  return `<figure class="shot-fig"${s.next ? ' data-avail="next"' : ""}><a href="/assets/shots/${esc(s.file)}.webp">${img}</a>${caption ? `<figcaption>${esc(s.caption)}</figcaption>` : ""}</figure>`;
}
