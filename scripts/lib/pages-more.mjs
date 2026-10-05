// Profiles & sharing, Troubleshooting & FAQ, Feedback, Changelog, Credits.
// Messages in quotes are copied from the addon's Lua; each section names its
// source file. Where the current release and the next release differ, the
// page says which is which.
import { esc, md, badge } from "./html.mjs";
import { src, dateET, nextNotice, earlyQuote } from "./pages-main.mjs";
import { FACTS, SECTIONS } from "./help-content.mjs";
import { RELEASE_NOTES, NEXT_RELEASE } from "./changelog-content.mjs";

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

// The closing part: known issues and where to go next.
function helpFooter() {
  return `<h2 id="known-issues">Known issues</h2>
<p>None confirmed yet: nothing has been checked in game. Problems confirmed by players will be listed here.</p>
<div class="notice info"><p><strong>Not covered here?</strong> Or the fix didn't help? Please <a href="/feedback/">report it on the Feedback page</a>, with the lines from <code>/fui status</code>.</p></div>`;
}

// The Troubleshooting & FAQ page (help-content.mjs holds its words and sources).
export function helpPage(model, read) {
  const facts = helpFacts(model, read);
  const sections = SECTIONS.map((s) => ({ ...s, shown: sourcedEntries(s, facts) }));
  const body = [`<h1>Troubleshooting &amp; FAQ</h1>`, `<p class="lede">Each answer uses ForeverUI's own commands and quotes its real messages. If your problem isn't here, or the fix doesn't help, please <a href="/feedback/">report it</a>.</p>`,
    nextNotice(model), helpJumps(sections), ...sections.map((s) => helpSection(s, facts)), helpFooter()];
  return { path: "/help/", title: "Troubleshooting & FAQ", description: "Fixes for common ForeverUI problems, using the addon's own commands and messages.", body: body.join("\n") };
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
<h2 id="next-h" style="margin-top:0">What's coming in the next release ${NEXT}</h2>
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
  const body = [`<h1>Changelog</h1>`, `<p class="lede">Newest first: what each ForeverUI release changed, in plain words.</p>`,
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
