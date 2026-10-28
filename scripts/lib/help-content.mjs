// The Troubleshooting & FAQ page's facts and entries.
// Every quoted message is read from the addon at build time (FACTS), so the
// page can only quote what the code really says. An entry whose facts can't
// be found is left off the page rather than shown with a guess.

// [key, where, file, regex with one capture, placeholder names].
// where: "rel" (the current release, which the page describes), "next" (the
// pinned newer source) or "both" (must read the same in both). Lua joins (" .. x .. ") in a capture
// become <name>, <layout>, ... in order, and %s or an ns.Format slot ({profile}) becomes "…". A "rel"
// fact with names is looked up in Locales by the next release's ns.Format text, whose slots show as those names.
export const FACTS = [
  ["unlockMsg", "both", "Core/Slash.lua", /chat\("(Unlocked: drag the handles\. \/vg lock when done\.)"\)/],
  ["resetAll", "both", "Core/Options.lua", /"button", "(Reset all positions)"/],
  ["themeHelp", "both", "Core/Slash.lua", /"theme reset"?,?\s+"?(every theme setting back to default)"/],
  ["resetTheme", "both", "Core/Options.lua", /"button", "(Reset theme)"/],
  ["modOff", "both", "Core/Options.lua", /"(A module that's off builds nothing and costs nothing\.)"/],
  ["keepDefault", "both", "README.md", /(Turn any module off under Modules to keep the default one\.)/],
  ["errorsHelp", "rel", "Core/Slash.lua", /"errors \[clear\]"?,?\s+"?(opens the errors Vanguard caught this session, with stacks and counts, in the copy window \(for a bug report\); clear empties the list)/],
  ["profResetAsk", "both", "Core/Options.lua", /confirmReset\("(Reset this profile\?)", "Reset"/],
  ["profReset", "both", "Core/Options.lua", /"(Profile (?:%s|\{\w+\}) as it was is saved as profile (?:%s|\{\w+\})\.)"/],
  ["nextSwitch", "rel", "Core/Slash.lua", /OfferReload\((?:ns\.Format\()?"(This character will use profile (?:" \.\. name \.\. "|\{profile\}) after the reload\.)"/, ["name"]],
  ["importFailed", "both", "Core/Slash.lua", /chat\((?:ns\.Format\()?"(Import failed:) (?:"|\{reason\})/],
  ["unread", "both", "README.md", /(go to the bars unread)/],
  ["auraHidden", "rel", "Core/Slash.lua", /and "(hidden right now)" or/],
  ["typeReload", "rel", "Core/Dialog.lua", /ns\.Chat\("(Type \/reload in chat to apply the change[^"]*)"\)/],
  ["waiting", "both", "Core/Slash.lua", /%d (change\(s\) waiting on combat)/],
  ["fixedBuild", "rel", "Core/Slash.lua", /local FIXED_BUILD = (\d+)/],
  ["buildWarn", "rel", "Core/Slash.lua", /"  ·  (update the game: [^"]+)"/],
  ["noSnip", "rel", "Core/Slash.lua", /"  ·  (secure snippets: no \(hover keys off\))"/],
  ["snipChat", "rel", "Core/Client.lua", /ns\.Chat\("(This client can't run secure snippets: [^"]+)"/],
  ["ccNote", "rel", "Modules/ClickCastOptions.lua", /list\.off:SetText\("([^"]+)"\)/],
  ["setupCombat", "rel", "Core/Setup.lua", /ns\.Chat\("(Setup opens when combat ends\.)"\)/],
  ["noReturn", "rel", "README.md", /(To run it again: `\/vg setup`, or \*\*Run setup\*\* under General → Layout)/],
  ["editNote", "rel", "Core/Movers.lua", /ns\.EDIT_NOTE = "([^"]+)"/],
  ["editOpt", "rel", "Core/Options.lua", /check\("(Show these handles in the game's Edit Mode too)"/],
  ["editMissing", "rel", "Core/Profiles.lua", /ns\.Chat\((?:ns\.Format\()?"(Profile (?:" \.\. ns\.ProfileName\(\) \.\. "|\{profile\}) uses Edit Mode layout (?:" \.\. name \.\. "|\{layout\}), which this account doesn't have\.)"/, ["name", "layout"]],
  ["footerLine", "rel", "Core/ErrorBadge.lua", /errorsText\(n\) \.\. "( caught this session: click to list them)"|"(\{count\} errors caught this session: click to list them)"/, ["n"]],
  ["noErrors", "rel", "Core/Slash.lua", /chat\("(No errors caught this session\.)"\)/],
  ["errorsClear", "rel", "Core/Dialog.lua", /f\.clear = button\(f, "([^"]+)"\)/],
  ["errorsReport", "rel", "Core/Dialog.lua", /f\.primary\.text:SetText\("([^"]+)"\)/],
  ["perfRecipe", "rel", "README.md", /(To measure Vanguard's CPU cost yourself)/],
  ["perfSlows", "rel", "README.md", /(it slows every addon a little, so turn it off when done)/],
  ["reportHelp", "rel", "Core/Slash.lua", /"report"?,?\s+"?(one block to copy for a bug report[^"]*)"/],
  ["reportTitle", "rel", "Core/Slash.lua", /ns\.ShowText\("(Vanguard report: Ctrl\+C, then paste at [^"]+)"/],
];

// The page's own words around the entries: the hero, the facts strip, the
// question count, the closing part and the Ko-fi line. HTML, like the answers.
// Other languages: scripts/lib/i18n-pages-*.mjs, the same keys.
export const HELP_PAGE = {
  description: "Fixes for common Vanguard problems, using the addon's own commands and messages.",
  lede: "Each answer uses Vanguard's own commands and quotes its real messages. Open a question to see the fix.",
  glanceStatus: "Start with <code>/vg status</code>: its lines say what's loaded",
  glanceReport: `Nothing here helps? <a href="/feedback/">Send a report</a>`,
  questions: { one: "{n} question", other: "{n} questions" },
  knownTitle: "Known issues",
  known: `<p>No known issues have been confirmed yet. Vanguard is an early release: not everything has been checked in the game yet, and some features are still being polished, so if something looks off, please tell us on the <a href="/feedback/">Feedback page</a>.</p>
<div class="notice info"><p><strong>Not covered here?</strong> Or the fix didn't help? Report it there as well, and include every line of <code>/vg status</code>.</p></div>`,
  ask: "Problem solved?",
  thanks: "Say thanks on Ko-fi",
  quote: "“{text}”",
};

// The page's entries, in order, by section. {key} is replaced by that fact
// (escaped); a list fact becomes a bulleted list, {NEXT} the Next release
// badge and {RELOAD} the Needs reload one. {ui:Text} is a button or page name
// of the addon's, in the page's language once the addon translates it.
// badge: "next" marks an entry that only applies to the next release (none
// today: the page describes the current release).
export const SECTIONS = [
  { id: "fixes", title: "Quick fixes", entries: [
    { id: "frame-moved", q: "A frame is off-screen or in the wrong place",
      a: `<p><code>/vg frames</code> lists the frames you can move. <code>/vg reset &lt;frame&gt;</code> puts one back in its default spot, and <code>/vg reset all</code> (or <strong>{resetAll}</strong> under <strong>{ui:General} → {ui:Layout}</strong> in <code>/vg</code>) puts every frame back.</p><p>To place frames yourself, type <code>/vg unlock</code> (“{unlockMsg}”), drag the handles, then <code>/vg lock</code>.</p>`,
      src: ["Core/Slash.lua (frames, reset, unlock)", "Core/Options.lua (General: Layout)"] },
    { id: "look", q: "Colors or fonts look wrong",
      a: `<p><code>/vg theme reset</code> puts {themeHelp} (it's also the <strong>{resetTheme}</strong> button under <strong>{ui:General} → {ui:Look}</strong>). <code>/vg accent reset</code> resets only the accent color.</p>`,
      src: ["Core/Slash.lua (theme, accent)", "Core/Options.lua (General: Look)"] },
    { id: "one-feature", q: "One part of Vanguard misbehaves",
      a: `<p>Type <code>/vg modules</code> to see the parts (modules), then <code>/vg disable &lt;module&gt;</code> and <code>/reload</code>. The README says: “{keepDefault}” The options window's {ui:Modules} page adds: “{modOff}”</p><p><code>/vg enable &lt;module&gt;</code> and <code>/reload</code> bring it back. Please <a href="/feedback/">report</a> what went wrong.</p>`,
      src: ["Core/Slash.lua (modules, enable, disable)", "Core/Options.lua (Modules page)", "README.md (Options)"] },
    { id: "errors", q: "Chat shows an error from Vanguard",
      a: `<p>An error in one part doesn't stop the others: Vanguard keeps it, and <code>/vg errors</code> lists it. In the command's own words, it “{errorsHelp}”.</p><p>Turn that part off (see above), then send a <a href="/feedback/">report</a> with <code>/vg report</code> in it.</p>`,
      src: ["Core/Slash.lua (errors)", "README.md (Commands: /vg errors)"] },
    { id: "report", q: "What do I put in a bug report?",
      a: `<p>Type <code>/vg report</code>: {reportHelp}. It opens in a box, already selected; the box's title says “{reportTitle}”. Paste it whole into the <a href="/feedback/">Feedback</a> form, with what you did and what happened.</p>`,
      src: ["Core/Slash.lua (report)"] },
    { id: "broken", q: "Everything is broken",
      a: `<p><code>/vg profile reset</code> asks first (“{profResetAsk}”), keeps a copy of the profile you're using, and puts it back to defaults (“{profReset}”); then reload.</p><p>To test without losing your settings, switch this character to a new, empty profile instead: <code>/vg profile Test</code>. It happens at your next reload: “{nextSwitch}” See <a href="/profiles/">Profiles</a>.</p>`,
      src: ["Core/Slash.lua (profile, profile reset)", "Core/Options.lua (Reset this profile)"] },
    { id: "import", q: "Import failed",
      a: `<p>When an import string can't be used, Vanguard says “{importFailed}” and one of these reasons:</p>{reasons}<p>Most often the string was cut off when it was copied or pasted: export it again and copy all of it.</p>`,
      src: ["Core/Serialize.lua", "Core/Slash.lua (import)"] },
    { id: "health-hidden", q: "Some numbers don't show in instances",
      a: `<p>The game client hides some values from addons, for example in instanced combat. The README says those values “{unread}”: the bars still fill, but Vanguard can't print a number it isn't allowed to read. This is expected. <code>/vg status</code> says when aura values are “{auraHidden}”.</p>`,
      src: ["README.md (what the client hides)", "Core/Slash.lua (status)"] },
    { id: "reload", q: "A setting didn't change anything",
      a: `<p>Settings marked {RELOAD} on the <a href="/settings/">Settings</a> page apply after a reload: the options window offers a <strong>{ui:Reload now}</strong> button. The Reload buttons are made the way WoW Forever allows. One made during a fight works once the fight ends; until then it says “{typeReload}”</p>`,
      src: ["Core/Dialog.lua", "README.md (Options: reloads on WoW Forever)"] },
    { id: "combat", q: "Something won't change during a fight",
      a: `<p>Some changes can't be made while you're in combat. Vanguard holds them and makes them when the fight ends. The second line of <code>/vg status</code> counts them: “&lt;n&gt; {waiting}”.</p>`,
      src: ["Core/Slash.lua (status)"] },
  ] },
  { id: "forever", title: "WoW Forever, setup and errors", entries: [
    { id: "renamed", q: "Where did ForeverUI go?",
      a: `<p>It's Vanguard now: the same addon, renamed because another, unrelated addon is published as ForeverUI. The commands are <code>/vg</code> and <code>/vanguard</code> instead of <code>/fui</code>. Your settings don't move over by themselves: before updating, type <code>/fui export</code> and keep the text; after updating, <code>/vg import</code> it. See <a href="/install/#renamed">Install &amp; Update</a>.</p>`,
      src: ["README.md (Formerly ForeverUI)"] },
    { id: "settings-lost", q: "My settings reset every time I start the game",
      a: `<p>The addon's code notes that WoW Forever beta builds older than {fixedBuild} lose addon settings at every launch, and break the raid frames, click casting and bar paging. Update the game. On an older build, <code>/vg status</code> says: “{buildWarn}”.</p>`,
      src: ["Core/Slash.lua (FIXED_BUILD, status)"] },
    { id: "hover-keys", q: "Hover keys don't work",
      a: `<p>Some WoW Forever beta clients can't run the code hover keys need. Vanguard then says at login: “{snipChat}”, and <code>/vg status</code> shows “{noSnip}”. The {ui:Click casting} page says: “{ccNote}”</p><p>Mouse click casting still works, bar 1 still changes with stances, forms and Shift+number, and the raid frames still work.</p>`,
      src: ["Core/Client.lua", "Core/Slash.lua (status)", "Modules/ClickCastOptions.lua (hover keys)", "README.md (secure snippets)"] },
    { id: "setup", q: "The setup wizard didn't open",
      a: `<p>The setup wizard opens the first time you log in on an account. If you're in a fight it waits: “{setupCombat}” Once you've finished or closed it, open it again with <code>/vg setup</code> or <strong>{ui:Run setup}</strong> under <strong>{ui:General} → {ui:Layout}</strong> in <code>/vg</code>.</p>`,
      src: ["Core/Setup.lua", "README.md (First-run setup)"] },
    { id: "edit-mode", q: "Vanguard's frames don't show in Edit Mode",
      a: `<p>When you open the game's Edit Mode, Vanguard's handles show too, with a note: “{editNote}” If they don't, tick <strong>{editOpt}</strong> under <strong>{ui:General} → {ui:Layout}</strong> in <code>/vg</code>.</p><p>The game frames that Vanguard hides or replaces (its action bars, XP and reputation bars, unit frames and so on) get no Edit Mode handle on purpose. Move Vanguard's frames instead.</p>`,
      src: ["Core/Movers.lua (Edit Mode)", "Core/Options.lua (General: Layout)", "README.md (Look and layout)"] },
    { id: "edit-layout", q: "Chat says my profile uses an Edit Mode layout this account doesn't have",
      a: `<p>A profile remembers which of the game's Edit Mode layouts you use with it. When a character loads that profile, Vanguard switches Edit Mode to the layout of that name, if your account has one. If it doesn't, Vanguard says “{editMissing}” and leaves Edit Mode as it is.</p>`,
      src: ["Core/Profiles.lua (Edit Mode layout)", "README.md (Look and layout)"] },
    { id: "errors-badge", q: "There's a red number on the addons button",
      a: `<p>That's how many errors Vanguard caught this session. The options window's footer says the same (“{footerLine}”). Click that line or type <code>/vg errors</code> to list them; the list's <strong>{errorsReport}</strong> button opens Vanguard's feedback form on a bug with the list attached, or you can paste it into a <a href="/feedback/">bug report</a> here. Its <strong>{errorsClear}</strong> button (or <code>/vg errors clear</code>) empties the list, and the number goes away. With nothing caught, <code>/vg errors</code> says “{noErrors}”</p>`,
      src: ["Core/ErrorBadge.lua", "Core/Slash.lua (errors)", "Core/Dialog.lua (errors window)", "README.md (Options)"] },
    { id: "language", q: "Is Vanguard in my language?",
      a: `<p>Vanguard's own text (the options window, setup, chat lines and tooltips) is in English in the current release. It runs on every client language, and names the game supplies (spells, items, zones) stay in your client's language.</p><p data-avail="next">{NEXT} The next release shows Vanguard's own text in your client's language: German, French, Spanish (Spain and Latin America), Italian, Brazilian Portuguese, Russian, Korean and Chinese (Simplified and Traditional). The translations are new and machine-drafted, so some lines will read oddly. When one does, please tell us on the <a href="/feedback/">Feedback page</a> (or with <code>/vg feedback</code> in the game): quote the line, name your language and, if you can, say how it should read. The commands you type stay English.</p><p>One known gap in the current release on a non-English client: click casting's spell groups and starter layouts, the instance prep buff checks and raid healing's class buff list look for the game's English names, so they can find nothing or list a buff you have as missing.<span data-avail="next"> The next release looks them up by id instead.</span></p>`,
      src: ["Locales/ (the translations)", "Core/Theme.lua (client fonts by locale)", "Modules/ClickCastSpells.lua", "Modules/InstancePrepBuffs.lua", "Modules/RaidHealing.lua (CLASS_BUFFS)"] },
    { id: "perf", q: "Is Vanguard slowing my game down?",
      a: `<p><code>/vg perf</code> shows Vanguard's CPU time and memory now, and its ten busiest functions. {perfRecipe}:</p><ol class="steps"><li>Type <code>/vg perf cpu</code>, then <code>/reload</code>.</li><li>Play a while (a raid pull is the hard case).</li><li>Type <code>/vg perf</code> and read the numbers.</li><li>Type <code>/vg perf cpu</code> and <code>/reload</code> again. Measuring has a cost: {perfSlows}.</li></ol><p>No performance numbers are published yet.</p>`,
      src: ["README.md (Commands: /vg perf)", "Core/Perf.lua"] },
  ] },
];

// The page's words in English, in the shape every language's table has
// (scripts/lib/i18n-pages-*.mjs): the page's own words, each section's
// title and each entry's question and answer, by id.
export const ENGLISH_HELP = {
  page: HELP_PAGE,
  sections: Object.fromEntries(SECTIONS.map((s) => [s.id, s.title])),
  entries: Object.fromEntries(SECTIONS.flatMap((s) => s.entries.map((e) => [e.id, { q: e.q, a: e.a }]))),
};
