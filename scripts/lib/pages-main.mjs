// Home, Install & Update, Getting started, Features, Commands and Settings.
// Generated parts come from the model (the addon's Lua, TOC, README and the
// release metadata); the prose around them only restates what those sources say.
import { esc, md, slug, badge, avail, shot, ornament, heroFrame, pageHero, curseforgeCta, CURSEFORGE_URL } from "./html.mjs";
import { AREAS } from "./model.mjs";
import { MORE } from "./features-content.mjs";

// "September 27, 2026" in New York time.
export function dateET(iso) {
  return new Date(iso).toLocaleDateString("en-US", { timeZone: "America/New_York", year: "numeric", month: "long", day: "numeric" });
}

// A short "Source: ..." line.
export function src(...files) {
  return `<p class="small">Source: ${files.map((f) => `<code>${esc(f)}</code>`).join(", ")} in the ForeverUI addon repository.</p>`;
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
    <h2 id="cf-h" class="cf-box-h">${heading ? (CURSEFORGE_URL ? "Get ForeverUI on CurseForge" : "ForeverUI is coming to CurseForge") : ""}</h2>
    ${curseforgeCta({ size: "lg" })}
    <p class="small cf-box-note">${CURSEFORGE_URL ? "Install and update it with the CurseForge app or from its page on the CurseForge website." : "No link yet: this badge becomes a link to ForeverUI's CurseForge page as soon as it's listed. Until then there's nothing to download here."}</p>
  </div>
  <dl class="facts">
    <dt>Current release</dt><dd>${esc(model.version)} (release ${esc(release.tag)})</dd>
    <dt>Published</dt><dd>${esc(dateET(release.publishedAt))}</dd>
    <dt>Game</dt><dd>WoW Forever (the addon declares Interface ${esc(model.rel.meta.Interface)})</dd>
  </dl>
</section>`;
}

// The "current release vs next release" notice used on several pages.
export function nextNotice(model) {
  if (model.same) return "";
  const newMods = model.modules.filter((m) => m.inNext && !m.inRel).length;
  const newCmds = [...model.commands.nextKeys].filter((k) => !model.commands.relKeys.has(k)).length;
  return `<div class="notice info"><p><strong>The current release is ${esc(model.version)}.</strong> The addon has moved on since that release: ${newMods} more modules and ${newCmds} more commands are written and waiting for the next release, which isn't out yet. This site marks those <span class="badge next">Next release</span>. They are not in v${esc(model.version)}.</p></div>`;
}

// ------------------------------------------------------------------ Home

// The README's opening tagline: "A from-scratch UI suite for WoW Forever".
export function tagline(readme) {
  const m = (readme || "").match(/^# ForeverUI\s*\n+([^\n(]+?)\s*(?:\(|\.|\n)/);
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

// The decorative CSS "UI mock": abstract shapes in the layout the README
// describes (centered frames, bars below, raid tiles above, square minimap,
// chat bottom left). Marked as an illustration, never a screenshot.
function uiMock() {
  const n = (k, cls) => Array.from({ length: k }, () => `<i${cls ? ` class="${cls}"` : ""}></i>`).join("");
  return `<figure class="mock-wrap">
  <div class="mock" role="img" aria-label="Illustration, not a screenshot: abstract shapes suggesting unit frames, action bars, raid tiles, chat and a square minimap.">
    <div class="mk-minimap"><b></b><b></b><b></b><b></b></div>
    <div class="mk-raid">${n(10)}</div>
    <div class="mk-small mk-focus"><span></span></div>
    <div class="mk-small mk-pet"><span></span></div>
    <div class="mk-player"><span class="mk-hp"></span><span class="mk-pw"></span></div>
    <div class="mk-small mk-tot"><span></span></div>
    <div class="mk-cast"><span></span></div>
    <div class="mk-self" aria-hidden="true"></div>
    <div class="mk-target"><span class="mk-hp"></span><span class="mk-pw"></span></div>
    <div class="mk-bars"><div>${n(12)}</div><div>${n(12)}</div><div>${n(12)}</div><span class="mk-xp"></span></div>
    <div class="mk-chat">${n(5)}</div>
  </div>
  <figcaption><span class="mock-tag">Illustration</span> Not a screenshot: an abstract sketch of the centered layout the addon's README describes, with player and target either side of your character, bars underneath, raid tiles above, chat bottom left and a square minimap. Screenshots may be added as this early release is polished.</figcaption>
</figure>`;
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
    title: "ForeverUI",
    description: rel.meta.Notes,
    body: `<section class="hero" aria-labelledby="hero-title">
${heroArt()}
<div class="hero-inner">
  <p class="hero-kicker">A fan addon for WoW Forever</p>
  <h1 id="hero-title" class="hero-title">ForeverUI</h1>
  ${ornament("hero-orn")}
  <p class="hero-tagline">${esc(line)}.</p>
  ${parts ? `<p class="hero-parts">${parts.replace(/\.$/, "").split(/,\s*/).map((x) => esc(x)).join(`<span class="visually-hidden">,</span> <span class="hero-dot" aria-hidden="true">◆</span> `)}</p>` : ""}
  <div class="hero-actions">${curseforgeCta({ size: "lg" })}<a class="button ghost" href="/features/">Explore the features</a></div>
  <p class="hero-meta">Current release v${esc(model.version)} · ${relMods.length} modules · the Slate &amp; Brass theme</p>
</div>
</section>

<div class="honesty">
  <div class="note-card warn"><svg class="note-mark" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10 1 L19 10 L10 19 L1 10 Z"/><path d="M10 6 V11 M10 13.5 V14.5"/></svg><p><strong>ForeverUI is an early release.</strong> Parts have been tested in game, and some features are still being polished, so if something looks off, please tell us on the <a href="/feedback/">Feedback page</a>.</p></div>
  ${model.same ? "" : `<div class="note-card info"><svg class="note-mark" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10 1 L19 10 L10 19 L1 10 Z"/><path d="M10 9 V14.5 M10 5.5 V6.5"/></svg>${nextNotice(model).replace(/^<div class="notice info">|<\/div>$/g, "")}</div>`}
</div>

<section class="home-sec" aria-labelledby="hl-h">
  <div class="sec-head">${ornament()}<h2 id="hl-h">In the v${esc(model.version)} release</h2><p>A few of its ${relMods.length} modules, in the words the addon uses on its own Modules page.</p></div>
  <ul class="feats">${highlights.map((m) => highlightCard(m, model.version)).join("\n")}</ul>
</section>

<section class="home-sec" aria-labelledby="mock-h">
  <div class="sec-head">${ornament()}<h2 id="mock-h">One layout, centered on you</h2></div>
  ${uiMock()}
</section>

<section class="home-sec" aria-labelledby="todo-h">
  <div class="sec-head">${ornament()}<h2 id="todo-h">What do you want to do?</h2></div>
  <div class="grid four">
    <a class="card tile" href="/install/"><strong>Install</strong>How installing through CurseForge will work.</a>
    <a class="card tile" href="/start/"><strong>Set up</strong>Open the options, move your frames, pick an accent.</a>
    <a class="card tile" href="/commands/"><strong>Commands</strong>Every <code>/fui</code> command, searchable.</a>
    <a class="card tile" href="/help/"><strong>Fix a problem</strong>Self-fixes, then how to report a bug.</a>
  </div>
</section>

<section class="home-sec" aria-labelledby="all-h">
  <div class="sec-head">${ornament()}<h2 id="all-h">All ${relMods.length} modules in v${esc(model.version)}</h2><p>Each can be turned off under <strong>/fui → Modules</strong>.</p></div>
  <ul class="chips">${relMods.map((m) => `<li><a href="/features/#${m.id}">${esc(m.name)}</a></li>`).join("")}</ul>
</section>
${src("ForeverUI.toc", "README.md", "Core/Options.lua (O.MODULE_INFO)")}`,
  };
}

// ------------------------------------------------------------------ Install

export function installPage(model) {
  const { rel } = model;
  const readme = rel.readme;
  const where = readme.match(/unzip the `ForeverUI` folder into `([^`]+)`\s*\(([^)]+)\)/);
  const sv = rel.meta.SavedVariables;
  const svc = rel.meta.SavedVariablesPerCharacter;
  const listed = !!CURSEFORGE_URL;
  return {
    path: "/install/",
    title: "Install & Update",
    description: "How to install, update and remove ForeverUI: through CurseForge once it's listed.",
    body: `${pageHero("Install &amp; Update", `ForeverUI is going to be on CurseForge. ${listed ? "Install and update it through CurseForge: the CurseForge app or the CurseForge website." : "Once it's listed, you'll install and update it through CurseForge: with the CurseForge app, or from ForeverUI's page on the CurseForge website. It isn't listed yet, and this site doesn't offer it as a download."}`)}
${curseforgeBox(model)}

<h2 id="curseforge">Install through CurseForge</h2>
<ul>
  <li><strong>With the CurseForge app:</strong> find ForeverUI in the app and install it. The app puts it in your AddOns folder and can keep it up to date.</li>
  <li><strong>From the CurseForge website:</strong> ForeverUI's page there offers its files. ${listed ? "The button above goes to that page." : "When it's listed, the button above turns into a link to that page."} Then follow <a href="#by-hand">If you install by hand</a>.</li>
</ul>
<div class="notice todo"><p><strong>To be confirmed:</strong> the exact steps for the WoW Forever client in the CurseForge app will be written here once ForeverUI is listed.</p></div>
<p>Then turn it on at character select (<strong>AddOns</strong>, tick <strong>ForeverUI</strong>), log in, and type <code>/fui</code> in chat to open the options. See <a href="/start/">Getting started</a>.</p>

<h2 id="by-hand">If you install by hand</h2>
<p>For when you take the file from ForeverUI's CurseForge page instead of using the app.</p>
<ol class="steps">
  <li><strong>Unzip the file.</strong> Inside is one folder called <code>ForeverUI</code>.</li>
  <li><strong>Put the <code>ForeverUI</code> folder in your AddOns folder.</strong> The addon's README says: unzip the <code>ForeverUI</code> folder into <code>${esc(where ? where[1] : "Interface/AddOns/")}</code> (${esc(where ? where[2] : "your Forever client's AddOns folder")}).
    <div class="notice todo"><p><strong>To be confirmed:</strong> the exact AddOns folder for the WoW Forever client (on Windows and macOS) is still being checked. Until then, use the folder of your Forever client that has <code>Interface/AddOns</code> in it.</p></div>
  </li>
  <li><strong>Turn it on at character select:</strong> open <strong>AddOns</strong> and tick <strong>ForeverUI</strong>, then log in.</li>
  <li>Type <code>/fui</code> in chat to open the options. See <a href="/start/">Getting started</a>.</li>
</ol>
${src("README.md (Install)", "scripts/package.mjs (zip layout)", "docs/SMOKE-TEST.md (step 1.2)")}

<h2 id="update">Update</h2>
<p><strong>With the CurseForge app:</strong> update ForeverUI there when a new version is out.</p>
<p><strong>By hand:</strong></p>
<ol class="steps">
  <li>Log out of the game (or close it).</li>
  <li>Delete the old <code>ForeverUI</code> folder from your AddOns folder.</li>
  <li>Unzip the new version and put its <code>ForeverUI</code> folder in the same place.</li>
</ol>
<p>Your settings are kept. ForeverUI saves them in the game's SavedVariables (<code>${esc(sv)}</code> for the account, <code>${esc(svc)}</code> for each character), not in the addon folder.</p>
<p>The <a href="/changelog/">Changelog</a> says what changed in each release.</p>
${src("ForeverUI.toc (SavedVariables)")}

<h2 id="uninstall">Uninstall</h2>
<p>Remove ForeverUI in the CurseForge app, or delete the <code>ForeverUI</code> folder from your AddOns folder. To turn it off for a while instead, untick it under <strong>AddOns</strong> at character select.</p>
<p>To go back to the game's own version of just one part (say, its action bars), you don't need to uninstall: turn that module off under <strong>/fui → Modules</strong> and reload. See <a href="/help/#one-feature">Troubleshooting</a>.</p>`,
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
  const b = inRel ? "" : ` <span class="badge next">Next release</span>`;
  const n = setup.steps.length;
  const caption = (i) => setup.caption.replace("%d", i + 1).replace("%d", n).replace("%s", setup.steps[i]);
  const wide = num(S, "Core/Setup.lua", /if w \/ h >= ([\d.]+) then return "ultrawide"/);
  const tall4k = num(S, "Core/Setup.lua", /if h >= (\d+) then return "4k"/);
  const tall1440 = num(S, "Core/Setup.lua", /return h >= (\d+) and "1440"/);
  const reloadAsk = says(D, "Core/Dialog.lua", " Reload the UI now to apply it?");
  const reloadBtn = label(D, "Core/Dialog.lua", "Reload");
  const laterBtn = label(D, "Core/Dialog.lua", "Later");
  const pixel = says(O, "Core/Options.lua", "Pixel-perfect scale (crisp 1-pixel lines)");
  const layoutName = (key) => esc(setup.layouts.find((l) => l.key === key)?.text || "");
  const scr = (key) => esc(setup.screens.find((p) => p.key === key)?.text || "");
  const screenRow = (p) => `${esc(p.text)} (${p.w} x ${p.h})`;
  return `<h2 id="setup-wizard">The setup wizard${b}</h2>
${inRel ? "" : `<p><strong>The setup wizard isn't in the current release.</strong> It's ready for the next release, and this is what it will do.</p>`}
<p>The first time you log in on an account, a window called “${esc(setup.title)}” opens. It has ${n} steps: ${setup.steps.map((x) => esc(x)).join(", ")}. The line under the title says where you are, for example “${esc(caption(0))}”. <strong>${label(S, "Core/Setup.lua", "Next")}</strong> goes on (on the last step it reads <strong>${label(S, "Core/Setup.lua", "Done")}</strong>) and <strong>${label(S, "Core/Setup.lua", "Back")}</strong> goes back a step.</p>
<p>It never opens during a fight. If you're in combat it says “${esc(setup.combat)}” and waits. If a fight starts while it's open, it gets out of the way and comes back on the same step when the fight is over.</p>

<h3 id="setup-layout">Step 1 · ${esc(setup.steps[0])}</h3>
<p>It asks: “${esc(setup.questions[0] || "")}” <strong>${layoutName(setup.layouts[0].key)}</strong> is picked when the window opens. Click a layout to see what it does under the list. Your choice takes effect when you click <strong>${label(S, "Core/Setup.lua", "Next")}</strong>.</p>
<div class="table-wrap"><table class="stack"><thead><tr><th scope="col">Layout</th><th scope="col">What it does</th></tr></thead><tbody>
${setup.layouts.map((l, i) => `<tr><td data-label="Layout"><strong>${esc(l.text)}</strong>${i === 0 ? ` <span class="badge plain">Default</span>` : ""}</td><td data-label="What it does">${esc(l.hint)}</td></tr>`).join("\n")}
</tbody></table></div>
<ul>
  <li><strong>${layoutName("healing")}</strong> also turns on the raid frames and click casting if they were off.</li>
  <li>Each layout first puts back anything another layout moved, so picking <strong>${layoutName("damage")}</strong> later undoes the others.</li>
</ul>

<h3 id="setup-screen">Step 2 · ${esc(setup.steps[1])}</h3>
<p>It asks: “${esc(setup.questions[1] || "")}” The wizard picks the preset for your screen when it opens and marks it “${s("your screen")}”: <strong>${scr("ultrawide")}</strong> for a screen at least ${esc(wide)} times as wide as it is tall; otherwise by height: <strong>${scr("4k")}</strong> from ${esc(tall4k)} pixels tall, <strong>${scr("1440")}</strong> from ${esc(tall1440)}, and <strong>${scr("1080")}</strong> from ${esc(setup.keepBelow)}. On a screen under ${esc(setup.keepBelow)} pixels tall, <strong>${esc(setup.keepText)}</strong> is picked. Your choice takes effect when you click <strong>${label(S, "Core/Setup.lua", "Next")}</strong>.</p>
<div class="table-wrap"><table class="stack"><thead><tr><th scope="col">Choice</th><th scope="col">What it sets</th></tr></thead><tbody>
${setup.screens.map((p) => `<tr><td data-label="Choice"><strong>${screenRow(p)}</strong></td><td data-label="What it sets">${esc(p.hint)}</td></tr>`).join("\n")}
<tr><td data-label="Choice"><strong>${esc(setup.keepText)}</strong></td><td data-label="What it sets">${esc(setup.keepHint)}</td></tr>
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

<h3 id="setup-finish">Finishing</h3>
<p>With the defaults it takes four clicks: <strong>${label(S, "Core/Setup.lua", "Next")}</strong>, <strong>${label(S, "Core/Setup.lua", "Next")}</strong>, <strong>${label(S, "Core/Setup.lua", "Next")}</strong>, <strong>${label(S, "Core/Setup.lua", "Done")}</strong>. <strong>${label(S, "Core/Setup.lua", "Done")}</strong>, the window's close button and <kbd>Escape</kbd> all end the wizard and lock your frames again. It doesn't come back by itself; type <code>/fui setup</code> to run it again.</p>
<p>If setup changed something that needs a reload, it then asks, with <strong>${reloadBtn}</strong> and <strong>${laterBtn}</strong> buttons:</p>
<ul>
  <li>“${esc(setup.reloadModule)}${reloadAsk}” (for example after <strong>${layoutName("healing")}</strong> turned the raid frames on)</li>
  <li>“${esc(setup.reloadTile)}${reloadAsk}”</li>
</ul>
${shot("the setup wizard, step 1")}`;
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
    description: "Open the ForeverUI options, run the setup wizard, move your frames and pick an accent.",
    body: `${pageHero("Getting started", `After you <a href="/install/">install</a> ForeverUI and log in, its frames replace the game's. Here's how to find the options and put things where you want them.`)}
${nextNotice(model)}
<h2 id="options">Open the options</h2>
<p>There are three ways:</p>
<ol class="steps">
  <li>Type <code>/fui</code> (or <code>/foreverui</code>) in chat. Type <code>/fui</code> again to close it.</li>
  <li>Left-click ForeverUI on the game's addons button by the minimap. Right-click it instead to turn move mode on or off.</li>
  ${gameMenu ? `<li>Press <kbd>Escape</kbd> to open the game menu, then click the <strong>${label(GM, "Core/GameMenu.lua", "ForeverUI")}</strong> button at the top of the menu. <span class="badge next">Next release</span></li>` : `<li>Press <kbd>Escape</kbd> to open the game menu, then click the <strong>ForeverUI</strong> button at the top of the menu.</li>`}
</ol>
<p>The options window has a page for each area. To find a setting, type in <strong>${label(OW, "Core/OptionsWindow.lua", "Search settings")}</strong> at the top: pages that don't match fade, and <kbd>Enter</kbd> opens the first match. Some changes need a reload; the window then says “${ow("Some changes need a reload")}” and shows a <strong>${label(OW, "Core/OptionsWindow.lua", "Reload now")}</strong> button.${saysIf(read.rel("Core/OptionsWindow.lua") || "", "Core/OptionsWindow.lua", "if ReloadUI then ReloadUI()") ? ` In v${esc(model.version)}, type <code>/reload</code> in chat instead: that release's button asks the game to reload directly, and WoW Forever blocks that for addons (see <a href="/help/#reload">Troubleshooting</a>).` : ""} Every page and setting is listed on <a href="/settings/">Settings</a>.</p>
${wizardSection(next.setup, !!rel.setup, read)}

<h2 id="move">Move your frames</h2>
<ol class="steps">
  <li>Type <code>/fui unlock</code> (or <code>/fui move</code>), or click <strong>${label(O, "Core/Options.lua", "Move frames")}</strong> under <strong>General → Layout</strong>. Every ForeverUI frame gets a drag handle.</li>
  <li>Drag a handle to move that frame. Or click a handle, then use the arrow keys to nudge it (hold <kbd>Shift</kbd> to move 10 px).</li>
  <li>Right-click a handle for its exact anchor and offsets${popoverNext ? `; the next release adds its scale (50% to 200%) and opacity (10% to 100%) there too <span class="badge next">Next release</span>` : ""}.</li>
  <li>Type <code>/fui lock</code> when you're done.</li>
</ol>
<p>While you're moving frames, <code>/fui grid [size|on|off]</code> shows a grid (8 to 256 px) and <code>/fui snap on|off</code> makes frames snap to each other. <code>/fui frames</code> lists the frames you can move, and <code>/fui reset &lt;frame|all&gt;</code> puts one frame (or all of them) back. You can't unlock frames during combat.</p>

<h2 id="accent">Pick an accent color</h2>
<p>Click a swatch under <strong>/fui → General → Look</strong>, or type <code>/fui accent &lt;name&gt;</code> with one of these names (or any color as six hex digits, like <code>ffcc00</code>). <code>/fui accent reset</code> puts the default back.</p>
<ul class="swatches">${presets.map(([k, hex], i) => `<li class="swatch"><i style="background:${esc(hex)}"></i><span><strong>${esc(k)}</strong>${i === 0 ? " (default)" : ""} <span class="small">${esc(hex)}</span></span></li>`).join("")}</ul>

<h2 id="modules">Keep the game's version of something</h2>
<p>Every part of ForeverUI is a module you can turn off under <strong>/fui → Modules</strong> (or type <code>/fui disable &lt;module&gt;</code>, then <code>/reload</code>). The options say: “${o("A module that's off builds nothing and costs nothing.")}” The list is on <a href="/features/">Features</a>.</p>`,
  };
}

// ------------------------------------------------------------------ Features

// True when the addon says a module starts off: every switch in its defaults
// is off and its own description says so ("off until", "switch it on").
function startsOff(m, model) {
  const d = model.next.modules.find((x) => x.name === m.key)?.defaults || {};
  const flags = Object.values(d).filter((v) => typeof v === "boolean");
  return flags.length > 0 && flags.every((v) => !v) && /off until|switch it on/i.test(m.desc);
}

// The module's longer description, while the README still says what it's written from.
function moreOf(m, model) {
  const entry = MORE[m.key];
  return entry && entry.check.every((c) => model.next.readme.includes(c)) ? entry.more : null;
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
  for (const c of m.commands) rows.push(["Command", `<a href="/commands/#cmd-${esc(c)}"><code>/fui ${esc(c)}</code></a> ${esc(helpText(model, c))}`]);
  rows.push(["Turn it off", `<strong>/fui → Modules</strong>, then reload`]);
  return `<dl class="facts">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>`;
}

// One module as a card: name, badges, the addon's one-liner, more, and its facts.
function featureCard(m, model) {
  const off = startsOff(m, model) ? ` <span class="badge plain">Off until you switch it on</span>` : "";
  const more = moreOf(m, model);
  return `<article class="card mod" id="${m.id}" data-module="${esc(m.key)}">
  <h3>${esc(m.name)} ${badge(m.inRel, m.inNext, model.version)}${off}</h3>
  ${m.desc ? `<p>${esc(m.desc)}</p>` : ""}${more ? `\n  <p class="mod-more">${esc(more)}</p>` : ""}
  ${featureFacts(m, model)}
</article>`;
}

// The feature areas that have modules, in the plan's order, then "Other".
function featureAreas(model) {
  const names = [...AREAS.map(([a]) => a), "Other"];
  return names.map((area) => [area, model.modules.filter((m) => m.area === area)]).filter(([, list]) => list.length);
}

// One area: its heading and its module cards.
function areaSection([area, list], model) {
  return `<section aria-labelledby="area-${slug(area)}"><h2 id="area-${slug(area)}">${esc(area)}</h2>
<div class="mods">${list.map((m) => featureCard(m, model)).join("\n")}</div></section>`;
}

// The Features lede, shown in the page hero.
const FEATURES_LEDE = `ForeverUI is built from parts called modules. Each one replaces or adds one piece of the game's interface, and each can be turned off on its own under <strong>/fui → Modules</strong>.`;

// The intro under the page hero: the next-release notice, the counts, and the jump links to each area.
function featuresIntro(model, groups) {
  const count = (f) => model.modules.filter(f).length;
  return `${nextNotice(model)}
<p>The name and first line of each module are the ones the addon shows on its Modules page. The longer text under it describes the module as it is in the newest version, so v${esc(model.version)} may not have every detail yet. Every module is on until you turn it off, except where it says <span class="badge plain">Off until you switch it on</span>. The <a href="/settings/">Settings</a> page shows exactly which options each release has.</p>
<p><strong>${count((m) => m.inRel)}</strong> modules in v${esc(model.version)} · <strong>${count((m) => m.inNext)}</strong> in the next release.</p>
<nav aria-label="Feature areas"><ul class="chips feature-areas">${groups.map(([a]) => `<li><a href="#area-${slug(a)}">${esc(a)}</a></li>`).join("")}</ul></nav>`;
}

// The Features page: one card per module, grouped by area.
export function featuresPage(model) {
  const groups = featureAreas(model);
  const body = [pageHero("Features", FEATURES_LEDE), featuresIntro(model, groups), ...groups.map((g) => areaSection(g, model)), shot("raid frames and the options window")];
  return { path: "/features/", title: "Features", description: "Every ForeverUI module: what it does, where its settings are, and its commands.", body: body.join("\n") };
}

// ------------------------------------------------------------------ Commands

// The Commands table's columns; the first is each row's header.
const CMD_COLS = ["Command", "What it does", "Needs the module", "Version"];

// The visible lines of one command entry.
function cmdLines(e, version) {
  const show = (lines) => lines.map((l) => `<p class="cmd-text"><span class="cmd-line">/fui ${esc(l.syntax)}</span><br>${esc(l.text)}</p>`).join("");
  if (e.relLines && !e.changed) return show(e.relLines);
  if (e.relLines && e.changed) return `${show(e.relLines)}<p class="cmd-meta">In the next release the help line reads:</p>${show(e.nextLines)}`;
  if (e.nextLines) return show(e.nextLines);
  return "";
}

// The command as shown in its row: every word it accepts.
function cmdTyped(e) {
  if (e.special === "fui") return "/fui";
  if (e.special === "help") return "/fui help";
  return `/fui ${e.keys.join(" | ")}`;
}

// What the Copy button copies: the command with its first word.
function cmdCopy(e) {
  if (e.special === "fui") return "/fui";
  if (e.special === "help") return "/fui help";
  return `/fui ${e.keys[0] || ""}`.trim();
}

// What a command does: the addon's help lines, or a plain note for /fui and /fui help.
function cmdWhat(e, c, version) {
  const also = e.keys.length ? `, and <code>/fui ${e.keys.map(esc).join("</code>, <code>/fui ")}</code>` : "";
  if (e.special === "fui") return `<p class="cmd-text">Opens (or closes) the options window. Also <code>${c.slashes.map(esc).join("</code>, <code>")}</code>${also}. The help's first line says: “${esc(c.relIntro)}”</p>`;
  if (e.special === "help") return `<p class="cmd-text">Prints the list of commands in chat: the help lines quoted on this page.</p>`;
  return cmdLines(e, version);
}

// Links to the Features sections of the modules a command needs.
function cmdModules(e, model) {
  return e.modules.map((m) => {
    const mm = model.modules.find((x) => x.key === m);
    return `<a href="/features/#${mm ? mm.id : slug(m)}">${esc(mm ? mm.name : m)}</a>`;
  }).join(", ");
}

// The words the search box matches for a command.
function cmdSearch(e) {
  const lines = [...(e.relLines || []), ...(e.nextLines || [])].map((l) => l.line);
  return [e.keys.join(" "), ...lines, e.special || ""].join(" ");
}

// The row header: an anchor for each word, the command and its Copy button.
function cmdHead(e) {
  const anchors = e.keys.map((k) => `<span id="cmd-${esc(k)}" data-command="${esc(k)}"></span>`).join("");
  const copy = esc(cmdCopy(e));
  return `<th scope="row" class="cmd-cap">${anchors}<div class="cmd-head"><code class="cmd-syntax">${esc(cmdTyped(e))}</code> <button class="copy" type="button" data-copy="${copy}" aria-label="Copy ${copy}">Copy</button></div></th>`;
}

// One command as a table row (a card on narrow screens); each cell carries its card label.
function cmdRow(e, model) {
  const cells = [cmdWhat(e, model.commands, model.version), cmdModules(e, model), badge(e.inRel, e.inNext, model.version)];
  const tds = cells.map((h, i) => `<td data-label="${CMD_COLS[i + 1]}">${h}</td>`).join("");
  return `<tr class="cmd opt-item" id="entry-${esc(e.id)}" data-avail="${avail(e.inRel, e.inNext)}" data-search="${esc(cmdSearch(e))}">${cmdHead(e)}${tds}</tr>`;
}

// Every command in one table: a real table from 900px wide, one card per command below that.
function cmdTable(model) {
  const head = `<thead><tr>${CMD_COLS.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead>`;
  const rows = model.commands.entries.map((e) => cmdRow(e, model)).join("\n");
  return `<table class="opt-table cmd-table" id="cmd-list" aria-label="ForeverUI commands">${head}<tbody>\n${rows}\n</tbody></table>`;
}

// The search box's switches (the old-version one only when a command was dropped since).
function cmdFilters(c, version) {
  const old = [...c.relKeys].some((k) => !c.nextKeys.has(k)) ? `<label><input type="checkbox" data-filter="old" checked> Show v${esc(version)}-only commands</label>` : "";
  return `<div class="filters"><label><input type="checkbox" data-filter="next" checked> Show next-release commands</label>${old}</div>`;
}

// The search box over the commands, with its switches and a live count.
function cmdSearchBox(c, version) {
  return `<div class="search" data-target="#cmd-list" data-items=".cmd" data-noun="commands">
  <label for="cmd-q">Search commands</label>
  <input id="cmd-q" type="search" placeholder="for example: reset, profile, errors" autocomplete="off">
  ${cmdFilters(c, version)}
  <p class="count" aria-live="polite" role="status"></p>
</div>`;
}

// The Commands page body: intro, counts, search, the table and every command word.
function commandsBody(model) {
  const { commands: c, version } = model;
  const all = [...new Set([...c.nextKeys, ...c.relKeys])];
  const hero = pageHero("Commands", `ForeverUI has one chat command, <code>/fui</code> (or <code>/foreverui</code>), followed by a word. The help text below is quoted exactly as the addon prints it with <code>/fui help</code>.`);
  const counts = `<p><strong>${c.relKeys.size}</strong> command words in v${esc(version)} · <strong>${c.nextKeys.size}</strong> in the next release. An unknown word prints “${esc(c.unknown || "Unknown command. /fui help")}”.</p>`;
  const words = `<p class="small">All ${all.length} command words: ${all.map((k) => `<a href="#cmd-${esc(k)}"><code>${esc(k)}</code></a>`).join(" ")}</p>`;
  return [hero, nextNotice(model), counts, cmdSearchBox(c, version), cmdTable(model), words, src("Core/Slash.lua (HELP, COMMANDS, SLASH_FOREVERUI1/2)")].join("\n");
}

// The Commands page.
export function commandsPage(model) {
  return { path: "/commands/", title: "Commands", description: "Every /fui command with its help text, verbatim from the addon.", body: commandsBody(model) };
}

// ------------------------------------------------------------------ Settings

// The columns of a settings table; the first is each row's header.
const COLS = ["Setting", "Type", "Values", "Default", "Reload and version"];

// What the addon calls each kind of row on the site.
const KIND_NAME = { check: "Switch", cycle: "Choice", slider: "Slider", button: "Button", visibility: "Visibility" };

// Text for a row's default across versions.
function defaultText(r, version) {
  const a = r.relDefault;
  const b = r.nextDefault;
  if (r.inRel && r.inNext && a && b && a !== b) return `${esc(a)} in v${esc(version)}, ${esc(b)} in the next release`;
  return a || b ? esc(a || b) : "";
}

// A row's choices and range, as one line ("" when it has neither).
function valuesText(r) {
  const out = [];
  if (r.choices && r.choices.length) out.push(r.choices.map((c) => esc(c[1])).join(" / "));
  if (r.range) {
    const f = (x) => (r.range.percent && r.range.max <= 2 ? `${Math.round(x * 100)}%` : String(x));
    out.push(`${esc(f(r.range.min))} to ${esc(f(r.range.max))}`);
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
function wideRow(r, attrs, version) {
  const b = r.inRel && r.inNext ? "" : ` ${badge(r.inRel, r.inNext, version)}`;
  if (r.kind === "header") return groupRow(`${esc(r.caption)}${b}`, attrs);
  return `<tr class="opt-row t opt-item" ${attrs}><td colspan="${COLS.length}">${esc(r.caption)}${b}</td></tr>`;
}

// One setting as a table row: the caption is the row header; each cell carries its card label.
function optRow(r, version, pageTitle, id) {
  const search = `${pageTitle} ${r.caption} ${(r.choices || []).map((c) => c[1]).join(" ")}`;
  const attrs = `data-avail="${avail(r.inRel, r.inNext)}" data-search="${esc(search)}"`;
  if (r.kind === "header" || r.kind === "text") return wideRow(r, attrs, version);
  const loop = r.loop ? ` <span class="small">(${esc(r.loop.variable)} = ${r.loop.from} to ${r.loop.to})</span>` : "";
  const notes = `${r.reload ? `<span class="badge reload">Needs reload</span> ` : ""}${badge(r.inRel, r.inNext, version)}`;
  const cells = [KIND_NAME[r.kind] || "", valuesText(r), defaultText(r, version), notes].map((h, i) => `<td data-label="${COLS[i + 1]}">${h}</td>`);
  return `<tr class="opt-row opt-item" id="${id}" ${attrs}><th scope="row" class="opt-cap">${esc(r.caption)}${loop}</th>${cells.join("")}</tr>`;
}

// A page's table rows, with a heading before rows repeated for every bar.
function pageRows(p, version, used) {
  const out = [];
  let inRepeat = null;
  for (const r of p.rows) {
    const rep = r.repeated ? JSON.stringify(r.repeated) : null;
    if (rep && rep !== inRepeat) out.push(groupRow(`For each of ${r.repeated.from} to ${r.repeated.to} (one card each)`, `data-search="${esc(p.title)} each"`));
    inRepeat = rep;
    out.push(optRow(r, version, p.title, rowId(p.id, r.caption, used)));
  }
  return out.join("\n");
}

// The Modules page's closing note: one switch per module.
function modulesRow(p, model) {
  if (p.key !== "modules") return "";
  const mods = model.modules.map((m) => `<a href="/features/#${m.id}">${esc(m.name)}</a>${m.inRel ? "" : " (next release)"}`).join(", ");
  return `<tr class="opt-row t"><td colspan="${COLS.length}">Then one switch per module (it applies after a reload): ${mods}.</td></tr>`;
}

// One options page: its heading and a table of its settings (one card per row on narrow screens).
function pageSection(p, model, used) {
  const head = `<thead><tr>${COLS.map((c) => `<th scope="col">${c}</th>`).join("")}</tr></thead>`;
  return `<section class="opt-page" aria-labelledby="${p.id}" data-page="${esc(p.key)}">
<h2 id="${p.id}">${esc(p.title)} ${badge(p.inRel, p.inNext, model.version)}</h2>
<table class="opt-table" aria-labelledby="${p.id}">${head}<tbody>
${pageRows(p, model.version, used)}
${modulesRow(p, model)}
</tbody></table>
</section>`;
}

// What a Reload button built during a fight prints instead of reloading (Core/Dialog.lua), or null.
function combatReloadLine(dialogLua) {
  return (dialogLua || "").match(/ns\.Chat\("(Type \/reload in chat[^"]*)"\)/)?.[1] || null;
}

// The note on Reload buttons built during a fight, read from Core/Dialog.lua ("" when the addon has none).
function combatReloadNote(read) {
  const line = combatReloadLine(read.next("Core/Dialog.lua"));
  if (!line) return "";
  const b = combatReloadLine(read.rel("Core/Dialog.lua")) ? "" : `<span class="badge next">Next release</span> `;
  return `<div class="notice info" id="reload-in-combat"><p>${b}WoW Forever lets an addon reload only from a click on a secure button, so that's what <strong>Reload now</strong> and the <strong>Reload</strong> button in ForeverUI's reload prompt are. That secure part can't be built during a fight: a Reload button made in combat gets it when the fight ends. Until then, clicking it only says “${esc(line)}” If that happens, type <code>/reload</code> in chat.</p></div>`;
}

export function settingsPage(model, read) {
  const { pages, version } = model;
  const count = (f) => pages.reduce((n, p) => n + p.rows.filter((r) => r.kind !== "header" && r.kind !== "text" && f(r)).length, 0);
  const used = new Set(pages.map((p) => p.id));
  return {
    path: "/settings/",
    title: "Settings",
    description: "Every page and setting in the ForeverUI options window, with defaults.",
    body: `${pageHero("Settings", `Every page of the options window (<code>/fui</code>) and every setting on it, with the caption exactly as the addon shows it.`)}
${nextNotice(model)}
<p>Settings marked <span class="badge reload">Needs reload</span> apply after a reload: the window says “Some changes need a reload” and offers <strong>Reload now</strong>. Defaults are shown where the addon's code states one; where it doesn't, none is shown.</p>
${combatReloadNote(read)}
<p><strong>${count((r) => r.inRel)}</strong> settings in v${esc(version)} · <strong>${count((r) => r.inNext)}</strong> in the next release · <strong>${pages.length}</strong> pages.</p>
<nav aria-label="Options pages"><ul class="chips chips-page">${pages.map((p) => `<li><a href="#${p.id}">${esc(p.title)}</a>${p.inRel ? "" : " <span class=\"badge next\">Next release</span>"}</li>`).join("")}</ul></nav>
<div class="search" data-target="#opt-list" data-items=".opt-row" data-groups=".opt-page" data-noun="settings">
  <label for="opt-q">Search settings</label>
  <input id="opt-q" type="search" placeholder="for example: raid, tooltip, chat" autocomplete="off">
  <div class="filters">
    <label><input type="checkbox" data-filter="next" checked> Show next-release settings</label>
    <label><input type="checkbox" data-filter="old" checked> Show v${esc(version)}-only settings</label>
  </div>
  <p class="count" aria-live="polite" role="status"></p>
</div>
<div id="opt-list">
${pages.map((p) => pageSection(p, model, used)).join("\n")}
</div>
<p class="small">Some rows only appear on some clients (for example the Specialization card on the Profiles page needs a client with specializations; the game's own click bindings need a client that has them). Lists that you fill in yourself (your profiles, your chat watch phrases, the bindings grid) aren't listed row by row.</p>
${src("Core/Options.lua (PAGES and row builders)", "Modules/RaidHealing.lua", "Modules/ClickCastOptions.lua", "Modules/Nameplates.lua", "Modules/Situations.lua", "Core/Visibility.lua", "Core/Dialog.lua (ns.ReloadButton)", "module defaults tables")}`,
  };
}
