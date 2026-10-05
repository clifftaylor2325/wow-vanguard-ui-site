// HTML helpers and the shared page layout (header, nav, footer).

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

// Every page in nav order: path, nav label, title.
export const NAV = [
  { path: "/", label: "Home", title: "ForeverUI" },
  { path: "/install/", label: "Install", title: "Install & Update" },
  { path: "/start/", label: "Getting started", title: "Getting started" },
  { path: "/features/", label: "Features", title: "Features" },
  { path: "/commands/", label: "Commands", title: "Commands" },
  { path: "/settings/", label: "Settings", title: "Settings" },
  { path: "/profiles/", label: "Profiles", title: "Profiles & sharing" },
  { path: "/help/", label: "Troubleshooting", title: "Troubleshooting & FAQ" },
  { path: "/feedback/", label: "Feedback", title: "Feedback" },
  { path: "/changelog/", label: "Changelog", title: "Changelog" },
  { path: "/credits/", label: "Credits", title: "Credits & license" },
];

// ForeverUI's CurseForge page. ForeverUI isn't listed yet, so there's no URL:
// every CurseForge call to action renders as a "Coming soon" badge, not a link.
// When the listing is live, put its URL here (for example
// "https://www.curseforge.com/wow/addons/<slug>") and rebuild: the badges
// become links and the tests switch to checking for the link.
export const CURSEFORGE_URL = null;

// The CurseForge call to action: a link once CURSEFORGE_URL is set, until then
// a styled, non-interactive "Coming soon on CurseForge" badge.
export function curseforgeCta({ size = "" } = {}) {
  const cls = `cf-cta${size ? ` cf-cta-${size}` : ""}`;
  const gem = `<svg class="cf-gem" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 1 L15 8 L8 15 L1 8 Z"/><path d="M8 4.5 L11.5 8 L8 11.5 L4.5 8 Z"/></svg>`;
  if (CURSEFORGE_URL) return `<a class="${cls}" data-curseforge="live" href="${esc(CURSEFORGE_URL)}">${gem}<span>Get ForeverUI on CurseForge</span></a>`;
  return `<span class="${cls} is-soon" data-curseforge="soon">${gem}<span>Coming soon on CurseForge</span></span>`;
}

// A decorative divider: a fine brass rule with linked diamonds in the middle.
export function ornament(cls = "") {
  return `<svg class="ornament${cls ? ` ${cls}` : ""}" viewBox="0 0 240 16" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><path class="orn-line" d="M4 8 H92 M148 8 H236"/><path class="orn-line" d="M28 8 l4 -3 l4 3 l-4 3 Z M204 8 l4 -3 l4 3 l-4 3 Z"/><path class="orn-gem" d="M111 8 L119 1 L127 8 L119 15 Z"/><path class="orn-line" d="M101 8 L109 1.5 L117 8 L109 14.5 Z M121 8 L129 1.5 L137 8 L129 14.5 Z"/></svg>`;
}

// The two linked diamonds of the ForeverUI logo, as a small inline SVG.
const MARK = `<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M11 4 L20 16 L11 28 L2 16 Z" fill="none" stroke="var(--accent)" stroke-width="2.5"/><path d="M21 4 L30 16 L21 28 L12 16 Z" fill="none" stroke="var(--text)" stroke-width="2.5"/></svg>`;

// A full HTML page with the shared header, nav and footer.
export function layout({ path, title, description, body, site }) {
  const nav = NAV.map((n) => `<li><a href="${n.path}"${n.path === path ? ' aria-current="page"' : ""}>${esc(n.label)}</a></li>`).join("");
  const fullTitle = path === "/" ? `ForeverUI: a UI suite for WoW Forever` : `${title} · ForeverUI`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="${esc(site.theme.bg)}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/theme.css">
<link rel="stylesheet" href="/assets/site.css">
<script>document.documentElement.className += " js";</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="header-inner">
    <a class="brand" href="/">${MARK}<span>ForeverUI</span></a>
    <nav class="nav" aria-label="Main">
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-list">Menu</button>
      <ul id="nav-list">${nav}</ul>
    </nav>
  </div>
</header>
<main id="main" tabindex="-1">
${body}
</main>
<footer class="site-footer">
  ${ornament("footer-orn")}
  <div class="footer-inner">
    <p style="margin:0">ForeverUI is a fan addon for WoW Forever, made by ${esc(site.author)}. It is an early release: parts have been tested in game, and some features are still being polished.</p>
    <p style="margin:0">Current release: ForeverUI ${esc(site.version)} · ${CURSEFORGE_URL ? `<a href="${esc(CURSEFORGE_URL)}">On CurseForge</a>` : "Coming soon on CurseForge"} · Code under the ${esc(site.licenseName)} license · <a href="/credits/">Credits &amp; license</a> · <a href="/feedback/">Feedback</a></p>
  </div>
</footer>
<script src="/assets/site.js" defer></script>
</body>
</html>
`;
}

// Availability badge for something by where it exists.
export function badge(inRel, inNext, version) {
  if (inRel && inNext) return `<span class="badge rel">In v${esc(version)}</span>`;
  if (inNext) return `<span class="badge next">Next release</span>`;
  if (inRel) return `<span class="badge old">v${esc(version)} only</span>`;
  return "";
}

// The availability key used by filters.
export function avail(inRel, inNext) {
  return inRel && inNext ? "rel" : inNext ? "next" : "old";
}

// A labelled screenshot placeholder.
export function shot(label) {
  return `<figure class="shot" role="img" aria-label="Screenshot coming: ${esc(label)}"><div><strong>Screenshot coming</strong>${esc(label)}</div></figure>`;
}
