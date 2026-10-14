// The Changelog page's words: each release in player language, newest first.
// Every line names the merged changes it comes from in `from` (addon pull
// request numbers). `from` is never shown on the site; it's there so each
// line can be traced back. No line may describe something that isn't merged.

// The player-language notes for each published release, by tag. A release
// missing here falls back to the titles in its GitHub release notes.
export const RELEASE_NOTES = {
  "v0.3.0": [
    { text: "A new look, Slate & Brass: flat slate panels, a brass accent and crisp one-pixel borders at any UI scale.", from: [19, 25] },
    { text: "Vanguard's own font (Fira Sans Condensed), new artwork and the Vanguard logo.", from: [20] },
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
      { label: "Quests", text: "Vanguard's own quest dialog, quest tracker and quest log. Pick lines and rewards with the number keys, and press Space to accept, continue or complete.", from: [64, 65, 66, 67] },
      { label: "Quests", text: "Quest helpers that can accept quests, turn in finished ones and skip the chatter. Each is off until you switch it on, and holding Shift skips them.", from: [64] },
      { label: "Click casting", text: "Set up click casting without typing: pick spells from your spellbook on a grid of mouse buttons and modifier keys, add hover keys, start from a layout for your class, and share or copy your bindings.", from: [78] },
      { label: "Click casting", text: "A switch (off until you turn it on) to use the game's own click casting bindings on Vanguard's frames instead.", from: [80] },
      { label: "Groups & raids", text: "Boss frames, and a raid tools bar for leaders and assistants: ready check, pull timer, role check, target icons and world markers.", from: [60] },
      { label: "Groups & raids", text: "Main tank frames that show what each tank is targeting, and small frames for your party's pets and targets (off until you switch them on).", from: [70] },
      { label: "Fight history", text: "Your damage per second and your place in each fight this session, as a row of bars under the damage meter. Off until you switch it on.", from: [81] },
      { label: "Vendor memory", text: "Vanguard remembers what merchants sell, so item tooltips can say who sells an item and where. /vg stock says where to buy what you keep stocked.", from: [81] },
      { label: "Instance prep", text: "At a dungeon or raid door, or on a ready check, a card lists what you're short of: ammo, soul shards, reagents, food and drink, bandages, potions, repairs and your stocked items.", from: [81] },
      { label: "Chat watch", text: "Pick words to watch for in chat (for example LFM). When someone says one, you hear a sound and see a note; click it to whisper them.", from: [81] },
      { label: "Situations", text: "Record a different layout and settings for solo, party, raid, PvP, instances or resting. They switch on their own, out of combat, as you move between them.", from: [81] },
      { label: "Auction helper", text: "A panel beside the auction house: shopping lists, a sell card that suggests a price just under the cheapest, prices from your scans in item tooltips, and a check for auctions of yours that someone undercut. It only posts or cancels when you click.", from: [81] },
      { label: "Your buffs", text: "Your buffs and debuffs in Vanguard's look next to the minimap, with weapon enchants in front. Right-click a buff to cancel it.", from: [43] },
      { label: "Info strip", text: "A strip under the minimap with durability, free bag slots, frame rate and latency, gold, ammo or soul shards and the time, plus XP and gold per hour while you level and, if you like, your damage per second.", from: [44, 59, 69, 80] },
      { label: "Errands", text: "Train all at a trainer in one click, keep items stocked from merchants, and a timer for each flight.", from: [59] },
      { label: "At merchants", text: "Repair with your own gold, sell gray items, and fewer repeated error messages.", from: [44] },
      { label: "Combat aids", text: "A swing timer, sparks on your power bar for the five-second rule and energy ticks, your threat on your target, and your pet's happiness.", from: [46, 47] },
      { label: "Class extras", text: "Totem timers for shamans (right-click to destroy a totem) and a mana bar for druids in forms, under the player frame.", from: [41] },
      { label: "Nameplates", text: "Levels in difficulty colors, and a gold mark on units your quests need.", from: [47, 69] },
      { label: "Chat and minimap", text: "Clickable web links in chat, a Copy button for recent chat, other addons' minimap buttons gathered in a drawer, and optional auto-accept for summons and resurrections (and auto-decline for duels).", from: [63] },
      { label: "Comfort", text: "Quality colors on bag items, the bank in Vanguard's look, durability on the character pane, and how many you own and what an item sells for in its tooltip.", from: [59, 62] },
      { label: "Bags", text: "A Sort button, and the combined bag grouped into sections such as Quest items, Equipment and Junk.", from: [44, 80] },
      { label: "Away screen", text: "While you're away, the screen dims to a card with your character, zone, time away and XP.", from: [69] },
      { label: "Faction look", text: "A crest and a heading font for your faction: crossed swords for the Alliance, crossed axes for the Horde.", from: [73] },
      { label: "Game windows", text: "The game's windows, popups, quest tracker, loss of control alert, talking head, Cooldown Manager and damage meter in Vanguard's look.", from: [53, 57, 58, 68] },
      { label: "Moving frames", text: "Every movable frame has its own size and opacity, and bars and strips can show always, on mouseover, in combat, or not at all.", from: [34, 80] },
      { label: "Key bindings", text: "Keybind mode: type /vg keybind, hover an action button and press a key.", from: [80] },
      { label: "Other addons", text: "Fonts and bar textures shared by other addons show in Vanguard's pickers, and Masque can skin Vanguard's buttons.", from: [80] },
      { label: "Alerts", text: "An optional alert when a rare is nearby, and restyled Hardcore death notices.", from: [80] },
      { label: "Renamed", text: "ForeverUI is now Vanguard, because another, unrelated addon is published as ForeverUI. The commands are /vg and /vanguard. Settings don't move over by themselves: type /fui export before you update and /vg import after (old ForeverUI strings import fine), then delete the old ForeverUI folder.", from: [110, 111, 121] },
      { label: "Gear upgrades", text: "An item's tooltip says how it compares with what you wear (for example “Upgrade +12%”), an arrow marks upgrades in the combined bag and on quest rewards, and /vg weights shows or changes the stat weights for your class and role.", from: [119] },
      { label: "Other characters' items", text: "Item tooltips list which of your other characters on the realm have the item, in their bags or bank. /vg inventory lists the characters remembered.", from: [119] },
      { label: "Waypoints", text: "/way with coordinates puts a waypoint on the map you're on, and the game's own arrow points to it. While the world map is open, a line along its bottom shows your coordinates and the cursor's.", from: [119] },
      { label: "Quest tracker", text: "With Questie loaded, Questie's tracker shows instead of Vanguard's, so there are never two.", from: [119] },
      { label: "Boss mod docks", text: "Two spots you can move for boss mods' timer bars. /vg dock lines Deadly Boss Mods' bars up with them, and for BigWigs chat says where to drag its anchors.", from: [119] },
      { label: "Broker strip", text: "Other addons' data feeds (the kind Titan Panel shows: gold trackers, durability, guild counts) in a thin strip along the top edge of the screen. Pick up to four.", from: [119] },
      { label: "Auto-accept", text: "Faster auto-loot: when the game is auto-looting, every slot is taken at once. Items being rolled for and bind-on-pickup items still wait.", from: [119] },
      { label: "Auction helper", text: "Selling: a sell card with the quantity, stack size and number of stacks, a price suggested just under the cheapest (never under a vendor's price), a bid and the auction length. Post puts up one stack per click and loads the next, with a running count.", from: [108] },
      { label: "Auction helper", text: "Shopping: lists you can rename, duplicate, delete, export and import (Auctionator lists too), filters per item, every listing of an item sortable by column, and a Recent list of your last 20 searches.", from: [108] },
      { label: "Auction helper", text: "Your auctions: each one someone undercut is marked, Cancel next undercut cancels them one click at a time, and sold or expired items can be relisted from your bags.", from: [108] },
      { label: "Auction helper", text: "Prices are kept per realm and faction. Every scan and search feeds them, with each item's daily low and market value for 30 days.", from: [108] },
      { label: "Auction helper", text: "A Deals card of listings priced under a vendor's price or well under market value, price alerts for shopping list items with a max price, and a Restock list made from what you're short of.", from: [109] },
      { label: "Auction helper", text: "Beside the profession window: what a recipe's reagents cost, what the item sells for and the profit. A sales ledger of what sold, ran out or was cancelled, and disenchant values in tooltips.", from: [109] },
      { label: "Auction helper", text: "Other addons can read Vanguard's auction prices through an API with Auctionator's function names. It never posts, buys or cancels.", from: [109] },
      { label: "Chat watch", text: "The toast shows the auction price beside a linked item.", from: [109] },
      { label: "Bug reports", text: "/vg report puts everything a bug report needs in one box, ready to copy and paste into the Feedback form on this site.", from: [124] },
    ] },
    { id: "improved", title: "Improved", items: [
      { label: "Auction helper", text: "A bare number typed in any price box means gold.", from: [123] },
      { label: "Raid and party frames", text: "Easier to read: softer class colors, outlined names, a shield for tanks and a cross for healers, and a set place for each mark so nothing overlaps.", from: [32, 39, 54] },
      { label: "Raid and party frames", text: "They start just above your player frame, big raids are drawn smaller so they fit, and groups can be laid out as rows.", from: [51, 60, 61, 104] },
      { label: "Action bars", text: "Empty slots stay hidden until you drag something, each bar has its own number of buttons, buttons per row and size, and bar 1 is the top row.", from: [34, 35] },
      { label: "Layout", text: "One centered layout that holds together at any UI scale, with sizes chosen for 1080p screens.", from: [51, 81] },
      { label: "Text", text: "Text size changes at once, chat has its own text size, and tooltips use Vanguard's font.", from: [50] },
      { label: "Options", text: "A dot marks each setting you changed (click it to put the default back), every part has a plain description, profiles are managed in the window, search jumps to the setting, and the keyboard and mouse wheel move around the window.", from: [48, 49, 81] },
      { label: "A calmer screen", text: "Frames in the middle of the screen drop their sheen and shadow (a switch brings the shadow back), with a new Soft bar texture.", from: [54] },
      { label: "Menu and bags", text: "The game's menu and bag buttons sit together in one bar in the corner, with Vanguard icons.", from: [52, 55, 57, 58, 81] },
      { label: "Game menu", text: "A Vanguard button at the top of the Escape menu, or just under it where your client's menu can't take new buttons.", from: [59, 75] },
      { label: "Profiles", text: "Choosing a profile takes effect at your next reload, a whole profile string can bring its UI scale along, and a profile remembers its Edit Mode layout.", from: [79, 80] },
      { label: "Edit Mode", text: "The game's Edit Mode shows Vanguard's frame handles too, so you can move everything in one place.", from: [69] },
      { label: "Nameplates", text: "Your target gets a small diamond and an accent border.", from: [55, 81] },
      { label: "Quests", text: "Long quest text and long quest lists scroll with the mouse wheel.", from: [79] },
      { label: "Performance", text: "Less work in big raids and with many nameplates on screen, and /vg perf to see what Vanguard costs.", from: [77] },
      { label: "Bug reports", text: "/vg errors lists what went wrong this session, and a red number on the addons button shows when something did.", from: [42, 75, 80] },
    ] },
    { id: "fixed", title: "Fixed", items: [
      { label: "Reloading", text: "The Reload buttons now work on WoW Forever.", from: [41] },
      { label: "Loading", text: "Vanguard no longer shows as out of date on WoW Forever, and a problem in one part no longer stops the rest.", from: [39, 75] },
      { label: "Old game builds", text: "/vg status warns when your WoW Forever build is too old to keep addon settings.", from: [56] },
      { label: "Hover keys", text: "When the game can't run the code hover keys need, bar 1 paging and the raid frames keep working, and hover keys now work with Shift or Ctrl held.", from: [76, 79] },
      { label: "Raid frames", text: "Names are no longer hidden under incoming heals, no error when the game hides health, and no false missing-buff warnings in instances (any paladin blessing counts).", from: [36, 39, 55] },
      { label: "Unit frames", text: "Your level updates when you level up, and frame shadows sit evenly.", from: [45] },
      { label: "Game windows", text: "No more errors when mail arrives or when you open Edit Mode, and quest and gossip text is easy to read.", from: [56] },
      { label: "Action bars", text: "Tooltips, self-cast and focus-cast work on every button, and hidden empty slots no longer block clicks.", from: [79] },
      { label: "Conversations", text: "Hiding the interface with Alt-Z no longer ends a conversation with an NPC.", from: [79] },
      { label: "Saved settings", text: "A damaged entry in your saved settings no longer stops Vanguard loading, and a bad frame spot in an imported profile no longer loses the unit frames.", from: [81] },
      { label: "Freezes and errors", text: "Unlocking with a grid size of 0 no longer freezes the game, and there's no longer an error at every login, when pressing the minus key in click casting, from /vg stock with Errands off, or on the Healing options page with raid heals off.", from: [81] },
      { label: "Cast bars and swing timer", text: "Channeled spells empty instead of filling, an interrupted channel no longer flashes as finished, and the swing timer starts over after a weapon swap.", from: [81] },
      { label: "Bars and counts", text: "Shift+number bar paging works in a stance, form or stealth, and item and reagent counts show on action buttons on WoW Forever.", from: [81] },
      { label: "Groups", text: "A quick second ready check keeps its answers, and group changes during a fight no longer pile up work for the end of it.", from: [81] },
      { label: "Boss levels", text: "A “??” boss level shows in red instead of gray.", from: [81] },
      { label: "Russian", text: "Russian headings use a font with Cyrillic letters.", from: [81] },
      { label: "Profiles", text: "A profile deleted on another character no longer comes back empty: a character that used it moves to Default. Copy here while a switch waits for a reload copies into the profile you'll use after it.", from: [124] },
      { label: "Moving frames", text: "Trying to unlock frames during a fight now says “In combat. Try again once combat ends.”", from: [124] },
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
      { label: "Talent planner", text: "Plan where your talent points will go before you have them, on the game's own talents window. With Plan on, a click sets the rank you want instead of buying it; the planned ranks show as badges and the next pick is ringed. Spend planned (or /vg talents spend) buys them in a legal order, chat names the next pick at each level-up, and plans are kept per character and spec and can be shared as a string.", from: [162] },
      { label: "Auction house", text: "Vanguard's auction helper is now two tabs on the game's window, Shopping and Selling, each card in its own bordered box. Shopping lists your shopping lists, Recent, Deals and a new Upgrades list (armor and weapons on the auction house that beat what you wear, by Gear upgrades' stat weights) beside one wide table with sortable columns. Selling has the sell card, what's up now and your auctions.", from: [174, 177] },
      { label: "Setup for each character", text: "A new character on an account that has finished setup gets the wizard too, with a Profile step first: share your other characters' profile, or give this one a copy of its own. Closing the wizard early asks again at the next login, Skip setup ends it for good, and Keep my current layout moves nothing, so running it again with /vg setup or Run setup (under General) changes only what you pick.", from: [179] },
      { label: "Game windows", text: "Many more of the game's windows get Vanguard's flat panel, close button, title and buttons: mail, guild, channels, friends and guild creation; the hunter's pet stable, the class trainer, separate bag windows, loot and item dialogs, the macro window and the stopwatch; the game's options, the addon list, Edit Mode, keybinding and help windows; and the world map, group finder, calendar and Legacy window. Each group has its own switch under Bars, map, chat.", from: [129, 130, 131, 132, 133] },
      { label: "Menus and tooltips", text: "Right-click menus and dropdowns open on a flat Vanguard panel, and more of the game's tooltips (item comparisons, buff tooltips, keybinding tooltips, whisper name suggestions) match the main tooltip.", from: [134] },
      { label: "Tabs and scroll bars", text: "Tabs on the game's windows become flat tiles with an accent line on the selected one, side tabs on the character pane get the same, and the game's scroll bars get a flat track and a raised thumb. The inside of the character pane (reputation and skill bars, headers, stat boxes, the equipment flyout) is dressed too.", from: [136, 157] },
      { label: "Window controls", text: "Close, maximize and minimize buttons in Vanguard's own look, in the same place on every window: a plain cross and two diagonal arrows on a square tile that turns red behind the close button under the mouse.", from: [157, 161, 181] },
      { label: "Your buffs and the swing timer", text: "The game's own swing timer, its external defensives and deadly debuff frames, the crafting cast bar and the possess bar take Vanguard's look. The game's swing timer is hidden while Vanguard's is on.", from: [135] },
      { label: "Feedback in game", text: "/vg feedback asks the same questions as the Feedback form on this site (bug or feature) and makes one block to copy. Paste it into the form here and it fills the fields. There's a Feedback page of its own at the end of the options window, too.", from: [152] },
      { label: "Healing", text: "The buffs to watch for are listed for every class, each with its icon and an on/off switch, with yours first, plus your spellbook's other buffs and any names you type.", from: [153] },
      { label: "Away screen", text: "Under the away card, your faction's passage: Varian's last letter to Anduin for the Alliance, the Blood Oath of the Horde for the Horde (with the faction look on).", from: [156] },
    ] },
    { id: "improved", title: "Improved", items: [
      { label: "Minimap", text: "The zone name sits on a see-through band along the top edge and the coordinates on one along the bottom, so both read over bright ground. Hover the zone name to see the zone, its subzone and whose territory it is; click it to open or close the world map.", from: [154] },
      { label: "Minimap buttons", text: "Tracking and the addon compartment are slot buttons like the menu bar's, on a taller bottom band, and the addon compartment's count is faded instead of hanging off its slot.", from: [157, 161] },
      { label: "Nameplates", text: "A click lands on the plate as Vanguard draws it (the name and bar, plus a little around them), friendly players' plates stay clickable with the game's name-only option on, and the plate under the mouse gets a faint wash. Players' plates show their big defensives and important buffs, and the buffs you cast on friendly players, right of the bar.", from: [176] },
      { label: "Menu bar", text: "Vanguard's line icons are on by default for new profiles, and the game's own icons, when you pick them, fill their slots in dark wells. The menu slots are a little taller so each button fits whole, and a slot's accent edge shows only under the mouse.", from: [167, 171, 178] },
      { label: "Icons", text: "New icons for the options window's pages and the minimap's tracking and addon buttons, from game-icons.net.", from: [171] },
      { label: "Keybind mode", text: "Bind the middle and side mouse buttons and the mouse wheel as well as keys. A tooltip over the button shows its keys, Backspace or Delete clears them, and chat says when a key is taken from something else.", from: [149] },
      { label: "Click casting", text: "The spell picker stays on screen and closes with Escape or a click outside it.", from: [149] },
      { label: "Game windows", text: "The friends list (the game's social window on WoW Forever) gets Vanguard's look, the panel reaches past the window so its contents have room, the bag window gets the same look, and the text boxes (copy, report, export, feedback) open above the options window.", from: [157, 161, 164, 182] },
      { label: "Bug reports", text: "/vg frame <name> prints what the game says about one of its frames (add deep for its parts), to paste into a bug report about something that only goes wrong in game.", from: [165] },
      { label: "Options", text: "Notes wrap inside their card, a dropdown's long choice ends in an ellipsis instead of running past its box, and the window's scroll bar can be dragged.", from: [152, 161] },
    ] },
    { id: "fixed", title: "Fixed", items: [
      { label: "Errors at login", text: "Three errors the game logged at every login are gone: one in the menu bar, one in the bags and one in the scroll bars of skinned windows.", from: [158] },
      { label: "Menu bar", text: "The bags and menu buttons no longer vanish, leaving an empty bar, after the game switches between mouse and gamepad.", from: [151] },
      { label: "Game windows", text: "One window's skin failing no longer stops the others from being dressed, the flight map keeps its map art, and the quest log's close button shows.", from: [155, 157, 161] },
      { label: "Chat", text: "Copy (and every copy and export box) works again.", from: [157] },
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
      { label: "Looks", text: "Seven more looks under General → Look: High contrast (opaque panels, white text, a thicker accent ring), Vellum and ink (a warm dark with cream text), Classic look (dark leather and bronze), Midnight, Obsidian, Moss, and Ash and ember. Slate and brass stays the default. A Corners setting rounds the corners of windows, frames, tooltips and buttons on any look (square stays the default), and a Window ornaments switch adds a thin brass rule under the options window's header and corner brackets on setup and the quest log.", from: [321, 328, 352, 325, 355, 361] },
      { label: "Role layouts", text: "Setup's Healing and Damage and tanking layouts now set the raid frame, raid aura and nameplate settings of the Healer and Damage presets, so the two look different. Vanguard's Healer, Damage and Tank presets also apply from the Profiles page (or /vg preset) after a question and a backup.", from: [348, 306] },
      { label: "Raid frames", text: "A raid of 25 or 40 now starts at the left of your character, its groups stacked as rows, where healers keep it. A party or a raid of 10 stays over your player frame, and Stack big raids at the left turns the change off.", from: [331, 335] },
      { label: "What's new", text: "After an update, the first login shows what changed in this version, grouped by part. Click a line to open its setting. /vg whatsnew opens it again.", from: [274] },
      { label: "Settings guard", text: "At each logout Vanguard keeps a backup of your profile. If your saved settings come back blank at the next login, chat says so and offers to restore them.", from: [272] },
      { label: "Profiles", text: "A profile can be exported in parts, such as layout only or one module, and a partial string merges into your profile without touching the rest. Your profile is backed up before any import, and large strings import without freezing the game. Other addons can offer presets, and open the options window on a page.", from: [278, 306] },
      { label: "Moving frames", text: "A frame can be anchored to another frame's side, and a bar can match another frame's width or height. Exit without saving puts every frame back as it was when you unlocked.", from: [279] },
      { label: "Situations", text: "While you record a situation, a banner says which one you are editing and what it changes, with a button to stop and save. Settings a situation can't hold are left out of it.", from: [276] },
      { label: "Game windows", text: "The spellbook gets the flat Vanguard panel, and the calendar and more than a dozen other game windows can be dragged by their top edge.", from: [274, 313] },
      { label: "Info strip", text: "The strip is in two columns now, with the day, date and time on one row and a calendar button that opens the game's calendar.", from: [302, 314, 374] },
      { label: "Group threat", text: "A panel lists who in your group has the most threat on your target. It starts off, and hides itself while the game hides threat values.", from: [311] },
      { label: "Group board (experimental)", text: "Not yet seen working in the game, so it may show no posts. /vg lfg lists the looking-for-more and looking-for-group posts it reads from chat, by dungeon, role and level. A click opens a whisper that you send yourself.", from: [270, 363] },
      { label: "Quest guidance", text: "Quest-start pins on the world map, from the game's own quest data, and a New mark on quests the game flags as new. Shift-click a quest in the tracker to point the arrow at its next step.", from: [270] },
      { label: "Other addons", text: "When another addon does a job a Vanguard module also does, chat says so once and the Modules page lets you pick which one does it.", from: [270] },
      { label: "Spell ranks", text: "Chat can say when a bar button holds an older rank of a spell you know better, and /vg ranks swap puts the newest rank there. Trainers you visit are remembered: /vg trainers next lists what comes in the next levels and where to learn it. Both start off.", from: [305] },
      { label: "Cooldowns", text: "A row of icons for what the game's Cooldown Manager misses: on-use trinkets, items and spells you choose, your pet's abilities and totems. A Cooldown Manager buff icon can also glow when its aura is in its last part. Both start off.", from: [317, 318] },
      { label: "Vanguard meter", text: "A damage and healing meter in the Vanguard look (/vg meter): the top lines of the game's own meter as class-colored bars, per second, in combat too. It starts off, and the game's own meter stays until you turn it off in the game's settings.", from: [329, 337, 351, 375] },
      { label: "Fight recap", text: "/vg recap shows the last fight's interrupts, dispels, damage taken and deaths from the game's damage meter, and sends them to a channel on request. A recap in your own chat after each fight starts off.", from: [315] },
      { label: "Roll tracker", text: "A small panel lists the group's /roll results with the top roll in your accent color, and, where the game has it, the items the group rolled for and each member's choice.", from: [289] },
      { label: "Officer loot tools", text: "A soft-reserve list (/vg loot) flags a roll on a reserved item in the roll tracker, and a roster panel lists the group by role. Nothing is synced or sent for you. Both start off.", from: [324] },
      { label: "Upgrades", text: "A wizard sets your stat weights stat by stat, with a slider and an exact-value box for each. /vg weights wizard opens it.", from: [370, 376] },
      { label: "Instance prep", text: "A dungeon card on the checklist shows the dungeon's level range, your own quests for it and the keys you carry. Buff checks add flask, food, weapon oil and raid buff rows to the ready-check card, and a wizard sets how many of each supply you want (/vg prep setup).", from: [304, 316, 372] },
      { label: "Craft queue", text: "A craft queue for your professions (/vg craft): queue the recipe on display, open the next one, raise Keep stocked to fit, see profession cooldowns across your characters and rank the recipes that pay best. Nothing is crafted or bought for you. It starts off.", from: [303] },
      { label: "Mail tools", text: "A panel beside the mail window searches and filters your inbox, and presets fill the Send Mail tab for your alts (/vg mail). You click Take and Send yourself. It starts off.", from: [320, 381] },
      { label: "Errands", text: "A boat and zeppelin timer learns each ride's time and counts down the next one. It starts off.", from: [307] },
      { label: "Legacy", text: "/vg legacy probe lists what the game has for the Legacy system, and a perk planner keeps a list of perks within the tree's 16 points. The planner starts off.", from: [323] },
      { label: "Levelling", text: "Quest XP in the tracker and quest log, XP bar tooltips and a warning when a supply you keep stocked runs low.", from: [288] },
      { label: "Nameplates", text: "/vg plates says whether the game shows enemy nameplates and turns them on, and the Nameplates page has Enemy and Friendly switches that follow the game's own settings. Enemy plates are on by default, and Vanguard dresses both alike.", from: [382, 384, 387] },
    ] },
    { id: "improved", title: "Improved", items: [
      { label: "Auction helper", text: "The tabs are now called Lists and Posting and are sized to their names. Posting shows a step guide (Item, Price, Post, Listed) with a line saying what to do next, a price the game asks you to confirm is confirmed with a second click, and a failed post names the auction house's error. Clicking an item in your bags while Posting is open keeps you on Posting.", from: [205, 298, 312, 371] },
      { label: "Auction helper", text: "Deals show their market value and full item names, Upgrades no longer repeats an item, and prices, sales and your character list are kept apart by realm, ruleset and faction side.", from: [275, 373] },
      { label: "Options window", text: "The options are split into one page for each part: Unit frames, Raid frames, Healing, Click casting, Talents, Action bars, Nameplates, Quests, Bars and bags, Map, Chat, Game windows, Combat tools and Town and gear. Escape closes the window, switches are larger and captions wrap.", from: [273, 326, 327, 330, 338, 340, 341] },
      { label: "Quest log", text: "Track and Untrack buttons redraw at once, Shift-click tracks a quest, and a zone's header has a chevron to fold it. Hovering a reward card in the quest log shows the item's tooltip.", from: [310, 378, 379, 380] },
      { label: "Quest tracker", text: "Click +N more to show up to 10 watched quests, and the choice is remembered. The tracker starts below the info strip so the two don't overlap.", from: [350, 353, 385] },
      { label: "Trainers", text: "Train all sits clear of the money line and matches the Train button's height.", from: [354, 358, 360] },
      { label: "Click casting", text: "The Add key picker and the spell picker stay above everything else, so clicks reach them.", from: [356, 357] },
      { label: "Setup", text: "The setup wizard keeps your current layout unless you pick another. Before it changes anything it backs up your profile, Done ends with a reload, and the last step sits above the frame handles with its title and step centred.", from: [280, 205] },
      { label: "Game windows", text: "Window controls sit on a resting tile, the map's close and maximize buttons level with its title, the calendar's filters clear the close button, guild panes' fill goes under their rows, and the spellbook's title and controls sit inside its band.", from: [308, 309, 314, 339, 342] },
      { label: "Bags", text: "The Sort button no longer sits under the backpack icon, and items drag again.", from: [300] },
      { label: "Menu bar", text: "A menu bar button takes your click while the game's new indicator shows above it, and the line icons are drawn at the size they show at.", from: [286, 299, 332] },
      { label: "Raid frames", text: "A raid tile width the choices don't list shows its value on the Width row.", from: [274, 205] },
      { label: "Theme", text: "Panels and edges are drawn more cleanly: striped fills are one pixel-exact tile, and switching look recolours text that is already on screen.", from: [269, 282, 297, 301, 361] },
      { label: "Brand", text: "Vanguard's crest is the addons-list icon and sits in the options window's header.", from: [343, 344] },
      { label: "Memory", text: "Auction price history keeps seven days instead of thirty, a scan keeps the cheapest link per item, and chat alerts are swept, so Vanguard holds less memory. /vg mem shows what it holds.", from: [334, 383] },
    ] },
    { id: "fixed", title: "Fixed", items: [
      { label: "Errors", text: "An error in a hook on a game function, a button click or a timer is kept in /vg errors and doesn't stop the others.", from: [277, 274] },
      { label: "Raid frames", text: "The grid stays on its spot's side right after a reset or a drag.", from: [335] },
      { label: "Options", text: "The Unit frames icon lines up with the others in the page list.", from: [336] },
      { label: "Mail tools", text: "Preset buttons you haven't made stay hidden, the panel says when the inbox is empty or nothing matches, and it sits on the mail window's layer.", from: [381] },
    ] },
] };

// What's merged since the release named in `after`: shown only while that is
// still the current release, so it can't go stale after the next one ships.
// Nothing yet: v0.6.0 is the current release, and the pinned source is its commit.
export const NEXT_RELEASE = {
  after: "v0.6.0",
  groups: [],
};
