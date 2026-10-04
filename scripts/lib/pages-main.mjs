// Home, Install & Update, Getting started, Features, Commands and Settings.
// Generated parts come from the model (the addon's Lua, TOC, README and the
// release); the prose around them only restates what those sources say.
import { esc, md, slug, badge, avail, shot } from "./html.mjs";
import { AREAS } from "./model.mjs";

// "September 27, 2026" in New York time.
export function dateET(iso) {
  return new Date(iso).toLocaleDateString("en-US", { timeZone: "America/New_York", year: "numeric", month: "long", day: "numeric" });
}

// "259,589 bytes (254 KB)".
export function sizeText(bytes) {
  return `${bytes.toLocaleString("en-US")} bytes (${Math.round(bytes / 1024)} KB)`;
}

// A short "Source: ..." line.
export function src(...files) {
  return `<p class="small">Source: ${files.map((f) => `<code>${esc(f)}</code>`).join(", ")} in the ForeverUI addon repository.</p>`;
}

// The README's "Written from scratch..." sentence (release README).
function scratchLine(readme) {
  return (readme.match(/^Written from scratch\.[^\n]*$/m) || [""])[0].replace(/\s*It bundles.*$/, "");
}

// The README's "not checked in game" sentence, whitespace normalized.
export function earlyQuote(readme) {
  const m = readme.match(/None of this has been checked in game yet:\s*please report what breaks\./);
  return m ? m[0].replace(/\s+/g, " ") : null;
}

// The download box: button, version, date, size and SHA-256.
export function downloadBox(model) {
  const { release, zip } = model;
  return `<section class="card download" aria-labelledby="dl-h">
  <div>
    <h2 id="dl-h" style="margin:0 0 8px;border:0;padding:0;font-size:1.2rem">Download ForeverUI ${esc(model.version)}</h2>
    <a class="button" href="/download/${esc(zip.name)}" download>Download ${esc(zip.name)}</a>
  </div>
  <dl class="facts">
    <dt>Version</dt><dd>${esc(model.version)} (release ${esc(release.tag)})</dd>
    <dt>Published</dt><dd>${esc(dateET(release.publishedAt))}</dd>
    <dt>Size</dt><dd>${esc(sizeText(zip.size))}</dd>
    <dt>SHA-256</dt><dd class="hash" data-sha256>${esc(zip.sha256)}</dd>
    <dt>Game</dt><dd>WoW Forever (the addon declares Interface ${esc(model.rel.meta.Interface)})</dd>
  </dl>
</section>`;
}

// The "current download vs next release" notice used on several pages.
export function nextNotice(model) {
  if (model.same) return "";
  const newMods = model.modules.filter((m) => m.inNext && !m.inRel).length;
  const newCmds = [...model.commands.nextKeys].filter((k) => !model.commands.relKeys.has(k)).length;
  return `<div class="notice info"><p><strong>The current download is ${esc(model.version)}.</strong> The addon has moved on since that release: ${newMods} more modules and ${newCmds} more commands are written and waiting for the next release, which isn't out yet. This site marks those <span class="badge next">Next release</span>. They are not in the zip you can download today.</p></div>`;
}

// ------------------------------------------------------------------ Home

export function homePage(model) {
  const { rel } = model;
  const quote = earlyQuote(rel.readme) || earlyQuote(model.next.readme);
  const relMods = model.modules.filter((m) => m.inRel);
  return {
    path: "/",
    title: "ForeverUI",
    description: rel.meta.Notes,
    body: `<h1>ForeverUI</h1>
<p class="lede">${esc(rel.meta.Notes)}</p>
<p class="prose">${esc(scratchLine(rel.readme))}</p>
${downloadBox(model)}
<div class="notice"><p><strong>Early release, not checked in game yet.</strong> ${quote ? `In the addon's own words: “${esc(quote)}”` : ""} Every report helps: see <a href="/feedback/">Feedback</a>.</p></div>
${nextNotice(model)}
<h2>What do you want to do?</h2>
<div class="grid four">
  <a class="card tile" href="/install/"><strong>Install</strong>Download the zip and put it in your AddOns folder.</a>
  <a class="card tile" href="/start/"><strong>Set up</strong>Open the options, move your frames, pick an accent.</a>
  <a class="card tile" href="/commands/"><strong>Commands</strong>Every <code>/fui</code> command, searchable.</a>
  <a class="card tile" href="/help/"><strong>Fix a problem</strong>Self-fixes, then how to report a bug.</a>
</div>
<h2>In the ${esc(model.version)} download</h2>
<p>${relMods.length} modules, each of which can be turned off under <strong>/fui → Modules</strong>:</p>
<ul class="grid two" style="list-style:none;padding:0">${relMods.map((m) => `<li><a href="/features/#${m.id}">${esc(m.name)}</a></li>`).join("")}</ul>
${shot("ForeverUI's default layout in game")}
${src("ForeverUI.toc", "README.md")}`,
  };
}

// ------------------------------------------------------------------ Install

export function installPage(model) {
  const { rel, zip } = model;
  const readme = rel.readme;
  const where = readme.match(/unzip the `ForeverUI` folder into `([^`]+)`\s*\(([^)]+)\)/);
  const sv = rel.meta.SavedVariables;
  const svc = rel.meta.SavedVariablesPerCharacter;
  return {
    path: "/install/",
    title: "Install & Update",
    description: "Install, update and remove ForeverUI by hand from the zip.",
    body: `<h1>Install &amp; Update</h1>
<p class="lede">ForeverUI installs by hand from a zip. That's the only way the addon supports today: it isn't listed on any addon manager.</p>
${downloadBox(model)}
<h2 id="install">Install</h2>
<ol class="steps">
  <li><strong>Download</strong> <a href="/download/${esc(zip.name)}" download>${esc(zip.name)}</a> (above).</li>
  <li><strong>Unzip it.</strong> Inside is one folder called <code>ForeverUI</code>.</li>
  <li><strong>Put the <code>ForeverUI</code> folder in your AddOns folder.</strong> The addon's README says: unzip the <code>ForeverUI</code> folder into <code>${esc(where ? where[1] : "Interface/AddOns/")}</code> (${esc(where ? where[2] : "your Forever client's AddOns folder")}).
    <div class="notice todo"><p><strong>To be confirmed:</strong> the exact AddOns folder for the WoW Forever client (on Windows and macOS) is still being checked. Until then, use the folder of your Forever client that has <code>Interface/AddOns</code> in it.</p></div>
  </li>
  <li><strong>Turn it on at character select:</strong> open <strong>AddOns</strong> and tick <strong>ForeverUI</strong>, then log in.</li>
  <li>Type <code>/fui</code> in chat to open the options. See <a href="/start/">Getting started</a>.</li>
</ol>
${src("README.md (Install)", "scripts/package.mjs (zip layout)", "docs/SMOKE-TEST.md (step 1.2)")}

<h2 id="check">Check your download (optional)</h2>
<p>The SHA-256 of the file you downloaded should be exactly:</p>
<p class="hash card">${esc(zip.sha256)}</p>
<p>On Windows: <code>certutil -hashfile ${esc(zip.name)} SHA256</code>. On macOS or Linux: <code>shasum -a 256 ${esc(zip.name)}</code>.</p>

<h2 id="update">Update</h2>
<ol class="steps">
  <li>Log out of the game (or close it).</li>
  <li>Delete the old <code>ForeverUI</code> folder from your AddOns folder.</li>
  <li>Unzip the new download and put its <code>ForeverUI</code> folder in the same place.</li>
</ol>
<p>Your settings are kept. ForeverUI saves them in the game's SavedVariables (<code>${esc(sv)}</code> for the account, <code>${esc(svc)}</code> for each character), not in the addon folder.</p>
<p>There is no automatic update: each new version is a new zip on this site. The <a href="/changelog/">Changelog</a> says what changed.</p>
${src("ForeverUI.toc (SavedVariables)", ".github/workflows/release.yml")}

<h2 id="uninstall">Uninstall</h2>
<p>Delete the <code>ForeverUI</code> folder from your AddOns folder. To turn it off for a while instead, untick it under <strong>AddOns</strong> at character select.</p>
<p>To go back to the game's own version of just one part (say, its action bars), you don't need to uninstall: turn that module off under <strong>/fui → Modules</strong> and reload. See <a href="/help/#one-feature">Troubleshooting</a>.</p>`,
  };
}

// ------------------------------------------------------------------ Getting started

// The setup wizard section (from Core/Setup.lua), when the source has one.
function wizardSection(setup, inRel) {
  if (!setup) return "";
  const b = inRel ? "" : ` <span class="badge next">Next release</span>`;
  const n = setup.steps.length;
  const caption = (i) => setup.caption.replace("%d", i + 1).replace("%d", n).replace("%s", setup.steps[i]);
  return `<h2 id="setup-wizard">The setup wizard${b}</h2>
${inRel ? "" : `<p><strong>The setup wizard isn't in the ${"current"} download.</strong> It is written and waits for the next release. This is what it will do, read straight from the addon's code.</p>`}
<p>The first time you log in on an account, a ${n}-step wizard (“${esc(setup.title)}”) opens: ${setup.steps.map((s) => esc(s)).join(", ")}. It waits until you're out of combat (it says “${esc(setup.combat)}”). Done, the close button and Escape all end it, and it doesn't come back on its own: <code>/fui setup</code> reopens it.</p>
<h3>Step 1 · ${esc(setup.steps[0])}</h3>
<p>“${esc(setup.questions[0] || "")}”</p>
<div class="table-wrap"><table class="stack"><thead><tr><th scope="col">Layout</th><th scope="col">What it does</th></tr></thead><tbody>
${setup.layouts.map((l, i) => `<tr><td data-label="Layout"><strong>${esc(l.text)}</strong>${i === 0 ? ` <span class="badge plain">Default</span>` : ""}</td><td data-label="What it does">${esc(l.hint)}</td></tr>`).join("\n")}
</tbody></table></div>
<h3>Step 2 · ${esc(setup.steps[1])}</h3>
<p>“${esc(setup.questions[1] || "")}” The preset that matches your screen is marked “· ${esc(setup.yourScreen || "your screen")}”; on a screen under ${esc(setup.keepBelow)} pixels tall, “${esc(setup.keepText)}” is picked.</p>
<div class="table-wrap"><table class="stack"><thead><tr><th scope="col">Preset</th><th scope="col">Made for</th><th scope="col">What it sets</th></tr></thead><tbody>
${setup.screens.map((s) => `<tr><td data-label="Preset"><strong>${esc(s.text)}</strong></td><td data-label="Made for">${s.w} x ${s.h}</td><td data-label="What it sets">${esc(s.hint)}</td></tr>`).join("\n")}
<tr><td data-label="Preset"><strong>${esc(setup.keepText)}</strong></td><td data-label="Made for">any screen</td><td data-label="What it sets">${esc(setup.keepHint)}</td></tr>
</tbody></table></div>
<h3>Step 3 · ${esc(setup.steps[2])}</h3>
<p>Pick an accent color (the swatches below) and a raid frame style: ${setup.styles.map((s) => `<strong>${esc(s[2])}</strong> (${esc(s[1])})`).join(", ")}.</p>
<h3>Step 4 · ${esc(setup.steps[3])}</h3>
<ul>${setup.moveLines.map((l) => `<li>“${esc(l)}”</li>`).join("")}</ul>
<p>With the defaults it's Next, Next, Next, Done. It may then offer a reload: “${esc(setup.reloadModule)}” or “${esc(setup.reloadTile)}”</p>
<p class="small">The wizard's caption reads like “${esc(caption(0))}”.</p>
${shot("the setup wizard, step 1")}
${src("Core/Setup.lua", "README.md (First-run setup)")}`;
}

export function startPage(model) {
  const { rel, next, version } = model;
  const presets = next.theme.presetOrder.map((k) => [k, next.theme.presets[k]]).filter((x) => x[1]);
  const relHas = (k) => model.commands.relKeys.has(k);
  const gameMenu = next.has("Core/GameMenu.lua") && !rel.has("Core/GameMenu.lua");
  const popoverNext = /scale and opacity/.test(JSON.stringify(next.pages)) && !/scale and opacity/.test(JSON.stringify(rel.pages));
  return {
    path: "/start/",
    title: "Getting started",
    description: "Open the ForeverUI options, move your frames and pick an accent.",
    body: `<h1>Getting started</h1>
<p class="lede">After you <a href="/install/">install</a> ForeverUI and log in, its frames replace the game's. Here's how to find the options and put things where you want them.</p>
${nextNotice(model)}
<h2 id="options">Open the options</h2>
<ul>
  <li>Type <code>/fui</code> (or <code>/foreverui</code>) in chat. <code>/fui</code> again closes it.</li>
  <li>Or left-click ForeverUI on the game's addons button by the minimap. Right-click it to turn move mode on or off.</li>
  ${gameMenu ? `<li>Or the <strong>ForeverUI</strong> button at the top of the game menu (<kbd>Escape</kbd>). <span class="badge next">Next release</span></li>` : ""}
</ul>
<p>The options window has a page per area. Use <strong>Search settings</strong> at the top to find a setting: pages that don't match fade, and <kbd>Enter</kbd> opens the first match. Some changes need a reload: the window then says “Some changes need a reload” and shows a <strong>Reload now</strong> button. Every page and setting is listed on <a href="/settings/">Settings</a>.</p>
${src("Core/Options.lua (ForeverUI_OnAddonCompartmentClick)", "Core/OptionsWindow.lua", "Core/Slash.lua")}

<h2 id="move">Move your frames</h2>
<ol class="steps">
  <li>Type <code>/fui unlock</code> (or <code>/fui move</code>), or click <strong>Move frames</strong> under <strong>General → Layout</strong>. Every ForeverUI frame gets a drag handle.</li>
  <li>Drag a handle to move that frame. Click a handle, then the arrow keys nudge it (<kbd>Shift</kbd>: 10 px).</li>
  <li>Right-click a handle for its exact anchor and offsets${popoverNext ? `; the next release adds its scale (50% to 200%) and opacity (10% to 100%) there too <span class="badge next">Next release</span>` : ""}.</li>
  <li>Type <code>/fui lock</code> when you're done.</li>
</ol>
<p>While moving: <code>/fui grid [size|on|off]</code> shows a grid (size 8 to 256 px) and <code>/fui snap on|off</code> snaps frames to each other. <code>/fui frames</code> lists the movable frames and <code>/fui reset &lt;frame|all&gt;</code> puts one (or all) back. Unlocking doesn't work during combat.</p>
${src("Core/Slash.lua (HELP, gridCommand)", "Core/Options.lua (layoutRows)", "Core/Movers.lua")}

<h2 id="accent">Pick an accent color</h2>
<p>Click a swatch under <strong>/fui → General → Look</strong>, or type <code>/fui accent &lt;name&gt;</code> with one of these names (or any <code>rrggbb</code> color). <code>/fui accent reset</code> puts the default back.</p>
<ul class="swatches">${presets.map(([k, hex], i) => `<li class="swatch"><i style="background:${esc(hex)}"></i><span><strong>${esc(k)}</strong>${i === 0 ? " (default)" : ""} <span class="small">${esc(hex)}</span></span></li>`).join("")}</ul>
${src("Core/Theme.lua (T.PRESETS)", "Core/Slash.lua (accentCommand)")}

<h2 id="modules">Keep the game's version of something</h2>
<p>Every part of ForeverUI is a module you can turn off under <strong>/fui → Modules</strong> (or <code>/fui disable &lt;module&gt;</code>, then <code>/reload</code>). The options say: “A module that's off builds nothing and costs nothing.” The list is on <a href="/features/">Features</a>.</p>
${wizardSection(next.setup, !!rel.setup)}
${relHas("setup") ? "" : ""}`,
  };
}

// ------------------------------------------------------------------ Features

export function featuresPage(model) {
  const groups = [...AREAS.map(([a]) => a), "Other"].map((area) => [area, model.modules.filter((m) => m.area === area)]).filter(([, l]) => l.length);
  const card = (m) => `<article class="card mod" id="${m.id}" data-module="${esc(m.key)}">
  <h3>${esc(m.name)} ${badge(m.inRel, m.inNext, model.version)}</h3>
  ${m.desc ? `<p>${esc(m.desc)}</p>` : ""}
  <p class="small">Module <code>${esc(m.key)}</code>${m.pages.length ? ` · Settings: ${m.pages.map((p) => `<a href="/settings/#${p.id}">${esc(p.title)}</a>`).join(", ")}` : ""}${m.commands.length ? ` · Commands: ${m.commands.map((c) => `<a href="/commands/#cmd-${esc(c)}"><code>/fui ${esc(c)}</code></a>`).join(", ")}` : ""}</p>
</article>`;
  return {
    path: "/features/",
    title: "Features",
    description: "Every ForeverUI module, what it does, and whether it's in the current download.",
    body: `<h1>Features</h1>
<p class="lede">ForeverUI is built from modules. Each one replaces or adds one part of the game's interface, and each can be turned off under <strong>/fui → Modules</strong>.</p>
${nextNotice(model)}
<p class="small">The one-line descriptions are the ones the addon shows on its Modules page (<code>O.MODULE_INFO</code> in <code>Core/Options.lua</code>), taken from its newest source. A module marked <span class="badge rel">In v${esc(model.version)}</span> is in the download, but some details in its description may have arrived after that release; the <a href="/settings/">Settings</a> page shows exactly which options each version has.</p>
<p><strong>${model.modules.filter((m) => m.inRel).length}</strong> modules in the v${esc(model.version)} download · <strong>${model.modules.filter((m) => m.inNext).length}</strong> in the next release.</p>
<nav aria-label="Feature areas"><ul class="filters" style="list-style:none;padding:0">${groups.map(([a]) => `<li><a href="#area-${slug(a)}">${esc(a)}</a></li>`).join("")}</ul></nav>
${groups.map(([area, list]) => `<section aria-labelledby="area-${slug(area)}"><h2 id="area-${slug(area)}">${esc(area)}</h2><div class="mods">${list.map(card).join("\n")}</div></section>`).join("\n")}
${shot("raid frames and the options window")}
${src("Core/Options.lua (O.MODULE_INFO)", "ns.Module(...) calls in Modules/*.lua")}`,
  };
}

// ------------------------------------------------------------------ Commands

// The visible lines of one command entry.
function cmdLines(e, version) {
  const show = (lines) => lines.map((l) => `<p class="cmd-text"><span class="cmd-line">/fui ${esc(l.syntax)}</span><br>${esc(l.text)}</p>`).join("");
  if (e.relLines && !e.changed) return show(e.relLines);
  if (e.relLines && e.changed) return `${show(e.relLines)}<p class="cmd-meta">In the next release the help line reads:</p>${show(e.nextLines)}`;
  if (e.nextLines) return show(e.nextLines);
  return "";
}

export function commandsPage(model) {
  const { commands: c, version } = model;
  const all = [...new Set([...c.nextKeys, ...c.relKeys])];
  const item = (e) => {
    const anchors = e.keys.map((k) => `<span id="cmd-${esc(k)}" data-command="${esc(k)}"></span>`).join("");
    let head;
    let body;
    if (e.special === "fui") {
      head = `<h2 class="cmd-name"><code class="cmd-syntax">/fui</code></h2>`;
      body = `<p class="cmd-text">Opens (or closes) the options window. Also <code>${c.slashes.map(esc).join("</code>, <code>")}</code>${e.keys.length ? `, and <code>/fui ${e.keys.map(esc).join("</code>, <code>/fui ")}</code>` : ""}. The help's first line says: “${esc(c.relIntro)}”</p>`;
    } else if (e.special === "help") {
      head = `<h2 class="cmd-name"><code class="cmd-syntax">/fui help</code></h2>`;
      body = `<p class="cmd-text">Prints the list of commands in chat: the help lines quoted on this page.</p>`;
    } else {
      head = `<h2 class="cmd-name"><code class="cmd-syntax">/fui ${esc(e.keys.join(" | "))}</code></h2>`;
      body = cmdLines(e, version);
    }
    const aliases = "";
    const mods = e.modules.length ? `<p class="cmd-meta">Needs the module: ${e.modules.map((m) => { const mm = model.modules.find((x) => x.key === m); return `<a href="/features/#${mm ? mm.id : slug(m)}">${esc(mm ? mm.name : m)}</a>`; }).join(", ")}</p>` : "";
    const search = [e.keys.join(" "), ...(e.relLines || []).map((l) => l.line), ...(e.nextLines || []).map((l) => l.line), e.special || ""].join(" ");
    const first = e.special === "help" ? "/fui help" : e.special === "fui" ? "/fui" : `/fui ${e.keys[0] || ""}`.trim();
    return `<li class="card cmd" id="entry-${esc(e.id)}" data-avail="${avail(e.inRel, e.inNext)}" data-search="${esc(search)}">
  <div class="cmd-head">${anchors}${head} ${badge(e.inRel, e.inNext, version)} <button class="copy" type="button" data-copy="${esc(first)}" aria-label="Copy ${esc(first)}">Copy</button></div>
  ${body}${aliases}${mods}
</li>`;
  };
  return {
    path: "/commands/",
    title: "Commands",
    description: "Every /fui command with its help text, verbatim from the addon.",
    body: `<h1>Commands</h1>
<p class="lede">ForeverUI has one chat command, <code>/fui</code> (or <code>/foreverui</code>), followed by a word. The help text below is quoted exactly as the addon prints it with <code>/fui help</code>.</p>
${nextNotice(model)}
<p><strong>${c.relKeys.size}</strong> command words in the v${esc(version)} download · <strong>${c.nextKeys.size}</strong> in the next release. An unknown word prints “${esc(c.unknown || "Unknown command. /fui help")}”.</p>
<div class="search" data-target="#cmd-list" data-items=".cmd" data-noun="commands">
  <label for="cmd-q">Search commands</label>
  <input id="cmd-q" type="search" placeholder="for example: reset, profile, errors" autocomplete="off">
  <div class="filters">
    <label><input type="checkbox" data-filter="next" checked> Show next-release commands</label>
    ${[...c.relKeys].some((k) => !c.nextKeys.has(k)) ? `<label><input type="checkbox" data-filter="old" checked> Show v${esc(version)}-only commands</label>` : ""}
  </div>
  <p class="count" aria-live="polite" role="status"></p>
</div>
<ul class="cmds" id="cmd-list">
${c.entries.map(item).join("\n")}
</ul>
<p class="small">All ${all.length} command words: ${all.map((k) => `<a href="#cmd-${esc(k)}"><code>${esc(k)}</code></a>`).join(" ")}</p>
${src("Core/Slash.lua (HELP, COMMANDS, SLASH_FOREVERUI1/2)")}`,
  };
}

// ------------------------------------------------------------------ Settings

// Text for a row's default across versions.
function defaultText(r, version) {
  const a = r.relDefault;
  const b = r.nextDefault;
  if (r.inRel && r.inNext) {
    if (a && b && a !== b) return `Default: ${esc(a)} in v${esc(version)}, ${esc(b)} in the next release`;
    if (a || b) return `Default: ${esc(a || b)}`;
    return "";
  }
  return a || b ? `Default: ${esc(a || b)}` : "";
}

// One settings row.
function optRow(r, version, pageTitle) {
  const kindName = { check: "Switch", cycle: "Choice", slider: "Slider", button: "Button", visibility: "Visibility", text: "", header: "" }[r.kind];
  const search = `${pageTitle} ${r.caption} ${(r.choices || []).map((c) => c[1]).join(" ")}`;
  const da = avail(r.inRel, r.inNext);
  if (r.kind === "header") return `<li class="opt-row h" data-avail="${da}" data-search="${esc(search)}">${esc(r.caption)} ${r.inRel && r.inNext ? "" : badge(r.inRel, r.inNext, version)}</li>`;
  if (r.kind === "text") return `<li class="opt-row t opt-item" data-avail="${da}" data-search="${esc(search)}">${esc(r.caption)} ${r.inRel && r.inNext ? "" : badge(r.inRel, r.inNext, version)}</li>`;
  const meta = [];
  if (kindName) meta.push(`<span>${kindName}</span>`);
  if (r.choices && r.choices.length) meta.push(`<span>${r.choices.map((c) => esc(c[1])).join(" / ")}</span>`);
  if (r.range) {
    const f = (x) => (r.range.percent && r.range.max <= 2 ? `${Math.round(x * 100)}%` : String(x));
    meta.push(`<span>${esc(f(r.range.min))} to ${esc(f(r.range.max))}</span>`);
  }
  const d = defaultText(r, version);
  if (d) meta.push(`<span>${d}</span>`);
  if (r.reload) meta.push(`<span class="badge reload">Needs reload</span>`);
  meta.push(badge(r.inRel, r.inNext, version));
  const loop = r.loop ? ` <span class="small">(${esc(r.loop.variable)} = ${r.loop.from} to ${r.loop.to})</span>` : "";
  return `<li class="opt-row opt-item" data-avail="${da}" data-search="${esc(search)}"><span class="opt-cap">${esc(r.caption)}${loop}</span><span class="opt-meta">${meta.join("")}</span></li>`;
}

// The rows of a page, with a note before rows repeated for every bar.
function pageRows(p, version) {
  const out = [];
  let inRepeat = null;
  for (const r of p.rows) {
    const rep = r.repeated ? JSON.stringify(r.repeated) : null;
    if (rep && rep !== inRepeat) out.push(`<li class="opt-row h" data-search="${esc(p.title)} each">For each of ${r.repeated.from} to ${r.repeated.to} (one card each)</li>`);
    inRepeat = rep;
    out.push(optRow(r, version, p.title));
  }
  return out.join("\n");
}

export function settingsPage(model) {
  const { pages, version } = model;
  const count = (f) => pages.reduce((n, p) => n + p.rows.filter((r) => r.kind !== "header" && r.kind !== "text" && f(r)).length, 0);
  const modulesPage = (p) => (p.key === "modules" ? `<li class="opt-row t">Then one switch per module (it applies after a reload): ${model.modules.map((m) => `<a href="/features/#${m.id}">${esc(m.name)}</a>${m.inRel ? "" : " (next release)"}`).join(", ")}.</li>` : "");
  return {
    path: "/settings/",
    title: "Settings",
    description: "Every page and setting in the ForeverUI options window, with defaults.",
    body: `<h1>Settings</h1>
<p class="lede">Every page of the options window (<code>/fui</code>) and every setting on it, with the caption exactly as the addon shows it.</p>
${nextNotice(model)}
<p>Settings marked <span class="badge reload">Needs reload</span> apply after a reload: the window says “Some changes need a reload” and offers <strong>Reload now</strong>. Defaults are shown where the addon's code states one; where it doesn't, none is shown.</p>
<p><strong>${count((r) => r.inRel)}</strong> settings in v${esc(version)} · <strong>${count((r) => r.inNext)}</strong> in the next release · <strong>${pages.length}</strong> pages.</p>
<nav aria-label="Options pages"><ul class="filters" style="list-style:none;padding:0">${pages.map((p) => `<li><a href="#${p.id}">${esc(p.title)}</a>${p.inRel ? "" : " <span class=\"badge next\">Next release</span>"}</li>`).join("")}</ul></nav>
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
${pages.map((p) => `<section class="opt-page" aria-labelledby="${p.id}" data-page="${esc(p.key)}">
<h2 id="${p.id}">${esc(p.title)} ${badge(p.inRel, p.inNext, version)}</h2>
<ul class="opt-rows">
${pageRows(p, version)}
${modulesPage(p)}
</ul>
</section>`).join("\n")}
</div>
<p class="small">Some rows only appear on some clients (for example the Specialization card on the Profiles page needs a client with specializations; the game's own click bindings need a client that has them). Lists that you fill in yourself (your profiles, your chat watch phrases, the bindings grid) aren't listed row by row.</p>
${src("Core/Options.lua (PAGES and row builders)", "Modules/RaidHealing.lua", "Modules/ClickCastOptions.lua", "Modules/Nameplates.lua", "Modules/Situations.lua", "Core/Visibility.lua", "module defaults tables")}`,
  };
}
