// Home, Install & Update, Getting started, Features, Commands and Settings.
// Generated parts come from the model (the addon's Lua, TOC, README and the
// release metadata); the prose around them only restates what those sources say.
import { shotByFile } from "./shots-content.mjs";
import { supportAsk, esc, md, slug, badge, nextBadge, reloadBadge, avail, shotFigure, ornament, heroFrame, pageHero, storeCtas, CURSEFORGE_URL, WAGO_URL, disclosure, glance, nextOnly, NEXT_BADGE } from "./html.mjs";
import { crestSvg } from "./brand.mjs";
import { AREAS } from "./model.mjs";
import { MORE, longerOf, readmeSays } from "./features-content.mjs";
import { EN } from "./i18n-site.mjs";
import { splitHelp, showSlots } from "./extract.mjs";

// "September 27, 2026" in New York time, in the page's language.
export function dateET(iso, loc = EN) {
  return new Date(iso).toLocaleDateString(loc.english ? "en-US" : loc.lang, { timeZone: "America/New_York", year: "numeric", month: "long", day: "numeric" });
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
export function curseforgeBox(model, { heading = true, loc = EN } = {}) {
  const { release } = model;
  const note = CURSEFORGE_URL
    ? (WAGO_URL ? loc.p("Install and update it with the CurseForge app or from its page on the CurseForge website, or get it from Wago Addons.") : loc.p("Install and update it with the CurseForge app or from its page on the CurseForge website."))
    : loc.p("No link yet: this badge becomes a link to Vanguard's CurseForge page as soon as it's listed (Wago is planned too). Until then there's nothing to download here.");
  return `<section class="card cf-box" aria-labelledby="cf-h">
  <div class="cf-box-main">
    <h2 id="cf-h" class="cf-box-h">${heading ? (CURSEFORGE_URL ? loc.p("Get Vanguard on CurseForge") : loc.p("Vanguard is coming to CurseForge")) : ""}</h2>
    <div class="cf-box-actions">${storeCtas({ size: "lg", loc })}</div>
    <p class="small cf-box-note">${note}</p>
  </div>
  <dl class="facts">
    <dt>${loc.p("Current release")}</dt><dd>${loc.p("{version} (release {tag})", { version: esc(model.version), tag: esc(release.tag) })}</dd>
    <dt>${loc.p("Published")}</dt><dd>${esc(dateET(release.publishedAt, loc))}</dd>
    <dt>${loc.p("Game")}</dt><dd>${loc.p("WoW Forever (the addon declares Interface {iface})", { iface: esc(model.rel.meta.Interface) })}</dd>
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
function heroFacts(model, moduleCount, loc) {
  const iface = foreverInterface(model.rel.meta);
  const client = iface ? loc.p("Built for WoW Forever (Interface {iface})", { iface: esc(iface) }) : loc.p("Built for WoW Forever");
  const released = loc.p("v{version}, released {date}", { version: esc(model.version), date: esc(dateET(model.release.publishedAt, loc)) });
  return `${client} · ${released} · ${loc.pn({ one: "{n} module", other: "{n} modules" }, moduleCount)}`;
}

// The README's opening tagline: "A from-scratch UI suite for WoW Forever".
export function tagline(readme) {
  const m = (readme || "").match(/^# Vanguard\s*\n+(?:[><][^\n]*\n+)*([^\n(]+?)\s*(?:\(|\.|\n)/);
  return m ? m[1].trim() : "";
}

// The tagline in the page's language, with its closing stop: the addon's own translated TOC Notes
// line (## Notes-deDE) up to its colon, which says the same (the full-width "：" of Chinese ends
// with "。"); English from the README.
export function localTagline(model, loc) {
  const notes = String(model.next.meta[`Notes-${loc.addonLocale}`] || "");
  const colon = notes.search(/[:：]/);
  if (loc.english || colon < 0) return `${tagline(model.next.readme) || tagline(model.rel.readme)}.`;
  return `${notes.slice(0, colon).trim()}${notes[colon] === "：" ? "。" : "."}`;
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

// One highlight card: the module's name and line in the page's language (the addon's own).
function highlightCard(m, version, loc) {
  const glyph = GLYPHS[m.key] || `<path d="M18 4 L32 18 L18 32 L4 18 Z"/>`;
  const name = esc(loc.addon(m.name));
  return `<li><a class="feat" href="/features/#${esc(m.id)}">
  <span class="feat-glyph"><svg viewBox="0 0 36 32" aria-hidden="true" focusable="false">${glyph}</svg></span>
  <span class="feat-name">${name}</span>
  <span class="feat-desc">${esc(loc.addon(m.desc))}</span>
  <span class="feat-foot">${badge(m.inRel, m.inNext, version, loc)}<span class="feat-more">${loc.p("Read more<span class=\"visually-hidden\"> about {name}</span>", { name })} <span aria-hidden="true">→</span></span></span>
</a></li>`;
}

// The layout at a glance: a real screenshot of the default layout, with what is in it.
function layoutShot(loc) {
  return `${shotFigure(shotByFile("01-hud-overview"), { caption: false, loc })}
<p class="small">${loc.p(`The default layout in the game: player and target frames either side of your character, your cast bar between them, the action bars underneath, the quest tracker and an info strip under the square minimap, and the bag and menu bar in the corner. More pictures are on <a href="/screenshots/">Screenshots</a>.`)}</p>`;
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

// The home page's four tiles under the hero.
function homeTiles(loc) {
  const tile = (href, title, line) => `<a class="card tile" href="${href}"><strong>${loc.p(title)}</strong><span>${loc.p(line)}</span></a>`;
  return `<div class="grid four tiles">
  ${tile("/install/", "Install", CURSEFORGE_URL ? "Get it through CurseForge or Wago." : "How installing through CurseForge will work.")}
  ${tile("/start/", "Set up", "Open the options, move your frames, pick an accent.")}
  ${tile("/commands/", "Commands", "Every <code>/vg</code> command, searchable.")}
  ${tile("/help/", "Fix a problem", "Self-fixes, then how to report a bug.")}
</div>`;
}

export function homePage(model, loc = EN) {
  const { rel } = model;
  const relMods = model.modules.filter((m) => m.inRel);
  const highlights = HIGHLIGHTS.map((k) => model.modules.find((m) => m.key === k)).filter((m) => m && m.inRel && m.desc);
  const n = relMods.length;
  const description = loc.english ? rel.meta.Notes : model.next.meta[`Notes-${loc.addonLocale}`] || rel.meta.Notes;
  return {
    path: "/",
    title: "Vanguard",
    description,
    translated: true,
    body: `<section class="hero" aria-labelledby="hero-title">
${heroArt()}
<div class="hero-inner">
  ${crestSvg({ full: true, cls: "hero-crest", label: loc.p("Vanguard's crest: two swords crossed behind a brass shield that bears a V") })}
  <p class="hero-kicker">${loc.p("An addon for WoW&nbsp;Forever")}</p>
  <h1 id="hero-title" class="hero-title">Vanguard</h1>
  ${ornament("hero-orn")}
  <p class="hero-tagline">${esc(localTagline(model, loc))}</p>
  <div class="hero-actions">${storeCtas({ size: "lg", loc })}<a class="button ghost" href="/features/">${loc.p("See the features")}</a></div>
  <p class="hero-meta">${heroFacts(model, n, loc)}</p>
</div>
</section>

${homeTiles(loc)}

<div class="notice info early"><p>${loc.p(`<strong>Vanguard is an early release.</strong> Not everything has been checked in the game yet, and some features are still being polished, so if something looks off, please tell us on the <a href="/feedback/">Feedback page</a>.`)}</p></div>

${disclosure({ id: "hl-h", title: loc.p("What's in v{version}", { version: esc(model.version) }), meta: loc.pn({ one: "{n} module", other: "{n} modules" }, n), body: `<p>${loc.p(`A few of its modules, in the words the addon uses on its own Modules page. <a href="/features/">All {n} are on Features</a>, and each can be turned off under <strong>/vg → {modules}</strong>.`, { n, modules: esc(loc.addon("Modules")) })}</p>
<ul class="feats">${highlights.map((m) => highlightCard(m, model.version, loc)).join("\n")}</ul>` })}
${disclosure({ id: "mock-h", title: loc.p("The layout at a glance"), body: layoutShot(loc) })}`,
  };
}

// ------------------------------------------------------------------ Install

// The Install page's opening line under its title.
function installLede(listed, loc) {
  if (!listed) return loc.p("Vanguard is going to be on CurseForge. Once it's listed, you'll install and update it through CurseForge. It isn't listed yet, and this site doesn't offer it as a download.");
  return WAGO_URL ? loc.p("Vanguard is on CurseForge and Wago. Install and update it through CurseForge: the CurseForge app or the CurseForge website.") : loc.p("Vanguard is on CurseForge. Install and update it through CurseForge: the CurseForge app or the CurseForge website.");
}

// "CurseForge" or "CurseForge or Wago": the stores Vanguard is on.
const storesOr = (loc) => (WAGO_URL ? loc.p("CurseForge or Wago") : "CurseForge");

// Install through CurseForge (the app, the website, Wago).
function installStores(listed, loc) {
  return `<ul>
  <li>${loc.p("<strong>With the CurseForge app:</strong> find Vanguard in the app and install it. The app puts it in your AddOns folder and can keep it up to date.")}</li>
  <li>${loc.p("<strong>From the CurseForge website:</strong> Vanguard's page there offers its files.")} ${listed ? loc.p("The button above goes to that page.") : loc.p("When it's listed, the button above turns into a link to that page.")} ${loc.p(`Then follow the steps under <a href="#by-hand">If you install by hand</a>.`)}</li>
${WAGO_URL ? `  <li>${loc.p(`<strong>From Wago Addons:</strong> <a href="{url}" rel="noopener">Vanguard's Wago page</a> offers the same files, for the Wago app or by hand.`, { url: esc(WAGO_URL) })}</li>
` : ""}</ul>
<p>${loc.p(`Then turn it on at character select (<strong>AddOns</strong>, tick <strong>Vanguard</strong>), log in, and type <code>/vg</code> in chat to open the options. See <a href="/start/">Getting started</a>.`)}</p>
${listed ? "" : `<p class="small">${loc.p("To be confirmed: the exact steps for the WoW Forever client in the CurseForge app will be written here once Vanguard is listed.")}</p>`}`;
}

// Installing from the zip by hand.
function installByHand(where, loc) {
  return `<p>${loc.p("For when you take the file from Vanguard's {stores} page instead of using an app.", { stores: storesOr(loc) })}</p>
<ol class="steps">
  <li>${loc.p("<strong>Unzip the file.</strong> Inside is one folder called <code>Vanguard</code>.")}</li>
  <li>${loc.p("<strong>Put the <code>Vanguard</code> folder in your AddOns folder.</strong> The addon's README says: unzip the <code>Vanguard</code> folder into <code>{path}</code> ({where}). The exact AddOns folder for the WoW Forever client (on Windows and macOS) is still being confirmed; until then, use the folder of your Forever client that has <code>Interface/AddOns</code> in it.", { path: esc(where ? where[1] : "Interface/AddOns/"), where: where ? esc(where[2]) : loc.p("your Forever client's AddOns folder") })}</li>
  <li>${loc.p("<strong>Turn it on at character select:</strong> open <strong>AddOns</strong> and tick <strong>Vanguard</strong>, then log in.")}</li>
  <li>${loc.p(`Type <code>/vg</code> in chat to open the options. See <a href="/start/">Getting started</a>.`)}</li>
</ol>
${sourceNote(loc, ["README.md (Install)", "scripts/package.mjs (zip layout)", "docs/SMOKE-TEST.md (step 1.2)"])}`;
}

// Updating, and the note for players coming from ForeverUI.
function installUpdate(rel, loc) {
  return `<p>${loc.p("<strong>With the {stores} app:</strong> update Vanguard there when a new version is out.", { stores: storesOr(loc) })}</p>
<p>${loc.p("<strong>By hand:</strong>")}</p>
<ol class="steps">
  <li>${loc.p("Log out of the game (or close it).")}</li>
  <li>${loc.p("Delete the old <code>Vanguard</code> folder from your AddOns folder.")}</li>
  <li>${loc.p("Unzip the new version and put its <code>Vanguard</code> folder in the same place.")}</li>
</ol>
<p>${loc.p("Your settings are kept. Vanguard saves them in the game's SavedVariables (<code>{account}</code> for the account, <code>{character}</code> for each character), not in the addon folder.", { account: esc(rel.meta.SavedVariables), character: esc(rel.meta.SavedVariablesPerCharacter) })}</p>
<div class="notice" id="renamed"><p>${loc.p("<strong>Coming from ForeverUI?</strong> Vanguard was called ForeverUI up to v0.3.0. It was renamed because another, unrelated addon is published under that name. The settings file is named after the addon, so your settings don't move over by themselves: before you update, type <code>/fui export</code> in game and keep the text; after updating, type <code>/vg import</code> and paste it (text from ForeverUI imports fine). Then delete the old <code>ForeverUI</code> folder from your AddOns folder.")}</p></div>
<p>${loc.p(`The <a href="/changelog/">Changelog</a> says what changed in each release.`)}</p>
${sourceNote(loc, ["Vanguard.toc (SavedVariables)"])}`;
}

// Uninstalling, or keeping the game's version of one part.
function installRemove(loc) {
  return `<p>${loc.p("Remove Vanguard in the {stores} app, or delete the <code>Vanguard</code> folder from your AddOns folder. To turn it off for a while instead, untick it under <strong>AddOns</strong> at character select.", { stores: storesOr(loc) })}</p>
<p>${loc.p(`To go back to the game's own version of just one part (say, its action bars), you don't need to uninstall: turn that module off under <strong>/vg → {modules}</strong> and reload. See <a href="/help/#one-feature">Troubleshooting</a>.`, { modules: esc(loc.addon("Modules")) })}</p>`;
}

export function installPage(model, loc = EN) {
  const { rel } = model;
  const where = rel.readme.match(/unzip the `(?:Vanguard|ForeverUI)` folder into `([^`]+)`\s*\(([^)]+)\)/);
  const listed = !!CURSEFORGE_URL;
  return {
    path: "/install/",
    title: "Install & Update",
    description: listed ? loc.p("How to install, update and remove Vanguard: through CurseForge or Wago.") : loc.p("How to install, update and remove Vanguard: through CurseForge once it's listed."),
    translated: true,
    body: `${pageHero(loc.t("title./install/"), installLede(listed, loc))}
${curseforgeBox(model, { loc })}
${disclosure({ id: "curseforge", title: loc.p("Install through CurseForge"), body: installStores(listed, loc) })}
${disclosure({ id: "by-hand", title: loc.p("If you install by hand"), body: installByHand(where, loc) })}
${disclosure({ id: "update", title: loc.p("Update"), body: installUpdate(rel, loc) })}
${disclosure({ id: "uninstall", title: loc.p("Uninstall"), body: installRemove(loc) })}
${supportAsk("install", loc.p("Vanguard is free and built by one person. If it saved you an evening of setting up your UI,"), undefined, loc.p("Say thanks on Ko-fi"))}`,
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

// The setup wizard's addon words in the page's language: lab() a button or label (checked
// by label()), say() a whole message (checked by says()), A() a text the extractor read.
function setupWords(S, loc) {
  const A = (text) => esc(loc.addon(text || ""));
  const lab = (text, file, name) => {
    label(text, file, name);
    return A(name);
  };
  const say = (text, file, part) => {
    says(text, file, part);
    return A(part);
  };
  return { A, lab, say, s: (part) => say(S, "Core/Setup.lua", part) };
}

// The names of the options pages the prose points to (General → Look, General → Layout), as the
// addon's own words in the page's language; the prose carries them as {general}, {look}, {layout}.
function pageNames(loc) {
  return { general: esc(loc.addon("General")), look: esc(loc.addon("Look")), layout: esc(loc.addon("Layout")) };
}

// A setup text with named slots, in the page's language: the addon's translation of the
// sentence, filled; the English the extractor made when the source has no named sentence.
function namedText(named, values, english, loc) {
  if (!named) return english;
  return loc.addon(named).replace(/\{(\w+)\}/g, (all, k) => (values[k] !== undefined ? String(values[k]) : all));
}

// The wizard's first paragraphs: what it is, its steps and buttons, and combat.
function wizardIntro(setup, inRel, w, loc) {
  const { A, lab } = w;
  const S = w.S;
  const n = setup.steps.length;
  const caption = namedText(setup.named.caption, { step: 1, count: n, name: loc.addon(setup.steps[0]) }, setup.caption.replace("%d", 1).replace("%d", n).replace("%s", setup.steps[0]), loc);
  const next = lab(S, "Core/Setup.lua", "Next"), done = lab(S, "Core/Setup.lua", "Done"), back = lab(S, "Core/Setup.lua", "Back");
  return `${inRel ? "" : `<p>${loc.p("<strong>The setup wizard isn't in the current release.</strong> It's ready for the next release, and this is what it will do.")}</p>`}
<p>${loc.p("The first time you log in on an account, a window called “{title}” opens. It has {n} steps: {steps}. The line under the title says where you are, for example “{caption}”. <strong>{next}</strong> goes on (on the last step it reads <strong>{done}</strong>) and <strong>{back}</strong> goes back a step.", { title: A(setup.title), n, steps: setup.steps.map((x) => A(x)).join(", "), caption: esc(caption), next, done, back })}${setup.later ? ` ${loc.p("On the first step, <strong>{skip}</strong> ends it without changing anything.", { skip: lab(S, "Core/Setup.lua", "Skip setup") })}` : ""}</p>
<p>${loc.p("It never opens during a fight. If you're in combat it says “{combat}” and waits. If a fight starts while it's open, it gets out of the way and comes back on the same step when the fight is over.", { combat: A(setup.combat) })}</p>`;
}

// Step 1: the layout question and the layouts table.
function wizardLayoutStep(setup, w, loc) {
  const { A, lab } = w;
  const layoutName = (key) => A(setup.layouts.find((l) => l.key === key)?.text || "");
  // Keep my current layout (moves nothing), picked when setup runs again; null before it came in.
  const keepLayout = setup.layouts.some((l) => l.key === "keep") ? layoutName("keep") : null;
  const picked = keepLayout
    ? loc.p("The first time, <strong>{healing}</strong> is picked if you're a healer (by your specialization, or else your group role) and <strong>{damage}</strong> otherwise; when you run it again, <strong>{keep}</strong> is picked, so clicking through moves nothing.", { healing: layoutName("healing"), damage: layoutName("damage"), keep: keepLayout })
    : loc.p("<strong>{layout}</strong> is picked when the window opens.", { layout: layoutName(setup.layouts[0].key) });
  const head = [loc.p("Layout"), loc.p("What it does")];
  return `<h3 id="setup-layout">${loc.p("Step 1 · {name}", { name: A(setup.steps[0]) })}</h3>
<p>${loc.p("It asks: “{question}”", { question: A(setup.questions[0] || "") })} ${picked} ${loc.p("Click a layout to see what it does under the list. Your choice takes effect when you click <strong>{next}</strong>.", { next: lab(w.S, "Core/Setup.lua", "Next") })}</p>
<div class="table-wrap"><table class="stack"><thead><tr><th scope="col">${head[0]}</th><th scope="col">${head[1]}</th></tr></thead><tbody>
${setup.layouts.map((l, i) => `<tr><td data-label="${head[0]}"><strong>${A(l.text)}</strong>${i === 0 && !keepLayout ? ` <span class="badge plain">${loc.p("Default")}</span>` : ""}</td><td data-label="${head[1]}">${A(l.hint)}</td></tr>`).join("\n")}
</tbody></table></div>
<ul>
  <li>${loc.p("<strong>{healing}</strong> also turns on the raid frames and click casting if they were off.", { healing: layoutName("healing") })}</li>
  <li>${loc.p("Each layout first puts back anything another layout moved, so picking <strong>{damage}</strong> later undoes the others.", { damage: layoutName("damage") })}</li>
</ul>`;
}

// Step 2: the screen question and the presets table.
function wizardScreenStep(setup, w, loc) {
  const { A, lab, s } = w;
  const S = w.S;
  const wide = num(S, "Core/Setup.lua", /if w \/ h >= ([\d.]+) then return "ultrawide"/);
  const tall4k = num(S, "Core/Setup.lua", /if h >= (\d+) then return "4k"/);
  const tall1440 = num(S, "Core/Setup.lua", /return h >= (\d+) and "1440"/);
  const pixel = w.say(w.O, "Core/Options.lua", "Pixel-perfect scale");
  const scr = (key) => A(setup.screens.find((p) => p.key === key)?.text || "");
  const screenRow = (p) => `${A(p.text)} (${p.w} x ${p.h})`;
  const keepLayout = setup.layouts.some((l) => l.key === "keep");
  const keepHint = namedText(setup.named.keep, { owner: loc.addon(setup.named.owner || "") }, setup.keepHint, loc);
  const head = [loc.p("Choice"), loc.p("What it sets")];
  const row = (choice, sets) => `<tr><td data-label="${head[0]}"><strong>${choice}</strong></td><td data-label="${head[1]}">${sets}</td></tr>`;
  const presets = loc.p("The wizard picks the preset for your screen when it opens and marks it “{yours}”: <strong>{ultrawide}</strong> for a screen at least {wide} times as wide as it is tall; otherwise by height: <strong>{k4}</strong> from {tall4k} pixels tall, <strong>{q1440}</strong> from {tall1440}, and <strong>{hd}</strong> from {below}.", { yours: s("your screen"), ultrawide: scr("ultrawide"), wide: esc(wide), k4: scr("4k"), tall4k: esc(tall4k), q1440: scr("1440"), tall1440: esc(tall1440), hd: scr("1080"), below: esc(setup.keepBelow) });
  const small = keepLayout
    ? loc.p("On a screen under {below} pixels tall, <strong>{keep}</strong> is picked, and so it is whenever you run setup again.", { below: esc(setup.keepBelow), keep: A(setup.keepText) })
    : loc.p("On a screen under {below} pixels tall, <strong>{keep}</strong> is picked.", { below: esc(setup.keepBelow), keep: A(setup.keepText) });
  return `<h3 id="setup-screen">${loc.p("Step 2 · {name}", { name: A(setup.steps[1]) })}</h3>
<p>${loc.p("It asks: “{question}”", { question: A(setup.questions[1] || "") })} ${presets} ${small} ${loc.p("Your choice takes effect when you click <strong>{next}</strong>.", { next: lab(S, "Core/Setup.lua", "Next") })}</p>
<div class="table-wrap"><table class="stack"><thead><tr><th scope="col">${head[0]}</th><th scope="col">${head[1]}</th></tr></thead><tbody>
${setup.screens.map((p) => row(screenRow(p), esc(namedText(setup.named.hint, p.values, p.hint, loc)))).join("\n")}
${setup.pixelText ? `${row(A(setup.pixelText), loc.p("Leaves the game's UI scale alone and turns on <strong>{pixel}</strong> under {general} → {look} instead.", { pixel, ...pageNames(loc) }))}\n` : ""}${row(A(setup.keepText), esc(keepHint))}
</tbody></table></div>
<p>${loc.p("The UI scale a preset sets is the game's own UI scale (the one in the game's graphics settings). It changes once you're out of combat, and choosing a preset turns off <strong>{pixel}</strong> under <strong>{general} → {look}</strong>.", { pixel, ...pageNames(loc) })} ${A(setup.reloadTile)}</p>`;
}

// Steps 3 and 4: the look, and moving frames.
function wizardLookMoveSteps(setup, w, loc) {
  const { A, lab } = w;
  return `<h3 id="setup-look">${loc.p("Step 3 · {name}", { name: A(setup.steps[2]) })}</h3>
<ul>
  <li>${loc.p(`<strong>{accent}:</strong> click a swatch to change the accent color right away. They're the same colors as in <a href="#accent">Pick an accent color</a> below.`, { accent: lab(w.S, "Core/Setup.lua", "Accent") })}</li>
  <li>${loc.p("<strong>{style}:</strong> three small raid tiles, each drawn in its style. Click one to switch to it right away: {styles}.", { style: lab(w.S, "Core/Setup.lua", "Raid frame style"), styles: setup.styles.map((x) => `<strong>${A(x[2])}</strong> (${A(x[1])})`).join(", ") })}</li>
</ul>

<h3 id="setup-move">${loc.p("Step 4 · {name}", { name: A(setup.steps[3]) })}</h3>
<p>${loc.p("On this step your frames are unlocked, and the wizard says:")}</p>
<ul>${setup.moveLines.map((l) => `<li>“${A(l)}”</li>`).join("")}</ul>
<p>${loc.p("Arrow keys are <kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd>; hold <kbd>Shift</kbd> to move 10 px at a time.")}</p>
`;
}

// The extra step a new character gets (the profile question), when the source has it.
function wizardProfileStep(setup, w, loc) {
  if (!setup.profileQuestion) return "";
  const { A, lab } = w;
  const S = w.S;
  // The two choices as the addon writes them, with <name> and <character> where it fills a name.
  const own = says(S, "Core/Setup.lua", "A profile of its own: ");
  const shareText = namedText("Share profile {profile} with your other characters", { profile: "<em>name</em>" }, "", loc);
  const ownText = namedText("A profile of its own: {profile}", { profile: "<em>character</em>" }, own, loc);
  const copy = namedText("Starts as a copy of {profile}; changes here stay on this character.", { profile: loc.p("the shared one") }, "", loc);
  return `<h3 id="setup-profile">${loc.p("A new character: the {name} step", { name: A(setup.profileName) })}</h3>
<p>${loc.p("Once setup is finished on your account, each new character gets it too, with one more step first. It asks: “{question}” and offers two choices:", { question: A(setup.profileQuestion) })}</p>
<ul>
  <li><strong>“${loc.english ? `${says(S, "Core/Setup.lua", "Share profile ")}<em>name</em>${says(S, "Core/Setup.lua", " with your other characters")}` : shareText}”</strong>: ${w.s("Changes here change them too.")}</li>
  <li><strong>“${loc.english ? `${own}<em>character</em>` : ownText}”</strong>: ${loc.english ? `a profile named after the character. It ${says(S, "Core/Setup.lua", "Starts as a copy of ").toLowerCase()}the shared one${says(S, "Core/Setup.lua", "; changes here stay on this character.")}` : `${loc.p("a profile named after the character.")} ${copy}`} ${loc.p("It then starts on your role's layout, and <strong>{back}</strong> doesn't return to this step.", { back: lab(S, "Core/Setup.lua", "Back") })}</li>
</ul>
<p>${loc.p("Characters that played before this step came in aren't asked.")}</p>

`;
}

// Finishing: the clicks, what Done and Skip do, and the reload question.
function wizardFinish(setup, w, loc) {
  const { A, lab } = w;
  const S = w.S;
  const next = lab(S, "Core/Setup.lua", "Next"), done = lab(S, "Core/Setup.lua", "Done");
  const clicks = loc.p("With the defaults it takes four clicks: <strong>{next}</strong>, <strong>{next}</strong>, <strong>{next}</strong>, <strong>{done}</strong>.", { next, done });
  const reloadAsk = (why) => {
    says(w.D, "Core/Dialog.lua", " Reload the UI now to apply it?");
    return esc(namedText("{why} Reload the UI now to apply it?", { why: loc.addon(why) }, `${why} Reload the UI now to apply it?`, loc));
  };
  const healing = A(setup.layouts.find((l) => l.key === "healing")?.text || "");
  const ends = setup.later
    ? `<p>${clicks} ${loc.p("<strong>{done}</strong> finishes it, and so does <strong>{skip}</strong>; both lock your frames again, and chat says “{again}”", { done, skip: lab(S, "Core/Setup.lua", "Skip setup"), again: A(setup.again) })}</p>
<p>${loc.p("The window's close button and <kbd>Escape</kbd> only close it. Until it's finished, it opens again at your next login, and chat says “{later}”", { later: A(setup.later) })}</p>
<p>${loc.p("To run it again, type <code>/vg setup</code> or click <strong>{run}</strong> under <strong>{general} → {layout}</strong> in <code>/vg</code>.", { run: lab(w.O, "Core/Options.lua", "Run setup"), ...pageNames(loc) })}</p>`
    : `<p>${clicks} ${loc.p("<strong>{done}</strong>, the window's close button and <kbd>Escape</kbd> all end the wizard and lock your frames again. It doesn't come back by itself; type <code>/vg setup</code> to run it again.", { done })}</p>`;
  return `<h3 id="setup-finish">${loc.p("Finishing")}</h3>
${ends}
<p>${loc.p("If setup changed something that needs a reload, it then asks, with <strong>{reload}</strong> and <strong>{later}</strong> buttons:", { reload: lab(w.D, "Core/Dialog.lua", "Reload"), later: lab(w.D, "Core/Dialog.lua", "Later") })}</p>
<ul>
  <li>“${reloadAsk(setup.reloadModule)}” ${loc.p("(for example after <strong>{healing}</strong> turned the raid frames on)", { healing })}</li>
  <li>“${reloadAsk(setup.reloadTile)}”</li>
</ul>
${shotFigure(shotByFile("02-setup-wizard"), { loc })}`;
}

// The setup wizard section (from Core/Setup.lua), when the source has one. Plain player
// language only: every label and message is quoted from the addon and checked by says().
function wizardSection(setup, inRel, read, loc) {
  if (!setup) return "";
  const S = read.next("Core/Setup.lua");
  const w = { ...setupWords(S, loc), S, D: read.next("Core/Dialog.lua"), O: read.next("Core/Options.lua") };
  const body = `${wizardIntro(setup, inRel, w, loc)}

${wizardLayoutStep(setup, w, loc)}

${wizardScreenStep(setup, w, loc)}

${wizardLookMoveSteps(setup, w, loc)}
${wizardProfileStep(setup, w, loc)}${wizardFinish(setup, w, loc)}`;
  return disclosure({ id: "setup-wizard", title: loc.p("The setup wizard"), next: !inRel, meta: inRel ? loc.pn({ one: "{n} step", other: "{n} steps" }, setup.steps.length) : nextBadge(loc), body });
}

// Getting started's glance strip: the four commands to know.
function startGlance(rel, next, loc) {
  const setupLine = loc.p("<code>/vg setup</code> runs the wizard");
  return glance([loc.p("<code>/vg</code> opens the options"), loc.p("<code>/vg unlock</code> moves frames"), loc.p("<code>/vg accent</code> picks a color"), next.setup ? (rel.setup ? setupLine : nextOnly(`${setupLine} ${nextBadge(loc)}`)) : ""]);
}

// Opening the options window, three ways, and its search.
function startOptions(model, read, loc) {
  const { rel, next } = model;
  const OW = read.next("Core/OptionsWindow.lua");
  const GM = read.next("Core/GameMenu.lua");
  const gameMenu = next.has("Core/GameMenu.lua") && !rel.has("Core/GameMenu.lua");
  const lab = (text, file, name) => (label(text, file, name), esc(loc.addon(name)));
  const escapeMenu = loc.p("Press <kbd>Escape</kbd> to open the game menu, then click the <strong>{button}</strong> button at the top of the Escape menu, or just under it where your client's menu can't take new buttons.", { button: lab(GM, "Core/GameMenu.lua", "Vanguard") });
  says(OW, "Core/OptionsWindow.lua", "Some changes need a reload");
  const oldReload = saysIf(read.rel("Core/OptionsWindow.lua") || "", "Core/OptionsWindow.lua", "if ReloadUI then ReloadUI()");
  return `<ol class="steps">
  <li>${loc.p("Type <code>/vg</code> (or <code>/vanguard</code>) in chat. Type <code>/vg</code> again to close it.")}</li>
  <li>${loc.p("Left-click Vanguard on the game's addons button by the minimap. Right-click it instead to turn move mode on or off.")}</li>
  ${gameMenu ? `<li data-avail="next">${escapeMenu} ${nextBadge(loc)}</li>` : `<li>${escapeMenu}</li>`}
</ol>
<p>${loc.p("The options window has a page for each area. To find a setting, type in <strong>{search}</strong> at the top: pages that don't match fade, and <kbd>Enter</kbd> opens the first match. Some changes need a reload; the window then says “{notice}” and shows a <strong>{reload}</strong> button.", { search: lab(OW, "Core/OptionsWindow.lua", "Search settings"), notice: esc(loc.addon("Some changes need a reload")), reload: lab(OW, "Core/OptionsWindow.lua", "Reload now") })}${oldReload ? ` ${loc.p(`In v{version}, type <code>/reload</code> in chat instead: that release's button asks the game to reload directly, and WoW Forever blocks that for addons (see <a href="/help/#reload">Troubleshooting</a>).`, { version: esc(model.version) })}` : ""} ${loc.p(`Every page and setting is listed on <a href="/settings/">Settings</a>.`)}</p>`;
}

// Moving frames: unlock, drag or nudge, anchors, lock; the grid and snapping.
function startMove(model, read, loc) {
  const { rel, next } = model;
  const O = read.next("Core/Options.lua");
  const popoverNext = /scale and opacity/.test(JSON.stringify(next.pages)) && !/scale and opacity/.test(JSON.stringify(rel.pages));
  label(O, "Core/Options.lua", "Move frames");
  return `<ol class="steps">
  <li>${loc.p("Type <code>/vg unlock</code> (or <code>/vg move</code>), or click <strong>{button}</strong> under <strong>{general} → {layout}</strong>. Every Vanguard frame gets a drag handle.", { button: esc(loc.addon("Move frames")), ...pageNames(loc) })}</li>
  <li>${loc.p("Drag a handle to move that frame. Or click a handle, then use the arrow keys to nudge it (hold <kbd>Shift</kbd> to move 10 px).")}</li>
  <li>${loc.p("Right-click a handle for its exact anchor and offsets")}${popoverNext ? nextOnly(`${loc.p("; the next release adds its scale (50% to 200%) and opacity (10% to 100%) there too")} ${nextBadge(loc)}`) : ""}.</li>
  <li>${loc.p("Type <code>/vg lock</code> when you're done.")}</li>
</ol>
<p>${loc.p("While you're moving frames, <code>/vg grid [size|on|off]</code> shows a grid (8 to 256 px) and <code>/vg snap on|off</code> makes frames snap to each other. <code>/vg frames</code> lists the frames you can move, and <code>/vg reset &lt;frame|all&gt;</code> puts one frame (or all of them) back. You can't unlock frames during combat.")}</p>`;
}

// The accent swatches, and keeping the game's version of a part.
function startAccentModules(model, read, loc) {
  const { next } = model;
  const presets = next.theme.presetOrder.map((k) => [k, next.theme.presets[k]]).filter((x) => x[1]);
  const O = read.next("Core/Options.lua");
  const offLine = "A module that's off builds nothing and costs nothing.";
  says(O, "Core/Options.lua", offLine);
  const accent = `<p>${loc.p("Click a swatch under <strong>/vg → {general} → {look}</strong>, or type <code>/vg accent &lt;name&gt;</code> with one of these names (or any color as six hex digits, like <code>ffcc00</code>). <code>/vg accent reset</code> puts the default back.", pageNames(loc))}</p>
<ul class="swatches">${presets.map(([k, hex], i) => `<li class="swatch"><i style="background:${esc(hex)}"></i><span><strong>${esc(k)}</strong>${i === 0 ? ` ${loc.p("(default)")}` : ""} <span class="small">${esc(hex)}</span></span></li>`).join("")}</ul>`;
  const modules = `<p>${loc.p(`Every part of Vanguard is a module you can turn off under <strong>/vg → {modules}</strong> (or type <code>/vg disable &lt;module&gt;</code>, then <code>/reload</code>). The options say: “{line}” The list is on <a href="/features/">Features</a>.`, { modules: esc(loc.addon("Modules")), line: esc(loc.addon(offLine)) })}</p>`;
  return { accent, modules };
}

export function startPage(model, read, loc = EN) {
  const { rel, next } = model;
  const { accent, modules } = startAccentModules(model, read, loc);
  return {
    path: "/start/",
    title: "Getting started",
    description: loc.p("Open the Vanguard options, run the setup wizard, move your frames and pick an accent."),
    translated: true,
    body: `${pageHero(loc.t("title./start/"), loc.p(`After you <a href="/install/">install</a> Vanguard and log in, its frames replace the game's. Here's how to find the options and put things where you want them.`))}
${startGlance(rel, next, loc)}
${disclosure({ id: "options", title: loc.p("Open the options"), open: true, body: startOptions(model, read, loc) })}
${wizardSection(next.setup, !!rel.setup, read, loc)}
${disclosure({ id: "move", title: loc.p("Move your frames"), body: startMove(model, read, loc) })}
${disclosure({ id: "accent", title: loc.p("Pick an accent color"), body: accent })}
${disclosure({ id: "modules", title: loc.p("Keep the game's version of something"), body: modules })}`,
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

// One help line's text in the page's language: the addon translates either the whole line
// (older sources, "frames   list the movable frames") or only its text (newer, with the syntax apart).
function ownHelp(l, loc) {
  if (loc.english || !l.line) return l.text || "";
  const whole = loc.addon(l.line);
  return (whole !== l.line && splitHelp(whole).text) || loc.addon(l.text || "");
}

// A command's help text as the addon prints it (newest source first), in the page's language.
function helpText(model, id, loc) {
  const e = model.commands.entries.find((x) => x.id === id);
  return ownHelp((e?.nextLines || e?.relLines || [])[0] || {}, loc);
}

// The "Settings / Commands / Turn it off" lines under a module.
function featureFacts(m, model, loc) {
  const rows = [];
  if (m.pages.length) rows.push([loc.p("Settings"), m.pages.map((p) => `<a href="/settings/#${p.id}">${esc(loc.addon(p.title))}</a>`).join(", ")]);
  for (const c of m.commands) rows.push([loc.p("Command"), `<a href="/commands/#cmd-${esc(c)}"><code>/vg ${esc(c)}</code></a> ${esc(helpText(model, c, loc))}`]);
  rows.push([loc.p("Turn it off"), loc.p("<strong>/vg → {modules}</strong>, then reload", { modules: esc(loc.addon("Modules")) })]);
  return `<dl class="facts">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>`;
}

// Where a card's words come from, in plain words (no file names).
function featureSource(m, more, loc) {
  const parts = [loc.p("Vanguard's own Modules page"), m.pages.length && loc.p("its options"), m.commands.length && loc.p("its commands"), more && loc.p("the addon's own feature list")].filter(Boolean);
  return `<p class="small mod-src">${loc.p("Source: {list}.", { list: loc.list(parts) })}</p>`;
}

const FEATURE_SHOTS = {
  UnitFrames: ["01-hud-overview"], Bags: ["10-bags"], MenuStrip: ["11-bag-menu-bar"], Windows: ["12-game-windows"],
  Merchant: ["14-merchant"], QuestDialog: ["15-quest-dialog"], QuestLog: ["16-quest-log"], QuestTracker: ["17-quest-tracker"],
  Errands: ["18-trainer-train-all", "37-flight-timer"], RaidFrames: ["21-raid-preview-25"], PartyExtras: ["20-party-preview"],
  ClickCast: ["22-click-casting"], Nameplates: ["32d-nameplates-enemies", "32e-nameplates-cast"], Meter: ["35-vanguard-meter-dps"],
  CooldownGaps: ["36-cooldown-gaps"],
};

// One module as a card: name, badges, the addon's one-liner, more, and its facts.
function featureCard(m, model, loc) {
  const off = startsOff(m, model) ? ` <span class="badge plain">${loc.t("feat.offBadge")}</span>` : "";
  const more = moreOf(m, model);
  const longer = longerOf(m.key).map((s) => loc.p(s));
  const name = esc(loc.addon(m.name));
  return `<article class="card mod" id="${m.id}" data-module="${esc(m.key)}" data-count${m.inRel ? "" : ' data-avail="next"'}>
  <h3>${name} ${badge(m.inRel, m.inNext, model.version, loc)}${off}</h3>
  ${m.desc ? `<p>${esc(loc.addon(m.desc))}</p>` : ""}
  <details class="mod-details"><summary>${loc.p("More<span class=\"visually-hidden\"> about {name}</span>", { name })}</summary>
  ${(FEATURE_SHOTS[m.key] || []).map((f) => shotFigure(shotByFile(f), { loc })).join("")}
  ${more ? `<p class="mod-more">${esc(loc.p(more))}</p>` : ""}${longer.length ? `\n  <p class="mod-longer">${esc(longer.join(" "))}</p>` : ""}
  ${featureFacts(m, model, loc)}
  ${featureSource(m, more, loc)}
  </details>
</article>`;
}

// The feature areas that have modules, in the plan's order, then "Other".
function featureAreas(model) {
  const names = [...AREAS.map(([a]) => a), "Other"];
  return names.map((area) => [area, model.modules.filter((m) => m.area === area)]).filter(([, list]) => list.length);
}

// One area: its heading and its module cards.
function areaSection([area, list], model, loc) {
  const rel = list.filter((m) => m.inRel).length;
  const mods = (n) => loc.pn({ one: "{n} module", other: "{n} modules" }, n);
  const meta = rel === list.length ? mods(rel) : `${mods(rel)}${nextOnly(` ${loc.p("+ {n} next release", { n: list.length - rel })}`)}`;
  return disclosure({ id: `area-${slug(area)}`, title: esc(loc.p(area)), meta, next: rel === 0, cls: "area", body: `<div class="mods">${list.map((m) => featureCard(m, model, loc)).join("\n")}</div>` });
}

// The Features lede, shown in the page hero.
function featuresLede(loc) {
  return loc.t("feat.lede", { modules: esc(loc.addon("Modules")) });
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

// The Features page: one card per module, grouped by area, in the page's language
// (the names and first lines are the addon's own, from its Modules page).
export function featuresPage(model, loc = EN) {
  const groups = featureAreas(model);
  const tail = model.same
    ? loc.p(`The name and first line of each module are the ones the addon shows on its Modules page. The longer text under <strong>More</strong> describes the module as it is in the newest version; <a href="/settings/">Settings</a> shows exactly which options each release has.`)
    : loc.p(`The name and first line of each module are the ones the addon shows on its Modules page. The longer text under <strong>More</strong> describes the module as it is in the newest version, so v{version} may not have every detail yet; <a href="/settings/">Settings</a> shows exactly which options each release has.`, { version: esc(model.version) });
  const body = [pageHero(loc.t("title./features/"), featuresLede(loc)), featuresIntro(model, loc), featureSearchBox(model, loc), `<div id="mod-list" class="dis-grid">${groups.map((g) => areaSection(g, model, loc)).join("\n")}</div>`,
    `<p class="small">${tail}</p>`];
  return { path: "/features/", title: "Features", description: loc.text("feat.description"), body: body.join("\n"), translated: true };
}

// ------------------------------------------------------------------ Commands

// The visible lines of one command entry. A help line's text is the addon's,
// in the page's language; its syntax stays as typed.
function cmdLines(e, loc) {
  const show = (lines) => lines.map((l) => `<p class="cmd-text"><span class="cmd-line">/vg ${esc(l.syntax)}</span><br>${esc(ownHelp(l, loc))}</p>`).join("");
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
  const all = [...(e.relLines || []), ...(e.nextLines || [])];
  const lines = all.map((l) => l.line);
  const own = loc.english ? [] : all.map((l) => ownHelp(l, loc)).filter((t) => !all.some((l) => l.text === t));
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
  return `<div class="search" data-target="#cmd-list" data-items=".cmd" data-groups=".cmd-group" data-noun="commands" data-noun-one="command">
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

// A row's caption in the page's language, as plain text. A ns.Format caption is looked up by its
// {slot} text, as the game does, and its slots show as <slot>.
function rowCaption(r, loc) {
  return r.key ? showSlots(loc.addon(r.key)) : loc.addon(r.caption);
}

// A heading or note row from the addon, spanning the table.
function wideRow(r, attrs, version, loc) {
  const b = r.inRel && r.inNext ? "" : ` ${badge(r.inRel, r.inNext, version, loc)}`;
  if (r.kind === "header") return groupRow(`${esc(rowCaption(r, loc))}${b}`, attrs);
  return `<tr class="opt-row t opt-item" ${attrs}><td colspan="${COLS.length}">${esc(rowCaption(r, loc))}${b}</td></tr>`;
}

// The words the search box matches for a row: its page, caption and choices,
// in English and in the page's language.
function rowSearch(r, pageTitle, loc) {
  const words = [pageTitle, r.caption, ...(r.choices || []).map((c) => c[1])];
  const own = loc.english ? [] : [...words.map((w) => loc.addon(w)), rowCaption(r, loc)].filter((w) => !words.includes(w));
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
  return `<tr class="opt-row opt-item" id="${id}" data-count ${attrs}><th scope="row" class="opt-cap">${esc(rowCaption(r, loc))}${loop}${kind}</th>${cells.join("")}</tr>`;
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
  const release = loc.n("set.inRelease", count((r) => r.inRel), { version: esc(version) });
  const next = model.same ? "" : nextOnly(` · ${loc.t("set.inNext", { n: count((r) => r.inNext) })}`);
  return `<p class="counts">${release}${next} · ${loc.n("set.pages", pages.length)}.</p>`;
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
