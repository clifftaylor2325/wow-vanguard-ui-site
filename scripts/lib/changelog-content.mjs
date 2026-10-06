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

// What's merged since the release named in `after`: shown only while that is
// still the current release, so it can't go stale after the next one ships.
// Nothing yet: v0.4.0 is the current release.
export const NEXT_RELEASE = {
  after: "v0.4.0",
  groups: [],
};
