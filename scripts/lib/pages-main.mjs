// Home, Install & Update, Getting started, Features, Commands and Settings.
// Generated parts come from the model (the addon's Lua, TOC, README and the
// release metadata); the prose around them only restates what those sources say.
import { shotByFile } from "./shots-content.mjs";
import { supportAsk, esc, md, slug, badge, nextBadge, reloadBadge, avail, shotFigure, ornament, heroFrame, pageHero, curseforgeCta, wagoLink, CURSEFORGE_URL, WAGO_URL, disclosure, glance, nextOnly, NEXT_BADGE } from "./html.mjs";
import { crestSvg } from "./brand.mjs";
import { AREAS } from "./model.mjs";
import { MORE, longerOf, readmeSays } from "./features-content.mjs";
import { EN } from "./i18n-site.mjs";
import { splitHelp } from "./extract.mjs";

// "September 27, 2026" in New York time.
export function dateET(iso) {
  return new Date(iso).toLocaleDateString("en-US", { timeZone: "America/New_York", year: "numeric", month: "long", day: "numeric" });
}

// A short "Source: ..." footnote, folded until the reader asks.
export function src(...files) {
  return sourceNote(EN, files);
}

// The "Source: ..." footnote in a language (file names stay as they are).
export function sourceNote(loc, files) {
  return `<details class="src"><summary>${loc.t("source")}</summary><p class="small">${loc.t("source.line", { files: files.map((f) => `<code>${esc(f)}</code>`).join(", ") })}</p></details>`;
}

// The README's "Written from scratch..." sentence (release README).
function scratchLine(readme) {
  return (readme.match(/^Written from scratch\.[^\n]*$/m) || [""])[0].replace(/\s*It bundles.*$/, "");
}

// The CurseForge card used on Home and Install: the call to action, plus the
// facts about the current release (no file, size or checksum: the site hosts none).
export function curseforgeBox(model, { heading = true } = {}) {
  const { release } = model;
  return `<section class="card cf-box" aria-labelledby="cf-h">
  <div class="cf-box-main">
    <h2 id="cf-h" class="cf-box-h">${heading ? (CURSEFORGE_URL ? "Get Vanguard on CurseForge" : "Vanguard is coming to CurseForge") : ""}</h2>
    <div class="cf-box-actions">${curseforgeCta({ size: "lg" })}${wagoLink({ size: "lg" })}</div>
    <p class="small cf-box-note">${CURSEFORGE_URL ? `Install and update it with the CurseForge app or from its page on the CurseForge website${WAGO_URL ? ", or get it from Wago Addons" : ""}.` : "No link yet: this badge becomes a link to Vanguard's CurseForge page as soon as it's listed (Wago is planned too). Until then there's nothing to download here."}</p>
  </div>
  <dl class="facts">
    <dt>Current release</dt><dd>${esc(model.version)} (release ${esc(release.tag)})</dd>
    <dt>Published</dt><dd>${esc(dateET(release.publishedAt))}</dd>
    <dt>Game</dt><dd>WoW Forever (the addon declares Interface ${esc(model.rel.meta.Interface)})</dd>
  </dl>
</section>`;
}

// ------------------------------------------------------------------ Home

// The Forever client's interface number among those the TOC declares ("16001" from
// "16001, 120105, 120007"): Forever's game version 1.60.1 encodes below 20000.
export function foreverInterface(meta) {
  return String(meta.Interface || "").split(/\s*,\s*/).find((n) => /^\d+$/.test(n) && Number(n) < 20000) || "";
}

// Home's facts line: which client, which release and when, how many modules.
function heroFacts(model, moduleCount) {
  const iface = foreverInterface(model.rel.meta);
  const client = iface ? `Built for WoW Forever (Interface ${esc(iface)})` : "Built for WoW Forever";
  return `${client} · v${esc(model.version)}, released ${esc(dateET(model.release.publishedAt))} · ${moduleCount} modules`;
}

// The README's opening tagline: "A from-scratch UI suite for WoW Forever".
export function tagline(readme) {
  const m = (readme || "").match(/^# Vanguard\s*\n+(?:[><][^\n]*\n+)*([^\n(]+?)\s*(?:\(|\.|\n)/);
  return m ? m[1].trim() : "";
}

// The modules featured on the home page, in this order, when the current
// release has them. Names and descriptions come from O.MODULE_INFO.
const HIGHLIGHTS = ["UnitFrames", "RaidFrames", "ClickCast", "ActionBars", "Bags", "Nameplates"];

// Small abstract glyphs for the highlight cards (decorative only).
const GLYPHS = {
  UnitFrames: `<rect x="3" y="7" width="14" height="5" rx="1"/><rect x="3" y="14" width="14" height="2.5" rx="1" class="g-fill"/><rect x="21" y="7" width="12" height="5" rx="1"/><rect x="21" y="14" width="12" height="2.5" rx="1" class="g-fill"/><path d="M18 22 l2 -2 l2 2 l-2 2 Z" class="g-fill"/>`,
  RaidFrames: `<rect x="3" y="5" width="8" height="6" rx="1"/><rect x="14" y="5" width="8" height="6" rx="1" class="g-fill"/><rect x="25" y="5" width="8" height="6" rx="1"/><rect x="3" y="14" width="8" height="6" rx="1" class="g-fill"/><rect x="14" y="14" width="8" height="6" rx="1"/><rect x="25" y="14" width="8" height="6" rx="1"/><path d="M3 24 H33"/>`,
  ClickCast: `<rect x="4" y="5" width="20" height="10" rx="1.5"/><path d="M20 12 L20 27 L24 23 L28 29 L30 28 L26 22 L31 21 Z" class="g-fill"/><path d="M7 18 H15"/>`,
  ActionBars: `<rect x="2" y="8" width="7" height="7" rx="1"/><rect x="11" y="8" width="7" height="7" rx="1" class="g-fill"/><rect x="20" y="8" width="7" height="7" rx="1"/><rect x="29" y="8" width="5" height="7" rx="1"/><rect x="2" y="18" width="7" height="7" rx="1"/><rect x="11" y="18" width="7" height="7" rx="1"/><rect x="20" y="18" width="7" height="7" rx="1" class="g-fill"/><rect x="29" y="18" width="5" height="7" rx="1"/>`,
  Bags: `<rect x="4" y="4" width="28" height="24" rx="2"/><path d="M4 11 H32"/><rect x="8" y="14" width="5" height="5" class="g-fill"/><rect x="15" y="14" width="5" height="5"/><rect x="22" y="14" width="5" height="5"/><rect x="8" y="21" width="5" height="4"/><rect x="15" y="21" width="5" height="4" class="g-fill"/>`,
  Nameplates: `<path d="M18 4 l3 3 l-3 3 l-3 -3 Z" class="g-fill"/><rect x="5" y="13" width="26" height="6" rx="1"/><rect x="5" y="13" width="17" height="6" rx="1" class="g-fill"/><rect x="5" y="22" width="5" height="5"/><rect x="12" y="22" width="5" height="5"/>`,
};

// One highlight card.
function highlightCard(m, version) {
  const glyph = GLYPHS[m.key] || `<path d="M18 4 L32 18 L18 32 L4 18 Z"/>`;
  return `<li><a class="feat" href="/features/#${esc(m.id)}">
  <span class="feat-glyph"><svg viewBox="0 0 36 32" aria-hidden="true" focusable="false">${glyph}</svg></span>
  <span class="feat-name">${esc(m.name)}</span>
  <span class="feat-desc">${esc(m.desc)}</span>
  <span class="feat-foot">${badge(m.inRel, m.inNext, version)}<span class="feat-more">Read more<span class="visually-hidden"> about ${esc(m.name)}</span> <span aria-hidden="true">→</span></span></span>
</a></li>`;
}

// The layout at a glance: a real screenshot of the default layout, with what is in it.
function layoutShot() {
  return `${shotFigure(shotByFile("01-hud-overview"), { caption: false })}
<p class="small">The default layout in the game: player and target frames either side of your character, your cast bar between them, the action bars underneath, the quest tracker and an info strip under the square minimap, and the bag and menu bar in the corner. More pictures are on <a href="/screenshots/">Screenshots</a>.</p>`;
}

// The hero's decorative layers: sky, glow, rune ring, ridges, embers and frame.
function heroArt() {
  const embers = Array.from({ length: 18 }, (_, i) => {
    const x = (i * 37 + 11) % 100;
    const d = 7 + ((i * 5) % 9);
    const delay = -((i * 1.7) % d).toFixed(1);
    const s = 2 + (i % 3);
    const y = 18 + ((i * 23) % 64);
    return `<i style="--x:${x}%;--y:${y}%;--d:${d}s;--t:${delay}s;--s:${s}px"${i % 4 === 0 ? ' class="e2"' : ""}></i>`;
  }).join("");
  const ticks = Array.from({ length: 24 }, (_, i) => `<path d="M100 8 v${i % 3 === 0 ? 9 : 5}" transform="rotate(${i * 15} 100 100)"/>`).join("");
  return `<div class="hero-art" aria-hidden="true">
  <div class="hero-sky"></div>
  <div class="hero-glow"></div>
  <svg class="hero-ring" viewBox="0 0 200 200" focusable="false"><circle cx="100" cy="100" r="92" class="ring-a"/><circle cx="100" cy="100" r="78" class="ring-b"/>${ticks}<path d="M100 14 l4 6 l-4 6 l-4 -6 Z M186 100 l-6 4 l-6 -4 l6 -4 Z M100 186 l-4 -6 l4 -6 l4 6 Z M14 100 l6 -4 l6 4 l-6 4 Z" class="ring-gem"/></svg>
  <svg class="hero-ridges" viewBox="0 0 1200 260" preserveAspectRatio="none" focusable="false">
    <path class="ridge-3" d="M0 150 L80 118 L150 136 L240 92 L330 128 L420 98 L520 140 L600 104 L690 132 L790 86 L880 124 L960 100 L1050 134 L1130 108 L1200 126 V260 H0 Z"/>
    <path class="ridge-2" d="M0 190 L110 150 L190 172 L300 134 L380 166 L470 142 L560 178 L660 140 L760 170 L850 146 L940 176 L1040 138 L1120 164 L1200 150 V260 H0 Z"/>
    <path class="ridge-1" d="M0 230 L140 196 L260 214 L380 188 L520 220 L640 196 L780 222 L900 192 L1030 218 L1200 196 V260 H0 Z"/>
  </svg>
  <div class="embers">${embers}</div>
  ${heroFrame()}
</div>`;
}

export function homePage(model) {
  const { rel } = model;
  const relMods = model.modules.filter((m) => m.inRel);
  const line = tagline(model.next.readme) || tagline(rel.readme);
  const notes = String(rel.meta.Notes || "");
  const parts = notes.includes(":") ? notes.slice(notes.indexOf(":") + 1).trim() : "";
  const highlights = HIGHLIGHTS.map((k) => model.modules.find((m) => m.key === k)).filter((m) => m && m.inRel && m.desc);
  return {
    path: "/",
    title: "Vanguard",
    description: rel.meta.Notes,
    body: `<section class="hero" aria-labelledby="hero-title">
${heroArt()}
<div class="hero-inner">
  ${crestSvg({ full: true, cls: "hero-crest", label: "Vanguard's crest: two swords crossed behind a brass shield that bears a V" })}
  <p class="hero-kicker">An addon for WoW&nbsp;Forever</p>
  <h1 id="hero-title" class="hero-title">Vanguard</h1>
  ${ornament("hero-orn")}
  <p class="hero-tagline">${esc(line)}.</p>
  <div class="hero-actions">${curseforgeCta({ size: "lg" })}${wagoLink({ size: "lg" })}<a class="button ghost" href="/features/">See the features</a></div>
  <p class="hero-meta">${heroFacts(model, relMods.length)}</p>
</div>
</section>

<div class="grid four tiles">
  <a class="card tile" href="/install/"><strong>Install</strong><span>${CURSEFORGE_URL ? "Get it through CurseForge or Wago." : "How installing through CurseForge will work."}</span></a>
  <a class="card tile" href="/start/"><strong>Set up</strong><span>Open the options, move your frames, pick an accent.</span></a>
  <a class="card tile" href="/commands/"><strong>Commands</strong><span>Every <code>/vg</code> command, searchable.</span></a>
  <a class="card tile" href="/help/"><strong>Fix a problem</strong><span>Self-fixes, then how to report a bug.</span></a>
</div>

<div class="notice info early"><p><strong>Vanguard is an early release.</strong> Not everything has been checked in the game yet, and some features are still being polished, so if something looks off, please tell us on the <a href="/feedback/">Feedback page</a>.</p></div>

${disclosure({ id: "hl-h", title: `What's in v${esc(model.version)}`, meta: `${relMods.length} modules`, body: `<p>A few of its modules, in the words the addon uses on its own Modules page. <a href="/features/">All ${relMods.length} are on Features</a>, and each can be turned off under <strong>/vg → Modules</strong>.</p>
<ul class="feats">${highlights.map((m) => highlightCard(m, model.version)).join("\n")}</ul>` })}
${disclosure({ id: "mock-h", title: "The layout at a glance", body: layoutShot() })}`,
  };
}

// ------------------------------------------------------------------ Install

export function installPage(model) {
  const { rel } = model;
  const readme = rel.readme;
  const where = readme.match(/unzip the `(?:Vanguard|ForeverUI)` folder into `([^`]+)`\s*\(([^)]+)\)/);
  const sv = rel.meta.SavedVariables;
  const svc = rel.meta.SavedVariablesPerCharacter;
  const listed = !!CURSEFORGE_URL;
  return {
    path: "/install/",
    title: "Install & Update",
    description: listed ? "How to install, update and remove Vanguard: through CurseForge or Wago." : "How to install, update and remove Vanguard: through CurseForge once it's listed.",
    body: `${pageHero("Install &amp; Update", listed ? `Vanguard is on CurseForge${WAGO_URL ? " and Wago" : ""}. Install and update it through CurseForge: the CurseForge app or the CurseForge website.` : "Vanguard is going to be on CurseForge. Once it's listed, you'll install and update it through CurseForge. It isn't listed yet, and this site doesn't offer it as a download.")}
${curseforgeBox(model)}
${disclosure({ id: "curseforge", title: "Install through CurseForge", body: `<ul>
  <li><strong>With the CurseForge app:</strong> find Vanguard in the app and install it. The app puts it in your AddOns folder and can keep it up to date.</li>
  <li><strong>From the CurseForge website:</strong> Vanguard's page there offers its files. ${listed ? "The button above goes to that page." : "When it's listed, the button above turns into a link to that page."} Then follow the steps under <a href="#by-hand">If you install by hand</a>.</li>
${WAGO_URL ? `  <li><strong>From Wago Addons:</strong> <a href="${esc(WAGO_URL)}" rel="noopener">Vanguard's Wago page</a> offers the same files, for the Wago app or by hand.</li>
` : ""}</ul>
<p>Then turn it on at character select (<strong>AddOns</strong>, tick <strong>Vanguard</strong>), log in, and type <code>/vg</code> in chat to open the options. See <a href="/start/">Getting started</a>.</p>
${listed ? "" : `<p class="small">To be confirmed: the exact steps for the WoW Forever client in the CurseForge app will be written here once Vanguard is listed.</p>`}` })}
${disclosure({ id: "by-hand", title: "If you install by hand", body: `<p>For when you take the file from Vanguard's CurseForge${WAGO_URL ? " or Wago" : ""} page instead of using an app.</p>
<ol class="steps">
  <li><strong>Unzip the file.</strong> Inside is one folder called <code>Vanguard</code>.</li>
  <li><strong>Put the <code>Vanguard</code> folder in your AddOns folder.</strong> The addon's README says: unzip the <code>Vanguard</code> folder into <code>${esc(where ? where[1] : "Interface/AddOns/")}</code> (${esc(where ? where[2] : "your Forever client's AddOns folder")}). The exact AddOns folder for the WoW Forever client (on Windows and macOS) is still being confirmed; until then, use the folder of your Forever client that has <code>Interface/AddOns</code> in it.</li>
  <li><strong>Turn it on at character select:</strong> open <strong>AddOns</strong> and tick <strong>Vanguard</strong>, then log in.</li>
  <li>Type <code>/vg</code> in chat to open the options. See <a href="/start/">Getting started</a>.</li>
</ol>
${src("README.md (Install)", "scripts/package.mjs (zip layout)", "docs/SMOKE-TEST.md (step 1.2)")}` })}
${disclosure({ id: "update", title: "Update", body: `<p><strong>With the CurseForge${WAGO_URL ? " or Wago" : ""} app:</strong> update Vanguard there when a new version is out.</p>
<p><strong>By hand:</strong></p>
<ol class="steps">
  <li>Log out of the game (or close it).</li>
  <li>Delete the old <code>Vanguard</code> folder from your AddOns folder.</li>
  <li>Unzip the new version and put its <code>Vanguard</code> folder in the same place.</li>
</ol>
<p>Your settings are kept. Vanguard saves them in the game's SavedVariables (<code>${esc(sv)}</code> for the account, <code>${esc(svc)}</code> for each character), not in the addon folder.</p>
<div class="notice" id="renamed"><p><strong>Coming from ForeverUI?</strong> Vanguard was called ForeverUI up to v0.3.0. It was renamed because another, unrelated addon is published under that name. The settings file is named after the addon, so your settings don't move over by themselves: before you update, type <code>/fui export</code> in game and keep the text; after updating, type <code>/vg import</code> and paste it (text from ForeverUI imports fine). Then delete the old <code>ForeverUI</code> folder from your AddOns folder.</p></div>
<p>The <a href="/changelog/">Changelog</a> says what changed in each release.</p>
${src("Vanguard.toc (SavedVariables)")}` })}
${disclosure({ id: "uninstall", title: "Uninstall", body: `<p>Remove Vanguard in the CurseForge${WAGO_URL ? " or Wago" : ""} app, or delete the <code>Vanguard</code> folder from your AddOns folder. To turn it off for a while instead, untick it under <strong>AddOns</strong> at character select.</p>
<p>To go back to the game's own version of just one part (say, its action bars), you don't need to uninstall: turn that module off under <strong>/vg → Modules</strong> and reload. See <a href="/help/#one-feature">Troubleshooting</a>.</p>` })}
${supportAsk("install", "Vanguard is free and built by one person. If it saved you an evening of setting up your UI,")}`,
  };
}

// ------------------------------------------------------------------ Getting started

// A message or label quoted from one addon file: each string part must appear in that
// file word for word (else the build stops); a { v } part is a placeholder like <name>.
export function says(text, file, ...parts) {
  return parts.map((p) => {
    if (typeof p !== "string") return `&lt;${esc(p.v)}&gt;`;
    if (!(text || "").includes(p)) throw new Error(`${file}: "${p}" not found in the addon source`);
    return esc(p);
  }).join("");
}

// The same, or null when a part is missing (for text that may only exist in one release).
export function saysIf(text, file, ...parts) {
  try { return says(text, file, ...parts); } catch { return null; }
}

// A button or field label: the build stops unless the file has it as a whole quoted string.
export function label(text, file, name) {
  says(text, file, `"${name}"`);
  return esc(name);
}

// A number read from a file by a regex with one capture group (the build stops when it's missing).
function num(text, file, re) {
  const m = (text || "").match(re);
  if (!m) throw new Error(`${file}: ${re} not found in the addon source`);
  return m[1];
}

// The setup wizard section (from Core/Setup.lua), when the source has one. Plain player
// language only: every label and message is quoted from the addon and checked by says().
function wizardSection(setup, inRel, read) {
  if (!setup) return "";
  const S = read.next("Core/Setup.lua");
  const D = read.next("Core/Dialog.lua");
  const O = read.next("Core/Options.lua");
  const s = (...p) => says(S, "Core/Setup.lua", ...p);
  const n = setup.steps.length;
  const caption = (i) => setup.caption.replace("%d", i + 1).replace("%d", n).replace("%s", setup.steps[i]);
  const wide = num(S, "Core/Setup.lua", /if w \/ h >= ([\d.]+) then return "ultrawide"/);
  const tall4k = num(S, "Core/Setup.lua", /if h >= (\d+) then return "4k"/);
  const tall1440 = num(S, "Core/Setup.lua", /return h >= (\d+) and "1440"/);
  const reloadAsk = says(D, "Core/Dialog.lua", " Reload the UI now to apply it?");
  const reloadBtn = label(D, "Core/Dialog.lua", "Reload");
  const laterBtn = label(D, "Core/Dialog.lua", "Later");
  const pixel = says(O, "Core/Options.lua", "Pixel-perfect scale");
  const layoutName = (key) => esc(setup.layouts.find((l) => l.key === key)?.text || "");
  const scr = (key) => esc(setup.screens.find((p) => p.key === key)?.text || "");
  const screenRow = (p) => `${esc(p.text)} (${p.w} x ${p.h})`;
  // Keep my current layout (moves nothing), picked when setup runs again; null before it came in.
  const keepLayout = setup.layouts.some((l) => l.key === "keep") ? layoutName("keep") : null;
  const body = `${inRel ? "" : `<p><strong>The setup wizard isn't in the current release.</strong> It's ready for the next release, and this is what it will do.</p>`}
<p>The first time you log in on an account, a window called “${esc(setup.title)}” opens. It has ${n} steps: ${setup.steps.map((x) => esc(x)).join(", ")}. The line under the title says where you are, for example “${esc(caption(0))}”. <strong>${label(S, "Core/Setup.lua", "Next")}</strong> goes on (on the last step it reads <strong>${label(S, "Core/Setup.lua", "Done")}</strong>) and <strong>${label(S, "Core/Setup.lua", "Back")}</strong> goes back a step.${setup.later ? ` On the first step, <strong>${label(S, "Core/Setup.lua", "Skip setup")}</strong> ends it without changing anything.` : ""}</p>
<p>It never opens during a fight. If you're in combat it says “${esc(setup.combat)}” and waits. If a fight starts while it's open, it gets out of the way and comes back on the same step when the fight is over.</p>

<h3 id="setup-layout">Step 1 · ${esc(setup.steps[0])}</h3>
<p>It asks: “${esc(setup.questions[0] || "")}” ${keepLayout ? `The first time, <strong>${layoutName("healing")}</strong> is picked if you're a healer (by your specialization, or else your group role) and <strong>${layoutName("damage")}</strong> otherwise; when you run it again, <strong>${keepLayout}</strong> is picked, so clicking through moves nothing.` : `<strong>${layoutName(setup.layouts[0].key)}</strong> is picked when the window opens.`} Click a layout to see what it does under the list. Your choice takes effect when you click <strong>${label(S, "Core/Setup.lua", "Next")}</strong>.</p>
<div class="table-wrap"><table class="stack"><thead><tr><th scope="col">Layout</th><th scope="col">What it does</th></tr></thead><tbody>
${setup.layouts.map((l, i) => `<tr><td data-label="Layout"><strong>${esc(l.text)}</strong>${i === 0 && !keepLayout ? ` <span class="badge plain">Default</span>` : ""}</td><td data-label="What it does">${esc(l.hint)}</td></tr>`).join("\n")}
</tbody></table></div>
<ul>
  <li><strong>${layoutName("healing")}</strong> also turns on the raid frames and click casting if they were off.</li>
  <li>Each layout first puts back anything another layout moved, so picking <strong>${layoutName("damage")}</strong> later undoes the others.</li>
</ul>

<h3 id="setup-screen">Step 2 · ${esc(setup.steps[1])}</h3>
<p>It asks: “${esc(setup.questions[1] || "")}” The wizard picks the preset for your screen when it opens and marks it “${s("your screen")}”: <strong>${scr("ultrawide")}</strong> for a screen at least ${esc(wide)} times as wide as it is tall; otherwise by height: <strong>${scr("4k")}</strong> from ${esc(tall4k)} pixels tall, <strong>${scr("1440")}</strong> from ${esc(tall1440)}, and <strong>${scr("1080")}</strong> from ${esc(setup.keepBelow)}. On a screen under ${esc(setup.keepBelow)} pixels tall, <strong>${esc(setup.keepText)}</strong> is picked${keepLayout ? `, and so it is whenever you run setup again` : ""}. Your choice takes effect when you click <strong>${label(S, "Core/Setup.lua", "Next")}</strong>.</p>
<div class="table-wrap"><table class="stack"><thead><tr><th scope="col">Choice</th><th scope="col">What it sets</th></tr></thead><tbody>
${setup.screens.map((p) => `<tr><td data-label="Choice"><strong>${screenRow(p)}</strong></td><td data-label="What it sets">${esc(p.hint)}</td></tr>`).join("\n")}
${setup.pixelText ? `<tr><td data-label="Choice"><strong>${esc(setup.pixelText)}</strong></td><td data-label="What it sets">Leaves the game's UI scale alone and turns on <strong>${pixel}</strong> under General → Look instead.</td></tr>\n` : ""}<tr><td data-label="Choice"><strong>${esc(setup.keepText)}</strong></td><td data-label="What it sets">${esc(setup.keepHint)}</td></tr>
</tbody></table></div>
<p>The UI scale a preset sets is the game's own UI scale (the one in the game's graphics settings). It changes once you're out of combat, and choosing a preset turns off <strong>${pixel}</strong> under <strong>General → Look</strong>. ${esc(setup.reloadTile)}</p>

<h3 id="setup-look">Step 3 · ${esc(setup.steps[2])}</h3>
<ul>
  <li><strong>${label(S, "Core/Setup.lua", "Accent")}:</strong> click a swatch to change the accent color right away. They're the same colors as in <a href="#accent">Pick an accent color</a> below.</li>
  <li><strong>${label(S, "Core/Setup.lua", "Raid frame style")}:</strong> three small raid tiles, each drawn in its style. Click one to switch to it right away: ${setup.styles.map((x) => `<strong>${esc(x[2])}</strong> (${esc(x[1])})`).join(", ")}.</li>
</ul>

<h3 id="setup-move">Step 4 · ${esc(setup.steps[3])}</h3>
<p>On this step your frames are unlocked, and the wizard says:</p>
<ul>${setup.moveLines.map((l) => `<li>“${esc(l)}”</li>`).join("")}</ul>
<p>Arrow keys are <kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd>; hold <kbd>Shift</kbd> to move 10 px at a time.</p>

${setup.profileQuestion ? `<h3 id="setup-profile">A new character: the ${esc(setup.profileName)} step</h3>
<p>Once setup is finished on your account, each new character gets it too, with one more step first. It asks: “${esc(setup.profileQuestion)}” and offers two choices:</p>
<ul>
  <li><strong>“${s("Share profile ")}<em>name</em>${s(" with your other characters")}”</strong>: ${s("Changes here change them too.")}</li>
  <li><strong>“${s("A profile of its own: ")}<em>character</em>”</strong>: a profile named after the character. It ${s("Starts as a copy of ").toLowerCase()}the shared one${s("; changes here stay on this character.")} It then starts on your role's layout, and <strong>${label(S, "Core/Setup.lua", "Back")}</strong> doesn't return to this step.</li>
</ul>
<p>Characters that played before this step came in aren't asked.</p>

` : ""}<h3 id="setup-finish">Finishing</h3>
${setup.later ? `<p>With the defaults it takes four clicks: <strong>${label(S, "Core/Setup.lua", "Next")}</strong>, <strong>${label(S, "Core/Setup.lua", "Next")}</strong>, <strong>${label(S, "Core/Setup.lua", "Next")}</strong>, <strong>${label(S, "Core/Setup.lua", "Done")}</strong>. <strong>${label(S, "Core/Setup.lua", "Done")}</strong> finishes it, and so does <strong>${label(S, "Core/Setup.lua", "Skip setup")}</strong>; both lock your frames again, and chat says “${esc(setup.again)}”</p>
<p>The window's close button and <kbd>Escape</kbd> only close it. Until it's finished, it opens again at your next login, and chat says “${esc(setup.later)}”</p>
<p>To run it again, type <code>/vg setup</code> or click <strong>${label(O, "Core/Options.lua", "Run setup")}</strong> under <strong>General → Layout</strong> in <code>/vg</code>.</p>` : `<p>With the defaults it takes four clicks: <strong>${label(S, "Core/Setup.lua", "Next")}</strong>, <strong>${label(S, "Core/Setup.lua", "Next")}</strong>, <strong>${label(S, "Core/Setup.lua", "Next")}</strong>, <strong>${label(S, "Core/Setup.lua", "Done")}</strong>. <strong>${label(S, "Core/Setup.lua", "Done")}</strong>, the window's close button and <kbd>Escape</kbd> all end the wizard and lock your frames again. It doesn't come back by itself; type <code>/vg setup</code> to run it again.</p>`}
<p>If setup changed something that needs a reload, it then asks, with <strong>${reloadBtn}</strong> and <strong>${laterBtn}</strong> buttons:</p>
<ul>
  <li>“${esc(setup.reloadModule)}${reloadAsk}” (for example after <strong>${layoutName("healing")}</strong> turned the raid frames on)</li>
  <li>“${esc(setup.reloadTile)}${reloadAsk}”</li>
</ul>
${shotFigure(shotByFile("02-setup-wizard"))}`;
  return disclosure({ id: "setup-wizard", title: "The setup wizard", next: !inRel, meta: inRel ? `${n} steps` : NEXT_BADGE, body });
}

export function startPage(model, read) {
  const { rel, next } = model;
  const presets = next.theme.presetOrder.map((k) => [k, next.theme.presets[k]]).filter((x) => x[1]);
  const gameMenu = next.has("Core/GameMenu.lua") && !rel.has("Core/GameMenu.lua");
  const popoverNext = /scale and opacity/.test(JSON.stringify(next.pages)) && !/scale and opacity/.test(JSON.stringify(rel.pages));
  const OW = read.next("Core/OptionsWindow.lua");
  const O = read.next("Core/Options.lua");
  const GM = read.next("Core/GameMenu.lua");
  const ow = (...p) => says(OW, "Core/OptionsWindow.lua", ...p);
  const o = (...p) => says(O, "Core/Options.lua", ...p);
  return {
    path: "/start/",
    title: "Getting started",
    description: "Open the Vanguard options, run the setup wizard, move your frames and pick an accent.",
    body: `${pageHero("Getting started", `After you <a href="/install/">install</a> Vanguard and log in, its frames replace the game's. Here's how to find the options and put things where you want them.`)}
${glance([`<code>/vg</code> opens the options`, `<code>/vg unlock</code> moves frames`, `<code>/vg accent</code> picks a color`, next.setup ? (rel.setup ? `<code>/vg setup</code> runs the wizard` : nextOnly(`<code>/vg setup</code> runs the wizard ${NEXT_BADGE}`)) : ""])}
${disclosure({ id: "options", title: "Open the options", open: true, body: `<ol class="steps">
  <li>Type <code>/vg</code> (or <code>/vanguard</code>) in chat. Type <code>/vg</code> again to close it.</li>
  <li>Left-click Vanguard on the game's addons button by the minimap. Right-click it instead to turn move mode on or off.</li>
  ${gameMenu ? `<li data-avail="next">Press <kbd>Escape</kbd> to open the game menu, then click the <strong>${label(GM, "Core/GameMenu.lua", "Vanguard")}</strong> button at the top of the Escape menu, or just under it where your client's menu can't take new buttons. ${NEXT_BADGE}</li>` : `<li>Press <kbd>Escape</kbd> to open the game menu, then click the <strong>${label(GM, "Core/GameMenu.lua", "Vanguard")}</strong> button at the top of the Escape menu, or just under it where your client's menu can't take new buttons.</li>`}
</ol>
<p>The options window has a page for each area. To find a setting, type in <strong>${label(OW, "Core/OptionsWindow.lua", "Search settings")}</strong> at the top: pages that don't match fade, and <kbd>Enter</kbd> opens the first match. Some changes need a reload; the window then says “${ow("Some changes need a reload")}” and shows a <strong>${label(OW, "Core/OptionsWindow.lua", "Reload now")}</strong> button.${saysIf(read.rel("Core/OptionsWindow.lua") || "", "Core/OptionsWindow.lua", "if ReloadUI then ReloadUI()") ? ` In v${esc(model.version)}, type <code>/reload</code> in chat instead: that release's button asks the game to reload directly, and WoW Forever blocks that for addons (see <a href="/help/#reload">Troubleshooting</a>).` : ""} Every page and setting is listed on <a href="/settings/">Settings</a>.</p>` })}
${wizardSection(next.setup, !!rel.setup, read)}
${disclosure({ id: "move", title: "Move your frames", body: `<ol class="steps">
  <li>Type <code>/vg unlock</code> (or <code>/vg move</code>), or click <strong>${label(O, "Core/Options.lua", "Move frames")}</strong> under <strong>General → Layout</strong>. Every Vanguard frame gets a drag handle.</li>
  <li>Drag a handle to move that frame. Or click a handle, then use the arrow keys to nudge it (hold <kbd>Shift</kbd> to move 10 px).</li>
  <li>Right-click a handle for its exact anchor and offsets${popoverNext ? nextOnly(`; the next release adds its scale (50% to 200%) and opacity (10% to 100%) there too ${NEXT_BADGE}`) : ""}.</li>
  <li>Type <code>/vg lock</code> when you're done.</li>
</ol>
<p>While you're moving frames, <code>/vg grid [size|on|off]</code> shows a grid (8 to 256 px) and <code>/vg snap on|off</code> makes frames snap to each other. <code>/vg frames</code> lists the frames you can move, and <code>/vg reset &lt;frame|all&gt;</code> puts one frame (or all of them) back. You can't unlock frames during combat.</p>` })}
${disclosure({ id: "accent", title: "Pick an accent color", body: `<p>Click a swatch under <strong>/vg → General → Look</strong>, or type <code>/vg accent &lt;name&gt;</code> with one of these names (or any color as six hex digits, like <code>ffcc00</code>). <code>/vg accent reset</code> puts the default back.</p>
<ul class="swatches">${presets.map(([k, hex], i) => `<li class="swatch"><i style="background:${esc(hex)}"></i><span><strong>${esc(k)}</strong>${i === 0 ? " (default)" : ""} <span class="small">${esc(hex)}</span></span></li>`).join("")}</ul>` })}
${disclosure({ id: "modules", title: "Keep the game's version of something", body: `<p>Every part of Vanguard is a module you can turn off under <strong>/vg → Modules</strong> (or type <code>/vg disable &lt;module&gt;</code>, then <code>/reload</code>). The options say: “${o("A module that's off builds nothing and costs nothing.")}” The list is on <a href="/features/">Features</a>.</p>` })}`,
  };
}

// ------------------------------------------------------------------ Features

// True when the addon says a module starts off: its own switches (O.MODULE_LINKS, else on/enabled, else every
// switch in its defaults) are off and its own description says so ("off until", "switch it on").
export function startsOff(m, model) {
  const d = model.next.modules.find((x) => x.name === m.key)?.defaults || {};
  const own = model.next.moduleLinks?.[m.key]?.keys || [["on", "enabled"].find((k) => typeof d[k] === "boolean")];
  const master = own.filter((k) => typeof d[k] === "boolean");
  const flags = master.length ? master.map((k) => d[k]) : Object.values(d).filter((v) => typeof v === "boolean");
  return flags.length > 0 && flags.every((v) => !v) && /off until|switch it on/i.test(m.desc);
}

// The module's longer description, while the README still says what it's written from.
function moreOf(m, model) {
  const entry = MORE[m.key];
  return entry && entry.check.every((c) => readmeSays(model.next.readme, c)) ? entry.more : null;
}

// A command's help text as the addon prints it (newest source first).
function helpText(model, id) {
  const e = model.commands.entries.find((x) => x.id === id);
  return ((e?.nextLines || e?.relLines || [])[0] || {}).text || "";
}

// The "Settings / Commands / Turn it off" lines under a module.
function featureFacts(m, model) {
  const rows = [];
  if (m.pages.length) rows.push(["Settings", m.pages.map((p) => `<a href="/settings/#${p.id}">${esc(p.title)}</a>`).join(", ")]);
  for (const c of m.commands) rows.push(["Command", `<a href="/commands/#cmd-${esc(c)}"><code>/vg ${esc(c)}</code></a> ${esc(helpText(model, c))}`]);
  rows.push(["Turn it off", `<strong>/vg → Modules</strong>, then reload`]);
  return `<dl class="facts">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>`;
}

// Where a card's words come from, in plain words (no file names).
function featureSource(m, more) {
  const parts = ["Vanguard's own Modules page", m.pages.length && "its options", m.commands.length && "its commands", more && "the addon's own feature list"].filter(Boolean);
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}` : parts[0];
  return `<p class="small mod-src">Source: ${list}.</p>`;
}

// The screenshots that show a module, by module key (files in src/assets/shots/).
const FEATURE_SHOTS = {
  UnitFrames: ["01-hud-overview"], Bags: ["10-bags"], MenuStrip: ["11-bag-menu-bar"], Windows: ["12-game-windows"],
  Merchant: ["14-merchant"], QuestDialog: ["15-quest-dialog"], QuestLog: ["16-quest-log"], QuestTracker: ["17-quest-tracker"],
  Errands: ["18-trainer-train-all", "37-flight-timer"], RaidFrames: ["21-raid-preview-25"], PartyExtras: ["20-party-preview"],
  ClickCast: ["22-click-casting"], Nameplates: ["32d-nameplates-enemies", "32e-nameplates-cast"], Meter: ["35-vanguard-meter-dps"],
  CooldownGaps: ["36-cooldown-gaps"],
};

// One module as a card: name, badges, the addon's one-liner, more, and its facts.
function featureCard(m, model) {
  const off = startsOff(m, model) ? ` <span class="badge plain">Off until you switch it on</span>` : "";
  const more = moreOf(m, model);
  const longer = longerOf(m.key);
  return `<article class="card mod" id="${m.id}" data-module="${esc(m.key)}" data-count${m.inRel ? "" : ' data-avail="next"'}>
  <h3>${esc(m.name)} ${badge(m.inRel, m.inNext, model.version)}${off}</h3>
  ${m.desc ? `<p>${esc(m.desc)}</p>` : ""}
  <details class="mod-details"><summary>More<span class="visually-hidden"> about ${esc(m.name)}</span></summary>
  ${(FEATURE_SHOTS[m.key] || []).map((f) => shotFigure(shotByFile(f))).join("")}
  ${more ? `<p class="mod-more">${esc(more)}</p>` : ""}${longer.length ? `\n  <p class="mod-longer">${esc(longer.join(" "))}</p>` : ""}
  ${featureFacts(m, model)}
  ${featureSource(m, more)}
  </details>
</article>`;
}

// The feature areas that have modules, in the plan's order, then "Other".
function featureAreas(model) {
  const names = [...AREAS.map(([a]) => a), "Other"];
  return names.map((area) => [area, model.modules.filter((m) => m.area === area)]).filter(([, list]) => list.length);
}

// One area: its heading and its module cards.
function areaSection([area, list], model) {
  const rel = list.filter((m) => m.inRel).length;
  const mods = (n) => `${n} module${n === 1 ? "" : "s"}`;
  const meta = rel === list.length ? mods(rel) : `${mods(rel)}${nextOnly(` + ${list.length - rel} next release`)}`;
  return disclosure({ id: `area-${slug(area)}`, title: esc(area), meta, next: rel === 0, cls: "area", body: `<div class="mods">${list.map((m) => featureCard(m, model)).join("\n")}</div>` });
}

// The Features lede, shown in the page hero. In another language it ends by
// saying the module descriptions below are in English (plan D8).
function featuresLede(loc) {
  const lede = loc.t("feat.lede", { modules: esc(loc.addon("Modules")) });
  return loc.english ? lede : `${lede} ${loc.t("feat.englishNote")}`;
}

// The facts strip under the page hero: the counts, and what the tags mean.
function featuresIntro(model, loc) {
  const count = (f) => model.modules.filter(f).length;
  const more = count((m) => m.inNext && !m.inRel);
  const off = `<span class="badge plain">${loc.t("feat.offBadge")}</span>`;
  return glance([loc.n("feat.inRelease", count((m) => m.inRel), { version: esc(model.version) }), more ? nextOnly(loc.t("glance.more", { n: more })) : "", loc.t("feat.everyOn", { badge: off })]);
}

// The search box over the module cards (site.js, the same one as Commands and Settings).
// It reads each card's whole text, the folded More included, and opens the areas with a match.
function featureSearchBox(model, loc) {
  return `<div class="search" data-target="#mod-list" data-items=".mod" data-groups=".area" data-noun="modules" data-noun-one="module">
  <label for="mod-q" class="search-label visually-hidden">${loc.t("feat.search")}</label>
  <input id="mod-q" type="search" placeholder="${esc(loc.text("feat.placeholder"))}" autocomplete="off">
  ${model.same ? "" : `<div class="filters"><label class="switch"><input type="checkbox" data-filter="next" checked> <span>${loc.t("nextSwitch")}</span></label></div>`}
  <p class="count" aria-live="polite" role="status"></p>
</div>`;
}

// The Features page: one card per module, grouped by area. In another language
// only the intro and the search are translated; the cards stay English (lang="en").
export function featuresPage(model, loc = EN) {
  const groups = featureAreas(model);
  const lang = loc.english ? "" : ' lang="en"';
  const body = [pageHero(loc.t("title./features/"), featuresLede(loc)), featuresIntro(model, loc), featureSearchBox(model, loc), `<div id="mod-list" class="dis-grid"${lang}>${groups.map((g) => areaSection(g, model)).join("\n")}</div>`,
    `<p class="small"${lang}>The name and first line of each module are the ones the addon shows on its Modules page. The longer text under <strong>More</strong> describes the module as it is in the newest version${model.same ? "" : `, so v${esc(model.version)} may not have every detail yet`}; <a href="/settings/">Settings</a> shows exactly which options each release has.</p>`];
  return { path: "/features/", title: "Features", description: loc.text("feat.description"), body: body.join("\n"), translated: true };
}

// ------------------------------------------------------------------ Commands

// The visible lines of one command entry. A help line's text is the addon's,
// in the page's language; its syntax stays as typed.
function cmdLines(e, loc) {
  const text = (l) => (loc.english ? l.text : splitHelp(loc.addon(l.line)).text || l.text);
  const show = (lines) => lines.map((l) => `<p class="cmd-text"><span class="cmd-line">/vg ${esc(l.syntax)}</span><br>${esc(text(l))}</p>`).join("");
  if (e.relLines && !e.changed) return show(e.relLines);
  if (e.relLines && e.changed) return `${show(e.relLines)}${nextOnly(`<p class="cmd-meta">${loc.t("cmd.nextReads")}</p>${show(e.nextLines)}`, "div")}`;
  if (e.nextLines) return show(e.nextLines);
  return "";
}

// The other ways to open the options window, without repeating /vg itself.
function fuiAliases(slashes, keys, loc) {
  const alts = [...slashes.filter((s) => s !== "/vg"), ...keys.map((k) => `/vg ${k}`)];
  return alts.length ? ` ${loc.t("cmd.also", { list: loc.list(alts.map((a) => `<code>${esc(a)}</code>`)) })}` : "";
}

// The command as shown in its row: every word it accepts.
function cmdTyped(e) {
  if (e.special === "fui") return "/vg";
  if (e.special === "help") return "/vg help";
  return `/vg ${e.keys.join(" | ")}`;
}

// What the Copy button copies: the command with its first word.
function cmdCopy(e) {
  if (e.special === "fui") return "/vg";
  if (e.special === "help") return "/vg help";
  return `/vg ${e.keys[0] || ""}`.trim();
}

// What a command does: the addon's help lines, or a plain note for /vg and /vg help.
function cmdWhat(e, c, loc) {
  if (e.special === "fui") return `<p class="cmd-text">${loc.t("cmd.opens")}${fuiAliases(c.slashes, e.keys, loc)} ${loc.t("cmd.firstLine", { text: esc(loc.addon(c.relIntro)) })}</p>`;
  if (e.special === "help") return `<p class="cmd-text">${loc.t("cmd.helpPrints")}</p>`;
  return cmdLines(e, loc);
}

// Links to the Features sections of the modules a command needs.
function cmdModules(e, model, loc) {
  return e.modules.map((m) => {
    const mm = model.modules.find((x) => x.key === m);
    return `<a href="/features/#${mm ? mm.id : slug(m)}">${esc(loc.addon(mm ? mm.name : m))}</a>`;
  }).join(", ");
}

// The words the search box matches for a command: its words and help lines,
// in English and in the page's language.
function cmdSearch(e, loc) {
  const lines = [...(e.relLines || []), ...(e.nextLines || [])].map((l) => l.line);
  const own = loc.english ? [] : lines.map((l) => loc.addon(l)).filter((l) => !lines.includes(l));
  return [e.keys.join(" "), ...lines, ...own, e.special || ""].join(" ");
}

// The row header: an anchor for each word, the command, its Copy button and its version tag.
function cmdHead(e, version, loc) {
  const anchors = e.keys.map((k) => `<span id="cmd-${esc(k)}" data-command="${esc(k)}"></span>`).join("");
  const copy = esc(cmdCopy(e));
  const b = badge(e.inRel, e.inNext, version, loc);
  return `<th scope="row" class="cmd-cap">${anchors}<div class="cmd-head"><code class="cmd-syntax">${esc(cmdTyped(e))}</code> <button class="copy" type="button" data-copy="${copy}" aria-label="${esc(loc.text("copy.label", { text: cmdCopy(e) }))}">${loc.t("copy")}</button>${b ? ` ${b}` : ""}</div></th>`;
}

// One command as a table row (a card on narrow screens): the command, then what it does and which module it needs.
function cmdRow(e, model, loc) {
  const mods = cmdModules(e, model, loc);
  const what = `${cmdWhat(e, model.commands, loc)}${mods ? `<p class="cmd-meta">${loc.t("cmd.needs", { modules: mods })}</p>` : ""}`;
  return `<tr class="cmd opt-item" id="entry-${esc(e.id)}" data-count data-avail="${avail(e.inRel, e.inNext)}" data-search="${esc(cmdSearch(e, loc))}">${cmdHead(e, model.version, loc)}<td data-label="${loc.t("cmd.col.what")}">${what}</td></tr>`;
}

// The commands grouped by the feature area of the module they need (the Features page's areas;
// General for those that need none), General first, then the areas in the Features page's order.
function cmdGroups(model) {
  const order = ["General", ...AREAS.map(([a]) => a), "Other"];
  const groups = new Map(order.map((name) => [name, { name, id: slug(name), entries: [] }]));
  for (const e of model.commands.entries) {
    const mm = e.modules[0] ? model.modules.find((x) => x.key === e.modules[0]) : null;
    groups.get(e.modules[0] ? (mm ? mm.area : "Other") : "General").entries.push(e);
  }
  return [...groups.values()].filter((g) => g.entries.length);
}

// A command group's count: "12 commands", "+ 2 next release" behind the next-release switch.
function cmdGroupMeta(g, loc) {
  const rel = g.entries.filter((e) => e.inRel).length;
  const more = g.entries.length - rel;
  return `${rel ? loc.n("cmd.count", rel) : ""}${more ? nextOnly(`${rel ? " + " : ""}${loc.t("group.moreNext", { n: more })}`) : ""}`;
}

// Every command in one table, in folded groups (a heading row with a button opens each).
function cmdTable(model, loc) {
  const cols = [loc.t("cmd.col.command"), loc.t("cmd.col.what")];
  const head = `<thead class="visually-hidden"><tr>${cols.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead>`;
  const groups = cmdGroups(model).map((g) => {
    const rel = g.entries.some((e) => e.inRel);
    const heading = `<tr class="opt-row h"><th scope="rowgroup" colspan="${cols.length}"><button type="button" class="group-toggle" aria-expanded="false">${loc.t(`area.${g.name}`)}<span class="dis-meta">${cmdGroupMeta(g, loc)}</span></button></th></tr>`;
    return `<tbody class="cmd-group collapsed" data-group="${esc(g.id)}"${rel ? "" : ' data-avail="next"'}>${heading}\n${g.entries.map((e) => cmdRow(e, model, loc)).join("\n")}</tbody>`;
  });
  return `<table class="opt-table cmd-table" id="cmd-list"><caption>${loc.t("cmd.caption")}</caption>${head}\n${groups.join("\n")}\n</table>`;
}

// The search box's switches: each only when some command needs it (one the next release adds, one it drops).
function cmdFilters(c, version, loc) {
  const next = [...c.nextKeys].some((k) => !c.relKeys.has(k)) ? `<label class="switch"><input type="checkbox" data-filter="next" checked> <span>${loc.t("nextSwitch")}</span></label>` : "";
  const old = [...c.relKeys].some((k) => !c.nextKeys.has(k)) ? `<label><input type="checkbox" data-filter="old" checked> ${loc.t("cmd.showOld", { version: esc(version) })}</label>` : "";
  return next || old ? `<div class="filters">${next}${old}</div>` : "";
}

// The search box over the commands, with its switches and a live count.
function cmdSearchBox(c, version, loc) {
  return `<div class="search" data-target="#cmd-list" data-items=".cmd" data-noun="commands" data-noun-one="command">
  <label for="cmd-q" class="search-label">${loc.t("cmd.search")}</label>
  <input id="cmd-q" type="search" placeholder="${esc(loc.text("cmd.placeholder"))}" autocomplete="off">
  ${cmdFilters(c, version, loc)}
  <p class="count" aria-live="polite" role="status"></p>
</div>`;
}

// The Commands page body: the counts, the search and the grouped table.
function commandsBody(model, loc) {
  const { commands: c, version } = model;
  const more = [...c.nextKeys].filter((k) => !c.relKeys.has(k)).length;
  const hero = pageHero(loc.t("title./commands/"), loc.t("cmd.lede"));
  const unknown = esc(loc.addon(c.unknown || "Unknown command. /vg help"));
  const counts = glance([loc.n("cmd.words", c.relKeys.size, { version: esc(version) }), more ? nextOnly(loc.t("glance.more", { n: more })) : "", loc.t("cmd.unknown", { text: unknown })]);
  return [hero, counts, cmdSearchBox(c, version, loc), cmdTable(model, loc), sourceNote(loc, ["Core/Slash.lua (HELP, COMMANDS, SLASH_VANGUARD1/2)"])].join("\n");
}

// The Commands page.
export function commandsPage(model, loc = EN) {
  return { path: "/commands/", title: "Commands", description: loc.text("cmd.description"), body: commandsBody(model, loc), translated: true };
}

// ------------------------------------------------------------------ Settings

// The columns of a settings table (string keys); the first is each row's header.
const COLS = ["set.col.setting", "set.col.values", "set.col.default", "set.col.notes"];

// The kinds of row the site names (kind.<kind>).
const KINDS = ["check", "cycle", "slider", "button", "visibility"];

// A default as the page's language says it: a switch's On or Off is the site's
// word, a choice is the addon's label, a number stays a number.
function defaultWord(r, value, loc) {
  if (r.kind === "check") return loc.text(value === "On" ? "set.on" : "set.off");
  return r.kind === "cycle" ? loc.addon(value) : value;
}

// Text for a row's default across versions.
function defaultText(r, loc) {
  const a = r.relDefault && defaultWord(r, r.relDefault, loc);
  const b = r.nextDefault && defaultWord(r, r.nextDefault, loc);
  if (r.inRel && r.inNext && a && b && a !== b) return `${esc(a)}${nextOnly(` ${loc.t("set.defaultNext", { value: esc(b) })}`)}`;
  return a || b ? esc(a || b) : "";
}

// A row's choices and range, as one line ("" when it has neither).
function valuesText(r, loc) {
  const out = [];
  if (r.choices && r.choices.length) out.push(r.choices.map((c) => esc(loc.addon(c[1]))).join(" / "));
  if (r.range) {
    const f = (x) => (r.range.percent && r.range.max <= 2 ? `${Math.round(x * 100)}%` : String(x));
    out.push(loc.t("set.range", { min: esc(f(r.range.min)), max: esc(f(r.range.max)) }));
  }
  return out.join("; ");
}

// A unique id for a row's anchor: the page id plus the caption's slug.
function rowId(pageId, caption, used) {
  const base = `${pageId}-${slug(caption) || "row"}`;
  let id = base;
  for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
  used.add(id);
  return id;
}

// A heading row that spans the table and opens a new row group.
function groupRow(html, attrs) {
  return `</tbody><tbody><tr class="opt-row h" ${attrs}><th scope="rowgroup" colspan="${COLS.length}">${html}</th></tr>`;
}

// A heading or note row from the addon, spanning the table.
function wideRow(r, attrs, version, loc) {
  const b = r.inRel && r.inNext ? "" : ` ${badge(r.inRel, r.inNext, version, loc)}`;
  if (r.kind === "header") return groupRow(`${esc(loc.addon(r.caption))}${b}`, attrs);
  return `<tr class="opt-row t opt-item" ${attrs}><td colspan="${COLS.length}">${esc(loc.addon(r.caption))}${b}</td></tr>`;
}

// The words the search box matches for a row: its page, caption and choices,
// in English and in the page's language.
function rowSearch(r, pageTitle, loc) {
  const words = [pageTitle, r.caption, ...(r.choices || []).map((c) => c[1])];
  const own = loc.english ? [] : words.map((w) => loc.addon(w)).filter((w) => !words.includes(w));
  return `${pageTitle} ${r.caption} ${(r.choices || []).map((c) => c[1]).join(" ")}${own.length ? ` ${own.join(" ")}` : ""}`;
}

// One setting as a table row: the caption is the row header; each cell carries its card label.
function optRow(r, version, pageTitle, id, loc) {
  const attrs = `data-avail="${avail(r.inRel, r.inNext)}" data-search="${esc(rowSearch(r, pageTitle, loc))}"`;
  if (r.kind === "header" || r.kind === "text") return wideRow(r, attrs, version, loc);
  const loop = r.loop ? ` <span class="small">(${esc(r.loop.variable)} = ${loc.t("set.range", { min: r.loop.from, max: r.loop.to })})</span>` : "";
  const notes = `${r.reload ? `${reloadBadge(loc)} ` : ""}${badge(r.inRel, r.inNext, version, loc)}`;
  const kind = KINDS.includes(r.kind) ? ` <span class="opt-kind">${loc.t(`kind.${r.kind}`)}</span>` : "";
  const cells = [valuesText(r, loc), defaultText(r, loc), notes].map((h, i) => `<td data-label="${loc.t(COLS[i + 1])}">${h}</td>`);
  return `<tr class="opt-row opt-item" id="${id}" data-count ${attrs}><th scope="row" class="opt-cap">${esc(loc.addon(r.caption))}${loop}${kind}</th>${cells.join("")}</tr>`;
}

// The heading over rows the options window repeats, e.g. "The rows below repeat for each n from 1 to 8".
function repeatHeading(rep, loc) {
  if (rep.variable) return loc.t("set.repeatEach", { variable: esc(`<${rep.variable}>`), from: rep.from, to: rep.to });
  return loc.t("set.repeatOf", { from: rep.from, to: rep.to });
}

// A page's table rows, with a heading before rows repeated for every bar.
function pageRows(p, version, used, loc) {
  const out = [];
  let inRepeat = null;
  for (const r of p.rows) {
    const rep = r.repeated ? JSON.stringify(r.repeated) : null;
    if (rep && rep !== inRepeat) out.push(groupRow(repeatHeading(r.repeated, loc), `data-search="${esc(p.title)} each"`));
    inRepeat = rep;
    out.push(optRow(r, version, p.title, rowId(p.id, r.caption, used), loc));
  }
  return out.join("\n");
}

// The Modules page's closing note: one switch per module.
function modulesRow(p, model, loc) {
  if (p.key !== "modules") return "";
  const mods = model.modules.map((m) => `<a href="/features/#${m.id}">${esc(loc.addon(m.name))}</a>${m.inRel ? "" : ` ${loc.t("set.moduleNext")}`}`).join(", ");
  return `<tr class="opt-row t"><td colspan="${COLS.length}">${loc.t("set.modulesRow", { modules: mods })}</td></tr>`;
}

// One options page, folded: its heading opens a table of its settings (one card per row on narrow screens).
function pageSection(p, model, used, loc) {
  const head = `<thead><tr>${COLS.map((c) => `<th scope="col">${loc.t(c)}</th>`).join("")}</tr></thead>`;
  const n = p.rows.filter((r) => r.kind !== "header" && r.kind !== "text").length;
  const b = badge(p.inRel, p.inNext, model.version, loc);
  return `<details class="opt-page disclosure" data-page="${esc(p.key)}"${p.inRel ? "" : ' data-avail="next"'}>
<summary><h2 id="${p.id}">${esc(loc.addon(p.title))}</h2><span class="dis-meta">${loc.n("set.count", n)}${b ? ` ${b}` : ""}</span></summary>
<div class="dis-body">
<table class="opt-table" aria-labelledby="${p.id}">${head}<tbody>
${pageRows(p, model.version, used, loc)}
${modulesRow(p, model, loc)}
</tbody></table>
</div>
</details>`;
}

// What a Reload button built during a fight prints instead of reloading (Core/Dialog.lua), or null.
function combatReloadLine(dialogLua) {
  return (dialogLua || "").match(/ns\.Chat\("(Type \/reload in chat[^"]*)"\)/)?.[1] || null;
}

// The addon's reload words the notes quote, in the page's language.
function reloadWords(loc) {
  return { prompt: esc(loc.addon("Some changes need a reload")), reloadNow: esc(loc.addon("Reload now")), reload: esc(loc.addon("Reload")) };
}

// The note on Reload buttons built during a fight, read from Core/Dialog.lua ("" when the addon has none).
function combatReloadNote(read, loc) {
  const line = combatReloadLine(read.next("Core/Dialog.lua"));
  if (!line) return "";
  const b = combatReloadLine(read.rel("Core/Dialog.lua")) ? "" : `${nextBadge(loc)} `;
  return `<div class="notice info" id="reload-in-combat"><p>${b}${loc.t("set.combatReload", { ...reloadWords(loc), line: esc(loc.addon(line)) })}</p></div>`;
}

// The search box over the settings, with its version switches and a live count.
function settingsSearchBox(model, loc) {
  return `<div class="search" data-target="#opt-list" data-items=".opt-row" data-groups=".opt-page" data-noun="settings" data-noun-one="setting">
  <label for="opt-q" class="search-label">${loc.t("set.search")}</label>
  <input id="opt-q" type="search" placeholder="${esc(loc.text("set.placeholder"))}" autocomplete="off">
  ${model.same ? "" : `<div class="filters">
    <label class="switch"><input type="checkbox" data-filter="next" checked> <span>${loc.t("nextSwitch")}</span></label>
    <label><input type="checkbox" data-filter="old" checked> ${loc.t("set.showOld", { version: esc(model.version) })}</label>
  </div>`}
  <p class="count" aria-live="polite" role="status"></p>
</div>`;
}

// The counts line: settings in the release (and the next one), and pages.
function settingsCounts(model, loc) {
  const { pages, version } = model;
  const count = (f) => pages.reduce((n, p) => n + p.rows.filter((r) => r.kind !== "header" && r.kind !== "text" && f(r)).length, 0);
  const parts = [loc.n("set.inRelease", count((r) => r.inRel), { version: esc(version) }), model.same ? "" : loc.t("set.inNext", { n: count((r) => r.inNext) }), loc.n("set.pages", pages.length)];
  return `<p class="counts">${parts.filter(Boolean).join(" · ")}.</p>`;
}

// The folded aside under the settings: reloads, defaults and what isn't listed.
function settingsAside(read, loc) {
  return disclosure({ id: "reloads", level: 3, title: loc.t("set.aboutTitle"), cls: "aside", body: `<p>${loc.t("set.aboutReload", { badge: reloadBadge(loc), ...reloadWords(loc) })}</p>
${combatReloadNote(read, loc)}
<p class="small">${loc.t("set.aboutClients")}</p>` });
}

export function settingsPage(model, read, loc = EN) {
  const used = new Set(model.pages.map((p) => p.id));
  return {
    path: "/settings/",
    title: "Settings",
    description: loc.text("set.description"),
    translated: true,
    body: `${pageHero(loc.t("title./settings/"), loc.t("set.lede"))}
${settingsCounts(model, loc)}
${settingsSearchBox(model, loc)}
<div id="opt-list" class="dis-grid">
${model.pages.map((p) => pageSection(p, model, used, loc)).join("\n")}
</div>
${settingsAside(read, loc)}
${sourceNote(loc, ["Core/Options.lua (PAGES and row builders)", "Modules/RaidHealing.lua", "Modules/ClickCastOptions.lua", "Modules/Nameplates.lua", "Modules/Situations.lua", "Core/Visibility.lua", "Core/Dialog.lua (ns.ReloadButton)", "module defaults tables"])}`,
  };
}
