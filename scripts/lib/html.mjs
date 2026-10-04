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
  <div class="footer-inner">
    <p style="margin:0">ForeverUI is a fan addon for WoW Forever, made by ${esc(site.author)}. It is an early release: nothing has been checked in game yet.</p>
    <p style="margin:0">Current download: ForeverUI ${esc(site.version)} · Code under the ${esc(site.licenseName)} license · <a href="/credits/">Credits &amp; license</a> · <a href="/feedback/">Feedback</a></p>
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
