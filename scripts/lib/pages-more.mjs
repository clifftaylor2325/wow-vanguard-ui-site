// Profiles & sharing, Troubleshooting & FAQ, Feedback, Changelog, Credits.
// Messages in quotes are copied from the addon's Lua; each section names its
// source file. Where the current release and the next release differ, the
// page says which is which.
import fs from "node:fs";
import path from "node:path";
import { root } from "./config.mjs";
import { SHOT_GROUPS } from "./shots-content.mjs";
import { shotFigure, esc, md, badge, pageHero, disclosure, glance, nextOnly, NEXT_BADGE, nextBadge, reloadBadge, supportOn, supportAsk, followLine } from "./html.mjs";
import { src, sourceNote, dateET, says, saysIf, label } from "./pages-main.mjs";
import { FACTS, SECTIONS, ENGLISH_HELP } from "./help-content.mjs";
import { EN } from "./i18n-site.mjs";
import { RELEASE_NOTES, NEXT_RELEASE } from "./changelog-content.mjs";
import { AREAS } from "./model.mjs";
import { LIMITS, FALLBACK_AREAS } from "../../src/feedback/fields.js";

const NEXT = NEXT_BADGE;

// A string literal from a file, by a regex with one capture group (null when absent).
function grab(text, re) {
  const m = (text || "").match(re);
  return m ? m[1] : null;
}

// ------------------------------------------------------------------ Profiles

// A text with each {name} slot filled from values (a slot values lacks stays as written).
const fillSlots = (text, values) => text.replace(/\{(\w+)\}/g, (all, k) => (values[k] !== undefined ? String(values[k]) : all));

// The Profiles page's addon words in the page's language. Each quote is checked
// against the addon's source as it always was (says() and label() stop the build
// when the addon's text changes) and shows as written in English; in another
// language it is the addon's translation of the whole sentence (its string table
// key, with named slots), filled with placeholders such as <name>.
function profileWords(read, loc) {
  const f = {
    slash: "Core/Slash.lua", prof: "Core/Profiles.lua", opt: "Core/Options.lua", list: "Core/OptionsProfiles.lua",
    dlg: "Core/Dialog.lua", db: "Core/DB.lua", ser: "Core/Serialize.lua", cco: "Modules/ClickCastOptions.lua", cc: "Modules/ClickCast.lua",
  };
  const N = Object.fromEntries(Object.entries(f).map(([k, file]) => [k, read.next(file) || ""]));
  const R = Object.fromEntries(Object.entries(f).map(([k, file]) => [k, read.rel(file) || ""]));
  const ph = (word) => `<${loc.p(word)}>`;
  const w = {
    f, N, R, ph,
    q: (k, ...p) => says(N[k], f[k], ...p),
    qr: (k, ...p) => saysIf(R[k], f[k], ...p),
    // A whole addon string: checked, then in the page's language.
    qa: (k, text) => (says(N[k], f[k], text), esc(loc.addon(text))),
    // A button or label.
    lb: (k, name) => (label(N[k], f[k], name), esc(loc.addon(name))),
    // A quote: the English as built from checked parts, or the translation of its named sentence.
    tr: (english, named, values = {}) => (loc.english ? english : esc(fillSlots(loc.addon(named), values))),
  };
  // A quote (HTML) followed by the reload question, as the reload dialog shows it.
  w.reloadAsk = (why) => {
    const ask = w.q("dlg", " Reload the UI now to apply it?");
    return loc.english ? `${why}${ask}` : fillSlots(esc(loc.addon("{why} Reload the UI now to apply it?")), { why });
  };
  w.reloadBtns = loc.p("<strong>{reload}</strong> or <strong>{later}</strong>", { reload: w.lb("dlg", "Reload"), later: w.lb("dlg", "Later") });
  return w;
}

// What's new since the current release, by what the current release's source lacks.
function profileNews(w, read) {
  const { qr, R, q, N, f } = w;
  const name = { v: "name" };
  // Exports leave out an active Situations override: the export call, and the module's own name.
  const OWN = "if ns.OwnValues then return ns.OwnValues(encode, scope) end";
  q("prof", OWN);
  says(N.opt, f.opt, 'Situations = { "Situations",');
  return {
    staged: !qr("slash", "This character will use profile "),
    listNew: !R.list,
    relUse: qr("opt", '"Use " .. name'),
    relImport: qr("prof", "Imported as profile ", name, " and switched to it."),
    displayNew: !qr("prof", "This profile was made at UI scale"),
    editNew: !qr("prof", "Edit Mode layout "),
    specCardNew: !qr("slash", "This client has no specializations"),
    shareNew: !/shareBuilder/.test(R.cco),
    ownNew: !R.prof.includes(OWN),
    relReloadUI: saysIf(read.rel("Core/Dialog.lua") || "", f.dlg, "ReloadUI()"),
    vendorNew: !read.rel("Modules/VendorMemory.lua") && !read.rel("Modules/AuctionPrices.lua"),
  };
}

// "See which profile you're using": /vg profile and the Profiles page's top line.
function profileWhich(w, news, defaultName, loc) {
  const { q, tr, ph } = w;
  const NEXT = nextBadge(loc);
  const d = esc(defaultName);
  const chat = tr(`${q("slash", "Profile: ")}${d}${q("slash", "   (all: ")}…)`, "Profile: {profile}   (all: {all})", { profile: defaultName, all: "…" });
  const chatNext = tr(`Profile: ${d}; &lt;name&gt;${q("slash", " after a reload")}   (all: …)`, "Profile: {profile}; {next} after a reload   (all: {all})", { profile: defaultName, next: ph("name"), all: "…" });
  const top = tr(`${q("opt", "This character uses ")}${d}.`, "This character uses {profile}.", { profile: defaultName });
  const topNext = tr(`This character uses ${d}${q("opt", " until you reload, then ")}&lt;name&gt;.`, "This character uses {profile} until you reload, then {next}.", { profile: defaultName, next: ph("name") });
  return `<ul>
  <li>${loc.p("Type <code>/vg profile</code>. Chat answers “{quote}”, with every profile on your account.", { quote: chat })}${news.staged ? nextOnly(` ${NEXT} ${loc.p("When you've picked another profile that's waiting for a reload, it adds that one: “{quote}”.", { quote: chatNext })}`) : ""}</li>
  <li>${loc.p("Or open <strong>/vg → {profiles}</strong>. At the top it says “{quote}”", { profiles: esc(loc.addon("Profiles")), quote: top })}${news.staged ? nextOnly(` ${NEXT} ${loc.p("While a switch is waiting for a reload it says “{quote}”", { quote: topNext })}`) : ""}</li>
</ul>`;
}

// Switching this character to another profile, as each release does it.
function profileSwitching(w, news, v, loc) {
  const { q, qr, qa, tr, ph, reloadAsk, reloadBtns } = w;
  const NEXT = nextBadge(loc);
  const name = { v: "name" };
  const willUse = tr(q("slash", "This character will use profile ", name, " after the reload."), "This character will use profile {profile} after the reload.", { profile: ph("name") });
  const already = tr(q("slash", "This character already uses profile ", name, "."), "This character already uses profile {profile}.", { profile: ph("name") });
  const takesEffect = loc.p("A new profile takes effect at your next reload. Until then the frames on screen still belong to the profile you were using, so anything you change goes into that one. Vanguard asks: “{quote}” Click {buttons}.", { quote: reloadAsk(willUse), buttons: reloadBtns });
  const head = `<p>${loc.p("Log in on each character and pick the same profile, in chat or on the Profiles page.")}</p>
<ul>
  <li>${loc.p("Type <code>/vg profile &lt;name&gt;</code>. If there's no profile with that name yet, Vanguard makes it. {rule}", { rule: qa("slash", "Profile names are 1-32 letters, digits, spaces, - or _.") })}</li>
  ${news.relUse ? `<li>${loc.p("In v{version}, the Profiles page has a <strong>Use &lt;name&gt;</strong> button for each of your other profiles (up to five), under <strong>Switch profile</strong>.", { version: esc(v) })}${news.listNew ? nextOnly(` ${loc.p("The next release replaces them with a list (below).")}`) : ""}</li>` : ""}
</ul>`;
  if (!news.staged) return `${head}\n<p>${takesEffect}</p>`;
  return `${head}
<p>${loc.p("In v{version}, switching happens straight away and Vanguard offers a reload: “{quote}”", { version: esc(v), quote: `${qr("slash", "This character now uses profile ") || ""}&lt;name&gt;.${q("dlg", " Reload the UI now to apply it?")}` })}</p>
${news.relReloadUI ? `<p>${loc.p(`In v{version}, if the <strong>Reload</strong> button doesn't reload, type <code>/reload</code> in chat: that release's button asks the game to reload directly, and WoW Forever blocks that for addons. See <a href="/help/#reload">Troubleshooting</a>.`, { version: esc(v) })}</p>` : ""}
<p data-avail="next">${NEXT} ${takesEffect} ${loc.p("If you pick the profile you're already using, it says “{quote}”", { quote: already })}</p>`;
}

// The list of profiles on the Profiles page, with its buttons.
function profileList(w, news, loc) {
  const { lb, qa, tr } = w;
  const nb = news.listNew ? ` ${nextBadge(loc)}` : "";
  const inUse = (key, english) => tr(qa("list", english), key, { profile: "" }).trim();
  return `<div${news.listNew ? ' data-avail="next"' : ""}>
<h3 id="profile-list">${loc.p("The list on the Profiles page")}${nb}</h3>
<p>${loc.p("Under <strong>{heading}</strong>, each profile has a row with its name and buttons:", { heading: lb("opt", "Your profiles") })}</p>
<ul>
  <li>${loc.p("<strong>{use}</strong>: this character switches to that profile at your next reload.", { use: lb("list", "Use") })}</li>
  <li>${loc.p("<strong>{copy}</strong>: copies that profile's settings over the profile you're using.", { copy: lb("list", "Copy here") })}</li>
  <li>${loc.p("<strong>{delete}</strong>: deletes that profile.", { delete: lb("list", "Delete") })}</li>
</ul>
<p>${loc.p("<strong>{copy}</strong> and <strong>{delete}</strong> can't be undone, so the first click only changes the button to “{sure}”. Click again to do it.", { copy: lb("list", "Copy here"), delete: lb("list", "Delete"), sure: qa("list", "Sure?") })}</p>
<p>${loc.p("Next to the names you'll see “{inUse}”, or, while a switch waits for a reload, “{untilReload}” on the profile you're using now and “{afterReload}” on the one that takes over. The profile that takes over has no buttons. The one you're using now only has <strong>{use}</strong>, which cancels the switch.", { inUse: inUse("{profile}  (in use)", "(in use)"), untilReload: inUse("{profile}  (in use until reload)", "(in use until reload)"), afterReload: inUse("{profile}  (after reload)", "(after reload)"), use: lb("list", "Use") })}</p>
<p>${loc.p("At the bottom, type a name in the <strong>{box}</strong> box and click <strong>{create}</strong> (or press <kbd>Enter</kbd>). The new profile is empty, and this character switches to it at your next reload. If the name is already used or has characters that aren't allowed, the box says “{taken}”.", { box: lb("list", "New profile"), create: lb("list", "Create"), taken: qa("list", "Name taken or not allowed") })}</p>
</div>`;
}

// The chat commands that manage profiles, as a table.
function profileChatTable(w, news, loc) {
  const { q, qa, tr, ph, reloadAsk } = w;
  const NEXT = nextBadge(loc);
  const name = { v: "name" };
  const head = [loc.p("Type"), loc.p("What it does"), loc.p("Chat says")];
  const row = (typed, does, says_) => `<tr><td data-label="${head[0]}"><code>${typed}</code></td><td data-label="${head[1]}">${does}</td><td data-label="${head[2]}">${says_}</td></tr>`;
  const created = tr(q("slash", "Created profile ", name, "."), "Created profile {profile}.", { profile: ph("name") });
  const copied = tr(`${q("slash", "Copied ", name, " into ")}&lt;your profile&gt;.`, "Copied {from} into {profile}.", { from: ph("name"), profile: ph("your profile") });
  const deleted = tr(q("slash", "Deleted profile ", name, "."), "Deleted profile {profile}.", { profile: ph("name") });
  const noOther = tr(q("slash", "No other profile called ", name, "."), "No other profile called {profile}.", { profile: ph("name") });
  const saved = tr(q("opt", "Profile ", name, " as it was is saved as profile ", { v: "copy" }, "."), "Profile {profile} as it was is saved as profile {backup}.", { profile: ph("name"), backup: ph("copy") });
  const deleteDoes = news.staged ? `${loc.p("Deletes a profile. You can't delete the one you're using.")}${nextOnly(` ${NEXT} ${loc.p("You also can't delete the one waiting for a reload.")}`)}` : loc.p("Deletes a profile. You can't delete the one you're using, or the one waiting for a reload.");
  return `<h3 id="manage">${loc.p("Manage profiles in chat")}</h3>
<div class="table-wrap"><table class="stack"><thead><tr><th scope="col">${head[0]}</th><th scope="col">${head[1]}</th><th scope="col">${head[2]}</th></tr></thead><tbody>
${row("/vg profile new &lt;name&gt;", loc.p("Makes an empty profile. You stay on the one you're using."), loc.p("“{a}” or “{b}”", { a: created, b: qa("slash", "That name is taken or not allowed.") }))}
${row("/vg profile copy &lt;name&gt;", loc.p("Copies that profile's settings over the one you're using, then offers a reload."), loc.p("“{a}” or “{b}”", { a: reloadAsk(copied), b: noOther }))}
${row("/vg profile delete &lt;name&gt;", deleteDoes, loc.p("“{a}” or “{b}”", { a: deleted, b: qa("slash", "Can't delete that one (missing, or in use).") }))}
${row("/vg profile reset", loc.p("Asks first (“{ask}”), keeps a copy of the profile you're using, then puts every setting in it back to its default; reload to apply.", { ask: qa("opt", "Reset this profile?") }), `“${saved}”`)}
</tbody></table></div>`;
}

// Export and import: the steps, what a whole profile import does, one module, and the text.
function profileShare(w, news, v, fuiPrefix, loc) {
  const { q, lb, qa, tr, ph, reloadAsk, reloadBtns } = w;
  const NEXT = nextBadge(loc);
  const name = { v: "name" };
  // /vg export's box title: written in Core/Slash.lua before the string table, by ns.ExportTitle in Core/Profiles.lua after.
  const exportTitle = tr(saysIf(w.N.slash, w.f.slash, "Vanguard export (") ? `${q("slash", "Vanguard export (")}profile &lt;name&gt;)${q("slash", "  Ctrl+C to copy")}`
    : q("prof", "Vanguard export (profile ", name, ")  Ctrl+C to copy"), "Vanguard export (profile {profile})  Ctrl+C to copy", { profile: ph("name") });
  // The question with its screen part: one format string before the string table, a sentence with named slots after.
  const uiOld = saysIf(w.N.prof, w.f.prof, "This profile was made at UI scale %d%%%s (yours: %d%%). Use its UI scale?");
  const uiEnglish = uiOld ? uiOld.replace("%d%%%s", "&lt;its scale&gt;% on a &lt;width&gt; x &lt;height&gt; screen").replace("%d%%", "&lt;yours&gt;%")
    : q("prof", "This profile was made at UI scale {scale}% on a {width} x {height} screen (yours: {mine}%). Use its UI scale?")
      .replace("{scale}", "&lt;its scale&gt;").replace("{width}", "&lt;width&gt;").replace("{height}", "&lt;height&gt;").replace("{mine}", "&lt;yours&gt;");
  const uiQ = tr(uiEnglish, "This profile was made at UI scale {scale}% on a {width} x {height} screen (yours: {mine}%). Use its UI scale?", { scale: ph("its scale"), width: ph("width"), height: ph("height"), mine: ph("yours") });
  const importedAsk = reloadAsk(tr(`${q("prof", "Imported as profile ")}Imported${q("prof", "; this character will use it after a reload.")}`, "Imported as profile {profile}; this character will use it after a reload.", { profile: "Imported" }));
  const moduleDone = reloadAsk(tr(`${q("prof", "Imported ")}&lt;module&gt;${q("prof", " settings into profile ")}&lt;your profile&gt;.`, "Imported {parts} settings into profile {profile}.", { parts: ph("module"), profile: ph("your profile") }));
  const nothing = tr(`${q("slash", "Nothing to export: ")}${q("prof", "nothing saved for ")}&lt;module&gt;${q("prof", " yet")}.`, "Nothing to export: {reason}.", { reason: fillSlots(loc.addon("nothing saved for {part} yet"), { part: ph("module") }) });
  const li = (isNew, html) => `<li${isNew ? ' data-avail="next"' : ""}>${isNew ? `${NEXT} ` : ""}${html}</li>`;
  return `<p>${loc.p("You copy your profile out as a line of text, and paste that text into Vanguard on the other PC.")}</p>
<ol class="steps">
  <li>${loc.p("<strong>Export.</strong> Click <strong>{button}</strong> on the Profiles page, or type <code>/vg export</code>. A window opens with the text already selected. Its title says “{title}” (with <code>/vg export</code>: “{slashTitle}”). Press <kbd>Ctrl</kbd>+<kbd>C</kbd> to copy it, then click <strong>{close}</strong>.", { button: lb("opt", "Export profile"), title: qa("opt", "Vanguard export  Ctrl+C to copy"), slashTitle: exportTitle, close: lb("dlg", "Close") })}</li>
  <li>${loc.p("<strong>Send it to yourself</strong> in any way you like, as long as the whole text arrives.")}</li>
  <li>${loc.p("<strong>Import.</strong> On the other PC, click <strong>{button}</strong> on the Profiles page or type <code>/vg import</code>. A window titled “{title}” opens. Paste with <kbd>Ctrl</kbd>+<kbd>V</kbd> and click <strong>{import}</strong>.", { button: lb("opt", "Import"), title: qa("slash", "Paste a Vanguard string, then Import"), import: lb("dlg", "Import") })}</li>
</ol>
<h3 id="import-whole">${loc.p("What importing a whole profile does")}</h3>
<p>${loc.p("The profile is saved as a new profile called “Imported”. If you already have one with that name, it's called “Imported 2”, then “Imported 3”, and so on. Nothing you already have is overwritten.")}</p>
${news.relImport ? `<p>${loc.p("In v{version}, this character switches to it straight away (“Imported as profile Imported and switched to it.”), and Vanguard offers a reload (type <code>/reload</code> in chat if its button doesn't reload).", { version: esc(v) })}</p>` : ""}
<ol class="steps">
  ${li(news.displayNew, loc.p("If the string has the UI scale it was made at, Vanguard asks first, for example: “{question}” Click <strong>{use}</strong> to switch to that UI scale (it changes once you're out of combat), or <strong>{no}</strong> to keep yours. If the string doesn't say what screen it was made on, the question leaves out the screen part.", { question: uiQ, use: w.qa("prof", "Use it"), no: lb("dlg", "No") }))}
  ${li(news.staged, loc.p("Then it asks: “{question}” Click {buttons}.", { question: importedAsk, buttons: reloadBtns }))}
</ol>
<h3 id="import-module">${loc.p("Just one module")}</h3>
<p>${loc.p(`<code>/vg export &lt;module&gt;</code> copies just one module's settings (the module names are on <a href="/features/">Features</a> and in <code>/vg modules</code>). Importing that text merges those settings into the profile you're using, key by key: the text's values win, and anything it doesn't name stays as it is. Vanguard backs your profile up before any import. Chat then says: “{done}” If that module has nothing saved yet, export says “{nothing}”`, { done: moduleDone, nothing })}</p>

<h3 id="string">${loc.p("What's in the text")}</h3>
<ul>
  <li>${loc.p("It starts with <code>{prefix}</code>. Vanguard only reads settings from it and never runs anything in it. A built-in check notices when part of the text is missing.", { prefix: esc(fuiPrefix) })}</li>
  <li>${loc.p("Text exported before the addon was renamed from ForeverUI starts with <code>FUI1:</code>; it still imports.")}</li>
  <li>${loc.p("The settings and frame positions saved in the profile.")}</li>
  <li${news.ownNew ? ' data-avail="next"' : ""}>${loc.p("The profile's own settings, never a temporary change from <strong>{situations}</strong> that happens to be active.", { situations: esc(loc.addon("Situations")) })}${news.ownNew ? ` ${NEXT}` : ""}</li>
  ${li(news.displayNew, loc.p("For a whole profile, the UI scale (to the nearest percent) and the screen size it was made on."))}
  ${li(news.editNew, loc.p("Where your client supports Edit Mode, the name of the game's Edit Mode layout that goes with the profile (see below)."))}
</ul>
<p>${loc.p(`If the text can't be used, chat says “{failed}” and the reason. The reasons are listed under <a href="/help/#import">Troubleshooting</a>.`, { failed: loc.english ? q("slash", "Import failed: ") : esc(fillSlots(loc.addon("Import failed: {reason}."), { reason: "…" })) })}</p>`;
}

// The game's Edit Mode layout a profile remembers.
function profileEditMode(w, loc) {
  const { q, tr, ph } = w;
  const name = { v: "name" };
  const switched = tr(q("prof", "Edit Mode layout ", { v: "layout" }, ", from profile ", name, "."), "Edit Mode layout {layout}, from profile {profile}.", { layout: ph("layout"), profile: ph("name") });
  const missing = tr(`Profile &lt;name&gt; ${q("prof", " uses Edit Mode layout ").trim()} &lt;layout&gt;${q("prof", ", which this account doesn't have.")}`, "Profile {profile} uses Edit Mode layout {layout}, which this account doesn't have.", { profile: ph("name"), layout: ph("layout") });
  return `<p>${loc.p("Where your client supports Edit Mode, a profile remembers which of the game's Edit Mode layouts you use with it. When a character loads a different profile than last time (a switch, an import, or a specialization profile), Vanguard switches Edit Mode to that layout once you're out of combat and says “{quote}”", { quote: switched })}</p>
<p>${loc.p("If your account has no Edit Mode layout with that name, nothing changes, and chat says “{quote}” Make a layout with that name in Edit Mode if you want it.", { quote: missing })}</p>`;
}

// Click-casting bindings: kept apart from profiles, with their own sharing.
function profileClickCasting(w, loc) {
  const { q, lb, qa, tr, ph } = w;
  const imported = tr(q("cco", "Imported ", { v: "number" }, " click-casting bindings."), "Imported {count} click-casting bindings.", { count: ph("number") });
  const cant = tr(`${q("cco", "Can't import: ")}&lt;reason&gt;.`, "Can't import: {why}.", { why: ph("reason") });
  const copied = tr(`${q("cco", "Click-casting bindings copied to spec ")}&lt;number&gt;.`, "Click-casting bindings copied to spec {spec}.", { spec: ph("number") });
  return `<p>${loc.p("Click-casting bindings aren't part of a profile. They're saved per character and per specialization, so importing a profile doesn't change them. They have their own sharing, under <strong>/vg → {page} → {share}</strong>:", { page: esc(loc.addon("Click casting")), share: lb("cco", "Share") })}</p>
<ul>
  <li>${loc.p("<strong>{export}</strong> opens a window titled “{title}” with the text to copy (<kbd>Ctrl</kbd>+<kbd>C</kbd>).", { export: lb("cco", "Export"), title: qa("cco", "Click-casting bindings") })}</li>
  <li>${loc.p("<strong>{import}</strong> opens “{title}”. Paste and click <strong>{button}</strong>. It <strong>replaces</strong> the bindings for this character (and this specialization) and says “{done}” If the text isn't right it says “{cant}”, for example “{example}” when you paste a profile instead.", { import: lb("cco", "Import"), title: qa("cco", "Paste a click-casting string"), button: lb("dlg", "Import"), done: imported, cant, example: qa("cc", "not a click-casting string") })}</li>
  <li>${loc.p("On game clients with specializations there's also <strong>{copy}</strong>, which copies your bindings over another spec's: “{done}” It only shows where the client has specializations and there's another spec to copy to.", { copy: qa("cco", "Copy to spec..."), done: copied })}</li>
</ul>`;
}

// Profiles by specialization, on clients that have specializations.
function profileSpec(w, news, loc) {
  const { q, qr, lb, qa, tr, ph, reloadAsk } = w;
  const name = { v: "name" };
  const noSpec = news.specCardNew && qr("slash", "No specialization on this character yet.");
  const uses = tr(q("prof", "Your specialization uses profile ", name, "."), "Your specialization uses profile {profile}.", { profile: ph("name") });
  return `<p>${loc.p("Vanguard only offers spec profiles on game clients that have specializations. On a client without them, <code>/vg spec</code> answers “{none}” and the Profiles page has no <strong>{section}</strong> section.", { none: qa("slash", "This client has no specializations, so profiles don't switch by spec."), section: lb("opt", "Specialization") })}${news.specCardNew ? ` ${nextBadge(loc)}` : ""}${noSpec ? ` ${loc.p("Today, <code>/vg spec</code> answers “{answer}” instead, and the <strong>Specialization</strong> section still shows.", { answer: esc(loc.addon("No specialization on this character yet.")) })}` : ""}</p>
<p>${loc.p("On a client that has them:")}</p>
<ul>
  <li>${loc.p("<code>/vg spec &lt;profile&gt;</code>, or <strong>{use}</strong> on the Profiles page, makes your current specialization use that profile. <code>/vg spec off</code> or <strong>{stop}</strong> stops it. <code>/vg spec</code> on its own says which profile your spec uses.", { use: lb("opt", "Use this profile for this spec"), stop: lb("opt", "Stop spec switching") })}</li>
  <li>${loc.p("When you change specialization, Vanguard asks: “{question}” When you log in, it uses your spec's profile without asking.", { question: reloadAsk(uses) })}</li>
  <li>${loc.p("A character with no specialization yet gets “{answer}”", { answer: qa("slash", "No specialization on this character yet.") })}</li>
</ul>`;
}

// Profiles & sharing. Plain player language only: every button, label and message is
// quoted from the addon (says() and label() stop the build when the addon's text changes).
export function profilesPage(model, read, loc = EN) {
  const v = model.version;
  const w = profileWords(read, loc);
  const news = profileNews(w, read);
  const nb = (isNew) => (isNew ? ` ${nextBadge(loc)}` : "");
  // The string's prefix, read from the exact line that writes it.
  const fuiPrefix = (w.N.ser.match(/string\.format\("([A-Z]+1:)%s:%s:%s", scope, S\.Checksum\(body\), body\)/) || [])[1];
  if (!fuiPrefix) throw new Error(`${w.f.ser}: the export string format not found in the addon source`);
  const defaultName = (w.N.db.match(/local DEFAULT_PROFILE = "([^"]+)"/) || [])[1];
  if (!defaultName) throw new Error(`${w.f.db}: the first profile's name not found in the addon source`);
  const d = esc(defaultName);
  return {
    path: "/profiles/",
    title: "Profiles & sharing",
    description: loc.p("Share one Vanguard layout across characters, or move it to another PC."),
    translated: true,
    body: `${pageHero(loc.t("title./profiles/"), loc.p("A profile holds all of Vanguard's settings and frame positions. Profiles are saved for your whole account, and each character uses one of them. The first one is called <strong>{name}</strong>.", { name: d }))}
${glance([loc.p("<code>/vg profile</code> says which profile you're using"), loc.p("<code>/vg export</code> and <code>/vg import</code> move one between PCs"), loc.p("The first profile is <strong>{name}</strong>", { name: d })])}
<div class="dis-grid">
${disclosure({ id: "which", title: loc.p("See which profile you're using"), open: true, body: profileWhich(w, news, defaultName, loc) })}
${disclosure({ id: "same-account", title: loc.p("Use one layout on several characters"), body: `${profileSwitching(w, news, v, loc)}

${profileList(w, news, loc)}

${profileChatTable(w, news, loc)}
<p>${loc.p("On the Profiles page, <strong>{reset}</strong> does the same as <code>/vg profile reset</code>, straight away and without asking first. The options window then shows its <strong>Reload now</strong> button.", { reset: w.lb("opt", "Reset profile") })}</p>` })}
${disclosure({ id: "share", title: loc.p("Move a profile to another account or PC"), body: profileShare(w, news, v, fuiPrefix, loc) })}
${disclosure({ id: "edit-mode", title: loc.p("The game's Edit Mode layout"), meta: `${nb(news.editNew)}`, next: news.editNew, body: profileEditMode(w, loc) })}
${disclosure({ id: "click-casting", title: loc.p("Click-casting bindings"), meta: `${nb(news.shareNew)}`, body: profileClickCasting(w, loc) })}
${disclosure({ id: "spec", title: loc.p("Profiles by specialization"), body: profileSpec(w, news, loc) })}
${disclosure({ id: "account-wide", title: loc.p("Shared by every character on your account"), meta: `${nb(news.vendorNew)}`, next: news.vendorNew, body: `<p>${loc.p("These aren't part of any profile, and every character on your account shares them: vendor memory (which merchants sell what) and auction house prices.")}</p>` })}
</div>`,
  };
}

// ------------------------------------------------------------------ Troubleshooting

// Turns a captured Lua string into display text: each join (" .. x .. ")
// becomes the next placeholder, <name> by default, and each %s or ns.Format slot ({name}) an ellipsis.
function luaText(text, names = []) {
  let i = 0;
  return text.replace(/" \.\. [\w.():]+ \.\. "/g, () => `<${names[i++] || "name"}>`).replace(/%s|\{\w+\}/g, "…");
}

// One fact from FACTS: the captured text, or null when it isn't in the code
// ("both" needs the same text in the current release and the next, a %s and a
// {name} slot being the same), in the page's language when the addon translates
// that text (English otherwise; the next release's wording is the one translated).
function readFact(read, [, where, file, re, names], loc) {
  const one = (ref) => grab(read[ref](file), re);
  const same = (a, b) => a !== null && b !== null && luaText(a, names) === luaText(b, names);
  const raw = where === "both" ? (same(one("rel"), one("next")) ? one("next") : null) : one(where);
  return raw === null ? null : luaText(loc.addon(raw), names);
}

// Every fact the help page quotes, plus the version and the import reasons.
function helpFacts(model, read, loc) {
  const facts = { v: model.version };
  for (const f of FACTS) facts[f[0]] = readFact(read, f, loc);
  // Releases before 0.4.0 name the addon ForeverUI in these reasons; read as Vanguard, they're the same.
  const reasons = (ref) => [...(read[ref]("Core/Serialize.lua") || "").matchAll(/return nil, "([^"]+)"/g)].map((m) => loc.addon(m[1].replace("ForeverUI", "Vanguard")));
  const rel = reasons("rel");
  // The current release's reasons: a newer release may add some, and the page describes the current one.
  facts.reasons = rel.length ? rel : null;
  return facts;
}

// The {key} names a text uses (the badges and the addon's {ui:...} words aside).
function keysOf(text) {
  return [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).filter((k) => k !== "NEXT" && k !== "RELOAD");
}

// A text with its {key}s filled in: escaped text, a list for a list, the badges for {NEXT} and
// {RELOAD}, and {ui:Text} the addon's own word for a button or page, in the page's language.
function fill(text, facts, loc, words) {
  const quote = (t) => words.page.quote.replace("{text}", esc(t));
  return text.replace(/\{ui:([^}]+)\}/g, (_, w) => esc(loc.addon(w))).replace(/\{(\w+)\}/g, (_, k) => {
    if (k === "NEXT") return nextBadge(loc);
    if (k === "RELOAD") return reloadBadge(loc);
    const v = facts[k];
    return Array.isArray(v) ? `<ul>${v.map((r) => `<li>${quote(r)}</li>`).join("")}</ul>` : esc(v);
  });
}

// The entries of a section whose facts were all found in the code.
function sourcedEntries(section, facts) {
  return section.entries.filter((e) => [e.a, ...e.src].flatMap(keysOf).every((k) => facts[k] != null));
}

// One question and answer as a card, with where it comes from (file names stay English).
function helpEntry(e, facts, loc, words) {
  const next = e.badge === "next";
  const { q, a } = words.entries[e.id];
  return `<section class="card help-entry" id="${e.id}" aria-labelledby="${e.id}-q"${next ? ' data-avail="next"' : ""}>
<details class="disclosure">
<summary><h3 id="${e.id}-q">${esc(q)}</h3>${next ? `<span class="dis-meta">${nextBadge(loc)}</span>` : ""}</summary>
<div class="dis-body">
${fill(a, facts, loc, words)}
${sourceNote(loc, e.src.map((s) => s.replace(/\{(\w+)\}/g, (_, k) => String(facts[k]))))}
</div>
</details>
</section>`;
}

// "19 questions" in the page's language.
function questionCount(n, loc, words) {
  const forms = words.page.questions;
  return (forms[new Intl.PluralRules(loc.lang).select(n)] ?? forms.other).replace("{n}", n);
}

// One section, folded: its heading opens its sourced entries (nothing when none are left).
function helpSection(s, facts, open, loc, words) {
  if (!s.shown.length) return "";
  const body = `<div class="dis-grid">${s.shown.map((e) => helpEntry(e, facts, loc, words)).join("\n")}</div>`;
  return disclosure({ id: s.id, title: esc(words.sections[s.id]), open, meta: questionCount(s.shown.length, loc, words), body });
}

// The closing part: known issues, then what to do when the page doesn't help.
function helpFooter(words) {
  return disclosure({ id: "known-issues", title: esc(words.page.knownTitle), body: words.page.known });
}

// The Troubleshooting & FAQ page in a language (help-content.mjs holds its English words and
// sources, scripts/lib/i18n-pages-*.mjs the other languages'). Which entries show is decided by
// the English facts, so every language shows the same ones.
export function helpPage(model, read, loc = EN) {
  const words = loc.pages?.help ?? ENGLISH_HELP;
  const facts = helpFacts(model, read, loc);
  const sections = SECTIONS.map((s) => ({ ...s, shown: sourcedEntries(s, facts) }));
  if (loc.english) for (const s of sections) for (const e of s.entries) if (!s.shown.includes(e)) console.warn(`help: left off "${e.q}" (a quoted fact is not in the addon at this ref)`);
  const body = [pageHero(esc(loc.text("title./help/")), words.page.lede),
    glance([words.page.glanceStatus, words.page.glanceReport]),
    ...sections.map((s, i) => helpSection(s, facts, i === 0, loc, words)), helpFooter(words), supportAsk("help", words.page.ask, undefined, words.page.thanks)];
  return { path: "/help/", title: "Troubleshooting & FAQ", description: words.page.description, body: body.join("\n"), translated: true };
}

// ------------------------------------------------------------------ Feedback

// The "Part of Vanguard" options: the addon's modules, grouped as on the
// Features page, then the four general choices. Values are module keys; the
// Function reads the same list from site-data.json. Each option carries its English name in
// data-en, which the preview shows, so it reads as the report the Function files.
function areaOptions(model, loc) {
  const byKey = new Map(model.modules.map((m) => [m.key, m]));
  const used = new Set();
  const groups = AREAS.map(([title, keys]) => {
    const mods = keys.map((k) => byKey.get(k)).filter(Boolean);
    mods.forEach((m) => used.add(m.key));
    return [title, mods];
  });
  const rest = model.modules.filter((m) => !used.has(m.key));
  if (rest.length) groups.push(["Other modules", rest]);
  const opt = (value, label, english) => `<option value="${esc(value)}" data-en="${esc(english)}">${esc(label)}</option>`;
  return [`<option value="">${loc.p("Choose one")}</option>`,
    ...groups.filter(([, mods]) => mods.length).map(([title, mods]) => `<optgroup label="${esc(loc.p(title))}">${mods.map((m) => opt(m.key, loc.addon(m.name), m.name)).join("")}</optgroup>`),
    `<optgroup label="${esc(loc.p("Something else"))}">${FALLBACK_AREAS.map(([v, l]) => opt(v, loc.p(l), l)).join("")}</optgroup>`].join("\n");
}

// One labelled text field: input (or textarea) with its hint and error line.
function field(name, label, { area = false, required = false, hint = "", rows = 4, type = "text", autocomplete = "off", loc = EN } = {}) {
  const [min, max] = LIMITS[name];
  const id = `fb-${name}`;
  const req = required ? " required" : "";
  const limits = `${min > 0 && min > 1 ? ` minlength="${min}"` : ""} maxlength="${max}"`;
  const describe = `aria-describedby="${id}-hint ${id}-err"`;
  const control = area
    ? `<textarea id="${id}" name="${name}" rows="${rows}"${req}${limits} ${describe}></textarea>`
    : `<input id="${id}" name="${name}" type="${type}" autocomplete="${autocomplete}"${req}${limits} ${describe}>`;
  const count = (n) => n.toLocaleString(loc.english ? "en-US" : loc.lang);
  const limitText = min > 1 ? loc.p("{min} to {max} characters.", { min: count(min), max: count(max) }) : loc.p("Up to {max} characters.", { max: count(max) });
  return `<div class="field" data-field="${name}">
<label for="${id}">${label}${required ? "" : ` <span class="opt">${loc.p("(optional)")}</span>`}</label>
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

// What to paste for the report field: /vg report when the addon has it, else status and errors.
function reportHint(model, loc) {
  const rel = model.commands.relKeys.has("report");
  const next = model.commands.nextKeys.has("report");
  if (rel) return loc.p("Type <code>/vg report</code> in game and paste what it shows.");
  if (next) return `${loc.p("Paste the lines of <code>/vg status</code> (and any error lines): see the steps below.")}${nextOnly(` ${nextBadge(loc)} ${loc.p("has <code>/vg report</code>, one block to paste.")}`)}`;
  return loc.p("No Vanguard version has <code>/vg report</code> yet, so paste the lines of <code>/vg status</code> and <code>/vg errors</code>: see the steps below.");
}

// What the paste box does: /vg feedback's block fills the form, where the addon has that command.
function pasteHint(model, loc) {
  const rel = model.commands.relKeys.has("feedback");
  const next = model.commands.nextKeys.has("feedback");
  const how = loc.p("To skip the typing, type <code>/vg feedback</code> in game, answer its questions and press <strong>{button}</strong>, then paste the block it shows here: the fields below fill themselves.", { button: esc(loc.addon("Make report")) });
  if (rel) return how;
  const report = loc.p("A pasted <code>/vg report</code> goes in the report box below.");
  if (next) return `${report}${nextOnly(` ${nextBadge(loc)} ${how}`)}`;
  return report;
}

// The paste box above the form's fields: a /vg feedback block pasted here
// fills them. It has no name, so it is never sent; assets/feedback.js reads it.
function pasteBox(model, loc) {
  return `<div class="field fb-paste">
<label for="fb-paste">${loc.p("From the game")} <span class="opt">${loc.p("(optional)")}</span></label>
<textarea id="fb-paste" rows="3" aria-describedby="fb-paste-hint fb-filled"></textarea>
<p class="hint" id="fb-paste-hint">${pasteHint(model, loc)}</p>
<p class="hint fb-filled" id="fb-filled" role="status" hidden></p>
</div>`;
}

// The form: the paste box, kind, summary, the bug or feature fields, contact,
// the acknowledgement and the spam checks. Shown only with JavaScript.
function feedbackForm(model, loc) {
  const v = model.version;
  const P = (english) => loc.p(english);
  return `<form id="fb-form" class="fb-form fb-needs-js" novalidate>
${pasteBox(model, loc)}
<fieldset class="field fb-kind" data-field="kind">
<legend>${P("What would you like to send?")}</legend>
<label><input type="radio" name="kind" value="bug" checked> ${P("Report a bug")}</label>
<label><input type="radio" name="kind" value="feature"> ${P("Request a feature")}</label>
<p class="err" id="fb-kind-err" hidden></p>
</fieldset>
${field("title", P("Short summary"), { required: true, hint: P("For example: Raid frames go blank after a reload."), loc })}
<fieldset class="fb-group" data-kind="bug">
<legend class="sr-only">${P("Bug report")}</legend>
${field("report", P("Paste your /vg report (or /vg status + /vg errors)"), { area: true, rows: 8, hint: reportHint(model, loc), loc })}
${checkbox("no_report", loc.p("I'm on v{version}, or I couldn't get the report", { version: esc(v) }))}
${field("did", P("What did you do?"), { area: true, required: true, loc })}
${field("expected", P("What did you expect?"), { area: true, rows: 3, loc })}
${field("happened", P("What happened instead?"), { area: true, required: true, loc })}
</fieldset>
<fieldset class="fb-group" data-kind="feature" disabled hidden>
<legend class="sr-only">${P("Feature request")}</legend>
${field("want", P("What do you want?"), { area: true, required: true, loc })}
<div class="field" data-field="area">
<label for="fb-area">${P("Part of Vanguard")}</label>
<select id="fb-area" name="area" required aria-describedby="fb-area-err">
${areaOptions(model, loc)}
</select>
<p class="err" id="fb-area-err" hidden></p>
</div>
${field("why", P("Why would it help you?"), { area: true, required: true, loc })}
</fieldset>
${checkbox("contact_ok", P("I'm OK being contacted about this report"))}
<div class="fb-contact" hidden>
${field("contact", P("Discord tag or email"), { autocomplete: "email", hint: P("Kept privately for 90 days so a maintainer can ask you a question. It is never put in the report."), loc })}
</div>
${checkbox("public_ack", P("I understand this report is sent to the private repository the Vanguard maintainers use. It is not a public issue, and the maintainers can read everything in the preview."), { required: true })}
<div class="hp" aria-hidden="true"><label for="fb-hp">Leave this empty</label><input id="fb-hp" name="fui_hp" type="text" tabindex="-1" autocomplete="off"></div>
<p class="small">${P("Screenshots can't be sent with this form yet: describe what you see instead.")}</p>
<div class="fb-actions"><button class="button" type="submit">${P("Preview")}</button></div>
</form>`;
}

// The messages assets/feedback.js shows, read from its source and the field checks it shares
// (src/feedback/fields.js): each tr("…") and say("…") text and each field's label.
function scriptMessages() {
  const code = ["src/assets/feedback.js", "src/feedback/fields.js"].map((f) => fs.readFileSync(path.join(root, f), "utf8")).join("\n");
  const calls = [...code.matchAll(/\b(?:tr|say)\("((?:[^"\\]|\\.)*)"/g)].map((m) => JSON.parse(`"${m[1]}"`));
  const labels = [...code.matchAll(/\["[\w-]+", "([^"]+)"\]/g)].map((m) => m[1]);
  return [...new Set([...calls, ...labels])];
}

// The page's translations of the script's messages, for assets/feedback.js; nothing in English.
function messagesJson(loc) {
  const own = Object.fromEntries(scriptMessages().map((m) => [m, loc.p(m)]));
  return loc.english ? "" : `\n<script type="application/json" id="fb-messages">${JSON.stringify(own).replace(/</g, "\\u003c")}</script>`;
}

// The preview and confirmation steps, filled in by assets/feedback.js.
function feedbackSteps(loc) {
  const P = (english) => loc.p(english);
  return `<section id="fb-preview" class="fb-step" hidden aria-labelledby="fb-preview-h">
<h3 id="fb-preview-h" tabindex="-1">${P("Check your report")}</h3>
<p>${P("This is exactly what will be sent to the private repository the Vanguard maintainers use. It is not a public issue.")}</p>
<dl class="facts">
<dt>${P("Title")}</dt><dd id="fb-preview-title"></dd>
<dt>${P("Labels")}</dt><dd id="fb-preview-labels"></dd>
</dl>
<pre id="fb-preview-body" class="fb-preview-body"></pre>
<p class="small" id="fb-preview-note"></p>
<div id="fb-turnstile" class="fb-turnstile"></div>
<div id="fb-send-error" class="notice fb-alert" role="alert" hidden></div>
<div class="fb-actions">
<button class="button" type="button" id="fb-send">${P("Send report")}</button>
<button class="button secondary" type="button" id="fb-edit">${P("Edit")}</button>
<button class="copy" type="button" data-copy-from="#fb-preview-body" aria-label="${esc(loc.p("Copy the report text"))}">${P("Copy report text")}</button>
</div>
</section>
<section id="fb-done" class="fb-step" hidden aria-labelledby="fb-done-h">
<h3 id="fb-done-h" tabindex="-1">${P("Thanks: your report is in")}</h3>
<p>${P(`Your reference is <strong class="fb-ref" id="fb-ref"></strong>. <span id="fb-done-dup"></span>`)}</p>
<p>${P("Keep it: quote it if you want to add something, or to have the report removed.")}</p>
<div class="fb-actions"><button class="button secondary" type="button" id="fb-again">${P("Send another")}</button></div>
</section>${messagesJson(loc)}`;
}

// What happens to a report: who sees it, what it may hold, and how to have it removed.
function privacyNote(loc) {
  const items = [
    "No account or email is needed.",
    "Your report is sent to the private repository the Vanguard maintainers use. Only the project's maintainers can read it. It is not posted anywhere public.",
    "A pasted report can hold character or profile names, chat, or guild details. Check the preview, and take out anything you'd rather not send.",
    "If you tick \"OK being contacted\", your Discord tag or email is kept privately for 90 days and is never put in the report.",
    "Your IP address is never stored or put in a report. To stop floods, the site keeps a scrambled key made from it for an hour or two, and that key changes every day.",
    "To have a report removed, send another report with the title “Remove VG-…” and your reference. A maintainer deletes it.",
    "Every report gets its own reference, shown only to the person who sent it. If yours was added to an earlier report of the same error, your reference is on your part alone, so a removal request covers only what you sent.",
  ];
  return disclosure({ id: "privacy", title: loc.p("Where your report goes"), body: `<ul>
${items.map((i) => `<li>${loc.p(i)}</li>`).join("\n")}
</ul>` });
}

// The two templates a player can copy when the form can't be used.
function feedbackTemplates(v, relErrors, loc) {
  const errorsLine = relErrors ? loc.p("/vg errors (paste every line):") : loc.p(`/vg errors (paste every line; on {version}, paste any "failed to load" line from chat instead):`, { version: v });
  const bug = `${loc.p("Vanguard bug report")}
${loc.p("What I did:")}
${loc.p("What I expected:")}
${loc.p("What happened instead:")}

${loc.p("/vg status (paste every line):")}

${errorsLine}

${loc.p("Screen resolution and UI scale (if you know them):")}`;
  const feature = `${loc.p("Vanguard feature request")}
${loc.p("What I want:")}
${loc.p("Which part of Vanguard it touches (a module from the Features page, a command, or a setting):")}
${loc.p("Why it would help me:")}`;
  return { bug, feature };
}

// The bug half of "Get your report ready": the steps and the template.
function readyBug(model, read, templates, loc) {
  const v = model.version;
  const NEXT = nextBadge(loc);
  const relStatusLines = (grab(read.rel("Core/Slash.lua"), /local function statusCommand\(\)([\s\S]*?)\nend/) || "").match(/chat\(/g)?.length || 0;
  const nextStatusLines = (grab(read.next("Core/Slash.lua"), /local function statusCommand\(\)([\s\S]*?)\nend/) || "").match(/chat\(/g)?.length || 0;
  const relErrors = model.commands.relKeys.has("errors");
  const failLine = grab(read.rel("Core/Modules.lua"), /string\.format\("(module %s failed to load: %s)"/);
  const errorsStep = relErrors
    ? loc.p("<strong>Type <code>/vg errors</code></strong> and copy all of it.")
    : `${loc.p("<strong>Copy any error lines</strong>. v{version} has no <code>/vg errors</code> yet; if chat showed {line}, copy that whole line.", { version: esc(v), line: failLine ? `“${esc(failLine.replace(/%s/g, "…"))}”` : loc.p("an error") })}${nextOnly(` ${NEXT} ${loc.p("<code>/vg errors</code> lists the errors Vanguard caught this session, with stacks and counts, ready for a bug report.")}`)}`;
  return `<section class="card" aria-labelledby="bug">
<h3 id="bug">${loc.p("Report a bug")}</h3>
<ol class="steps">
  <li>${loc.p("<strong>Write down what you did</strong>, what you expected, and what happened instead.")}</li>
  <li>${loc.p("<strong>Type <code>/vg status</code></strong> and copy all of its lines. In v{version} it prints {n} lines: the version, profile and module count, then skins, painted frames and changes waiting on combat.", { version: esc(v), n: relStatusLines })}${nextStatusLines > relStatusLines ? nextOnly(` ${NEXT} ${loc.p("prints {n}, adding the client, what it has, and your UI scale and text size.", { n: nextStatusLines })}`) : ""}</li>
  <li>${errorsStep}</li>
</ol>
<p class="small">${loc.p("Can't copy text from chat? Type out the lines that matter, or describe them.")}${model.commands.nextKeys.has("copy") && !model.commands.relKeys.has("copy") ? nextOnly(` ${loc.p("In the next release, <code>/vg copy</code> opens the recent chat as plain text, ready to copy.")}`) : ""}</p>
<h4>${loc.p("Bug report template")}</h4>
<pre class="template" id="bug-template">${esc(templates.bug)}</pre>
<button class="copy" type="button" data-copy-from="#bug-template" aria-label="${esc(loc.p("Copy the bug report template"))}">${loc.p("Copy template")}</button>
</section>`;
}

// The feature half of "Get your report ready": what to answer and the template.
function readyFeature(model, templates, loc) {
  const check = model.same
    ? loc.p(`Before you ask, check <a href="/features/">Features</a>: it may already be there.`)
    : loc.p(`Before you ask, check <a href="/features/">Features</a>: it may already be there, or written for the next release (turn on <strong>Show what's coming</strong> in the sidebar to see those).`);
  return `<section class="card" aria-labelledby="feature">
<h3 id="feature">${loc.p("Request a feature")}</h3>
<p>${loc.p("Tell us what would make Vanguard better for you. Please answer:")}</p>
<ol class="steps">
  <li>${loc.p("<strong>What you want.</strong>")}</li>
  <li>${loc.p(`<strong>Which part of Vanguard it touches</strong>: a module from <a href="/features/">Features</a>, a <a href="/commands/">command</a> or a <a href="/settings/">setting</a>.`)}</li>
  <li>${loc.p("<strong>Why it would help you.</strong>")}</li>
</ol>
<div class="notice info"><p>${loc.p("<strong>Reviewed, not promised.</strong> Every request is read and considered, but there's no promise that it will be built, or when.")}</p></div>
<h4>${loc.p("Feature request template")}</h4>
<pre class="template" id="feature-template">${esc(templates.feature)}</pre>
<button class="copy" type="button" data-copy-from="#feature-template" aria-label="${esc(loc.p("Copy the feature request template"))}">${loc.p("Copy template")}</button>
<p class="small template-note">${check}</p>
</section>`;
}

export function feedbackPage(model, read, loc = EN) {
  const templates = feedbackTemplates(model.version, model.commands.relKeys.has("errors"), loc);
  return {
    path: "/feedback/",
    title: "Feedback",
    description: loc.p("Report a Vanguard bug or request a feature."),
    translated: true,
    scripts: ["/assets/feedback.js"],
    body: `${pageHero(loc.t("title./feedback/"), loc.p("Report a bug or ask for a feature. No account or email is needed, and you see exactly what's sent before it goes."))}
<section class="card fb" aria-labelledby="send">
<h2 id="send">${loc.p("Send a report")}</h2>
<div class="notice todo fb-nojs" role="note"><p>${loc.p("<strong>The form needs JavaScript.</strong> Turn JavaScript on to send a report from this page. Until then, get your report ready with the steps and templates below, and keep it.")}</p></div>
<div id="fb-status" class="notice fb-alert fb-needs-js" role="status" hidden></div>
${feedbackForm(model, loc)}
${feedbackSteps(loc)}
</section>
${privacyNote(loc)}
${disclosure({ id: "get-ready", title: loc.p("Get your report ready"), meta: loc.p("steps and templates"), body: `<div class="grid two">
${readyBug(model, read, templates, loc)}
${readyFeature(model, templates, loc)}
</div>
${sourceNote(loc, ["Core/Slash.lua (status, errors)", "Core/Modules.lua", "docs/SMOKE-TEST.md (Report block)", "README.md"])}` })}`,
  };
}

// ------------------------------------------------------------------ Changelog

// PR titles from an auto-generated release body, without links or authors.
function notesOf(body) {
  return [...(body || "").matchAll(/^\*\s+(.+?)\s+by\s+@\S+\s+in\s+\S+\s*$/gm)].map((m) => m[1]);
}

// One "What's coming" group: its heading and its bullets.
function nextGroup(g, loc) {
  const items = g.items.map((i) => `<li><strong>${esc(loc.p(i.label))}:</strong> ${esc(loc.p(i.text))}</li>`);
  return `<h3 id="next-${g.id}">${esc(loc.p(g.title))}</h3>\n<ul class="changes">${items.join("")}</ul>`;
}

// What's merged since the current release, while that release is the one the
// notes were written after; nothing once a newer release is out.
function nextSection(model, loc) {
  if (model.same || model.release.tag !== NEXT_RELEASE.after || !NEXT_RELEASE.groups.length) return "";
  const n = NEXT_RELEASE.groups.reduce((t, g) => t + g.items.length, 0);
  const intro = `<p>${loc.p(`Not released yet, so it has no version number or date. Everything here is written and waiting; v{version} doesn't have it. <a href="/features/">Features</a>, <a href="/commands/">Commands</a> and <a href="/settings/">Settings</a> show these parts when you turn on <strong>Show what's coming</strong> in the sidebar.`, { version: esc(model.version) })}</p>`;
  return `<section class="card" aria-labelledby="next-h">
<details class="disclosure">
<summary><h2 id="next-h">${loc.p("What's coming in the next release")}</h2><span class="dis-meta">${loc.pn({ one: "{n} change", other: "{n} changes" }, n)}</span></summary>
<div class="dis-body">
${intro}
${NEXT_RELEASE.groups.map((g) => nextGroup(g, loc)).join("\n")}
</div>
</details>
</section>`;
}

// A release's grouped notes (New, Improved, Fixed), each group folded under its heading.
function groupedNotes(r, groups, loc) {
  return groups.map((g) => disclosure({ id: `rel-${esc(r.tagName)}-${g.id}`, level: 3, title: esc(loc.p(g.title)), meta: loc.pn({ one: "{n} change", other: "{n} changes" }, g.items.length),
    body: `<ul class="changes">${g.items.map((i) => `<li><strong>${esc(loc.p(i.label))}:</strong> ${esc(loc.p(i.text))}</li>`).join("")}</ul>` })).join("\n");
}

// A release's bullets: the player-language notes (grouped for a big release), else its release note titles.
function releaseNotes(r, loc) {
  const own = RELEASE_NOTES[r.tagName];
  if (own?.groups) return groupedNotes(r, own.groups, loc);
  const notes = own?.map((n) => loc.p(n.text)) || notesOf(r.body);
  return notes.length ? `<ul class="changes">${notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : `<p>${loc.p("No notes.")}</p>`;
}

// One published release: its tag, date, a Current release badge, and its notes.
function releaseSection(r, model, loc) {
  const isCurrent = r.tagName === model.release.tag;
  const current = isCurrent ? ` <span class="badge rel">${loc.p("Current release")}</span>` : "";
  return `<section aria-labelledby="rel-${esc(r.tagName)}">
<details class="disclosure"${isCurrent ? " open data-open" : ""}>
<summary><h2 id="rel-${esc(r.tagName)}">${esc(r.tagName)}</h2><span class="dis-meta">${esc(dateET(r.publishedAt, loc))}${current}</span></summary>
<div class="dis-body">
${releaseNotes(r, loc)}
</div>
</details>
</section>`;
}

// The Changelog page: the next release first, then every release, newest first.
export function changelogPage(model, loc = EN) {
  const rels = model.releases.releases.slice().sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const body = [pageHero(loc.t("title./changelog/"), loc.p("Newest first: what each Vanguard release changed, in plain words.")),
    supportAsk("changelog", loc.p("Vanguard is free. If these releases are useful to you,"), undefined, loc.p("Say thanks on Ko-fi")),
    ...rels.map((r) => releaseSection(r, model, loc)), nextSection(model, loc), `<p class="small">${loc.p("Every line comes from the changes merged into the addon for that release.")}</p>`];
  return { path: "/changelog/", title: "Changelog", description: loc.p("What changed in each Vanguard release, newest first, and what's coming next."), body: body.join("\n"), translated: true };
}

// ------------------------------------------------------------------ Credits

// A README section's body ("## Credits" -> text up to the next heading; the
// spec text that follows the README starts with a feature page's "# Title").
function section(readme, name) {
  const m = readme.match(new RegExp(`^## ${name}\\s*\\n([\\s\\S]*?)(?=^#{1,2} |(?![\\s\\S]))`, "m"));
  return m ? m[1].trim() : "";
}

// What the top of a LICENSE file says: the MIT License's name and its copyright line, or, for an
// all-rights-reserved notice, its copyright line ("Copyright (c) 2026 … All rights reserved.").
export function licenseSummary(text) {
  const lines = String(text || "").split("\n").map((l) => l.trim()).filter(Boolean);
  if (/^MIT License$/i.test(lines[0] || "")) return { head: "MIT License", line: lines[1] || "", released: "released under the MIT License" };
  return { head: lines[0] || "", line: "", released: "" };
}

// Credits' License section: the licence's own words stay as written (English, marked so),
// with the page's words around them.
function creditsLicense(model, lic, loc) {
  const relLicense = section(model.rel.readme, "License");
  const nextLicense = section(model.next.readme, "License");
  const en = loc.english ? "" : ' lang="en"';
  const nextPart = nextLicense && nextLicense !== relLicense
    ? nextOnly(`<p>${loc.p("The next release also bundles shared libraries; its README says:")}</p><blockquote class="card prose"${en}><p>${md(nextLicense)}</p></blockquote>`, "div") : "";
  return `<p${en}><strong>${esc(lic.head)}</strong>${lic.line ? `. ${esc(lic.line)}.` : ""}</p>
<p>${loc.p("From the v{version} README:", { version: esc(model.version) })}</p>
<blockquote class="card prose"${en}><p>${md(relLicense)}</p></blockquote>
${nextPart}`;
}

// The Support section of Credits: the ways to support, each with what it is.
function creditsSupport(loc) {
  return `<p>${loc.p("Vanguard is free, and always will be. If you'd like to help its development, you can:")}</p>
<ul>${supportOn().map((l) => `<li><a href="${esc(l.url)}" rel="noopener">${esc(l.name)}</a>: ${esc(loc.p(l.what))}</li>`).join("")}</ul>
<p class="small">${loc.p("Supporting is never needed to use any part of Vanguard.")}</p>`;
}

export function creditsPage(model, site, loc = EN) {
  const lic = licenseSummary(model.rel.license);
  const nextCredits = section(model.next.readme, "Credits");
  const bullets = nextCredits.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2).replace(/,?\s*https?:\/\/[^\s:,)]+/g, ""));
  const en = loc.english ? "" : ' lang="en"';
  const lede = lic.released
    ? loc.p("Vanguard is made by {author} and released under the MIT License.", { author: esc(site.author) })
    : `${loc.p("Vanguard is made by {author}.", { author: esc(site.author) })} ${esc(lic.head)}`;
  const listed = model.same ? loc.p("As listed in the addon's README:") : loc.p("As listed in the addon's README for the next release:");
  return {
    path: "/credits/",
    title: "Credits & license",
    description: loc.p("Vanguard's license and the fonts, libraries and art it uses."),
    translated: true,
    body: `${pageHero(loc.t("title./credits/"), lede)}
${disclosure({ id: "license", title: loc.p("License"), open: true, body: creditsLicense(model, lic, loc) })}
${bullets.length ? disclosure({ id: "credits", title: loc.p("Fonts, libraries and art"), body: `<p>${listed}</p><ul${en}>${bullets.map((b) => `<li>${md(b)}</li>`).join("")}</ul>` }) : ""}
${supportOn().length ? disclosure({ id: "support", title: loc.p("Support Vanguard"), body: creditsSupport(loc) }) : ""}
${disclosure({ id: "site", title: loc.p("This website"), body: `<p>${loc.p(`This site uses Fira Sans Condensed, the same font as the addon, under the SIL Open Font License 1.1: <a href="/fonts/OFL.txt">license text</a>. Its colors are Vanguard's own theme colors.`)}</p>
<p>${loc.p("Vanguard is an addon for WoW Forever.")}</p>
${sourceNote(loc, ["LICENSE", "README.md (License, Credits)", "Media/Fonts/OFL.txt"])}` })}`,
  };
}

// ------------------------------------------------------------------ Support

// The Support page's words in English (HTML). Other languages: scripts/lib/i18n-pages-*.mjs,
// the same keys. It makes no claim about Vanguard's features.
export const SUPPORT_PAGE = {
  description: "Vanguard is free and built by one person. Here is what support pays for, how to give it, and other ways to help.",
  lede: "Vanguard is free to use, and always will be. Support is a thank-you, never a requirement.",
  paysTitle: "What support pays for",
  pays: `<p>Vanguard is built by one person. Support pays for the time to keep it working as WoW Forever patches change, and to fix what players report.</p>
<p>It never unlocks anything: every part of Vanguard works the same for everyone.</p>`,
  giveTitle: "Give on Ko-fi",
  giveButton: "Support Vanguard on Ko-fi",
  giveNote: "Ko-fi takes the payment and shows its own options. Nothing is sent to Vanguard or this site.",
  otherTitle: "Can't chip in? These help too",
  other: `<ul>
  <li>Tell other players about Vanguard.</li>
  <li>Send a bug report or an idea on the <a href="/feedback/">Feedback page</a>.</li>
  <li>Include the lines of <code>/vg status</code> when something goes wrong, so it can be fixed faster.</li>
</ul>`,
  follow: "Follow {x} on X for news, and talk with other players on {discord}.",
};

// The "other ways to help" list with the community line (X and Discord) as its last item, when there is one.
function withFollow(list, follow) {
  return follow ? list.replace("</ul>", `  <li>${follow}</li>\n</ul>`) : list;
}

// The Support page: what support pays for, the Ko-fi link, and other ways to help. The only page
// that asks at length; Ko-fi's own script is not loaded here (no third-party code on the site).
export function supportPage(loc = EN) {
  const w = loc.pages?.support ?? SUPPORT_PAGE;
  const kofi = supportOn().find((l) => l.name === "Ko-fi");
  const url = kofi ? `${kofi.url}?utm_source=vanguardui&utm_medium=site&utm_campaign=support-page` : "";
  return {
    path: "/support/",
    title: "Support Vanguard",
    description: w.description,
    translated: true,
    body: `${pageHero(esc(loc.text("title./support/")), w.lede)}
${disclosure({ id: "pays-for", title: esc(w.paysTitle), open: true, body: w.pays })}
${kofi ? disclosure({ id: "give", title: esc(w.giveTitle), open: true, body: `<p><a class="button" href="${esc(url)}" rel="noopener">${esc(w.giveButton)}</a></p>
<p class="small">${esc(w.giveNote)}</p>` }) : ""}
${disclosure({ id: "other-ways", title: esc(w.otherTitle), body: withFollow(w.other, followLine(w.follow)) })}`,
  };
}

// ------------------------------------------------------------------ Screenshots

// One group of screenshots as a folded section. A group whose every shot is next-release only is too.
function shotGroup(g, loc) {
  const next = g.shots.every((x) => x.next);
  return disclosure({ id: g.id, title: esc(loc.p(g.title)), meta: loc.pn({ one: "{n} shot", other: "{n} shots" }, g.shots.length), next, cls: "area", body: `<p>${esc(loc.p(g.intro))}</p>\n<div class="shots-grid">${g.shots.map((x) => shotFigure(x, { loc })).join("\n")}</div>` });
}

// The Screenshots page: real in-game captures, grouped by what they show.
export function screenshotsPage(model, loc = EN) {
  const n = SHOT_GROUPS.reduce((t, g) => t + g.shots.length, 0);
  return {
    path: "/screenshots/",
    title: "Screenshots",
    description: loc.p("Real in-game screenshots of Vanguard in WoW Forever."),
    translated: true,
    body: `${pageHero(loc.t("title./screenshots/"), loc.p("Real captures from the game, not mock-ups. Click one to see it full size."))}
${glance([loc.pn({ one: "<strong>{n}</strong> in-game screenshot", other: "<strong>{n}</strong> in-game screenshots" }, n), ...(model && !model.same ? [loc.p("Shots of things only the next release has hide with the rest of it")] : []), loc.p(`The same pictures sit beside their module on <a href="/features/">Features</a>`)])}
<div class="dis-grid">${SHOT_GROUPS.map((g) => shotGroup(g, loc)).join("\n")}</div>
<p class="small">${loc.p("Taken in WoW Forever with the default Slate and brass look. Names of other players are blurred or cropped out.")}</p>`,
  };
}
