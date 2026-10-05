// Profiles & sharing, Troubleshooting & FAQ, Feedback, Changelog, Credits.
// Messages in quotes are copied from the addon's Lua; each section names its
// source file. Where the current release and the next release differ, the
// page says which is which.
import { esc, md, badge } from "./html.mjs";
import { src, dateET, nextNotice, says, saysIf, label } from "./pages-main.mjs";

const NEXT = `<span class="badge next">Next release</span>`;

// A string literal from a file, by a regex with one capture group (null when absent).
function grab(text, re) {
  const m = (text || "").match(re);
  return m ? m[1] : null;
}

// ------------------------------------------------------------------ Profiles

// Profiles & sharing. Plain player language only: every button, label and message is
// quoted from the addon (says() and label() stop the build when the addon's text changes).
export function profilesPage(model, read) {
  const v = model.version;
  const f = {
    slash: "Core/Slash.lua", prof: "Core/Profiles.lua", opt: "Core/Options.lua", list: "Core/OptionsProfiles.lua",
    dlg: "Core/Dialog.lua", db: "Core/DB.lua", ser: "Core/Serialize.lua", cco: "Modules/ClickCastOptions.lua", cc: "Modules/ClickCast.lua",
  };
  const N = Object.fromEntries(Object.entries(f).map(([k, file]) => [k, read.next(file) || ""]));
  const R = Object.fromEntries(Object.entries(f).map(([k, file]) => [k, read.rel(file) || ""]));
  const q = (k, ...p) => says(N[k], f[k], ...p);
  const qr = (k, ...p) => saysIf(R[k], f[k], ...p);
  const L = (k, name) => label(N[k], f[k], name);
  const name = { v: "name" };
  const reloadAsk = q("dlg", " Reload the UI now to apply it?");
  const reloadBtns = `<strong>${L("dlg", "Reload")}</strong> or <strong>${L("dlg", "Later")}</strong>`;
  // What's new since the current release.
  const staged = !qr("slash", "This character will use profile ");
  const listNew = !R.list;
  const relUse = qr("opt", '"Use " .. name');
  const relImport = qr("prof", "Imported as profile ", name, " and switched to it.");
  const displayNew = !qr("prof", "This profile was made at UI scale");
  const editNew = !qr("prof", "Edit Mode layout ");
  const specCardNew = !qr("slash", "This client has no specializations");
  const shareNew = !/shareBuilder/.test(R.cco);
  const nb = (isNew) => (isNew ? ` ${NEXT}` : "");
  const uiQ = q("prof", "This profile was made at UI scale %d%%%s (yours: %d%%). Use its UI scale?")
    .replace("%d%%%s", "&lt;its scale&gt;% on a &lt;width&gt; x &lt;height&gt; screen").replace("%d%%", "&lt;yours&gt;%");
  const defaultName = (N.db.match(/local DEFAULT_PROFILE = "([^"]+)"/) || [])[1];
  if (!defaultName) throw new Error(`${f.db}: the first profile's name not found in the addon source`);
  return {
    path: "/profiles/",
    title: "Profiles & sharing",
    description: "Share one ForeverUI layout across characters, or move it to another PC.",
    body: `<h1>Profiles &amp; sharing</h1>
<p class="lede">A profile holds all of ForeverUI's settings and frame positions. Profiles are saved for your whole account, and each character uses one of them. The first one is called <strong>${esc(defaultName)}</strong>.</p>
${nextNotice(model)}
<h2 id="which">See which profile you're using</h2>
<ul>
  <li>Type <code>/fui profile</code>. Chat answers “${q("slash", "Profile: ")}${esc(defaultName)}${q("slash", "   (all: ")}…)”, with every profile on your account.${staged ? ` ${NEXT} When you've picked another profile that's waiting for a reload, it adds that one: “Profile: ${esc(defaultName)}; &lt;name&gt;${q("slash", " after a reload")}   (all: …)”.` : ""}</li>
  <li>Or open <strong>/fui → Profiles</strong>. At the top it says “${q("opt", "This character uses ")}${esc(defaultName)}.”${staged ? ` ${NEXT} While a switch is waiting for a reload it says “This character uses ${esc(defaultName)}${q("opt", " until you reload, then ")}&lt;name&gt;.”` : ""}</li>
</ul>

<h2 id="same-account">Use one layout on several characters</h2>
<p>Log in on each character and pick the same profile, in chat or on the Profiles page.</p>
<ul>
  <li>Type <code>/fui profile &lt;name&gt;</code>. If there's no profile with that name yet, ForeverUI makes it. ${q("slash", "Profile names are 1-32 letters, digits, spaces, - or _.")}</li>
  ${relUse ? `<li>In v${esc(v)}, the Profiles page has a <strong>Use &lt;name&gt;</strong> button for each of your other profiles (up to five), under <strong>Switch profile</strong>.${listNew ? ` The next release replaces them with a list (below).` : ""}</li>` : ""}
</ul>
${staged ? `<p>In v${esc(v)}, switching happens straight away and ForeverUI offers a reload: “${qr("slash", "This character now uses profile ") || ""}&lt;name&gt;.${reloadAsk}”</p>
<p>${NEXT} A new profile takes effect at your next reload. Until then the frames on screen still belong to the profile you were using, so anything you change goes into that one. ForeverUI asks: “${q("slash", "This character will use profile ", name, " after the reload.")}${reloadAsk}” Click ${reloadBtns}. If you pick the profile you're already using, it says “${q("slash", "This character already uses profile ", name, ".")}”</p>` : `<p>A new profile takes effect at your next reload. Until then the frames on screen still belong to the profile you were using, so anything you change goes into that one. ForeverUI asks: “${q("slash", "This character will use profile ", name, " after the reload.")}${reloadAsk}” Click ${reloadBtns}.</p>`}

<h3 id="profile-list">The list on the Profiles page${nb(listNew)}</h3>
<p>Under <strong>${L("opt", "Your profiles")}</strong>, each profile has a row with its name and buttons:</p>
<ul>
  <li><strong>${L("list", "Use")}</strong>: this character switches to that profile at your next reload.</li>
  <li><strong>${L("list", "Copy here")}</strong>: copies that profile's settings over the profile you're using.</li>
  <li><strong>${L("list", "Delete")}</strong>: deletes that profile.</li>
</ul>
<p><strong>${L("list", "Copy here")}</strong> and <strong>${L("list", "Delete")}</strong> can't be undone, so the first click only changes the button to “${q("list", "Sure?")}”. Click again to do it.</p>
<p>Next to the names you'll see “${q("list", "(in use)")}”, or, while a switch waits for a reload, “${q("list", "(in use until reload)")}” on the profile you're using now and “${q("list", "(after reload)")}” on the one that takes over. The profile that takes over has no buttons. The one you're using now only has <strong>${L("list", "Use")}</strong>, which cancels the switch.</p>
<p>At the bottom, type a name in the <strong>${L("list", "New profile")}</strong> box and click <strong>${L("list", "Create")}</strong> (or press <kbd>Enter</kbd>). The new profile is empty, and this character switches to it at your next reload. If the name is already used or has characters that aren't allowed, the box says “${q("list", "Name taken or not allowed")}”.</p>

<h3 id="manage">Manage profiles in chat</h3>
<div class="table-wrap"><table class="stack"><thead><tr><th scope="col">Type</th><th scope="col">What it does</th><th scope="col">Chat says</th></tr></thead><tbody>
<tr><td data-label="Type"><code>/fui profile new &lt;name&gt;</code></td><td data-label="What it does">Makes an empty profile. You stay on the one you're using.</td><td data-label="Chat says">“${q("slash", "Created profile ", name, ".")}” or “${q("slash", "That name is taken or not allowed.")}”</td></tr>
<tr><td data-label="Type"><code>/fui profile copy &lt;name&gt;</code></td><td data-label="What it does">Copies that profile's settings over the one you're using, then offers a reload.</td><td data-label="Chat says">“${q("slash", "Copied ", name, " into ")}&lt;your profile&gt;.${reloadAsk}” or “${q("slash", "No other profile called ", name, ".")}”</td></tr>
<tr><td data-label="Type"><code>/fui profile delete &lt;name&gt;</code></td><td data-label="What it does">Deletes a profile. You can't delete the one you're using${staged ? `. ${NEXT} You also can't delete the one waiting for a reload` : ", or the one waiting for a reload"}.</td><td data-label="Chat says">“${q("slash", "Deleted profile ", name, ".")}” or “${q("slash", "Can't delete that one (missing, or in use).")}”</td></tr>
<tr><td data-label="Type"><code>/fui profile reset</code></td><td data-label="What it does">Puts every setting in the profile you're using back to its default, then offers a reload.</td><td data-label="Chat says">“Profile &lt;your profile&gt;${q("slash", " is back to defaults.")}${reloadAsk}”</td></tr>
</tbody></table></div>
<p>On the Profiles page, <strong>${L("opt", "Reset profile")}</strong> does the same as <code>/fui profile reset</code>, straight away and without asking first. The options window then shows its <strong>Reload now</strong> button.</p>

<h2 id="share">Move a profile to another account or PC</h2>
<p>You copy your profile out as a line of text, and paste that text into ForeverUI on the other PC.</p>
<ol class="steps">
  <li><strong>Export.</strong> Click <strong>${L("opt", "Export profile")}</strong> on the Profiles page, or type <code>/fui export</code>. A window opens with the text already selected. Its title says “${q("opt", "ForeverUI export  Ctrl+C to copy")}” (with <code>/fui export</code>: “${q("slash", "ForeverUI export (")}profile &lt;name&gt;)${q("slash", "  Ctrl+C to copy")}”). Press <kbd>Ctrl</kbd>+<kbd>C</kbd> to copy it, then click <strong>${L("dlg", "Close")}</strong>.</li>
  <li><strong>Send it to yourself</strong> in any way you like, as long as the whole text arrives.</li>
  <li><strong>Import.</strong> On the other PC, click <strong>${L("opt", "Import")}</strong> on the Profiles page or type <code>/fui import</code>. A window titled “${q("slash", "Paste a ForeverUI string, then Import")}” opens. Paste with <kbd>Ctrl</kbd>+<kbd>V</kbd> and click <strong>${L("dlg", "Import")}</strong>.</li>
</ol>
<h3 id="import-whole">What importing a whole profile does</h3>
<p>The profile is saved as a new profile called “Imported”. If you already have one with that name, it's called “Imported 2”, then “Imported 3”, and so on. Nothing you already have is overwritten.</p>
${relImport ? `<p>In v${esc(v)}, this character switches to it straight away (“Imported as profile Imported and switched to it.”), and ForeverUI offers a reload.</p>` : ""}
<ol class="steps">
  <li>${displayNew ? `${NEXT} ` : ""}If the string has the UI scale it was made at, ForeverUI asks first, for example: “${uiQ}” Click <strong>${q("prof", "Use it")}</strong> to switch to that UI scale (it changes once you're out of combat), or <strong>${L("dlg", "No")}</strong> to keep yours. If the string doesn't say what screen it was made on, the question leaves out the screen part.</li>
  <li>${staged ? `${NEXT} ` : ""}Then it asks: “${q("prof", "Imported as profile ")}Imported${q("prof", "; this character will use it after a reload.")}${reloadAsk}” Click ${reloadBtns}.</li>
</ol>
<h3 id="import-module">Just one module</h3>
<p><code>/fui export &lt;module&gt;</code> copies just one module's settings (the module names are on <a href="/features/">Features</a> and in <code>/fui modules</code>). Importing that text replaces that module's settings in the profile you're using: “${q("prof", "Imported ")}&lt;module&gt;${q("prof", " settings into profile ")}&lt;your profile&gt;.${reloadAsk}” If that module has nothing saved yet, export says “${q("slash", "Nothing to export: ")}${q("prof", "nothing saved for ")}&lt;module&gt;${q("prof", " yet")}.”</p>

<h3 id="string">What's in the text</h3>
<ul>
  <li>It starts with <code>${q("ser", "FUI1")}:</code>. ForeverUI only reads settings from it and never runs anything in it. A built-in check notices when part of the text is missing.</li>
  <li>The settings and frame positions saved in the profile.</li>
  <li>The profile's own settings, never a temporary change from Situations that happens to be active.${nb(!qr("prof", "Situations"))}</li>
  <li>${displayNew ? `${NEXT} ` : ""}For a whole profile, the UI scale (to the nearest percent) and the screen size it was made on.</li>
  <li>${editNew ? `${NEXT} ` : ""}The name of the game's Edit Mode layout that goes with the profile (see below).</li>
</ul>
<p>If the text can't be used, chat says “${q("slash", "Import failed: ")}” and the reason. The reasons are listed under <a href="/help/#import">Troubleshooting</a>.</p>

<h2 id="edit-mode">The game's Edit Mode layout${nb(editNew)}</h2>
<p>A profile remembers which of the game's Edit Mode layouts you use with it. When a character loads a different profile than last time (a switch, an import, or a specialization profile), ForeverUI switches Edit Mode to that layout once you're out of combat and says “${q("prof", "Edit Mode layout ", { v: "layout" }, ", from profile ", name, ".")}”</p>
<p>If your account has no Edit Mode layout with that name, nothing changes, and chat says “Profile &lt;name&gt; ${q("prof", " uses Edit Mode layout ").trim()} &lt;layout&gt;${q("prof", ", which this account doesn't have.")}” Make a layout with that name in Edit Mode if you want it.</p>

<h2 id="click-casting">Click-casting bindings${nb(shareNew)}</h2>
<p>Click-casting bindings aren't part of a profile. They're saved per character and per specialization, so importing a profile doesn't change them. They have their own sharing, under <strong>/fui → Click casting → ${L("cco", "Share")}</strong>:</p>
<ul>
  <li><strong>${L("cco", "Export")}</strong> opens a window titled “${q("cco", "Click-casting bindings")}” with the text to copy (<kbd>Ctrl</kbd>+<kbd>C</kbd>).</li>
  <li><strong>${L("cco", "Import")}</strong> opens “${q("cco", "Paste a click-casting string")}”. Paste and click <strong>${L("dlg", "Import")}</strong>. It <strong>replaces</strong> the bindings for this character (and this specialization) and says “${q("cco", "Imported ", { v: "number" }, " click-casting bindings.")}” If the text isn't right it says “${q("cco", "Can't import: ")}&lt;reason&gt;.”, for example “${q("cc", "not a click-casting string")}” when you paste a profile instead.</li>
  <li>On game clients with specializations there's also <strong>${q("cco", "Copy to spec...")}</strong>, which copies your bindings over another spec's: “${q("cco", "Click-casting bindings copied to spec ")}&lt;number&gt;.” WoW Forever has no specializations, so it doesn't show there.</li>
</ul>

<h2 id="spec">Profiles by specialization</h2>
<p>This only works on game clients that have specializations. WoW Forever has none, so there <code>/fui spec</code> answers “${q("slash", "This client has no specializations, so profiles don't switch by spec.")}” and the Profiles page has no <strong>${L("opt", "Specialization")}</strong> section.${nb(specCardNew)}${specCardNew && qr("slash", "No specialization on this character yet.") ? ` In v${esc(v)}, <code>/fui spec</code> answers “${qr("slash", "No specialization on this character yet.")}” instead, and the <strong>Specialization</strong> section still shows.` : ""}</p>
<p>On a client that has them:</p>
<ul>
  <li><code>/fui spec &lt;profile&gt;</code>, or <strong>${L("opt", "Use this profile for this spec")}</strong> on the Profiles page, makes your current specialization use that profile. <code>/fui spec off</code> or <strong>${L("opt", "Stop spec switching")}</strong> stops it. <code>/fui spec</code> on its own says which profile your spec uses.</li>
  <li>When you change specialization, ForeverUI asks: “${q("prof", "Your specialization uses profile ", name, ".")}${reloadAsk}” When you log in, it uses your spec's profile without asking.</li>
  <li>A character with no specialization yet gets “${q("slash", "No specialization on this character yet.")}”</li>
</ul>

<h2 id="account-wide">Shared by every character on your account${nb(!read.rel("Modules/VendorMemory.lua") && !read.rel("Modules/AuctionPrices.lua"))}</h2>
<p>These aren't part of any profile, and every character on your account shares them: vendor memory (which merchants sell what) and auction house prices.</p>`,
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
<h2>In v${esc(v)} (the current release)</h2>
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
<p>No known issues have been confirmed yet. ForeverUI is an early release: parts have been tested in game, and some features are still being polished, so if something looks off, please tell us on the <a href="/feedback/">Feedback page</a>.</p>
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
<p class="lede">ForeverUI is an early release. Parts have been tested in game, and some features are still being polished, so if something looks off, please tell us on the <a href="/feedback/">Feedback page</a>. There are two ways to help.</p>
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
<p>Not released yet, so there's no version number or date. This is what the addon's source holds today that v${esc(v)} doesn't, worked out from the code itself:</p>
<h3>${newMods.length} new modules</h3>
<ul>${newMods.map((m) => `<li><a href="/features/#${m.id}">${esc(m.name)}</a>: ${esc(m.desc)}</li>`).join("")}</ul>
<h3>${newCmds.length} new commands</h3>
<ul>${newCmds.map((e) => `<li><a href="/commands/#cmd-${esc(e.keys[0])}"><code>/fui ${esc(e.keys.join(" | "))}</code></a></li>`).join("")}</ul>
${changedCmds.length ? `<h3>Changed commands</h3><ul>${changedCmds.map((e) => `<li><code>/fui ${esc(e.keys.join(" | "))}</code>: new help text, see <a href="/commands/#cmd-${esc(e.keys[0])}">Commands</a></li>`).join("")}</ul>` : ""}
${newPages.length ? `<h3>New options pages</h3><ul>${newPages.map((p) => `<li><a href="/settings/#${p.id}">${esc(p.title)}</a></li>`).join("")}</ul>` : ""}
</section>`}
${rels.map((r) => {
  const notes = notesOf(r.body);
  return `<section aria-labelledby="rel-${esc(r.tagName)}">
<h2 id="rel-${esc(r.tagName)}">${esc(r.tagName)} <span class="small">· ${esc(dateET(r.publishedAt))}</span>${r.tagName === model.release.tag ? ` <span class="badge rel">Current release</span>` : ""}</h2>
${notes.length ? `<ul>${notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : "<p>No notes.</p>"}
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

export function creditsPage(model, site) {
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
<p>ForeverUI is made by ${esc(site.author)}.</p>
<p>This site uses Fira Sans Condensed, the same font as the addon, under the SIL Open Font License 1.1: <a href="/fonts/OFL.txt">license text</a>. Its colors are ForeverUI's own theme colors.</p>
<p>ForeverUI is a fan addon for WoW Forever.</p>
${src("LICENSE", "README.md (License, Credits)", "Media/Fonts/OFL.txt")}`,
  };
}
