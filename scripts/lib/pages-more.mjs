// Profiles & sharing, Troubleshooting & FAQ, Feedback, Changelog, Credits.
// Messages in quotes are copied from the addon's Lua; each section names its
// source file. Where the current release and the next release differ, the
// page says which is which.
import { esc, md, badge, pageHero } from "./html.mjs";
import { src, dateET, nextNotice, says, saysIf, label } from "./pages-main.mjs";
import { FACTS, SECTIONS } from "./help-content.mjs";
import { RELEASE_NOTES, NEXT_RELEASE } from "./changelog-content.mjs";
import { AREAS } from "./model.mjs";
import { LIMITS, FALLBACK_AREAS } from "../../src/feedback/fields.js";

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
  // The string's prefix, read from the exact line that writes it.
  const fuiPrefix = (N.ser.match(/string\.format\("(FUI1:)%s:%s:%s", scope, S\.Checksum\(body\), body\)/) || [])[1];
  if (!fuiPrefix) throw new Error(`${f.ser}: the export string format not found in the addon source`);
  // Exports leave out an active Situations override: the export call, and the module's own name.
  const OWN = "if ns.OwnValues then return ns.OwnValues(encode, scope) end";
  q("prof", OWN);
  says(N.opt, f.opt, 'Situations = { "Situations",');
  const ownNew = !R.prof.includes(OWN);
  const relReloadUI = saysIf(read.rel("Core/Dialog.lua") || "", f.dlg, "ReloadUI()");
  const uiQ = q("prof", "This profile was made at UI scale %d%%%s (yours: %d%%). Use its UI scale?")
    .replace("%d%%%s", "&lt;its scale&gt;% on a &lt;width&gt; x &lt;height&gt; screen").replace("%d%%", "&lt;yours&gt;%");
  const defaultName = (N.db.match(/local DEFAULT_PROFILE = "([^"]+)"/) || [])[1];
  if (!defaultName) throw new Error(`${f.db}: the first profile's name not found in the addon source`);
  return {
    path: "/profiles/",
    title: "Profiles & sharing",
    description: "Share one ForeverUI layout across characters, or move it to another PC.",
    body: `${pageHero("Profiles &amp; sharing", `A profile holds all of ForeverUI's settings and frame positions. Profiles are saved for your whole account, and each character uses one of them. The first one is called <strong>${esc(defaultName)}</strong>.`)}
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
${relReloadUI ? `<p>In v${esc(v)}, if the <strong>Reload</strong> button doesn't reload, type <code>/reload</code> in chat: that release's button asks the game to reload directly, and WoW Forever blocks that for addons. See <a href="/help/#reload">Troubleshooting</a>.</p>` : ""}
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
${relImport ? `<p>In v${esc(v)}, this character switches to it straight away (“Imported as profile Imported and switched to it.”), and ForeverUI offers a reload (type <code>/reload</code> in chat if its button doesn't reload).</p>` : ""}
<ol class="steps">
  <li>${displayNew ? `${NEXT} ` : ""}If the string has the UI scale it was made at, ForeverUI asks first, for example: “${uiQ}” Click <strong>${q("prof", "Use it")}</strong> to switch to that UI scale (it changes once you're out of combat), or <strong>${L("dlg", "No")}</strong> to keep yours. If the string doesn't say what screen it was made on, the question leaves out the screen part.</li>
  <li>${staged ? `${NEXT} ` : ""}Then it asks: “${q("prof", "Imported as profile ")}Imported${q("prof", "; this character will use it after a reload.")}${reloadAsk}” Click ${reloadBtns}.</li>
</ol>
<h3 id="import-module">Just one module</h3>
<p><code>/fui export &lt;module&gt;</code> copies just one module's settings (the module names are on <a href="/features/">Features</a> and in <code>/fui modules</code>). Importing that text replaces that module's settings in the profile you're using: “${q("prof", "Imported ")}&lt;module&gt;${q("prof", " settings into profile ")}&lt;your profile&gt;.${reloadAsk}” If that module has nothing saved yet, export says “${q("slash", "Nothing to export: ")}${q("prof", "nothing saved for ")}&lt;module&gt;${q("prof", " yet")}.”</p>

<h3 id="string">What's in the text</h3>
<ul>
  <li>It starts with <code>${esc(fuiPrefix)}</code>. ForeverUI only reads settings from it and never runs anything in it. A built-in check notices when part of the text is missing.</li>
  <li>The settings and frame positions saved in the profile.</li>
  <li>The profile's own settings, never a temporary change from <strong>Situations</strong> that happens to be active.${nb(ownNew)}</li>
  <li>${displayNew ? `${NEXT} ` : ""}For a whole profile, the UI scale (to the nearest percent) and the screen size it was made on.</li>
  <li>${editNew ? `${NEXT} ` : ""}Where your client supports Edit Mode, the name of the game's Edit Mode layout that goes with the profile (see below).</li>
</ul>
<p>If the text can't be used, chat says “${q("slash", "Import failed: ")}” and the reason. The reasons are listed under <a href="/help/#import">Troubleshooting</a>.</p>

<h2 id="edit-mode">The game's Edit Mode layout${nb(editNew)}</h2>
<p>Where your client supports Edit Mode, a profile remembers which of the game's Edit Mode layouts you use with it. When a character loads a different profile than last time (a switch, an import, or a specialization profile), ForeverUI switches Edit Mode to that layout once you're out of combat and says “${q("prof", "Edit Mode layout ", { v: "layout" }, ", from profile ", name, ".")}”</p>
<p>If your account has no Edit Mode layout with that name, nothing changes, and chat says “Profile &lt;name&gt; ${q("prof", " uses Edit Mode layout ").trim()} &lt;layout&gt;${q("prof", ", which this account doesn't have.")}” Make a layout with that name in Edit Mode if you want it.</p>

<h2 id="click-casting">Click-casting bindings${nb(shareNew)}</h2>
<p>Click-casting bindings aren't part of a profile. They're saved per character and per specialization, so importing a profile doesn't change them. They have their own sharing, under <strong>/fui → Click casting → ${L("cco", "Share")}</strong>:</p>
<ul>
  <li><strong>${L("cco", "Export")}</strong> opens a window titled “${q("cco", "Click-casting bindings")}” with the text to copy (<kbd>Ctrl</kbd>+<kbd>C</kbd>).</li>
  <li><strong>${L("cco", "Import")}</strong> opens “${q("cco", "Paste a click-casting string")}”. Paste and click <strong>${L("dlg", "Import")}</strong>. It <strong>replaces</strong> the bindings for this character (and this specialization) and says “${q("cco", "Imported ", { v: "number" }, " click-casting bindings.")}” If the text isn't right it says “${q("cco", "Can't import: ")}&lt;reason&gt;.”, for example “${q("cc", "not a click-casting string")}” when you paste a profile instead.</li>
  <li>On game clients with specializations there's also <strong>${q("cco", "Copy to spec...")}</strong>, which copies your bindings over another spec's: “${q("cco", "Click-casting bindings copied to spec ")}&lt;number&gt;.” It only shows where the client has specializations and there's another spec to copy to.</li>
</ul>

<h2 id="spec">Profiles by specialization</h2>
<p>ForeverUI only offers spec profiles on game clients that have specializations. On a client without them, <code>/fui spec</code> answers “${q("slash", "This client has no specializations, so profiles don't switch by spec.")}” and the Profiles page has no <strong>${L("opt", "Specialization")}</strong> section.${nb(specCardNew)}${specCardNew && qr("slash", "No specialization on this character yet.") ? ` In v${esc(v)}, <code>/fui spec</code> answers “${qr("slash", "No specialization on this character yet.")}” instead, and the <strong>Specialization</strong> section still shows.` : ""}</p>
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

// Turns a captured Lua string into display text: each join (" .. x .. ")
// becomes the next placeholder, <name> by default, and each %s an ellipsis.
function luaText(text, names = []) {
  let i = 0;
  return text.replace(/" \.\. [\w.():]+ \.\. "/g, () => `<${names[i++] || "name"}>`).replace(/%s/g, "…");
}

// One fact from FACTS: the captured text, or null when it isn't in the code
// ("both" needs the same text in the current release and the next).
function readFact(read, [, where, file, re, names]) {
  const one = (ref) => { const t = grab(read[ref](file), re); return t === null ? null : luaText(t, names); };
  if (where !== "both") return one(where);
  const rel = one("rel");
  return rel !== null && rel === one("next") ? rel : null;
}

// Every fact the help page quotes, plus the version and the import reasons.
function helpFacts(model, read) {
  const facts = { v: model.version };
  for (const f of FACTS) facts[f[0]] = readFact(read, f);
  const reasons = (ref) => [...(read[ref]("Core/Serialize.lua") || "").matchAll(/return nil, "([^"]+)"/g)].map((m) => m[1]);
  const rel = reasons("rel");
  facts.reasons = rel.length && rel.join("|") === reasons("next").join("|") ? rel : null;
  return facts;
}

// The {key} names a text uses.
function keysOf(text) {
  return [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((k) => k !== "NEXT");
}

// A text with its {key}s filled in: escaped text, a list for a list, the badge for {NEXT}.
function fill(text, facts) {
  return text.replace(/\{(\w+)\}/g, (_, k) => {
    if (k === "NEXT") return NEXT;
    const v = facts[k];
    return Array.isArray(v) ? `<ul>${v.map((r) => `<li>“${esc(r)}”</li>`).join("")}</ul>` : esc(v);
  });
}

// The entries of a section whose facts were all found in the code.
function sourcedEntries(section, facts) {
  return section.entries.filter((e) => [e.a, ...e.src].flatMap(keysOf).every((k) => facts[k] != null));
}

// One question and answer as a card, with where it comes from.
function helpEntry(e, facts) {
  const badge = e.badge === "next" ? ` ${NEXT}` : "";
  return `<section class="card help-entry" id="${e.id}" aria-labelledby="${e.id}-q">
<h3 id="${e.id}-q">${esc(e.q)}${badge}</h3>
${fill(e.a, facts)}
${src(...e.src.map((s) => s.replace(/\{(\w+)\}/g, (_, k) => String(facts[k]))))}
</section>`;
}

// The "on this page" links, one per question shown.
function helpJumps(sections) {
  const links = sections.flatMap((s) => s.shown).map((e) => `<li><a href="#${e.id}">${esc(e.q)}</a></li>`);
  return `<nav aria-label="Questions on this page"><ul class="chips help-jumps">${links.join("")}</ul></nav>`;
}

// One section: its heading and its sourced entries (nothing when none are left).
function helpSection(s, facts) {
  if (!s.shown.length) return "";
  return `<h2 id="${s.id}">${esc(s.title)}</h2>\n${s.shown.map((e) => helpEntry(e, facts)).join("\n")}`;
}

// The closing part: known issues, then what to do when the page doesn't help.
function helpFooter() {
  return `<h2 id="known-issues">Known issues</h2>
<p>No known issues have been confirmed yet. ForeverUI is an early release: parts have been tested in game, and some features are still being polished, so if something looks off, please tell us on the <a href="/feedback/">Feedback page</a>.</p>
<div class="notice info"><p><strong>Not covered here?</strong> Or the fix didn't help? Report it there as well, and include every line of <code>/fui status</code>.</p></div>`;
}

// The Troubleshooting & FAQ page (help-content.mjs holds its words and sources).
export function helpPage(model, read) {
  const facts = helpFacts(model, read);
  const sections = SECTIONS.map((s) => ({ ...s, shown: sourcedEntries(s, facts) }));
  const body = [pageHero("Troubleshooting &amp; FAQ", "Each answer uses ForeverUI's own commands and quotes its real messages."),
    nextNotice(model), helpJumps(sections), ...sections.map((s) => helpSection(s, facts)), helpFooter()];
  return { path: "/help/", title: "Troubleshooting & FAQ", description: "Fixes for common ForeverUI problems, using the addon's own commands and messages.", body: body.join("\n") };
}

// ------------------------------------------------------------------ Feedback

// The "Part of ForeverUI" options: the addon's modules, grouped as on the
// Features page, then the four general choices. Values are module keys; the
// Function reads the same list from site-data.json.
function areaOptions(model) {
  const byKey = new Map(model.modules.map((m) => [m.key, m]));
  const used = new Set();
  const groups = AREAS.map(([title, keys]) => {
    const mods = keys.map((k) => byKey.get(k)).filter(Boolean);
    mods.forEach((m) => used.add(m.key));
    return [title, mods];
  });
  const rest = model.modules.filter((m) => !used.has(m.key));
  if (rest.length) groups.push(["Other modules", rest]);
  const opt = (value, label) => `<option value="${esc(value)}">${esc(label)}</option>`;
  return [`<option value="">Choose one</option>`,
    ...groups.filter(([, mods]) => mods.length).map(([title, mods]) => `<optgroup label="${esc(title)}">${mods.map((m) => opt(m.key, m.name)).join("")}</optgroup>`),
    `<optgroup label="Something else">${FALLBACK_AREAS.map(([v, l]) => opt(v, l)).join("")}</optgroup>`].join("\n");
}

// One labelled text field: input (or textarea) with its hint and error line.
function field(name, label, { area = false, required = false, hint = "", rows = 4, type = "text", autocomplete = "off" } = {}) {
  const [min, max] = LIMITS[name];
  const id = `fb-${name}`;
  const req = required ? " required" : "";
  const limits = `${min > 0 && min > 1 ? ` minlength="${min}"` : ""} maxlength="${max}"`;
  const describe = `aria-describedby="${id}-hint ${id}-err"`;
  const control = area
    ? `<textarea id="${id}" name="${name}" rows="${rows}"${req}${limits} ${describe}></textarea>`
    : `<input id="${id}" name="${name}" type="${type}" autocomplete="${autocomplete}"${req}${limits} ${describe}>`;
  const limitText = min > 1 ? `${min} to ${max.toLocaleString("en-US")} characters.` : `Up to ${max.toLocaleString("en-US")} characters.`;
  return `<div class="field" data-field="${name}">
<label for="${id}">${label}${required ? "" : ` <span class="opt">(optional)</span>`}</label>
${control}
<p class="hint" id="${id}-hint">${hint ? `${hint} ` : ""}${limitText}</p>
<p class="err" id="${id}-err" hidden></p>
</div>`;
}

// One checkbox with its error line.
function checkbox(name, label, { required = false } = {}) {
  const id = `fb-${name}`;
  return `<div class="field check" data-field="${name}">
<label for="${id}"><input id="${id}" name="${name}" type="checkbox"${required ? " required" : ""} aria-describedby="${id}-err"> <span>${label}</span></label>
<p class="err" id="${id}-err" hidden></p>
</div>`;
}

// What to paste for the report field: /fui report when the addon has it, else status and errors.
function reportHint(model) {
  const rel = model.commands.relKeys.has("report");
  const next = model.commands.nextKeys.has("report");
  if (rel) return "Type <code>/fui report</code> in game and paste what it shows.";
  if (next) return `${NEXT} has <code>/fui report</code>, one block to paste. In v${esc(model.version)}, paste the lines of <code>/fui status</code> (and any error lines): see the steps below.`;
  return "No ForeverUI version has <code>/fui report</code> yet, so paste the lines of <code>/fui status</code> and <code>/fui errors</code>: see the steps below.";
}

// The form: kind, summary, the bug or feature fields, contact, the
// acknowledgement and the spam checks. Shown only with JavaScript.
function feedbackForm(model) {
  const v = model.version;
  return `<form id="fb-form" class="fb-form fb-needs-js" novalidate>
<fieldset class="field fb-kind" data-field="kind">
<legend>What would you like to send?</legend>
<label><input type="radio" name="kind" value="bug" checked> Report a bug</label>
<label><input type="radio" name="kind" value="feature"> Request a feature</label>
<p class="err" id="fb-kind-err" hidden></p>
</fieldset>
${field("title", "Short summary", { required: true, hint: "For example: Raid frames go blank after a reload." })}
<fieldset class="fb-group" data-kind="bug">
<legend class="sr-only">Bug report</legend>
${field("report", "Paste your /fui report (or /fui status + /fui errors)", { area: true, rows: 8, hint: reportHint(model) })}
${checkbox("no_report", `I'm on v${esc(v)}, or I couldn't get the report`)}
${field("did", "What did you do?", { area: true, required: true })}
${field("expected", "What did you expect?", { area: true, rows: 3 })}
${field("happened", "What happened instead?", { area: true, required: true })}
</fieldset>
<fieldset class="fb-group" data-kind="feature" disabled hidden>
<legend class="sr-only">Feature request</legend>
${field("want", "What do you want?", { area: true, required: true })}
<div class="field" data-field="area">
<label for="fb-area">Part of ForeverUI</label>
<select id="fb-area" name="area" required aria-describedby="fb-area-err">
${areaOptions(model)}
</select>
<p class="err" id="fb-area-err" hidden></p>
</div>
${field("why", "Why would it help you?", { area: true, required: true })}
</fieldset>
${checkbox("contact_ok", "I'm OK being contacted about this report")}
<div class="fb-contact" hidden>
${field("contact", "Discord tag or email", { autocomplete: "email", hint: "Kept privately for 90 days so a maintainer can ask you a question. It is never put in the report." })}
</div>
${checkbox("public_ack", "I understand this report is sent to the private repository the ForeverUI maintainers use. It is not a public issue, and the maintainers can read everything in the preview.", { required: true })}
<div class="hp" aria-hidden="true"><label for="fb-hp">Leave this empty</label><input id="fb-hp" name="fui_hp" type="text" tabindex="-1" autocomplete="off"></div>
<p class="small">Screenshots can't be sent with this form yet: describe what you see instead.</p>
<div class="fb-actions"><button class="button" type="submit">Preview</button></div>
</form>`;
}

// The preview and confirmation steps, filled in by assets/feedback.js.
function feedbackSteps() {
  return `<section id="fb-preview" class="fb-step" hidden aria-labelledby="fb-preview-h">
<h3 id="fb-preview-h" tabindex="-1">Check your report</h3>
<p>This is exactly what will be sent to the private repository the ForeverUI maintainers use. It is not a public issue.</p>
<dl class="facts">
<dt>Title</dt><dd id="fb-preview-title"></dd>
<dt>Labels</dt><dd id="fb-preview-labels"></dd>
</dl>
<pre id="fb-preview-body" class="fb-preview-body"></pre>
<p class="small" id="fb-preview-note"></p>
<div id="fb-turnstile" class="fb-turnstile"></div>
<div id="fb-send-error" class="notice fb-alert" role="alert" hidden></div>
<div class="fb-actions">
<button class="button" type="button" id="fb-send">Send report</button>
<button class="button secondary" type="button" id="fb-edit">Edit</button>
<button class="copy" type="button" data-copy-from="#fb-preview-body" aria-label="Copy the report text">Copy report text</button>
</div>
</section>
<section id="fb-done" class="fb-step" hidden aria-labelledby="fb-done-h">
<h3 id="fb-done-h" tabindex="-1">Thanks: your report is in</h3>
<p>Your reference is <strong class="fb-ref" id="fb-ref"></strong>. <span id="fb-done-dup"></span></p>
<p>Keep it: quote it if you want to add something, or to have the report removed.</p>
<div class="fb-actions"><button class="button secondary" type="button" id="fb-again">Send another</button></div>
</section>`;
}

// What happens to a report: who sees it, what it may hold, and how to have it removed.
function privacyNote() {
  return `<section class="card" aria-labelledby="privacy">
<h2 id="privacy" style="margin-top:0">Where your report goes</h2>
<ul>
<li>No account or email is needed.</li>
<li>Your report is sent to the private repository the ForeverUI maintainers use. Only the project's maintainers can read it. It is not posted anywhere public.</li>
<li>A pasted report can hold character or profile names, chat, or guild details. Check the preview, and take out anything you'd rather not send.</li>
<li>If you tick "OK being contacted", your Discord tag or email is kept privately for 90 days and is never put in the report.</li>
<li>Your IP address is never stored or put in a report. To stop floods, the site keeps a scrambled key made from it for an hour or two, and that key changes every day.</li>
<li>To have a report removed, send another report with the title “Remove FUI-…” and your reference. A maintainer deletes it.</li>
<li>Every report gets its own reference, shown only to the person who sent it. If yours was added to an earlier report of the same error, your reference is on your part alone, so a removal request covers only what you sent.</li>
</ul>
</section>`;
}

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

Screen resolution and UI scale (if you know them):`;
  const featureTemplate = `ForeverUI feature request
What I want:
Which part of ForeverUI it touches (a module from the Features page, a command, or a setting):
Why it would help me:`;
  return {
    path: "/feedback/",
    title: "Feedback",
    description: "Report a ForeverUI bug or request a feature.",
    scripts: ["/assets/feedback.js"],
    body: `${pageHero("Feedback", `ForeverUI is an early release. Parts have been tested in game, and some features are still being polished, so if something looks off, please tell us. No account or email is needed.`)}
<section class="card fb" aria-labelledby="send">
<h2 id="send" style="margin-top:0">Send a report</h2>
<div class="notice todo fb-nojs" role="note"><p><strong>The form needs JavaScript.</strong> Turn JavaScript on to send a report from this page. Until then, get your report ready with the steps and templates below, and keep it.</p></div>
<div id="fb-status" class="notice fb-alert fb-needs-js" role="status" hidden></div>
${feedbackForm(model)}
${feedbackSteps()}
</section>
${privacyNote()}
<h2 id="get-ready">Get your report ready</h2>
<div class="grid two">
<section class="card" aria-labelledby="bug">
<h3 id="bug" style="margin-top:0">Report a bug</h3>
<ol class="steps">
  <li><strong>Write down what you did</strong>, what you expected, and what happened instead.</li>
  <li><strong>Type <code>/fui status</code></strong> and copy all of its lines. In v${esc(v)} it prints ${relStatusLines} lines: the version, profile and module count, then skins, painted frames and changes waiting on combat.${nextStatusLines > relStatusLines ? ` ${NEXT} prints ${nextStatusLines}, adding the client, what it has, and your UI scale and text size.` : ""}</li>
  <li><strong>${relErrors ? "Type <code>/fui errors</code>" : "Copy any error lines"}</strong>${relErrors ? " and copy all of it." : `. v${esc(v)} has no <code>/fui errors</code> yet; if chat showed ${failLine ? `“${esc(failLine.replace(/%s/g, "…"))}”` : "an error"}, copy that whole line. ${NEXT} <code>/fui errors</code> lists the errors ForeverUI caught this session, with stacks and counts, ready for a bug report.`}</li>
</ol>
<p class="small">Can't copy text from chat? Type out the lines that matter, or describe them. ${model.commands.nextKeys.has("copy") && !model.commands.relKeys.has("copy") ? `In the next release, <code>/fui copy</code> opens the recent chat as plain text, ready to copy.` : ""}</p>
<h4>Bug report template</h4>
<pre class="template" id="bug-template">${esc(bugTemplate)}</pre>
<button class="copy" type="button" data-copy-from="#bug-template" aria-label="Copy the bug report template">Copy template</button>
</section>
<section class="card" aria-labelledby="feature">
<h3 id="feature" style="margin-top:0">Request a feature</h3>
<p>Tell us what would make ForeverUI better for you. Please answer:</p>
<ol class="steps">
  <li><strong>What you want.</strong></li>
  <li><strong>Which part of ForeverUI it touches</strong>: a module from <a href="/features/">Features</a>, a <a href="/commands/">command</a> or a <a href="/settings/">setting</a>.</li>
  <li><strong>Why it would help you.</strong></li>
</ol>
<div class="notice info"><p><strong>Reviewed, not promised.</strong> Every request is read and considered, but there's no promise that it will be built, or when.</p></div>
<h4>Feature request template</h4>
<pre class="template" id="feature-template">${esc(featureTemplate)}</pre>
<button class="copy" type="button" data-copy-from="#feature-template" aria-label="Copy the feature request template">Copy template</button>
<p class="small template-note">Before you ask, check <a href="/features/">Features</a>: some things are already written and marked <span class="badge next">Next release</span>.</p>
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

// One "What's coming" group: its heading and its bullets.
function nextGroup(g) {
  const items = g.items.map((i) => `<li><strong>${esc(i.label)}:</strong> ${esc(i.text)}</li>`);
  return `<h3 id="next-${g.id}">${esc(g.title)}</h3>\n<ul class="changes">${items.join("")}</ul>`;
}

// What's merged since the current release, while that release is the one the
// notes were written after; nothing once a newer release is out.
function nextSection(model) {
  if (model.same || model.release.tag !== NEXT_RELEASE.after) return "";
  const intro = `<p>Not released yet, so it has no version number or date. Everything here is written and waiting; v${esc(model.version)} doesn't have it. On <a href="/features/">Features</a>, <a href="/commands/">Commands</a> and <a href="/settings/">Settings</a> these parts are marked ${NEXT}.</p>`;
  return `<section class="card" aria-labelledby="next-h">
<h2 id="next-h" style="margin-top:0">What's coming in the next release</h2>
${intro}
${NEXT_RELEASE.groups.map(nextGroup).join("\n")}
</section>`;
}

// A release's bullets: the player-language notes, else its release note titles.
function releaseNotes(r) {
  const notes = RELEASE_NOTES[r.tagName]?.map((n) => n.text) || notesOf(r.body);
  return notes.length ? `<ul class="changes">${notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : "<p>No notes.</p>";
}

// One published release: its tag, date, a Current release badge, and its notes.
function releaseSection(r, model) {
  const current = r.tagName === model.release.tag ? ` <span class="badge rel">Current release</span>` : "";
  return `<section aria-labelledby="rel-${esc(r.tagName)}">
<h2 id="rel-${esc(r.tagName)}">${esc(r.tagName)} <span class="small">· ${esc(dateET(r.publishedAt))}</span>${current}</h2>
${releaseNotes(r)}
</section>`;
}

// The Changelog page: the next release first, then every release, newest first.
export function changelogPage(model) {
  const rels = model.releases.releases.slice().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const body = [pageHero("Changelog", "Newest first: what each ForeverUI release changed, in plain words."),
    nextSection(model), ...rels.map((r) => releaseSection(r, model)), `<p class="small">Every line comes from the changes merged into the addon for that release.</p>`];
  return { path: "/changelog/", title: "Changelog", description: "What changed in each ForeverUI release, newest first, and what's coming next.", body: body.join("\n") };
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
    body: `${pageHero("Credits &amp; license")}
<h2 id="license">ForeverUI</h2>
<p><strong>${esc(lic[0] || "")}</strong>. ${esc(lic[1] || "")}.</p>
<p>From the v${esc(model.version)} README:</p>
<blockquote class="card prose"><p>${md(relLicense)}</p></blockquote>
${nextLicense && nextLicense !== relLicense ? `<p>The next release also bundles shared libraries; its README says:</p><blockquote class="card prose"><p>${md(nextLicense)}</p></blockquote>` : ""}
${bullets.length ? `<h2 id="credits">Fonts, libraries and art</h2><p>As listed in the addon's README for the next release:</p><ul>${bullets.map((b) => `<li>${md(b)}</li>`).join("")}</ul>` : ""}
<h2 id="site">This website</h2>
<p>ForeverUI is made by ${esc(site.author)}.</p>
<p>This site uses Fira Sans Condensed, the same font as the addon, under the SIL Open Font License 1.1: <a href="/fonts/OFL.txt">license text</a>. Its colors are ForeverUI's own theme colors.</p>
<p>ForeverUI is a fan addon for WoW Forever.</p>
${src("LICENSE", "README.md (License, Credits)", "Media/Fonts/OFL.txt")}`,
  };
}
