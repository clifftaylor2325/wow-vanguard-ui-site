// The Troubleshooting & FAQ page's facts and entries.
// Every quoted message is read from the addon at build time (FACTS), so the
// page can only quote what the code really says. An entry whose facts can't
// be found is left off the page rather than shown with a guess.

// [key, where, file, regex with one capture, placeholder names].
// where: "rel" (the current release), "next" (the pinned newer source) or
// "both" (must read the same in both). Lua joins (" .. x .. ") in a capture
// become <name>, <layout>, ... in order, and %s becomes "…".
export const FACTS = [
  ["unlockMsg", "both", "Core/Slash.lua", /chat\("(Unlocked: drag the handles\. \/fui lock when done\.)"\)/],
  ["resetAll", "both", "Core/Options.lua", /"button", "(Reset all positions)"/],
  ["themeHelp", "both", "Core/Slash.lua", /"theme reset\s+(every theme setting back to default)"/],
  ["resetTheme", "both", "Core/Options.lua", /"button", "(Reset theme)"/],
  ["modOff", "both", "Core/Options.lua", /"(A module that's off builds nothing and costs nothing\.)"/],
  ["keepDefault", "both", "README.md", /(Turn any module off under Modules to keep the default one\.)/],
  ["failLine", "rel", "Core/Modules.lua", /string\.format\("(module %s failed to load: %s)"/],
  ["errorsKept", "next", "README.md", /(an error in one module, skin, event handler or after-combat update is kept here and doesn't stop the others)/],
  ["profReset", "both", "Core/Slash.lua", /OfferReload\("(Profile " \.\. ns\.ProfileName\(\) \.\. " is back to defaults\.)"\)/, ["name"]],
  ["relSwitch", "rel", "Core/Slash.lua", /OfferReload\("(This character now uses profile " \.\. name \.\. "\.)"\)/, ["name"]],
  ["nextSwitch", "next", "Core/Slash.lua", /OfferReload\("(This character will use profile " \.\. name \.\. " after the reload\.)"\)/, ["name"]],
  ["importFailed", "both", "Core/Slash.lua", /chat\("(Import failed:) "/],
  ["unread", "both", "README.md", /(go to the bars unread)/],
  ["auraHidden", "next", "Core/Slash.lua", /and "(hidden right now)" or/],
  ["relReload", "rel", "Core/OptionsWindow.lua", /"(Reload now)", function\(\) if ReloadUI then ReloadUI\(\)/],
  ["typeReload", "next", "Core/Dialog.lua", /ns\.Chat\("(Type \/reload in chat to apply the change[^"]*)"\)/],
  ["waiting", "both", "Core/Slash.lua", /%d (change\(s\) waiting on combat)/],
  ["fixedBuild", "next", "Core/Slash.lua", /local FIXED_BUILD = (\d+)/],
  ["buildWarn", "next", "Core/Slash.lua", /"  ·  (update the game: [^"]+)"/],
  ["noSnip", "next", "Core/Slash.lua", /"  ·  (secure snippets: no \(hover keys off\))"/],
  ["snipChat", "next", "Core/Client.lua", /ns\.Chat\("(This client can't run secure snippets: [^"]+)"/],
  ["ccNote", "next", "Modules/ClickCastOptions.lua", /list\.off:SetText\("([^"]+)"\)/],
  ["setupCombat", "next", "Core/Setup.lua", /ns\.Chat\("(Setup opens when combat ends\.)"\)/],
  ["noReturn", "next", "README.md", /(it doesn't come back on its own)/],
  ["editNote", "next", "Core/Movers.lua", /ns\.EDIT_NOTE = "([^"]+)"/],
  ["editOpt", "next", "Core/Options.lua", /check\("(Show these handles in the game's Edit Mode too)"/],
  ["editMissing", "next", "Core/Profiles.lua", /ns\.Chat\("(Profile " \.\. ns\.ProfileName\(\) \.\. " uses Edit Mode layout " \.\. name \.\. ", which this account doesn't have\.)"\)/, ["name", "layout"]],
  ["footerLine", "next", "Core/ErrorBadge.lua", /errorsText\(n\) \.\. "( caught this session: click to list them)"/],
  ["noErrors", "next", "Core/Slash.lua", /chat\("(No errors caught this session\.)"\)/],
  ["perfRecipe", "next", "README.md", /(To measure ForeverUI's CPU cost yourself)/],
  ["perfSlows", "next", "README.md", /(it slows every addon a little, so turn it off when done)/],
];

// The page's entries, in order, by section. {key} is replaced by that fact
// (escaped); a list fact becomes a bulleted list, and {NEXT} the Next release
// badge. badge: "next" marks an
// entry that only applies to the next release.
export const SECTIONS = [
  { id: "fixes", title: "Quick fixes", entries: [
    { id: "frame-moved", q: "A frame is off-screen or in the wrong place",
      a: `<p><code>/fui frames</code> lists the frames you can move. <code>/fui reset &lt;frame&gt;</code> puts one back in its default spot, and <code>/fui reset all</code> (or <strong>{resetAll}</strong> under <strong>General → Layout</strong> in <code>/fui</code>) puts every frame back.</p><p>To place frames yourself, type <code>/fui unlock</code> (“{unlockMsg}”), drag the handles, then <code>/fui lock</code>.</p>`,
      src: ["Core/Slash.lua (frames, reset, unlock)", "Core/Options.lua (General: Layout)"] },
    { id: "look", q: "Colors or fonts look wrong",
      a: `<p><code>/fui theme reset</code> puts {themeHelp} (it's also the <strong>{resetTheme}</strong> button under <strong>General → Look</strong>). <code>/fui accent reset</code> resets only the accent color.</p>`,
      src: ["Core/Slash.lua (theme, accent)", "Core/Options.lua (General: Look)"] },
    { id: "one-feature", q: "One part of ForeverUI misbehaves",
      a: `<p>Type <code>/fui modules</code> to see the parts (modules), then <code>/fui disable &lt;module&gt;</code> and <code>/reload</code>. The README says: “{keepDefault}” The options window's Modules page adds: “{modOff}”</p><p><code>/fui enable &lt;module&gt;</code> and <code>/reload</code> bring it back. Please <a href="/feedback/">report</a> what went wrong.</p>`,
      src: ["Core/Slash.lua (modules, enable, disable)", "Core/Options.lua (Modules page)", "README.md (Options)"] },
    { id: "failed-to-load", q: "Chat says a module “failed to load”",
      a: `<p>In v{v}, when a part hits an error while it starts, ForeverUI prints “{failLine}” and keeps loading the others. Turn that part off (see above) and put the whole line in your <a href="/feedback/">report</a>.</p><p>{NEXT} Errors like this are listed by <code>/fui errors</code> instead: {errorsKept}.</p>`,
      src: ["Core/Modules.lua (v{v})", "README.md (Commands: /fui errors)"] },
    { id: "broken", q: "Everything is broken",
      a: `<p><code>/fui profile reset</code> puts the profile you're using back to defaults (“{profReset}”), then reload.</p><p>To test without losing your settings, switch this character to a new, empty profile instead: <code>/fui profile Test</code>. In v{v} the switch is at once (“{relSwitch}”). {NEXT} It happens at your next reload: “{nextSwitch}” See <a href="/profiles/">Profiles</a>.</p>`,
      src: ["Core/Slash.lua (profile, profile reset)"] },
    { id: "import", q: "Import failed",
      a: `<p>When an import string can't be used, ForeverUI says “{importFailed}” and one of these reasons:</p>{reasons}<p>Most often the string was cut off when it was copied or pasted: export it again and copy all of it.</p>`,
      src: ["Core/Serialize.lua", "Core/Slash.lua (import)"] },
    { id: "health-hidden", q: "Some numbers don't show in instances",
      a: `<p>The game client hides some values from addons, for example in instanced combat. The README says those values “{unread}”: the bars still fill, but ForeverUI can't print a number it isn't allowed to read. This is expected.</p><p>{NEXT} <code>/fui status</code> says when aura values are “{auraHidden}”.</p>`,
      src: ["README.md (what the client hides)", "Core/Slash.lua (status)"] },
    { id: "reload", q: "A setting didn't change anything",
      a: `<p>Settings marked <span class="badge reload">Needs reload</span> on the <a href="/settings/">Settings</a> page apply after a reload. In v{v}, type <code>/reload</code> in chat: that release's <strong>{relReload}</strong> button asks the game to reload directly, and WoW Forever blocks that for addons.</p><p>{NEXT} The Reload buttons are made the way WoW Forever allows. One made during a fight works once the fight ends; until then it says “{typeReload}”</p>`,
      src: ["Core/OptionsWindow.lua (v{v})", "Core/Dialog.lua", "README.md (Options: reloads on WoW Forever)"] },
    { id: "combat", q: "Something won't change during a fight",
      a: `<p>Some changes can't be made while you're in combat. ForeverUI holds them and makes them when the fight ends. The second line of <code>/fui status</code> counts them: “&lt;n&gt; {waiting}”.</p>`,
      src: ["Core/Slash.lua (status)"] },
  ] },
  { id: "forever", title: "WoW Forever and the next release", entries: [
    { id: "settings-lost", q: "My settings reset every time I start the game",
      a: `<p>The addon's code notes that WoW Forever beta builds older than {fixedBuild} lose addon settings at every launch, and break the raid frames, click casting and bar paging. Update the game.</p><p>{NEXT} On an older build, <code>/fui status</code> says: “{buildWarn}”.</p>`,
      src: ["Core/Slash.lua (FIXED_BUILD, status)"] },
    { id: "hover-keys", q: "Hover keys don't work", badge: "next",
      a: `<p>Some WoW Forever beta clients can't run the code hover keys need. ForeverUI then says at login: “{snipChat}”, and <code>/fui status</code> shows “{noSnip}”. The Click casting page says: “{ccNote}”</p><p>Mouse click casting still works, bar 1 still changes with stances, forms and Shift+number, and the raid frames still work.</p>`,
      src: ["Core/Client.lua", "Core/Slash.lua (status)", "Modules/ClickCastOptions.lua (hover keys)", "README.md (secure snippets)"] },
    { id: "setup", q: "The setup wizard didn't open", badge: "next",
      a: `<p>The setup wizard opens the first time you log in on an account. If you're in a fight it waits: “{setupCombat}” Once you've finished or closed it, {noReturn}: type <code>/fui setup</code> to open it again.</p>`,
      src: ["Core/Setup.lua", "README.md (First-run setup)"] },
    { id: "edit-mode", q: "ForeverUI's frames don't show in Edit Mode", badge: "next",
      a: `<p>When you open the game's Edit Mode, ForeverUI's handles show too, with a note: “{editNote}” If they don't, tick <strong>{editOpt}</strong> under <strong>General → Layout</strong> in <code>/fui</code>.</p><p>The game frames that ForeverUI hides or replaces (its action bars, XP and reputation bars, unit frames and so on) get no Edit Mode handle on purpose. Move ForeverUI's frames instead.</p>`,
      src: ["Core/Movers.lua (Edit Mode)", "Core/Options.lua (General: Layout)", "README.md (Look and layout)"] },
    { id: "edit-layout", q: "Chat says my profile uses an Edit Mode layout this account doesn't have", badge: "next",
      a: `<p>A profile remembers which of the game's Edit Mode layouts you use with it. When a character loads that profile, ForeverUI switches Edit Mode to the layout of that name, if your account has one. If it doesn't, ForeverUI says “{editMissing}” and leaves Edit Mode as it is.</p>`,
      src: ["Core/Profiles.lua (Edit Mode layout)", "README.md (Look and layout)"] },
    { id: "errors-badge", q: "There's a red number on the addons button", badge: "next",
      a: `<p>That's how many errors ForeverUI caught this session. The options window's footer says the same (“&lt;n&gt; errors{footerLine}”). Type <code>/fui errors</code> to list them for a <a href="/feedback/">bug report</a>, and <code>/fui errors clear</code> to empty the list; the number goes away. With nothing caught, <code>/fui errors</code> says “{noErrors}”</p>`,
      src: ["Core/ErrorBadge.lua", "Core/Slash.lua (errors)", "README.md (Options)"] },
    { id: "perf", q: "Is ForeverUI slowing my game down?", badge: "next",
      a: `<p><code>/fui perf</code> shows ForeverUI's CPU time and memory now, and its ten busiest functions. {perfRecipe}:</p><ol class="steps"><li>Type <code>/fui perf cpu</code>, then <code>/reload</code>.</li><li>Play a while (a raid pull is the hard case).</li><li>Type <code>/fui perf</code> and read the numbers.</li><li>Type <code>/fui perf cpu</code> and <code>/reload</code> again to turn measuring off: {perfSlows}.</li></ol><p>No performance numbers are published yet.</p>`,
      src: ["README.md (Commands: /fui perf)", "Core/Perf.lua"] },
  ] },
];
