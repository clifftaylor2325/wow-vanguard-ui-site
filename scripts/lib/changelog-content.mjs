// The Changelog page's words: each release in player language, newest first.
// Every line names the merged changes it comes from in `from` (addon pull
// request numbers). `from` is never shown on the site; it's there so each
// line can be traced back. No line may describe something that isn't merged.

// The player-language notes for each published release, by tag. A release
// missing here falls back to the titles in its GitHub release notes.
export const RELEASE_NOTES = {
  "v0.3.0": [
    { text: "A new look, Slate & Brass: flat slate panels, a brass accent and crisp one-pixel borders at any UI scale.", from: [19, 25] },
    { text: "Vanguard's own font (Fira Sans Condensed), new artwork and a new logo.", from: [20] },
    { text: "Softer surfaces: a light sheen, soft shadows and one consistent set of text sizes.", from: [21] },
    { text: "A redesigned options window: a header, an icon for each page, settings grouped on cards, and new kinds of controls.", from: [22] },
    { text: "Frames: a choice of bar texture, bars that fill smoothly, a dark style for the raid frames, and glows.", from: [23] },
    { text: "Gentle motion and sounds, flashes on the cast bars, and a small menu on each frame while frames are unlocked.", from: [24] },
  ],
  "v0.2.0": [
    { text: "Cast bars, and buffs and debuffs on your target and focus.", from: [14] },
    { text: "Raid frames: players out of range fade, and raid icons, ready check, resurrection and leader marks show.", from: [15] },
    { text: "Tooltips: a flat look, colored by class or by how friendly the unit is, with a line saying what it targets, in a set spot on screen.", from: [16] },
    { text: "Nameplates: flat bars, threat colors, debuffs, cast bars and a border on your target.", from: [17] },
  ],
  "v0.1.0": [
    { text: "The first release: the Vanguard look, unlock mode for moving frames, and profiles. Other addons can dress their windows in the Vanguard look too.", from: [1] },
    { text: "Unit frames: player, target, target of target, focus, pet and party.", from: [2] },
    { text: "Eight action bars, with bar paging, key bindings and cooldowns.", from: [3] },
    { text: "Minimap, chat and bags in the Vanguard look, with the zone name inside the minimap.", from: [4, 5] },
    { text: "Action buttons are tinted when you're out of range; XP and reputation bars.", from: [6] },
    { text: "Profiles: share settings as a text string, use a profile per specialization, and make, copy or delete profiles.", from: [7] },
    { text: "The options window.", from: [8] },
    { text: "Raid frames, with click casting and hover keys.", from: [9, 10] },
    { text: "Raid frames show debuffs you can remove and your heals over time.", from: [11] },
    { text: "Healer extras: incoming heals, shields, aggro and missing buffs.", from: [12] },
    { text: "Restyled pet, stance and extra action buttons, and a button to leave a vehicle.", from: [13] },
  ],
};

// v0.4.0, the first release named Vanguard: grouped, since it holds everything
// merged from #26 to #124 (the setup wizard, quests, the rename, the auction
// helper, F1-F7 and this batch's fixes).
RELEASE_NOTES["v0.4.0"] = { groups: [
    { id: "new", title: "New", items: [
      { label: "Setup wizard", text: "The first time you log in on an account, a short setup helps you pick a layout (Damage and tanking, Healing, or Like the game's), your screen size, your colors, and where things go. Open it again any time with /vg setup.", from: [40, 71, 80] },
      { label: "{ui:Quests}", text: "Vanguard's own quest dialog, quest tracker and quest log. Pick lines and rewards with the number keys, and press Space to accept, continue or complete.", from: [64, 65, 66, 67] },
      { label: "{ui:Quests}", text: "Quest helpers that can accept quests, turn in finished ones and skip the chatter. Each is off until you switch it on, and holding Shift skips them.", from: [64] },
      { label: "{ui:Click casting}", text: "Set up click casting without typing: pick spells from your spellbook on a grid of mouse buttons and modifier keys, add hover keys, start from a layout for your class, and share or copy your bindings.", from: [78] },
      { label: "{ui:Click casting}", text: "A switch (off until you turn it on) to use the game's own click casting bindings on Vanguard's frames instead.", from: [80] },
      { label: "Groups & raids", text: "Boss frames, and a raid tools bar for leaders and assistants: ready check, pull timer, role check, target icons and world markers.", from: [60] },
      { label: "Groups & raids", text: "Main tank frames that show what each tank is targeting, and small frames for your party's pets and targets (off until you switch them on).", from: [70] },
      { label: "{ui:Fight history}", text: "Your damage per second and your place in each fight this session, as a row of bars under the damage meter. Off until you switch it on.", from: [81] },
      { label: "{ui:Vendor memory}", text: "Vanguard remembers what merchants sell, so item tooltips can say who sells an item and where. /vg stock says where to buy what you keep stocked.", from: [81] },
      { label: "{ui:Instance prep}", text: "At a dungeon or raid door, or on a ready check, a card lists what you're short of: ammo, soul shards, reagents, food and drink, bandages, potions, repairs and your stocked items.", from: [81] },
      { label: "{ui:Chat watch}", text: "Pick words to watch for in chat (for example LFM). When someone says one, you hear a sound and see a note; click it to whisper them.", from: [81] },
      { label: "{ui:Situations}", text: "Record a different layout and settings for solo, party, raid, PvP, instances or resting. They switch on their own, out of combat, as you move between them.", from: [81] },
      { label: "{ui:Auction helper}", text: "A panel beside the auction house: shopping lists, a sell card that suggests a price just under the cheapest, prices from your scans in item tooltips, and a check for auctions of yours that someone undercut. It only posts or cancels when you click.", from: [81] },
      { label: "{ui:Your buffs}", text: "Your buffs and debuffs in Vanguard's look next to the minimap, with weapon enchants in front. Right-click a buff to cancel it.", from: [43] },
      { label: "{ui:Info strip}", text: "A strip under the minimap with durability, free bag slots, frame rate and latency, gold, ammo or soul shards and the time, plus XP and gold per hour while you level and, if you like, your damage per second.", from: [44, 59, 69, 80] },
      { label: "{ui:Errands}", text: "{ui:Train all} at a trainer in one click, keep items stocked from merchants, and a timer for each flight.", from: [59] },
      { label: "At merchants", text: "Repair with your own gold, sell gray items, and fewer repeated error messages.", from: [44] },
      { label: "Combat aids", text: "A swing timer, sparks on your power bar for the five-second rule and energy ticks, your threat on your target, and your pet's happiness.", from: [46, 47] },
      { label: "Class extras", text: "Totem timers for shamans (right-click to destroy a totem) and a mana bar for druids in forms, under the player frame.", from: [41] },
      { label: "{ui:Nameplates}", text: "Levels in difficulty colors, and a gold mark on units your quests need.", from: [47, 69] },
      { label: "Chat and minimap", text: "{ui:Clickable web links in chat}, a Copy button for recent chat, other addons' minimap buttons gathered in a drawer, and optional auto-accept for summons and resurrections (and auto-decline for duels).", from: [63] },
      { label: "{ui:Comfort}", text: "Quality colors on bag items, the bank in Vanguard's look, durability on the character pane, and how many you own and what an item sells for in its tooltip.", from: [59, 62] },
      { label: "{ui:Bags}", text: "A Sort button, and the combined bag grouped into sections such as Quest items, Equipment and Junk.", from: [44, 80] },
      { label: "Away screen", text: "While you're away, the screen dims to a card with your character, zone, time away and XP.", from: [69] },
      { label: "{ui:Faction look}", text: "A crest and a heading font for your faction: crossed swords for the Alliance, crossed axes for the Horde.", from: [73] },
      { label: "{ui:Game windows}", text: "The game's windows, popups, quest tracker, loss of control alert, talking head, Cooldown Manager and damage meter in Vanguard's look.", from: [53, 57, 58, 68] },
      { label: "Moving frames", text: "Every movable frame has its own size and opacity, and bars and strips can show always, on mouseover, in combat, or not at all.", from: [34, 80] },
      { label: "Key bindings", text: "Keybind mode: type /vg keybind, hover an action button and press a key.", from: [80] },
      { label: "{ui:Other addons}", text: "Fonts and bar textures shared by other addons show in Vanguard's pickers, and button-skinning addons can skin Vanguard's buttons.", from: [80] },
      { label: "Alerts", text: "An optional alert when a rare is nearby, and restyled Hardcore death notices.", from: [80] },
      { label: "Renamed", text: "ForeverUI is now Vanguard, because another, unrelated addon is published as ForeverUI. The commands are /vg and /vanguard. Settings don't move over by themselves: type /fui export before you update and /vg import after (old ForeverUI strings import fine), then delete the old ForeverUI folder.", from: [110, 111, 121] },
      { label: "{ui:Gear upgrades}", text: "An item's tooltip says how it compares with what you wear (for example “Upgrade +12%”), an arrow marks upgrades in the combined bag and on quest rewards, and /vg weights shows or changes the stat weights for your class and role.", from: [119] },
      { label: "Other characters' items", text: "Item tooltips list which of your other characters on the realm have the item, in their bags or bank. /vg inventory lists the characters remembered.", from: [119] },
      { label: "{ui:Waypoints}", text: "/way with coordinates puts a waypoint on the map you're on, and the game's own arrow points to it. While the world map is open, a line along its bottom shows your coordinates and the cursor's.", from: [119] },
      { label: "{ui:Quest tracker}", text: "When a quest addon Vanguard recognizes is loaded, that addon's tracker shows instead of Vanguard's, so there are never two.", from: [119] },
      { label: "Boss mod docks", text: "Two spots you can move for boss mods' timer bars. /vg dock lines up the bars of the boss mods it can dock, and for the others chat says where to drag their anchors.", from: [119] },
      { label: "{ui:Broker strip}", text: "Other addons' data feeds (gold trackers, durability, guild counts) in a thin strip along the top edge of the screen. Pick up to four.", from: [119] },
      { label: "{ui:Auto-accept}", text: "{ui:Faster auto-loot}: when the game is auto-looting, every slot is taken at once. Items being rolled for and bind-on-pickup items still wait.", from: [119] },
      { label: "{ui:Auction helper}", text: "Selling: a sell card with the quantity, stack size and number of stacks, a price suggested just under the cheapest (never under a vendor's price), a bid and the auction length. Post puts up one stack per click and loads the next, with a running count.", from: [108] },
      { label: "{ui:Auction helper}", text: "Shopping: lists you can rename, duplicate, delete, export and import (lists from another auction addon too), filters per item, every listing of an item sortable by column, and a Recent list of your last 20 searches.", from: [108] },
      { label: "{ui:Auction helper}", text: "Your auctions: each one someone undercut is marked, {ui:Cancel next undercut} cancels them one click at a time, and sold or expired items can be relisted from your bags.", from: [108] },
      { label: "{ui:Auction helper}", text: "Prices are kept per realm and faction. Every scan and search feeds them, with each item's daily low and market value for 30 days.", from: [108] },
      { label: "{ui:Auction helper}", text: "A Deals card of listings priced under a vendor's price or well under market value, price alerts for shopping list items with a max price, and a Restock list made from what you're short of.", from: [109] },
      { label: "{ui:Auction helper}", text: "Beside the profession window: what a recipe's reagents cost, what the item sells for and the profit. A sales ledger of what sold, ran out or was cancelled, and disenchant values in tooltips.", from: [109] },
      { label: "{ui:Auction helper}", text: "Other addons can read Vanguard's auction prices through an API that follows another auction addon's function names. It never posts, buys or cancels.", from: [109] },
      { label: "{ui:Chat watch}", text: "The toast shows the auction price beside a linked item.", from: [109] },
      { label: "Bug reports", text: "/vg report puts everything a bug report needs in one box, ready to copy and paste into the Feedback form on this site.", from: [124] },
    ] },
    { id: "improved", title: "Improved", items: [
      { label: "{ui:Auction helper}", text: "A bare number typed in any price box means gold.", from: [123] },
      { label: "Raid and party frames", text: "Easier to read: softer class colors, outlined names, a shield for tanks and a cross for healers, and a set place for each mark so nothing overlaps.", from: [32, 39, 54] },
      { label: "Raid and party frames", text: "They start just above your player frame, big raids are drawn smaller so they fit, and groups can be laid out as rows.", from: [51, 60, 61, 104] },
      { label: "{ui:Action bars}", text: "Empty slots stay hidden until you drag something, each bar has its own number of buttons, buttons per row and size, and bar 1 is the top row.", from: [34, 35] },
      { label: "{ui:Layout}", text: "One centered layout that holds together at any UI scale, with sizes chosen for 1080p screens.", from: [51, 81] },
      { label: "Text", text: "{ui:Text size} changes at once, chat has its own text size, and tooltips use Vanguard's font.", from: [50] },
      { label: "Options", text: "A dot marks each setting you changed (click it to put the default back), every part has a plain description, profiles are managed in the window, search jumps to the setting, and the keyboard and mouse wheel move around the window.", from: [48, 49, 81] },
      { label: "A calmer screen", text: "Frames in the middle of the screen drop their sheen and shadow (a switch brings the shadow back), with a new Soft bar texture.", from: [54] },
      { label: "Menu and bags", text: "The game's menu and bag buttons sit together in one bar in the corner, with Vanguard icons.", from: [52, 55, 57, 58, 81] },
      { label: "Game menu", text: "A Vanguard button at the top of the Escape menu, or just under it where your client's menu can't take new buttons.", from: [59, 75] },
      { label: "{ui:Profiles}", text: "Choosing a profile takes effect at your next reload, a whole profile string can bring its UI scale along, and a profile remembers its Edit Mode layout.", from: [79, 80] },
      { label: "Edit Mode", text: "The game's Edit Mode shows Vanguard's frame handles too, so you can move everything in one place.", from: [69] },
      { label: "{ui:Nameplates}", text: "Your target gets a small diamond and an accent border.", from: [55, 81] },
      { label: "{ui:Quests}", text: "Long quest text and long quest lists scroll with the mouse wheel.", from: [79] },
      { label: "Performance", text: "Less work in big raids and with many nameplates on screen, and /vg perf to see what Vanguard costs.", from: [77] },
      { label: "Bug reports", text: "/vg errors lists what went wrong this session, and a red number on the addons button shows when something did.", from: [42, 75, 80] },
    ] },
    { id: "fixed", title: "Fixed", items: [
      { label: "Reloading", text: "The Reload buttons now work on WoW Forever.", from: [41] },
      { label: "Loading", text: "Vanguard no longer shows as out of date on WoW Forever, and a problem in one part no longer stops the rest.", from: [39, 75] },
      { label: "Old game builds", text: "/vg status warns when your WoW Forever build is too old to keep addon settings.", from: [56] },
      { label: "Hover keys", text: "When the game can't run the code hover keys need, bar 1 paging and the raid frames keep working, and hover keys now work with Shift or Ctrl held.", from: [76, 79] },
      { label: "{ui:Raid frames}", text: "Names are no longer hidden under incoming heals, no error when the game hides health, and no false missing-buff warnings in instances (any paladin blessing counts).", from: [36, 39, 55] },
      { label: "{ui:Unit frames}", text: "Your level updates when you level up, and frame shadows sit evenly.", from: [45] },
      { label: "{ui:Game windows}", text: "No more errors when mail arrives or when you open Edit Mode, and quest and gossip text is easy to read.", from: [56] },
      { label: "{ui:Action bars}", text: "Tooltips, self-cast and focus-cast work on every button, and hidden empty slots no longer block clicks.", from: [79] },
      { label: "Conversations", text: "Hiding the interface with Alt-Z no longer ends a conversation with an NPC.", from: [79] },
      { label: "Saved settings", text: "A damaged entry in your saved settings no longer stops Vanguard loading, and a bad frame spot in an imported profile no longer loses the unit frames.", from: [81] },
      { label: "Freezes and errors", text: "Unlocking with a grid size of 0 no longer freezes the game, and there's no longer an error at every login, when pressing the minus key in click casting, from /vg stock with Errands off, or on the Healing options page with raid heals off.", from: [81] },
      { label: "Cast bars and swing timer", text: "Channeled spells empty instead of filling, an interrupted channel no longer flashes as finished, and the swing timer starts over after a weapon swap.", from: [81] },
      { label: "Bars and counts", text: "Shift+number bar paging works in a stance, form or stealth, and item and reagent counts show on action buttons on WoW Forever.", from: [81] },
      { label: "{ui:Groups}", text: "A quick second ready check keeps its answers, and group changes during a fight no longer pile up work for the end of it.", from: [81] },
      { label: "Boss levels", text: "A “??” boss level shows in red instead of gray.", from: [81] },
      { label: "Russian", text: "Russian headings use a font with Cyrillic letters.", from: [81] },
      { label: "{ui:Profiles}", text: "A profile deleted on another character no longer comes back empty: a character that used it moves to Default. {ui:Copy here} while a switch waits for a reload copies into the profile you'll use after it.", from: [124] },
      { label: "Moving frames", text: "Trying to unlock frames during a fight now says “{ui:In combat. Try again once combat ends.}”", from: [124] },
    ] },
  ],
};

// v0.5.0: everything merged from #122 to #182. Not listed: changes only the addon's
// developers see (#122, #125, #126, #127, #128, #160, #163, #168, #172, #173:
// tests, builds, CI, the license and the CurseForge setup), and fixes to things
// that never shipped in a release (#166, #175, #180: the reworked menu bar
// drawing empty or blurred, the new auction tabs failing to build).
RELEASE_NOTES["v0.5.0"] = { groups: [
    { id: "new", title: "New", items: [
      { label: "{ui:Talent planner}", text: "Plan where your talent points will go before you have them, on the game's own talents window. With Plan on, a click sets the rank you want instead of buying it; the planned ranks show as badges and the next pick is ringed. {ui:Spend planned} (or /vg talents spend) buys them in a legal order, chat names the next pick at each level-up, and plans are kept per character and spec and can be shared as a string.", from: [162] },
      { label: "{ui:Auction house}", text: "Vanguard's auction helper is now two tabs on the game's window, Shopping and Selling, each card in its own bordered box. Shopping lists your shopping lists, Recent, Deals and a new {ui:Upgrades list} (armor and weapons on the auction house that beat what you wear, by Gear upgrades' stat weights) beside one wide table with sortable columns. Selling has the sell card, what's up now and your auctions.", from: [174, 177] },
      { label: "Setup for each character", text: "A new character on an account that has finished setup gets the wizard too, with a Profile step first: share your other characters' profile, or give this one a copy of its own. Closing the wizard early asks again at the next login, {ui:Skip setup} ends it for good, and {ui:Keep my current layout} moves nothing, so running it again with /vg setup or {ui:Run setup} (under General) changes only what you pick.", from: [179] },
      { label: "{ui:Game windows}", text: "Many more of the game's windows get Vanguard's flat panel, close button, title and buttons: mail, guild, channels, friends and guild creation; the hunter's pet stable, the class trainer, separate bag windows, loot and item dialogs, the macro window and the stopwatch; the game's options, the addon list, Edit Mode, keybinding and help windows; and the world map, group finder, calendar and Legacy window. Each group has its own switch under Bars, map, chat.", from: [129, 130, 131, 132, 133] },
      { label: "Menus and tooltips", text: "Right-click menus and dropdowns open on a flat Vanguard panel, and more of the game's tooltips (item comparisons, buff tooltips, keybinding tooltips, whisper name suggestions) match the main tooltip.", from: [134] },
      { label: "Tabs and scroll bars", text: "Tabs on the game's windows become flat tiles with an accent line on the selected one, side tabs on the character pane get the same, and the game's scroll bars get a flat track and a raised thumb. The inside of the character pane (reputation and skill bars, headers, stat boxes, the equipment flyout) is dressed too.", from: [136, 157] },
      { label: "Window controls", text: "Close, maximize and minimize buttons in Vanguard's own look, in the same place on every window: a plain cross and two diagonal arrows on a square tile that turns red behind the close button under the mouse.", from: [157, 161, 181] },
      { label: "Your buffs and the swing timer", text: "The game's own swing timer, its external defensives and deadly debuff frames, the crafting cast bar and the possess bar take Vanguard's look. The game's swing timer is hidden while Vanguard's is on.", from: [135] },
      { label: "Feedback in game", text: "/vg feedback asks the same questions as the Feedback form on this site (bug or feature) and makes one block to copy. Paste it into the form here and it fills the fields. There's a Feedback page of its own at the end of the options window, too.", from: [152] },
      { label: "{ui:Healing}", text: "The buffs to watch for are listed for every class, each with its icon and an on/off switch, with yours first, plus your spellbook's other buffs and any names you type.", from: [153] },
      { label: "Away screen", text: "Under the away card, your faction's passage: Varian's last letter to Anduin for the Alliance, the Blood Oath of the Horde for the Horde (with the faction look on).", from: [156] },
    ] },
    { id: "improved", title: "Improved", items: [
      { label: "{ui:Minimap}", text: "The zone name sits on a see-through band along the top edge and the coordinates on one along the bottom, so both read over bright ground. Hover the zone name to see the zone, its subzone and whose territory it is; click it to open or close the world map.", from: [154] },
      { label: "Minimap buttons", text: "Tracking and the addon compartment are slot buttons like the menu bar's, on a taller bottom band, and the addon compartment's count is faded instead of hanging off its slot.", from: [157, 161] },
      { label: "{ui:Nameplates}", text: "A click lands on the plate as Vanguard draws it (the name and bar, plus a little around them), friendly players' plates stay clickable with the game's name-only option on, and the plate under the mouse gets a faint wash. Players' plates show their big defensives and important buffs, and the buffs you cast on friendly players, right of the bar.", from: [176] },
      { label: "Menu bar", text: "Vanguard's line icons are on by default for new profiles, and the game's own icons, when you pick them, fill their slots in dark wells. The menu slots are a little taller so each button fits whole, and a slot's accent edge shows only under the mouse.", from: [167, 171, 178] },
      { label: "Icons", text: "New icons for the options window's pages and the minimap's tracking and addon buttons, from game-icons.net.", from: [171] },
      { label: "{ui:Keybind mode}", text: "Bind the middle and side mouse buttons and the mouse wheel as well as keys. A tooltip over the button shows its keys, Backspace or Delete clears them, and chat says when a key is taken from something else.", from: [149] },
      { label: "{ui:Click casting}", text: "The spell picker stays on screen and closes with Escape or a click outside it.", from: [149] },
      { label: "{ui:Game windows}", text: "The friends list (the game's social window on WoW Forever) gets Vanguard's look, the panel reaches past the window so its contents have room, the bag window gets the same look, and the text boxes (copy, report, export, feedback) open above the options window.", from: [157, 161, 164, 182] },
      { label: "Bug reports", text: "/vg frame <name> prints what the game says about one of its frames (add deep for its parts), to paste into a bug report about something that only goes wrong in game.", from: [165] },
      { label: "Options", text: "Notes wrap inside their card, a dropdown's long choice ends in an ellipsis instead of running past its box, and the window's scroll bar can be dragged.", from: [152, 161] },
    ] },
    { id: "fixed", title: "Fixed", items: [
      { label: "Errors at login", text: "Three errors the game logged at every login are gone: one in the menu bar, one in the bags and one in the scroll bars of skinned windows.", from: [158] },
      { label: "Menu bar", text: "The bags and menu buttons no longer vanish, leaving an empty bar, after the game switches between mouse and gamepad.", from: [151] },
      { label: "{ui:Game windows}", text: "One window's skin failing no longer stops the others from being dressed, the flight map keeps its map art, and the quest log's close button shows.", from: [155, 157, 161] },
      { label: "{ui:Chat}", text: "Copy (and every copy and export box) works again.", from: [157] },
    ] },
] };

// v0.6.0: its notes are keyed by tag and show on the Changelog now that the
// release exists, written from the addon's docs/CHANGELOG.md and the merged PRs.
// Everything merged from #205 to #383 that a player can see, in the addon's own words where
// Core/WhatsNewNotes.lua has them. Not listed: changes only the addon's developers see (#185,
// #241, #242, #277, #283, #292, #293, #295, #296, #322, #345: tests, builds, CI, docs and
// tooling), and #362 (a light look that was added and removed before any release).
RELEASE_NOTES["v0.6.0"] = { groups: [
    { id: "new", title: "New", items: [
      { label: "Looks", text: "Seven more looks under {ui:General} → {ui:Look}: {ui:High contrast} (opaque panels, white text, a thicker accent ring), {ui:Vellum and ink} (a warm dark with cream text), {ui:Classic look} (dark leather and bronze), {ui:Midnight}, {ui:Obsidian}, {ui:Moss}, and {ui:Ash and ember}. Slate and brass stays the default. A Corners setting rounds the corners of windows, frames, tooltips and buttons on any look (square stays the default), and a {ui:Window ornaments} switch adds a thin brass rule under the options window's header and corner brackets on setup and the quest log.", from: [321, 328, 352, 325, 355, 361] },
      { label: "Role layouts", text: "Setup's Healing and Damage and tanking layouts now set the raid frame, raid aura and nameplate settings of the Healer and Damage presets, so the two look different. Vanguard's Healer, Damage and Tank presets also apply from the Profiles page (or /vg preset) after a question and a backup.", from: [348, 306] },
      { label: "{ui:Raid frames}", text: "A raid of 25 or 40 now starts at the left of your character, its groups stacked as rows, where healers keep it. A party or a raid of 10 stays over your player frame, and Stack big raids at the left turns the change off.", from: [331, 335] },
      { label: "{ui:What's new}", text: "After an update, the first login shows what changed in this version, grouped by part. Click a line to open its setting. /vg whatsnew opens it again.", from: [274] },
      { label: "Settings guard", text: "At each logout Vanguard keeps a backup of your profile. If your saved settings come back blank at the next login, chat says so and offers to restore them.", from: [272] },
      { label: "{ui:Profiles}", text: "A profile can be exported in parts, such as layout only or one module, and a partial string merges into your profile without touching the rest. Your profile is backed up before any import, and large strings import without freezing the game. Other addons can offer presets, and open the options window on a page.", from: [278, 306] },
      { label: "Moving frames", text: "A frame can be anchored to another frame's side, and a bar can match another frame's width or height. {ui:Exit without saving} puts every frame back as it was when you unlocked.", from: [279] },
      { label: "{ui:Situations}", text: "While you record a situation, a banner says which one you are editing and what it changes, with a button to stop and save. Settings a situation can't hold are left out of it.", from: [276] },
      { label: "{ui:Game windows}", text: "The spellbook gets the flat Vanguard panel, and the calendar and more than a dozen other game windows can be dragged by their top edge.", from: [274, 313] },
      { label: "{ui:Info strip}", text: "The strip is in two columns now, with the day, date and time on one row and a calendar button that opens the game's calendar.", from: [302, 314, 374] },
      { label: "{ui:Group threat}", text: "A panel lists who in your group has the most threat on your target. It starts off, and hides itself while the game hides threat values.", from: [311] },
      { label: "Group board (experimental)", text: "Not yet seen working in the game, so it may show no posts. /vg lfg lists the looking-for-more and looking-for-group posts it reads from chat, by dungeon, role and level. A click opens a whisper that you send yourself.", from: [270, 363] },
      { label: "{ui:Quest guidance}", text: "Quest-start pins on the world map, from the game's own quest data, and a New mark on quests the game flags as new. Shift-click a quest in the tracker to point the arrow at its next step.", from: [270] },
      { label: "{ui:Other addons}", text: "When another addon does a job a Vanguard module also does, chat says so once and the Modules page lets you pick which one does it.", from: [270] },
      { label: "{ui:Spell ranks}", text: "Chat can say when a bar button holds an older rank of a spell you know a higher rank of, and /vg ranks swap puts the newest rank there. Trainers you visit are remembered: /vg trainers next lists what comes in the next levels and where to learn it. Both start off.", from: [305] },
      { label: "{ui:Cooldowns}", text: "A row of icons for what the game's Cooldown Manager misses: on-use trinkets, items and spells you choose, your pet's abilities and totems. A Cooldown Manager buff icon can also glow when its aura is in its last part. Both start off.", from: [317, 318] },
      { label: "{ui:Vanguard meter}", text: "A damage and healing meter in the Vanguard look (/vg meter): the top lines of the game's own meter as class-colored bars, per second, in combat too. It starts off, and the game's own meter stays until you turn it off in the game's settings.", from: [329, 337, 351, 375] },
      { label: "Fight recap", text: "/vg recap shows the last fight's interrupts, dispels, damage taken and deaths from the game's damage meter, and sends them to a channel on request. A recap in your own chat after each fight starts off.", from: [315] },
      { label: "{ui:Roll tracker}", text: "A small panel lists the group's /roll results with the top roll in your accent color, and, where the game has it, the items the group rolled for and each member's choice.", from: [289] },
      { label: "{ui:Officer loot tools}", text: "A soft-reserve list (/vg loot) flags a roll on a reserved item in the roll tracker, and a roster panel lists the group by role. Nothing is synced or sent for you. Both start off.", from: [324] },
      { label: "{ui:Upgrades}", text: "A wizard sets your stat weights stat by stat, with a slider and an exact-value box for each. /vg weights wizard opens it.", from: [370, 376] },
      { label: "{ui:Instance prep}", text: "A dungeon card on the checklist shows the dungeon's level range, your own quests for it and the keys you carry. Buff checks add flask, food, weapon oil and raid buff rows to the ready-check card, and a wizard sets how many of each supply you want (/vg prep setup).", from: [304, 316, 372] },
      { label: "{ui:Craft queue}", text: "A craft queue for your professions (/vg craft): queue the recipe on display, open the next one, raise {ui:Keep stocked} to fit, see profession cooldowns across your characters and rank the recipes that pay best. Nothing is crafted or bought for you. It starts off.", from: [303] },
      { label: "{ui:Mail tools}", text: "A panel beside the mail window searches and filters your inbox, and presets fill the Send Mail tab for your alts (/vg mail). You click Take and Send yourself. It starts off.", from: [320, 381] },
      { label: "{ui:Errands}", text: "A boat and zeppelin timer learns each ride's time and counts down the next one. It starts off.", from: [307] },
      { label: "Legacy", text: "/vg legacy probe lists what the game has for the Legacy system, and a perk planner keeps a list of perks within the tree's 16 points. The planner starts off.", from: [323] },
      { label: "{ui:Levelling}", text: "Quest XP in the tracker and quest log, XP bar tooltips and a warning when a supply you keep stocked runs low.", from: [288] },
      { label: "{ui:Nameplates}", text: "/vg plates says whether the game shows enemy nameplates and turns them on, and the Nameplates page has Enemy and Friendly switches that follow the game's own settings. Enemy plates are on by default, and Vanguard dresses both alike.", from: [382, 384, 387] },
    ] },
    { id: "improved", title: "Improved", items: [
      { label: "{ui:Auction helper}", text: "The tabs are now called Lists and Posting and are sized to their names. Posting shows a step guide (Item, Price, Post, Listed) with a line saying what to do next, a price the game asks you to confirm is confirmed with a second click, and a failed post names the auction house's error. Clicking an item in your bags while Posting is open keeps you on Posting.", from: [205, 298, 312, 371] },
      { label: "{ui:Auction helper}", text: "Deals show their market value and full item names, Upgrades no longer repeats an item, and prices, sales and your character list are kept apart by realm, ruleset and faction side.", from: [275, 373] },
      { label: "Options window", text: "The options are split into one page for each part: Unit frames, Raid frames, Healing, Click casting, Talents, Action bars, Nameplates, Quests, Bars and bags, Map, Chat, Game windows, Combat tools and Town and gear. Escape closes the window, switches are larger and captions wrap.", from: [273, 326, 327, 330, 338, 340, 341] },
      { label: "{ui:Quest log}", text: "Track and Untrack buttons redraw at once, Shift-click tracks a quest, and a zone's header has a chevron to fold it. Hovering a reward card in the quest log shows the item's tooltip.", from: [310, 378, 379, 380] },
      { label: "{ui:Quest tracker}", text: "Click +N more to show up to 10 watched quests, and the choice is remembered. The tracker starts below the info strip so the two don't overlap.", from: [350, 353, 385] },
      { label: "Trainers", text: "{ui:Train all} sits clear of the money line and matches the Train button's height.", from: [354, 358, 360] },
      { label: "{ui:Click casting}", text: "The {ui:Add key} picker and the spell picker stay above everything else, so clicks reach them.", from: [356, 357] },
      { label: "Setup", text: "The setup wizard keeps your current layout unless you pick another. Before it changes anything it backs up your profile, Done ends with a reload, and the last step sits above the frame handles with its title and step centred.", from: [280, 205] },
      { label: "{ui:Game windows}", text: "Window controls sit on a resting tile, the map's close and maximize buttons level with its title, the calendar's filters clear the close button, guild panes' fill goes under their rows, and the spellbook's title and controls sit inside its band.", from: [308, 309, 314, 339, 342] },
      { label: "{ui:Bags}", text: "The Sort button no longer sits under the backpack icon, and items drag again.", from: [300] },
      { label: "Menu bar", text: "A menu bar button takes your click while the game's new indicator shows above it, and the line icons are drawn at the size they show at.", from: [286, 299, 332] },
      { label: "{ui:Raid frames}", text: "A raid tile width the choices don't list shows its value on the Width row.", from: [274, 205] },
      { label: "Theme", text: "Panels and edges are drawn more cleanly: striped fills are one pixel-exact tile, and switching look recolours text that is already on screen.", from: [269, 282, 297, 301, 361] },
      { label: "Brand", text: "Vanguard's crest is the addons-list icon and sits in the options window's header.", from: [343, 344] },
      { label: "Memory", text: "Auction price history keeps seven days instead of thirty, a scan keeps the cheapest link per item, and chat alerts are swept, so Vanguard holds less memory. /vg mem shows what it holds.", from: [334, 383] },
    ] },
    { id: "fixed", title: "Fixed", items: [
      { label: "Errors", text: "An error in a hook on a game function, a button click or a timer is kept in /vg errors and doesn't stop the others.", from: [277, 274] },
      { label: "{ui:Raid frames}", text: "The grid stays on its spot's side right after a reset or a drag.", from: [335] },
      { label: "Options", text: "The Unit frames icon lines up with the others in the page list.", from: [336] },
      { label: "{ui:Mail tools}", text: "Preset buttons you haven't made stay hidden, the panel says when the inbox is empty or nothing matches, and it sits on the mail window's layer.", from: [381] },
    ] },
] };

// v0.7.0: written from the addon's docs/CHANGELOG.md and the PRs merged from #388 to #537. Not
// listed: changes only the addon's developers see (#478, #486, #502, #505, #526, #536, #537:
// release tooling, tests, checks and docs). Nothing in this release was checked in the game yet.
RELEASE_NOTES["v0.7.0"] = { groups: [
    { id: "new", title: "New", items: [
      { label: "{ui:Quest arrow}", text: "An on-screen arrow points to the nearest quest objective, and on to a quest on another map. A map click can turn it on, with a recent list and a Clear button.", from: [466, 467, 507, 517] },
      { label: "Questing", text: "Quest spots show on the minimap, quest mobs get a mark on their nameplate, and the quest log shows XP to your next level. Quests can be tracked automatically, and quest history is kept for your whole account. Shared quests can be accepted from your group (off by default).", from: [468, 469, 480, 485] },
      { label: "{ui:Quest log}", text: "Ctrl-click marks quests and Abandon takes all the marked ones. Objectives show as rows with a count and progress bar.", from: [469, 504] },
      { label: "{ui:Chat history}", text: "Chat windows can keep their lines across reloads and logins, and gold selling, boosting, recruiting and repeated lines can go to a Filtered tab instead of your chat. Both start off.", from: [475, 443, 449] },
      { label: "{ui:Chat}", text: "A Find button and {ui:Find in chat} search the open windows and saved history. The Chat page lets you pick, make, rename and close tabs, choose what each shows, and set window size, lock and floating windows.", from: [508, 516, 520, 523] },
      { label: "{ui:Bags}", text: "Make your own categories in the combined bag, search with words, deposit to the bank, and use Filter and Groups buttons on the search row.", from: [471, 501, 510] },
      { label: "Town", text: "The merchant window has a sell list, Sell all of one item, and Stack and Max buying. Mail has {ui:Take all} and {ui:Return all}.", from: [471, 451, 454, 456] },
      { label: "Alts", text: "/vg alts shows an overview of your characters, also on the {ui:Game windows} page.", from: [471] },
      { label: "{ui:HUD}", text: "A {ui:Versus deck} can join the player and target frames, with shield corners on unit frames and cast bars. {ui:Calm HUD} dims your frames out of combat, and a low-health screen-edge tint warns you in a fight. All three start off.", from: [420, 421, 444, 446] },
      { label: "Cast bars and frames", text: "A ring at the cursor for the global cooldown and your cast (off by default), an interrupt-ready mark on cast bars, and an eating, drinking and missing-buff chip on your frame (off until you tick it). Raid frames show three indicator icons from the game's aura filters.", from: [487] },
      { label: "Graphics", text: "/vg graphics checks your computer, screen and frame rate and suggests settings. /vg graphics apply sets them and undo puts them back.", from: [451, 458] },
      { label: "Cooldown Manager", text: "The Cooldowns page has the Cooldown Manager's settings and a setup wizard, and key text shows on its icons.", from: [481] },
      { label: "Character sheet", text: "Item level and missing-enchant marks show on the character sheet, and /vg gear lists them. /vg pets and the stable master line read the game's pet stable.", from: [507, 506] },
      { label: "Rolls and info", text: "The roll tracker reads the loot list from Forever's encounter loot history, and the info strip shows ammo when your ranged weapon needs it.", from: [482, 521, 524] },
      { label: "Forever rules", text: "The game rules show in /vg realm, with a note when a rules change moves your saved-data key. The TOC lists the 12.1.5 build, and beta data can be cleared on request.", from: [512, 521] },
      { label: "{ui:Quiet the game}", text: "A Quiet module can silence invite declines, battleground release, error and zone text and camera zoom.", from: [479] },
      { label: "{ui:Vanguard meter}", text: "Each line shows its share of the total. Kinds and segments, a spell panel, a chat report, a death recap link on the Deaths view, Report and Reset buttons and a width setting.", from: [494, 529, 532, 533, 534] },
      { label: "{ui:Other addons}", text: "Chat says once when another addon does a job a Vanguard module does: unit frames, action bars, nameplates, raid frames, or auction shopping and posting.", from: [484, 492, 519] },
    ] },
    { id: "improved", title: "Improved", items: [
      { label: "{ui:Game windows}", text: "Many more game windows are in the Vanguard look: the spellbook, guild, social, map, group finder, Legacy, calendar, Edit Mode, keybindings and the Lua error window. The auction house tabs and panels too, and a failing part no longer stops the rest.", from: [399, 413, 415, 427, 429, 434, 436, 442] },
      { label: "Controls", text: "One selected look and one press state for rows, tabs, sliders, scroll bars and buttons across the options and game windows; buttons light only while the mouse is over them. The game's remaining arrow art is skinned, and /vg errors opens a copy window.", from: [403, 404, 405, 406, 407, 408, 409, 410, 411, 414, 416] },
      { label: "{ui:Classic look}", text: "A flat panel under each action bar and a round minimap option.", from: [500, 522] },
      { label: "Options window", text: "Reload tags, a searchable settings list, a page reset and grouped Modules. Setup has Larger text and readability switches.", from: [509, 519] },
      { label: "Safer colours", text: "Dispel types stay apart (on with the game's colour-blind mode), and dispel badges show a corner mark per type.", from: [495, 515] },
      { label: "{ui:Chat tabs}", text: "Chat tabs wear the theme's tab look and the alert glow takes the accent colour, with a bigger default window and a softer backdrop.", from: [535] },
      { label: "Performance", text: "/vg perf reads the game's addon profiler and /vg perf slow names Vanguard's slowest handlers. /vg mem reads memory after a garbage collection.", from: [451, 459, 460] },
      { label: "Saved data", text: "Vanguard trims the oldest price data if the game says the saved file is too large.", from: [477, 503] },
    ] },
    { id: "fixed", title: "Fixed", items: [
      { label: "Safety", text: "Chat filters skip hidden text, saved click-cast Import checks the whole string first, and values the game may hide are no longer tested in raid roles, heals, threat and health text.", from: [490, 491, 503, 513] },
      { label: "Merchants and mail", text: "The merchant sell list is safer (junk, stock), the mail Take button never takes pay-on-delivery mail, mail runs re-check the whole mail, and the auction house closes safely in combat.", from: [493, 511] },
      { label: "Windows", text: "A stuck window drag ends cleanly, and slash and auction input is parsed more strictly.", from: [530, 531] },
      { label: "{ui:Tooltips}", text: "Tooltip hooks no longer break when another addon covers the same job.", from: [489, 464, 465] },
    ] },
] };

// v0.7.1: written from the addon's docs/CHANGELOG.md and the PRs merged from #538 to #566.
// Not listed: #563 (CLAUDE.md, developers only) and #567 (the version bump).
RELEASE_NOTES["v0.7.1"] = { groups: [
    { id: "improved", title: "Improved", items: [
      { label: "{ui:Chat}", text: "The chat window is one rounded panel with a tab bar, tabs you can always see and its side buttons stacked.", from: [543, 566] },
      { label: "{ui:Cast bar}", text: "Your cast bar moves up with the action bars instead of sitting under them.", from: [554] },
      { label: "{ui:Versus deck}", text: "The {ui:Versus deck} rounds its corners instead of cutting them.", from: [552] },
      { label: "{ui:Nameplates}", text: "A green check marks mobs you have tagged, on nameplates and unit frames.", from: [551] },
      { label: "Edit Mode", text: "In Edit Mode the window sits over the handles, bars line up with no gap and the default spots are tidier.", from: [544, 565] },
      { label: "{ui:Quest arrow}", text: "The quest arrow sits centred at the top of the screen by default.", from: [540] },
      { label: "{ui:Game windows}", text: "More of the game's art is in the Vanguard look: the world map and its quest panel, the Settings window's Graphics section and its language and microphone rows, and the arrows on dropdowns and steppers.", from: [550, 559, 562, 545] },
      { label: "Mail", text: "You can add and remove presets from the Find mail panel.", from: [560] },
    ] },
    { id: "fixed", title: "Fixed", items: [
      { label: "{ui:Game windows}", text: "The calendar's today marker fits its cell, the guild list shows the selected guild's banner, Legacy keeps its challenge icons, and the professions skill bar stays inside its box.", from: [549, 542, 541, 539] },
      { label: "Group finder and setup", text: "The group finder's search box no longer overlaps its button, and the setup wizard's choices rest flat with the picked one on the selected rail.", from: [538, 561, 548] },
      { label: "Mail and bags", text: "The Find mail panel closes with the mailbox, and the bags' Filter and Groups buttons fit their labels.", from: [555, 547] },
      { label: "Escape", text: "Escape closes the meter's spell panel and the Instance prep card.", from: [558] },
      { label: "Safety", text: "The {ui:Cooldown Manager glow} never reads an aura the game hides, and /vg probe never makes a call the game restricts.", from: [556, 553] },
      { label: "Your name", text: "Your own name counts as you when it carries a realm other than the realm's name, in chat watch, the chat filter and the roll tracker.", from: [557] },
    ] },
] };

// v0.7.2: written from the addon's docs/CHANGELOG.md and the PRs merged from #568 to #589.
// Not listed: #582 and #583 (the docs split, developers only) and #591 (the version bump).
RELEASE_NOTES["v0.7.2"] = { groups: [
    { id: "improved", title: "Improved", items: [
      { label: "Window buttons", text: "Window buttons (close, minimize, maximize, back) show only their mark at rest; under the mouse a grey rounded tile appears and the close cross turns vermilion.", from: [587] },
      { label: "{ui:Game windows}", text: "The world map's breadcrumbs and their arrows are one control, the inbox Prev and Next captions sit clear of their arrows, and the Spellbook's category icons fill their tiles.", from: [570, 571, 574] },
      { label: "Character and settings", text: "The character pane's tabs, fold chevrons and rows take the theme, and the Settings window's Graphics box sits under its tabs with centred tab labels.", from: [572, 573] },
      { label: "Social", text: "The social window shows status in words with the presence dot centred on the name.", from: [579] },
      { label: "{ui:Chat}", text: "Chat tabs sit over the panel in the tab bar, and the frame, tabs, edit box, text fade, find box and bubbles are polished; the edit box sits under the panel with a rail in the channel's colour.", from: [575, 577] },
      { label: "{ui:Nameplates}", text: "A grey X and a grey nameplate bar mark mobs another player has tagged; mobs you tagged keep the green check.", from: [576] },
      { label: "Action bars and Edit Mode", text: "Scaled action bars touch in the bottom stack, and in Edit Mode the handles keep a dialog's layer and bars stack on whole pixels.", from: [568, 569] },
      { label: "{ui:Minimap}", text: "On a round minimap, quest marks, the zone name and the rim buttons stay on the map.", from: [580] },
      { label: "OpenMap", text: "With OpenMap loaded, Vanguard's map extras step aside: no cursor spot on the coordinates line and no quest-start pins. The Map page says so.", from: [584] },
    ] },
    { id: "fixed", title: "Fixed", items: [
      { label: "{ui:Chat}", text: "The Combat Log's filter strip sits in a band under the bar, and the copy box and the find box never stack.", from: [581, 588] },
      { label: "{ui:Game windows}", text: "Reputation rows read their state once the game has filled them. A window drag held as a fight starts ends before the lockdown, popups keep their own layout, Forever's addon list is dressed, and the social side windows are fixed.", from: [578, 585] },
      { label: "{ui:Profiles}", text: "A backup never overwrites another character's profile, swapping back to a spec with no profile undoes the staged switch, and a settings restore reads its backup the way an import does.", from: [589] },
      { label: "Options and Quiet", text: "Hiding the red error line keeps the yellow info lines, and an options search hit marks its row when the window opens again.", from: [589] },
    ] },
] };

RELEASE_NOTES["v0.7.3"] = { groups: [
    { id: "improved", title: "Improved", items: [
      { label: "Options window", text: "The Options window is taller, its changed dot names the default, the Modules page explains modules with their own switch, search finds more, and the addons button explains itself. Buff settings live on the {ui:Unit frames} page.", from: [632, 641] },
      { label: "{ui:Other addons}", text: "The Other addons card lists Forever add-ons and keeps answers you can change later.", from: [608] },
      { label: "Moving frames", text: "The unlock bar explains itself and leads back to the options, Reset puts moved windows back, and five more game windows can be dragged. Situations gets a Your situations card.", from: [627, 611] },
      { label: "Errors and prompts", text: "The errors window has {ui:Report a bug} and Clear buttons, the AFK screen steps aside when something needs you, and a destroy popup shows its confirm button in the danger colour.", from: [631, 620] },
      { label: "Unit frames and plates", text: "Unit frames show tooltips on hover, grey for tapped mobs, a Ghost label, raid marks and quieter threat. The pet has a cast bar, and nameplates can show health numbers.", from: [612, 628] },
      { label: "{ui:Swing timer}", text: "The swing timer dims when you are out of reach and turns on by itself for every class that swings.", from: [622] },
      { label: "Group and raid", text: "Raid tiles in a fight show missing health, summons, tooltips and indicator names. Your role is guarded in a group, with an Automatic whisper role and a {ui:Needs my role} line.", from: [630, 605] },
      { label: "{ui:Damage meter}", text: "The game's damage meter gets the Vanguard look for its header controls and breakdown, and its lines stay flat when the game reuses them.", from: [636, 615] },
      { label: "{ui:Quest tracker}", text: "Tracker objectives are rows, muted when done, with an accent line on the followed quest; the tracker tooltip shows a Failed line, and the arrow says Here and Turn in and has a Pin button.", from: [614, 606] },
      { label: "{ui:Quest windows}", text: "Quest windows show reward captions and the best-reward crown, a needs line, an empty-log message and an honest Accepted. Quest-start pins and /way titles read better, and history follows the game's own flag.", from: [629, 616] },
      { label: "{ui:Minimap}", text: "Minimap objectives are an accent dot under the quest mark, and the followed quest's mark is larger. The drawer takes late buttons, sorts them, closes on Escape and opens on the side with room.", from: [638, 618] },
      { label: "Info strips and bars", text: "Info strips fit their text, follow {ui:Text size}, explain their numbers on hover, open their window on click and keep rates through a reload. The clock follows the game's clock, and the reputation bar names its standing and takes the XP bar's spot at the cap.", from: [619, 624, 609, 626] },
      { label: "{ui:Chat}", text: "Channel tags are numbered, Copy works on the shown tab, and bare and guild links are clickable. The chat filter card says what it caught, and watch words match in any order and are marked.", from: [613, 625, 635] },
      { label: "Invites and errors", text: "A summon that comes in a fight is taken when it ends, declines give one line per sender, and hiding the red error line keeps the four errors you must act on.", from: [633, 640, 637] },
      { label: "Bags and town", text: "Bank search finds more words, bags show the Junk value, and an item can leave its group. Mail scrolls with days left on every letter, the auction scan counts down, and deals survive a trip to the mailbox. The {ui:Keep stocked} window, the {ui:Train all} count and the travel bar spot are clearer.", from: [617, 621, 623, 634] },
    ] },
    { id: "fixed", title: "Fixed", items: [
      { label: "Bug sweeps", text: "About 170 fixes across combat, group, quests, map, chat, bags, merchant, mail, auction and setup.", from: [592, 593, 594, 595, 596, 597, 598, 599, 600, 601, 602, 603, 604, 607] },
    ] },
] };

RELEASE_NOTES["v0.7.4"] = { groups: [
    { id: "improved", title: "Improved", items: [
      { label: "Credits", text: "The Map page's OpenMap card credits OpenMap's author, jiforever (jigrobbulus on CurseForge), and the Credits list names OpenMap.", from: [644] },
      { label: "Action buttons", text: "Long key names are short on the buttons (Caps Lock Cap, Page Up PU, Insert Ins, Delete Del) and stay on one line. A button holding an item you wear gets a thin green ring, and the keybind banner repeats your last bind and has a Done button.", from: [643] },
    ] },
] };

RELEASE_NOTES["v0.7.5"] = { groups: [
    { id: "new", title: "New", items: [
      { label: "Language", text: "Vanguard's own text shows in your client's language: German, French, Spanish, Italian, Brazilian Portuguese, Russian, Korean and Chinese. The translations are machine-drafted, so report a wrong line with /vg feedback or on the Feedback page. Commands and the What's new notes stay English.", from: [655, 656, 657, 658, 659, 660, 661, 663, 664, 667, 669, 670] },
      { label: "{ui:Panel texture}", text: "A {ui:Panel texture} choice (General, Look) draws a texture over every floating window; {ui:Flat} is the default.", from: [648] },
      { label: "{ui:Community}", text: "The Feedback page in the options has a Community card with Vanguard's Discord and X links to copy.", from: [677] },
    ] },
    { id: "improved", title: "Improved", items: [
      { label: "Options window", text: "Options pages show their cards as tabs, so the long pages fit one screen, and {ui:Reset this page} sits beside the page title. Every module switch says {ui:Reload to apply}, and searching for reload finds them.", from: [690, 691, 653] },
      { label: "Fit and layout", text: "Text fits its buttons, menus and windows at any text size and in longer translations. On narrow or short screens, default frame spots move just enough to stay on screen and clear of each other; wider screens are unchanged.", from: [662, 665, 666, 668, 671, 672, 673, 674, 675, 676, 678, 679, 680, 681, 682, 683, 684, 685, 686, 687, 688, 689] },
      { label: "Clear buttons", text: "Clearing loot reserves, a talent plan or saved chat asks first.", from: [652] },
    ] },
    { id: "fixed", title: "Fixed", items: [
      { label: "Bug and stability hunts", text: "Fixes from two bug hunts, a clean-code review and twelve stability hunts across combat, frames, chat, quests, bags, the auction house, mail, profiles and options.", from: [645, 649, 650, 651, 692, 693, 694, 695, 696, 697, 698, 700, 701, 702, 703, 704, 705] },
    ] },
] };

RELEASE_NOTES["v0.8.0"] = { groups: [
    { id: "new", title: "New", items: [
      { label: "{ui:Your keys}", text: "A {ui:Your keys} tab on the {ui:Action bars} page draws your keyboard and mouse and shows what every key does, with the Shift, Ctrl and Alt keys on their own tabs.", from: [712] },
      { label: "{ui:Key setup}", text: "On WoW Forever, {ui:Set up keys} (on the {ui:Your keys} tab) suggests keys for your class and role, shows every change on the keyboard and lists it with a tick box before anything moves, and can put your old keys back. {ui:Place new spells as I learn them} puts each spell you learn on its key for you.", from: [711, 713, 715, 717, 719] },
      { label: "Click-casting starter layouts", text: "On WoW Forever, the Click casting page has starter layouts for every class, with two healer layouts for priests, druids, paladins and shamans, and an Undo.", from: [718] },
    ] },
    { id: "improved", title: "Improved", items: [
      { label: "{ui:Calm HUD}", text: "{ui:Calm HUD} quiets the whole HUD out of combat, not only the unit frames: on the General page's {ui:Calm HUD} card each part dims, hides until the mouse is over it, or is left as it is.", from: [714, 719] },
      { label: "{ui:Click casting}", text: "Click casting keeps a list for each talent group on WoW Forever. A binding the game's own click settings won't run is marked on the grid, and an older list with the unit menu on {ui:Middle click} gets a notice with {ui:Swap them}.", from: [716] },
    ] },
    { id: "fixed", title: "Fixed", items: [
      { label: "Game windows and HUD", text: "Fixes from two hunts on the game's own windows and HUD pieces: text left in the game's parchment colours, art the game shows again on hover, raw bar colours, and the spellbook and achievements windows.", from: [707, 708, 709, 710] },
    ] },
] };

RELEASE_NOTES["v0.9.0"] = { groups: [
    { id: "new", title: "New", items: [
      { label: "Retail", text: "Vanguard now supports Retail 12.1.5 as well as WoW Forever, from the same download. The parts made for WoW Forever's own rules (key setup, the talent planner, spell ranks, the swing timer and a few more) stay off on Retail, with their pages and commands.", from: [744, 745, 746, 747, 756] },
      { label: "Retail class bars", text: "On Retail, class bars show holy power, soul shards, chi, Arcane charges, essence, runes, a Brewmaster's stagger, a Devourer's soul fragments and Ebon Might. Combo points light a charged point, and the cast bar marks each stage of an empowered cast.", from: [752] },
      { label: "Retail quest tracker", text: "On Retail, the quest tracker groups campaign quests and adds scenarios, delves with their tier, world quests, bonus objectives, the Traveler's Log, Endeavors, collections and achievements.", from: [751, 753] },
      { label: "{ui:Mythic+}", text: "A Mythic+ block in the tracker shows the key's timer, deaths, affixes, bosses and enemy forces. The dungeon card shows your keystone, and Situations gains Mythic+ and Delve.", from: [755] },
      { label: "Retail windows", text: "Retail's group finder, Adventure Guide, Mythic+ tab, character pane, warband bank, Great Vault, expansion page, transmog, Trading Post, housing, delve and profession windows wear the Vanguard look. An optional info strip line shows your Great Vault progress.", from: [749, 750, 753, 754] },
      { label: "{ui:In-combat mark}", text: "Crossed swords and a red edge on your frame, and a red edge on your target's while it fights. It is on at first; the switch is on the {ui:Unit frames} page.", from: [757] },
    ] },
    { id: "improved", title: "Improved", items: [
      { label: "Painted art", text: "The painted shield is Vanguard's icon, setup and What's new open under a painted welcome banner, two painted panel textures ({ui:Bedded slate} and {ui:Vellum}) join the {ui:Panel texture} choice, and the AFK screen shows a painted scene for your faction.", from: [722, 723, 730, 731, 732, 736, 737, 739] },
      { label: "{ui:Window ornaments}", text: "{ui:Window ornaments} are larger and show in full on every Vanguard window and every game window it skins, with an ornate ring on the round minimap. Muted text is a little brighter.", from: [738, 743] },
      { label: "{ui:Layout}", text: "On tall screens the bars and HUD rise as one block to sit under your character. A Cooldown Manager row wider than its spot shrinks to fit, and a Loot / Trade chat tab shows its whole name.", from: [733, 734, 735] },
      { label: "Options window", text: "The Raid frames page's cards open on their main settings, with a {ui:More settings} line that shows the rest.", from: [759] },
      { label: "Language", text: "The new text is translated in all ten languages. The translations are machine-drafted, so report a wrong line with /vg feedback.", from: [756, 757, 760] },
    ] },
    { id: "fixed", title: "Fixed", items: [
      { label: "Keys, frames and quests", text: "Key setup places a ranked spell's top rank, a flyout such as a mage's portals opens Vanguard's own list, frames Vanguard hides stay hidden, and finished auto-complete quests complete from the tracker.", from: [757, 760] },
      { label: "Safety", text: "The merchant's Stack button and Cancel on {ui:Your auctions} now ask first when they cost gold.", from: [757, 760] },
    ] },
] };

RELEASE_NOTES["v0.9.1"] = { groups: [
    { id: "improved", title: "Improved", items: [
      { label: "{ui:Gear upgrades}", text: "Gear upgrades weigh stats per class. On WoW Forever a druid picks Feral or Balance and a shaman Elemental or Enhancement under Damage style, and changed weights stay with their class. Caps on hit, expertise and defense mean a stat past its cap counts for nothing, and Import stat weights takes a guide site's weights string.", from: [767] },
      { label: "Stance and pet buttons", text: "Stance and pet buttons stay on their spots in a fight, and keybind mode binds them too.", from: [766] },
      { label: "{ui:Click casting}", text: "Click casting works on the main tank and party pet tiles, and Import asks before it replaces the bindings you have.", from: [766] },
      { label: "Raid frames and nameplates", text: "A thin bright line marks a shield that runs past a full health bar, and your focus's nameplate gets a quieter border and diamond.", from: [766] },
    ] },
    { id: "fixed", title: "Fixed", items: [
      { label: "Colours and theme", text: "Colours and the theme agree across every module, from cast bar times and combo point pips to the Dead and Offline words and Safer colours.", from: [765] },
      { label: "Raid tiles, nameplates and menus", text: "Raid tiles read Offline, ready checks and missing buffs right, nameplates show every aura the game flags for them without dark squares round the icons, Retail's right-click menus wear the theme, and Quiet gives back red errors and zone names once it is off.", from: [763, 764, 766] },
    ] },
] };

RELEASE_NOTES["v0.9.2"] = { groups: [
    { id: "fixed", title: "Fixed", items: [
      { label: "{ui:Nameplates}", text: "Nameplates no longer fill the error list with an “aura icon pixels” error in a dungeon or anywhere the game keeps some plates for itself: Vanguard leaves the aura icons on those plates alone.", from: [769] },
    ] },
] };

RELEASE_NOTES["v0.9.3"] = { groups: [
    { id: "fixed", title: "Fixed", items: [
      { label: "Bars and keys", text: "A flyout dragged onto a bar in a fight no longer raises an error, a WoW Forever flyout shows each spell once, and a character with no forms gets no empty stance boxes.", from: [773, 779] },
      { label: "Profiles and layout", text: "Pixel-perfect follows the screen, unlock and Edit Mode keep each other's moves, and a profile another character already restored from a newer backup is offered instead of being overwritten.", from: [773, 774, 775, 777, 778] },
      { label: "Bags and town", text: "The sell list and the craft queue are each character's own, auction posts, prices and bid wins count right, and bag search and quality borders behave.", from: [773, 775, 778, 779, 781] },
      { label: "Quests and chat", text: "Quest item buttons work in a fight, {ui:Close this tab} gives its chat back to the main window, and on Retail the quest tracker handles recipes, recrafts and scenario spells.", from: [774, 776, 777, 781] },
    ] },
] };

RELEASE_NOTES["v0.9.4"] = { groups: [
    { id: "new", title: "New", items: [
      { label: "Guided setup", text: "Setup now walks you through Vanguard's recommended settings in four more steps, {ui:Comfort}, {ui:Game settings}, {ui:Helpers} and Combat, with the rows recommended for your role marked. {ui:Move things} and {ui:All set} follow, listing what the run changed and offering {ui:Undo setup} to put your settings and the game's back. Running setup again starts every row on what you have now.", from: [794] },
      { label: "Setup paintings", text: "Every setup step sits under a painting: the dusk banner, then your faction's scene, then the camp at night.", from: [794] },
      { label: "{ui:Quiet the game}", text: "One place under {ui:Game windows} for declining duels, guild invites, group invites from strangers and friend requests, releasing at once in battlegrounds, and hiding the errors the action bar already shows. Auto-accept now only accepts, and the choices you had carry over.", from: [792] },
    ] },
    { id: "improved", title: "Improved", items: [
      { label: "Options", text: "Long setting names are short, with the old sentence as the row's tip, and a card you fold open or closed stays that way for that character. Features that used to be typed get buttons, such as listing your fights, your sell list and your craft queue, and a setting that is the game's own says so in its name.", from: [790] },
      { label: "Speed", text: "Logging in is quicker, because raid tile aura icons and nameplate frames are made when first needed. Raid frames, nameplates and the meter do less work in a fight, saved auction prices stop growing past a set size, and /vg perf shows more about boss fights.", from: [791] },
      { label: "Quests and mail", text: "A quest held on the arrow stays held through a reload, and {ui:Take all} stops at the first item with no free bag slot.", from: [793] },
      { label: "Merchants and the auction house", text: "Clicking a price alert shows the Buy page from any tab, and the merchant's Stack and Max line names what stops a buy: gold, stock or bag room.", from: [787] },
      { label: "{ui:Gear upgrades}", text: "A one-hand weapon is compared with the weaker hand while you wear a weapon in each, a WoW Forever shaman in the tank role weighs tank stats, and trainer memory is kept per faction.", from: [787, 793] },
      { label: "Frames and the meter", text: "The interrupt mark follows the interrupt you can use in your stance, click casting's “Also on your unit frames” leaves the boss frames out, a WoW Forever paladin's buff watch counts Blessing of Sanctuary, and the meter's Deaths report says when each death happened.", from: [793] },
    ] },
    { id: "fixed", title: "Fixed", items: [
      { label: "Saved settings", text: "The notice that your saved settings didn't load no longer comes back at every login when nothing was lost, and {ui:Keep these settings} answers it when it does show.", from: [785] },
      { label: "Errors", text: "A part of Vanguard that fails ten times in a session is paused instead of repeating the error, /vg errors lists paused parts and the actions the game blocked, and the Feedback page has a button to resume them. On WoW Forever, nameplates no longer raise an “aura icon pixels” error out in the world.", from: [788, 784] },
      { label: "{ui:Game windows}", text: "A game window a patch has reshaped keeps the game's own look instead of raising errors, and every other window is still skinned.", from: [792] },
      { label: "In a fight", text: "Dragging an action off a bar button, dropping one onto it and placing a newly learned spell do nothing in a fight, and work again when it ends.", from: [788] },
      { label: "{ui:Profiles}", text: "A profile brought over from Retail no longer makes WoW Forever's gear upgrades weigh item level, and restoring lost settings keeps the right backup.", from: [787] },
      { label: "{ui:Chat}", text: "{ui:Close this tab} on a tab that shows a channel points you to the tab's own menu, which gives the channel back to the main window.", from: [793] },
    ] },
] };

RELEASE_NOTES["v0.9.5"] = { groups: [
    { id: "new", title: "New", items: [
      { label: "HUD looks", text: "Your frames now point away from you as shields, with their bars filling toward you, and a crest on a rail between your frame and your target's (swords while you fight). Three more looks, {ui:Hairline}, {ui:Rimmed} and Tabs, sit beside {ui:Plain} under General, {ui:HUD look}, and setup offers the {ui:Shield} look as a recommended choice.", from: [796, 809] },
      { label: "HUD layouts", text: "Two layouts under General, Where the frames stand: The keep, a wall of frames at the foot of a wide screen, and Standards, tall banners either side of your character. Setup's layout step offers both.", from: [830] },
      { label: "{ui:Unit frames}", text: "Width and height sliders for each frame, more ways to show health, incoming heal and shield bars, a row of status marks (leader, tank or healer, resting, PvP), portraits under the {ui:Hairline}, {ui:Rimmed} and Tabs looks, and a frame for your focus's target.", from: [823, 833] },
      { label: "Nameplates and auras", text: "Plate size, aura counts, icon size and text sizes are sliders that apply at once, your target's plate can be drawn larger, and a switch (off until you turn it on) shows only the name on units you can't attack. Target and focus auras get sliders too, and Target's buffs shows All, Important or Yours.", from: [801, 804] },
      { label: "{ui:Tooltips}", text: "A player's tooltip adds their guild, rank, realm and role, yours shows your equipped item level, one switch adds Item ID and Spell ID, and each kind of tooltip gets its own position.", from: [799, 807] },
      { label: "{ui:Action bars}", text: "{ui:Macro names}, {ui:Key text} and {ui:Button spacing} apply without a reload, Auto-attack and Auto Shot buttons flash while the attack runs, and {ui:Your keys} shows the function row, a number pad and a layout choice (Automatic, QWERTZ or AZERTY).", from: [818, 828] },
      { label: "{ui:State cues}", text: "One switch under General, {ui:Motion and sound} adds a pulse round your frame at the pull, a breathing ring on a proc button, a flash when a cooldown ends and a ring at low health. The cues follow Reduce motion.", from: [824] },
      { label: "Town and talents", text: "A craft queue panel beside the profession window, a group board that scrolls, and an order for your talent plan (Order... on the planner's bar) that {ui:Spend planned} follows.", from: [828] },
    ] },
    { id: "improved", title: "Improved", items: [
      { label: "{ui:Look}", text: "Window and page titles are a size larger, the options header shows the painted crest and the Vanguard wordmark, a swatch beside the accent presets sets the accent to your class colour, and the game's own text in windows Vanguard does not skin takes the theme font.", from: [805] },
      { label: "Options", text: "The Modules page says so when its Show choice leaves nothing to list, and a page's card fades in when you change pages.", from: [805] },
      { label: "Language", text: "Most texts that were still English now have translations in the ten other languages, as machine drafts. The chat filter's word lists and the group board's phrases come per language, and a language with none shows no Gold selling, Boosting or Recruiting switch, with a note.", from: [829, 819] },
      { label: "{ui:Quests}", text: "Use the game's quest windows for now hands the quest and gossip windows back to the game at once, and holding a key hands back one talk. Zones you folded in the game's quest log stay folded, and Pick the reward that sells for most leaves the choice to you when a reward is a gear upgrade.", from: [815, 806] },
      { label: "Applied at once", text: "Raid tile width and height are sliders that resize the tiles without a reload, and the minimap's coordinates switch applies at once.", from: [815] },
      { label: "Retired", text: "Pet stable and the Legacy helper are gone, the two boss timer spots are movers under /vg unlock (and /vg dock is gone), and the officer tools' roster is on the {ui:Raid frames} page.", from: [820] },
      { label: "Group play", text: "A stranger you whispered in the last ten minutes may invite you, and gear upgrades give no verdict to an off-hand item while you wear a two-hander alone.", from: [806, 797] },
    ] },
    { id: "fixed", title: "Fixed", items: [
      { label: "Nameplate auras", text: "Aura icons on nameplates no longer show dark blocks or an “aura icon pixels” error where the game has closed a plate to addons.", from: [808, 821] },
      { label: "Profiles and setup", text: "/vg profile matches a name in any case and asks before making a new profile, /vg profile copy and delete ask first, and {ui:Undo setup} restores the profile it backed up without overwriting one it did not make.", from: [860] },
      { label: "{ui:Chat}", text: "An empty saved keyword no longer makes the chat filter catch every line, a damaged entry in a saved list no longer stops Chat watch, and a chat report under the game's chat restriction says why it could not be sent.", from: [860] },
      { label: "{ui:Quests}", text: "Abandon acts on the quest its row shows, and the game's quest tracker text stays hidden when the game brings its tracker back in a fight.", from: [860] },
      { label: "Town and auction house", text: "{ui:Return all} never tries a mail the game deletes, {ui:Keep stocked} never asks for more than one purchase allows, {ui:Train all} does nothing at a pet trainer, selling junk skips locked items and items in an equipment set, and a remembered bank is no longer replaced by an empty answer. At the auction house, Confirm posts only the item the sale was set up for, and a second click on Cancel doesn't repeat it.", from: [860] },
      { label: "In a fight", text: "The game menu's Vanguard button and the quest log button leave the game's window to close after the fight, your buff row stays put when a weapon enchant comes or goes, and a dropdown opened in a fight puts no click catcher over the screen.", from: [797, 810, 860] },
      { label: "Windows and bars", text: "Game windows, the fight recap, the damage meter and the minimap cope with values the game hides from addons, and one frame, nameplate or options row that fails no longer leaves the rest unpainted. The character pane's item levels read the item's detailed level.", from: [860, 810] },
    ] },
] };

// What's merged since the release named in `after`: shown only while that is
// still the current release, so it can't go stale after the next one ships.
// Nothing yet: v0.9.5 is the current release, and the pinned source is its commit.
export const NEXT_RELEASE = {
  after: "v0.9.5",
  groups: [],
};
