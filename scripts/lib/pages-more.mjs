// Profiles & sharing, Troubleshooting & FAQ, Feedback, Changelog, Credits.
// Messages in quotes are copied from the addon's Lua; each section names its
// source file. Where the current download and the next release differ, the
// page says which is which.
import { esc, md, badge } from "./html.mjs";
import { src, dateET, nextNotice, earlyQuote } from "./pages-main.mjs";

const NEXT = `<span class="badge next">Next release</span>`;

// A string literal from a file, by a regex with one capture group (null when absent).
function grab(text, re) {
  const m = (text || "").match(re);
  return m ? m[1] : null;
}

// ------------------------------------------------------------------ Profiles

export function profilesPage(model, read) {
  const v = model.version;
  const relSlash = read.rel("Core/Slash.lua");
  const nextSlash = read.next("Core/Slash.lua");
  const relProf = read.rel("Core/Profiles.lua");
  const nextProf = read.next("Core/Profiles.lua");
  const nameRule = grab(relSlash, /"(Profile names are [^"]+)"/);
  const relSwitch = grab(relSlash, /OfferReload\("(This character now uses profile )"/);
  const nextSwitch = grab(nextSlash, /OfferReload\("(This character will use profile )"/);
  const relImported = grab(relProf, /return "(Imported as profile )"/);
  const nextImported = grab(nextProf, /return "(Imported as profile " \.\. name \.\. "[^"]*)"/);
  const nextImportedText = nextImported ? nextImported.replace(/" \.\. name \.\. "/, "Imported") : null;
  const uiQ = grab(nextProf, /string\.format\("(This profile was made at UI scale[^"]+)"/);
  const editMissing = grab(nextProf, /Chat\("Profile " \.\. ns\.ProfileName\(\) \.\. " (uses Edit Mode layout " \.\. name \.\. ", which this account doesn't have\.)"\)/);
  const noSpecs = grab(nextSlash, /"(This client has no specializations[^"]+)"/);
  const relNoSpec = grab(relSlash, /"(No specialization on this character yet\.)"/);
  const hasShareNext = /shareBuilder/.test(read.next("Modules/ClickCastOptions.lua") || "") && !/shareBuilder/.test(read.rel("Modules/ClickCastOptions.lua") || "");
  return {
    path: "/profiles/",
    title: "Profiles & sharing",
    description: "Share one ForeverUI layout across characters, or move it to another PC.",
    body: `<h1>Profiles &amp; sharing</h1>
<p class="lede">A profile holds all of ForeverUI's settings and frame positions. Profiles are saved for your whole account, and each character uses one of them. The first one is called <strong>Default</strong>.</p>
${nextNotice(model)}
<h2 id="same-account">Use one layout on several characters</h2>
<ul>
  <li><code>/fui profile</code> shows which profile this character uses, and all of them.</li>
  <li><code>/fui profile &lt;name&gt;</code> switches this character to that profile, making it if it's new. In v${esc(v)} it then offers a reload: “${esc(relSwitch || "This character now uses profile ")}&lt;name&gt;.”</li>
  <li>Or in the options: <strong>/fui → Profiles</strong>, where v${esc(v)} shows a <strong>Use &lt;name&gt;</strong> button for other profiles.</li>
  <li>${esc(nameRule || "")}</li>
</ul>
${nextSwitch ? `<p>${NEXT} Choosing a profile takes effect at your next reload; until then you're still editing the profile you were using. The message becomes “${esc(nextSwitch)}&lt;name&gt; after the reload.”</p>` : ""}
<h3>Manage profiles</h3>
<ul>
  <li><code>/fui profile new &lt;name&gt;</code> makes an empty profile.</li>
  <li><code>/fui profile copy &lt;name&gt;</code> copies another profile's settings over the one you're using (then offers a reload).</li>
  <li><code>/fui profile delete &lt;name&gt;</code> deletes a profile. You can't delete the one in use.</li>
  <li><code>/fui profile reset</code> (or <strong>Reset profile</strong>) puts the profile you're using back to defaults.</li>
</ul>
${src("Core/DB.lua", "Core/Profiles.lua", "Core/Slash.lua (profileCommand)", "Core/Options.lua (profileRows)")}

<h2 id="share">Move a profile to another account or PC</h2>
<ol class="steps">
  <li>On the first PC: <code>/fui export</code> (or <strong>Export profile</strong> on the Profiles page) shows a string; press <kbd>Ctrl</kbd>+<kbd>C</kbd> to copy it. <code>/fui export &lt;module&gt;</code> exports just one module's settings.</li>
  <li>On the other PC: <code>/fui import</code> (or <strong>Import</strong>), paste the string, then Import.</li>
</ol>
<ul>
  <li>A whole profile is saved as a new profile called “Imported” (then “Imported 2”, and so on). In v${esc(v)} this character switches to it at once (“${esc(relImported || "Imported as profile ")}Imported and switched to it.”), and a reload is offered.</li>
  <li>One module's settings replace that module's settings in the profile you're using.</li>
  <li>Strings start with <code>FUI1:</code>. If one won't import, see <a href="/help/#import">Troubleshooting</a>.</li>
</ul>
${nextImportedText || uiQ || editMissing ? `<h3>In the next release ${NEXT}</h3><ul>
${nextImportedText ? `<li>A whole imported profile is used after a reload: “${esc(nextImportedText)}”</li>` : ""}
${uiQ ? `<li>A whole-profile string also carries the UI scale and screen size it was made on. Importing one asks: “${esc(uiQ.replace("%d%%%s", "X% on a W x H screen").replace("%d%%", "Y%"))}”</li>` : ""}
${editMissing ? `<li>A profile remembers which of the game's Edit Mode layouts you use with it. If your account doesn't have that layout, ForeverUI says: “Profile &lt;name&gt; ${esc(editMissing.replace(/" \.\. name \.\. "/, "<layout>"))}”</li>` : ""}
<li>Exports always hold your profile's own values, never a Situations override that happens to be active.</li>
<li>Vendor memory and auction prices are kept for the whole account, so every character shares them.</li>
</ul>` : ""}
${src("Core/Serialize.lua", "Core/Profiles.lua", "Core/Slash.lua (exportCommand, importCommand)", "README.md")}

${hasShareNext ? `<h2 id="click-casting">Click-casting bindings ${NEXT}</h2>
<p>Click-casting bindings are kept per character and specialization, apart from profiles. In the next release the Click casting page has a <strong>Share</strong> card to Export and Import them as a string, and to copy them to another spec where the client has specs.</p>
${src("Modules/ClickCastOptions.lua (shareBuilder)", "README.md (Click casting)")}` : ""}

<h2 id="spec">Profiles by specialization</h2>
<p><code>/fui spec [profile|off]</code> uses a profile whenever you're in this specialization. This is for clients that have specializations: the addon's code notes that WoW Forever has none. In v${esc(v)}, when the character has no specialization, <code>/fui spec</code> answers “${esc(relNoSpec || "")}”.${noSpecs ? ` ${NEXT} It says instead: “${esc(noSpecs)}”, and the Profiles page hides the Specialization card.` : ""}</p>
${src("Core/Profiles.lua (specGetter)", "Core/Slash.lua (specCommand)")}`,
  };
}

// ------------------------------------------------------------------ Troubleshooting

export function helpPage(model, read) {
  const v = model.version;
  const relSer = read.rel("Core/Serialize.lua") || "";
  const reasons = [...relSer.matchAll(/return nil, "([^"]+)"/g)].map((m) => m[1]);
  const relModules = read.rel("Core/Modules.lua") || "";
  const failLine = grab(relModules, /string\.format\("(module %s failed to load: %s)"/);
  const nextSlash = read.next("Core/Slash.lua") || "";
  const fixedBuild = grab(nextSlash, /local FIXED_BUILD = (\d+)/);
  const buildWarn = grab(nextSlash, /"  ·  (update the game: [^"]+)"/);
  const noSnip = grab(nextSlash, /"  ·  (secure snippets: no \(hover keys off\))"/);
  const setupCombat = model.next.setup?.combat;
  const profReset = grab(read.rel("Core/Slash.lua"), /OfferReload\("Profile " \.\. ns\.ProfileName\(\) \.\. " (is back to defaults\.)"\)/);
  const entry = (id, q, a, extra = "") => `<section class="card" id="${id}" style="margin-bottom:10px"><h3 style="margin-top:0">${q} ${extra}</h3>${a}</section>`;
  return {
    path: "/help/",
    title: "Troubleshooting & FAQ",
    description: "Fixes for common ForeverUI problems, using the addon's own commands and messages.",
    body: `<h1>Troubleshooting &amp; FAQ</h1>
<p class="lede">Most problems have a quick fix with a <code>/fui</code> command. If yours isn't here, or the fix doesn't help, please <a href="/feedback/">report it</a>.</p>
${nextNotice(model)}
<h2>In v${esc(v)} (the current download)</h2>
${entry("frame-moved", "A frame is off-screen or in the wrong place", `<p><code>/fui frames</code> lists the movable frames. <code>/fui reset &lt;frame&gt;</code> puts one back at its default spot; <code>/fui reset all</code> (or <strong>Reset all positions</strong> under <strong>General → Layout</strong>) puts every frame back.</p>`)}
${entry("look", "Colors or fonts look wrong", `<p><code>/fui theme reset</code> (or <strong>Reset theme</strong> under <strong>General → Look</strong>) puts every theme setting back to default. <code>/fui accent reset</code> resets just the accent color.</p>`)}
${entry("one-feature", "One part of ForeverUI misbehaves", `<p>Type <code>/fui modules</code> to list the modules, then <code>/fui disable &lt;module&gt;</code> and <code>/reload</code>. That part goes back to the game's own version (“A module that's off builds nothing and costs nothing.”). <code>/fui enable &lt;module&gt;</code> and <code>/reload</code> bring it back. Please <a href="/feedback/">report</a> what went wrong.</p>`)}
${entry("broken", "Everything is broken", `<p><code>/fui profile reset</code> puts the profile you're using back to defaults (“Profile &lt;name&gt; ${esc(profReset || "is back to defaults.")}”) and offers a reload. To test without losing your settings, switch to a new profile instead: <code>/fui profile Test</code>. See <a href="/profiles/">Profiles</a>.</p>`)}
${failLine ? entry("failed-to-load", "Chat says a module “failed to load”", `<p>In v${esc(v)}, when a module hits an error while it starts, ForeverUI prints <code>${esc(failLine.replace(/%s/g, "…"))}</code> and keeps loading the others. Turn that module off (above) to get the game's version back, and include the whole line in your report: see <a href="/feedback/">Feedback</a>.</p>`) : ""}
${entry("import", "Import failed", `<p>When an import string can't be used, ForeverUI says “Import failed:” and one of these reasons:</p><ul>${reasons.map((r) => `<li>“${esc(r)}”</li>`).join("")}</ul><p>Most often the string was cut off when it was copied or pasted: export it again and copy all of it.</p>`)}
${entry("health-hidden", "Some values don't show in instances", `<p>The game client hides some values from addons, for example in instanced combat. The addon's README says those values “go to the bars unread”: the bars still work, but ForeverUI can't show a number it isn't allowed to read. This is expected.</p>`)}
${entry("combat", "Something won't change during a fight", `<p>Unlocking frames doesn't work in combat: try again once combat ends. Other changes ForeverUI can't make during a fight wait until it ends; the second line of <code>/fui status</code> counts the “change(s) waiting on combat”.</p>`)}
${entry("reload", "A setting didn't change anything", `<p>Settings marked <span class="badge reload">Needs reload</span> on the <a href="/settings/">Settings</a> page apply after a reload. Click <strong>Reload now</strong> in the options window, or type <code>/reload</code>.</p>`)}
${fixedBuild || noSnip || setupCombat ? `<h2>Game builds, and help coming in the next release</h2>` : ""}
${fixedBuild ? entry("settings-lost", "My settings reset every time I start the game", `<p>The addon's code notes that WoW Forever beta builds older than ${esc(fixedBuild)} lose addon settings at every launch and break secure frames (raid frames, click casting, bar paging). Update the game. In the next release, <code>/fui status</code> warns about it: “${esc(buildWarn || "")}”.</p>`) : ""}
${noSnip ? entry("hover-keys", "Hover keys don't work", `<p>In the next release, <code>/fui status</code> shows “${esc(noSnip)}” when the client can't run secure snippets (a WoW Forever beta bug). Hover keys are then turned off, but mouse click casting still works.</p>`, NEXT) : ""}
${setupCombat ? entry("setup", "The setup wizard didn't open", `<p>The wizard is in the next release. It opens once per account, and waits if you're in combat (“${esc(setupCombat)}”). <code>/fui setup</code> opens it again.</p>`, NEXT) : ""}
${entry("errors-badge", "A red number on the addons button", `<p>In the next release, that's how many errors ForeverUI caught this session. <code>/fui errors</code> lists them for a bug report, and <code>/fui errors clear</code> empties the list.</p>`, NEXT)}
${entry("perf", "Is ForeverUI slowing my game down?", `<p>In the next release, <code>/fui perf</code> shows ForeverUI's CPU and memory now; <code>/fui perf cpu</code> turns the game's CPU profiling on or off (after a reload), and <code>/fui perf watch</code> prints them every minute. No performance numbers are published yet.</p>`, NEXT)}
<h2>Known issues</h2>
<p>None confirmed yet: nothing has been checked in game. Problems confirmed by players will be listed here.</p>
${src("Core/Slash.lua", "Core/Modules.lua", "Core/Serialize.lua", "Core/Setup.lua", "README.md")}`,
  };
}

// ------------------------------------------------------------------ Feedback

export function feedbackPage(model, read) {
  const v = model.version;
  const relStatusLines = (grab(read.rel("Core/Slash.lua"), /local function statusCommand\(\)([\s\S]*?)\nend/) || "").match(/chat\(/g)?.length || 0;
  const nextStatusLines = (grab(read.next("Core/Slash.lua"), /local function statusCommand\(\)([\s\S]*?)\nend/) || "").match(/chat\(/g)?.length || 0;
  const relErrors = model.commands.relKeys.has("errors");
  const failLine = grab(read.rel("Core/Modules.lua"), /string\.format\("(module %s failed to load: %s)"/);
  const quote = earlyQuote(model.rel.readme) || earlyQuote(model.next.readme);
  const bugTemplate = `ForeverUI bug report
What I did:
What I expected:
What happened instead:

/fui status (paste every line):

/fui errors (paste every line; on ${v}, paste any "failed to load" line from chat instead):

Screenshot attached: yes / no
Screen resolution and UI scale (if you know them):`;
  const featureTemplate = `ForeverUI feature request
What I want:
Which part of ForeverUI it touches (a module from the Features page, a command, or a setting):
Why it would help me:
Screenshot or mock-up (attach it, if you have one):`;
  return {
    path: "/feedback/",
    title: "Feedback",
    description: "Report a ForeverUI bug or request a feature.",
    body: `<h1>Feedback</h1>
<p class="lede">ForeverUI is an early release${quote ? `, and in its own words: “${esc(quote)}”` : "."} There are two ways to help.</p>
<div class="notice todo" role="note"><p><strong>Coming soon: where to send reports.</strong> The place to send bug reports and feature requests hasn't been set up yet. Until it is, get your report ready with the steps below, and keep it: this page will say where to send it.</p></div>
<div class="grid two">
<section class="card" aria-labelledby="bug">
<h2 id="bug" style="margin-top:0">Report a bug</h2>
<ol class="steps">
  <li><strong>Write down what you did</strong>, what you expected, and what happened instead.</li>
  <li><strong>Type <code>/fui status</code></strong> and copy all of its lines. In v${esc(v)} it prints ${relStatusLines} lines: the version, profile and module count, then skins, painted frames and changes waiting on combat.${nextStatusLines > relStatusLines ? ` ${NEXT} prints ${nextStatusLines}, adding the client, what it has, and your UI scale and text size.` : ""}</li>
  <li><strong>${relErrors ? "Type <code>/fui errors</code>" : "Copy any error lines"}</strong>${relErrors ? " and copy all of it." : `. v${esc(v)} has no <code>/fui errors</code> yet; if chat showed ${failLine ? `“${esc(failLine.replace(/%s/g, "…"))}”` : "an error"}, copy that whole line. ${NEXT} <code>/fui errors</code> lists the errors ForeverUI caught this session, with stacks and counts, ready for a bug report.`}</li>
  <li><strong>Take a screenshot</strong> with <kbd>Print Screen</kbd>. The files land in the game's Screenshots folder.</li>
</ol>
<p class="small">Can't copy text from chat? A screenshot of the chat lines works too. ${model.commands.nextKeys.has("copy") && !model.commands.relKeys.has("copy") ? `In the next release, <code>/fui copy</code> opens the recent chat as plain text, ready to copy.` : ""}</p>
<h3>Bug report template</h3>
<pre class="template" id="bug-template">${esc(bugTemplate)}</pre>
<button class="copy" type="button" data-copy-from="#bug-template" aria-label="Copy the bug report template">Copy template</button>
</section>
<section class="card" aria-labelledby="feature">
<h2 id="feature" style="margin-top:0">Request a feature</h2>
<p>Tell us what would make ForeverUI better for you. Please answer:</p>
<ol class="steps">
  <li><strong>What you want.</strong></li>
  <li><strong>Which part of ForeverUI it touches</strong>: a module from <a href="/features/">Features</a>, a <a href="/commands/">command</a> or a <a href="/settings/">setting</a>.</li>
  <li><strong>Why it would help you.</strong></li>
  <li><strong>A screenshot or mock-up</strong>, if you have one.</li>
</ol>
<div class="notice info"><p><strong>Reviewed, not promised.</strong> Every request is read and considered, but there's no promise that it will be built, or when.</p></div>
<h3>Feature request template</h3>
<pre class="template" id="feature-template">${esc(featureTemplate)}</pre>
<button class="copy" type="button" data-copy-from="#feature-template" aria-label="Copy the feature request template">Copy template</button>
<p class="small" style="margin-top:12px">Before you ask, check <a href="/features/">Features</a>: some things are already written and marked <span class="badge next">Next release</span>.</p>
</section>
</div>
${src("Core/Slash.lua (status, errors)", "Core/Modules.lua", "docs/SMOKE-TEST.md (Report block)", "README.md")}`,
  };
}

// ------------------------------------------------------------------ Changelog

// PR titles from an auto-generated release body, without links or authors.
function notesOf(body) {
  return [...(body || "").matchAll(/^\*\s+(.+?)\s+by\s+@\S+\s+in\s+\S+\s*$/gm)].map((m) => m[1]);
}

export function changelogPage(model) {
  const v = model.version;
  const newMods = model.modules.filter((m) => m.inNext && !m.inRel);
  const newCmds = model.commands.entries.filter((e) => e.inNext && !e.inRel && !e.special);
  const changedCmds = model.commands.entries.filter((e) => e.changed);
  const newPages = model.pages.filter((p) => p.inNext && !p.inRel);
  const rels = model.releases.releases.slice().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return {
    path: "/changelog/",
    title: "Changelog",
    description: "What changed in each ForeverUI release, newest first.",
    body: `<h1>Changelog</h1>
<p class="lede">Newest first. Each release lists the changes that went into it.</p>
${model.same ? "" : `<section class="card" aria-labelledby="next-h">
<h2 id="next-h" style="margin-top:0">Next release ${NEXT}</h2>
<p>Not released yet, so there's no version number or date. This is what the addon's source holds today that the v${esc(v)} download doesn't, worked out from the code itself:</p>
<h3>${newMods.length} new modules</h3>
<ul>${newMods.map((m) => `<li><a href="/features/#${m.id}">${esc(m.name)}</a>: ${esc(m.desc)}</li>`).join("")}</ul>
<h3>${newCmds.length} new commands</h3>
<ul>${newCmds.map((e) => `<li><a href="/commands/#cmd-${esc(e.keys[0])}"><code>/fui ${esc(e.keys.join(" | "))}</code></a></li>`).join("")}</ul>
${changedCmds.length ? `<h3>Changed commands</h3><ul>${changedCmds.map((e) => `<li><code>/fui ${esc(e.keys.join(" | "))}</code>: new help text, see <a href="/commands/#cmd-${esc(e.keys[0])}">Commands</a></li>`).join("")}</ul>` : ""}
${newPages.length ? `<h3>New options pages</h3><ul>${newPages.map((p) => `<li><a href="/settings/#${p.id}">${esc(p.title)}</a></li>`).join("")}</ul>` : ""}
</section>`}
${rels.map((r) => {
  const notes = notesOf(r.body);
  const asset = r.assets.find((a) => /\.zip$/.test(a.name));
  return `<section aria-labelledby="rel-${esc(r.tagName)}">
<h2 id="rel-${esc(r.tagName)}">${esc(r.tagName)} <span class="small">· ${esc(dateET(r.publishedAt))}</span>${r.tagName === model.release.tag ? ` <span class="badge rel">Current download</span>` : ""}</h2>
${notes.length ? `<ul>${notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : "<p>No notes.</p>"}
${asset ? `<p class="small">${esc(asset.name)}, ${asset.size.toLocaleString("en-US")} bytes${r.tagName === model.release.tag ? ` · <a href="/download/${esc(asset.name)}" download>download</a>` : " · older versions aren't offered for download"}</p>` : ""}
</section>`;
}).join("\n")}
<p class="small">Release notes list the titles of the changes merged for each release, from the addon's GitHub releases.</p>`,
  };
}

// ------------------------------------------------------------------ Credits

// A README section's body ("## Credits" -> text up to the next heading).
function section(readme, name) {
  const m = readme.match(new RegExp(`^## ${name}\\s*\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"));
  return m ? m[1].trim() : "";
}

export function creditsPage(model) {
  const lic = model.rel.license.split("\n").slice(0, 3).filter(Boolean);
  const relLicense = section(model.rel.readme, "License");
  const nextCredits = section(model.next.readme, "Credits");
  const nextLicense = section(model.next.readme, "License");
  const bullets = nextCredits.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2).replace(/,?\s*https?:\/\/[^\s:,)]+/g, ""));
  return {
    path: "/credits/",
    title: "Credits & license",
    description: "ForeverUI's license and the fonts, libraries and art it uses.",
    body: `<h1>Credits &amp; license</h1>
<h2 id="license">ForeverUI</h2>
<p><strong>${esc(lic[0] || "")}</strong>. ${esc(lic[1] || "")}.</p>
<p>From the v${esc(model.version)} README:</p>
<blockquote class="card prose"><p>${md(relLicense)}</p></blockquote>
${nextLicense && nextLicense !== relLicense ? `<p>The next release ${NEXT} also bundles shared libraries; its README says:</p><blockquote class="card prose"><p>${md(nextLicense)}</p></blockquote>` : ""}
${bullets.length ? `<h2 id="credits">Fonts, libraries and art</h2><p>As listed in the addon's README for the next release:</p><ul>${bullets.map((b) => `<li>${md(b)}</li>`).join("")}</ul>` : ""}
<h2 id="site">This website</h2>
<p>This site uses Fira Sans Condensed, the same font as the addon, under the SIL Open Font License 1.1: <a href="/fonts/OFL.txt">license text</a>. Its colors are ForeverUI's own theme colors.</p>
<p>ForeverUI is a fan addon for WoW Forever.</p>
${src("LICENSE", "README.md (License, Credits)", "Media/Fonts/OFL.txt")}`,
  };
}
