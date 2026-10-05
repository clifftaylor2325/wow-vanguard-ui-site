// The Features page's longer words for each module, in player language.
// Each `more` is written from the addon's README ("What's in it"), named in
// `from`. `check` lists README phrases, one or more for every fact in `more`,
// that the README must still contain at build time: if one is gone, that
// module's `more` is dropped and only the addon's own one-line description
// shows. `from` is never shown on the site.
export const MORE = {
  UnitFrames: { more: "Player, target, target of target, focus and party frames, plus up to five boss frames in a column from the top-left corner, each shown while its boss is in the fight. On WoW Forever they show levels colored by difficulty and health as a percent, and a diamond marks elite, rare and boss targets.",
    check: ["player, target, target of target, focus and party frames", "boss frames (up to five, in a column from the top-left corner", "each shown while its boss is in the fight", "levels (colored by difficulty) and health as a percent", "a diamond marks elite, rare and boss targets"], from: "Unit frames" },
  CastBars: { more: "Cast bars for you, your target and your focus, with a spark, the seconds left, your latency at the end of your own cast, and a gray edge on a cast you can't interrupt.",
    check: ["Cast bars for you, your target and your focus, with a spark, the seconds left, your latency at the end of your own cast, and a gray edge on a cast you can't interrupt"], from: "Unit frames (cast bars)" },
  FrameAuras: { more: "Debuffs sit under the target and focus frames: a crowd-control slot first, then yours, soonest to expire first. Turn \"Only your debuffs\" off to see everyone else's too, dimmed. The target's buffs sit above its frame.",
    check: ["Target and focus auras: debuffs under the frame", "a crowd-control slot, then yours soonest-first, then others' dimmed if you turn \"Only your debuffs\" off", "the target's buffs above it"], from: "Unit frames (target and focus auras)" },
  PlayerAuras: { more: "Your buffs sit in rows left of the minimap with timers, and your debuffs on a row under them, edged in their type's color. Right-click a buff to cancel it. Weapon enchants (poisons, stones, oils and a shaman's imbues) sit in front of the buffs.",
    check: ["buffs in rows left of the minimap with timers, your debuffs on a new row under them (edged in their type's color)", "right-click a buff to cancel it", "Weapon enchants (poisons, stones, oils, and a shaman's imbues", "sit in front of the buffs"], from: "Your buffs and debuffs" },
  ComboPoints: { more: "Combo points for rogues and druids, above the player frame.",
    check: ["Combo points for rogues and druids above the player frame"], from: "Unit frames" },
  ClassBars: { more: "Shamans get their totems under the player frame (icon and time left; right-click one to destroy it), and druids their mana while bear or cat form shows rage or energy.",
    check: ["shamans get their totems (icon and time left; right-click one to destroy it)", "druids their mana while bear or cat form shows rage or energy"], from: "Unit frames" },
  PowerTicks: { more: "A spark on your power bar counts down the five-second rule after each mana spell, or crosses the bar with every two-second energy tick.",
    check: ["a spark counts down the five-second rule after each mana spell, or crosses the bar with every two-second energy tick"], from: "Combat timers" },
  SwingTimer: { more: "One row per hand: main hand, off hand, and ranged for a hunter's Auto Shot. It's on for warriors, rogues and hunters, and can be set to always or never.",
    check: ["a swing timer with a row per hand (main hand, off hand, and ranged for a hunter's Auto Shot)", "on for warriors, rogues and hunters, and can be set to always or never"], from: "Combat timers" },
  UnitExtras: { more: "Your threat on your target as a percent above the target frame, in the threat colors once you have aggro, and a dot on the pet frame for a hunter pet's happiness: green happy, orange content, red unhappy.",
    check: ["your threat on your target as a percent above the target frame (in the threat colors once you have aggro)", "a dot on the pet frame for a hunter pet's happiness: green happy, orange content, red unhappy"], from: "Readouts" },
  RaidFrames: { more: "Tiles laid out in zones that never overlap: the name at the top, missing health, Dead or Offline under it, and the power bar along the bottom. By default, class colors are softened into the panel color so tiles read at a glance. A raid of more than 10 is drawn smaller so all 40 fit, and groups can be laid out as columns or as rows, so a big healing raid is wide and short.",
    check: ["Laid out in zones that never overlap: name at the top, status (missing health, Dead, Offline) under it", "the power bar along the bottom", "Readable at a glance: class colors softened into the panel color by default", "a raid of more than 10 is drawn smaller (80%, or 72% above 25) so all 40 fit", "Groups as columns (the default) or rows", "a big healing raid is wide and short"], from: "Raid frames; Centered layout" },
  RaidAuras: { more: "The first debuff you can dispel, then up to two others (boss debuffs included), and your heals over time, lit while they're in their refresh window. A debuff you can dispel washes the tile in its type's color.",
    check: ["the first debuff you can dispel, then up to two others (boss debuffs included)", "your HoTs, lit while they're in their refresh window", "A debuff you can dispel washes the tile in its type's color"], from: "Raid frames (Auras)" },
  RaidHealing: { more: "Incoming heals and shields, an aggro strip, and a mark for a missing buff (hidden while the game hides auras, so it never cries wolf).",
    check: ["incoming heals and shields, aggro strip, missing-buff marker (hidden while the game hides auras, so it never cries wolf)"], from: "Raid frames (Healing)" },
  RaidStatus: { more: "Players out of range fade, with raid target icons, the ready check (a check, cross or three dots), a resurrection mark, a gold crown for the leader and a small diamond for assistants.",
    check: ["range fade, raid target icons, ready check (a check, cross or three dots", "resurrection marker, and a gold crown for the leader and a small diamond for assistants"], from: "Raid frames (Status)" },
  MainTanks: { more: "In a raid, the players marked main tank or main assist get small tiles at the top left, with health in their class color and what each one is targeting beside it. Click one to target them.",
    check: ["in a raid, the players marked main tank or main assist get small tiles at the top left", "with health in their class color and what each is targeting written beside it", "Click one to target them"], from: "Main tank frames" },
  PartyExtras: { more: "A small tile for each party member's pet and target, one row per member, above the party frames. They show only in a party.",
    check: ["a small tile for each party member's pet and target, one row per member, above the party frames", "They show only in a party"], from: "Party pets and targets" },
  RaidTools: { more: "For the group's leader and assistants: a ready check, a 10-second pull timer (right-click cancels it), a role check, a button that turns your party into a raid, the eight raid target icons and the eight world markers.",
    check: ["for the group's leader and assistants, a small bar at the top left with a ready check, a 10-second pull timer (right-click cancels it), a role check and Raid (turns your party into a raid), the eight raid target icons", "the eight world markers"], from: "Raid tools" },
  ClickCast: { more: "Set it up without typing a spell: a grid of mouse buttons and Shift, Ctrl and Alt, filled from your own spellbook or with one click from a starter layout for your class. Add hover keys, try a binding on a sample tile without casting, and share your bindings as a string.",
    check: ["set up without typing a spell", "**Starter layout**: one button fills the grid with your class's healing layout", "mouse buttons down the side, Plain / Shift / Ctrl / Alt across the top", "Click a cell to pick from your own spellbook", "**Hover keys**", "**Try it**: hover the sample tile", "without casting", "Export and Import the bindings as a string"], from: "Click casting" },
  ActionBars: { more: "Eight bars, each with its own number of buttons, buttons per row, button size and visibility: always, on mouseover, in combat, or hidden (a hidden bar's keys still work). Empty slots stay out of sight until you drag a spell or item.",
    check: ["Each bar has its own number of buttons, buttons per row, button size, and visibility: Always, On mouseover", "In combat, Hidden", "Hidden bars keep their keys", "Empty slots stay hidden until you drag a spell or item"], from: "Action bars; Bars" },
  SpecialBars: { more: "Restyled pet, stance and extra action buttons that keep the game's active-stance, attack-flash and auto-cast marks, plus a vehicle exit button. The pet and stance bars get spots of their own at the bottom left, above the chat.",
    check: ["restyled pet, stance and extra action buttons and a vehicle exit button", "the active stance, the pet's attack flash and the auto-cast mark", "The pet and stance bars sit in spots of their own at the bottom left, above the chat"], from: "Action bars" },
  Minimap: { more: "A square minimap with brass diamonds on its corners. Tracking, mail, dungeon difficulty and the group finder eye move onto its corners.",
    check: ["square minimap (brass diamonds on its corners", "Tracking, mail, dungeon difficulty, the addon compartment and the group finder eye move onto the square minimap's corners"], from: "Everything else; The game's extras, tidied" },
  InfoStrip: { more: "Durability, free bag slots, frame rate and latency, gold, ammo or soul shards, and the time. While you level, a row adds your XP and gold per hour and the time to your next level. A fourth row can show your DPS in the last fight (off until you turn it on). Each part can be turned off.",
    check: ["durability (orange at 25% or less, red at 10% or less), free bag slots, fps and latency, gold, ammo for hunters, warriors and rogues (soul shards for warlocks", "and the time. While you level, a third row adds your XP per hour this session, the time to your next level at that pace, and your gold per hour", "A fourth row can show your DPS in the last fight", "(off until you turn it on;", "Each part can be turned off"], from: "Strip under the minimap" },
  AfkScreen: { more: "While you're away, the screen dims to a card with your name in your class color, your level and class, the zone, how long you've been away, the time and your XP bar. Moving or a fight brings everything back.",
    check: ["the screen dims to a card with your name in your class color, level and class, the zone, how long you've been away, the time and your XP bar", "Moving or a fight brings everything back"], from: "AFK screen" },
  MenuStrip: { more: "The game's bag and menu buttons share one bar in the bottom-right corner, each on its own framed slot, with a thin bar showing how full each bag is. The game's double XP bar, durability figure and clock are hidden while Vanguard shows its own.",
    check: ["The bag buttons and the micro menu share one bar in the bottom-right corner", "Every button sits on a 24-pixel slot", "Each bag's slot has a thin bar along its bottom showing how full that bag is", "no more double XP bar", "and so are the durability figure, clock and calendar button while the info strip shows them"], from: "The game's extras, tidied" },
  Chat: { more: "Vanguard's skin on the chat, which starts in a spot at the bottom left under the frames. Chat has its own Small, Medium or Large text size on top of Vanguard's text size.",
    check: ["chat skin", "Chat starts in a bottom-left spot under the frames", "Chat has its own Small, Medium or Large on top"], from: "Everything else; Centered layout; Text size" },
  Bags: { more: "One combined bag, with a Sort button, items bordered in their quality color, and sections for quest items, equipment, consumables, trade goods, other, junk and empty slots. The bank gets the same look.",
    check: ["combined bag", "with a Sort button beside the search box", "item slots bordered in each item's quality color", "quest items, equipment, consumables, trade goods, other, junk (gray items) and empty slots", "the bank in the same look"], from: "Everything else" },
  Merchant: { more: "Repairs with your own gold and sells your gray items. The error line drops what the action bar already shows (ability not ready, not enough rage or energy, no target). Each part can be turned off.",
    check: ["repairs with your own gold and sells your gray items", "The error line drops what the action bar already shows (ability not ready, not enough rage or energy, no target)", "Each can be turned off"], from: "At a merchant" },
  ChatExtras: { more: "Web addresses in chat become links you can click to copy. A Copy button over the chat (or /vg copy) opens the recent chat as plain text. Optional short channel names, and Ctrl + mouse wheel jumps to the top or bottom of a chat window.",
    check: ["web addresses in chat become links", "click one and it opens selected, ready to copy", "button over the chat (or `/vg copy`) opens the recent chat as plain text", "Short channel names (off until you switch it on)", "Ctrl + mouse wheel jumps to the top or the bottom of a chat window"], from: "Chat extras" },
  ChatWatch: { more: "Add phrases (for example \"LFM\") and pick the channels to watch. When someone says one, the whisper sound plays and a small toast shows who said it; click it to whisper them. Your own lines never ring.",
    check: ["phrases that ring a sound and show a toast you can click to whisper the sender", "Add phrases (\"LFM\"", "tick the channels to watch", "the whisper sound plays and a small accent-edged toast", "shows the sender and the line", "your own lines never ring"], from: "Chat watch" },
  MinimapButtons: { more: "Other addons' round minimap buttons are gathered into a drawer beside the map. The small \"...\" button on the map's left edge opens it.",
    check: ["other addons' round minimap buttons are gathered into a drawer beside the map; the small \"...\" button on the map's left edge opens it"], from: "Minimap drawer" },
  AutoAccept: { more: "Accept summons (out of combat), accept resurrections, and decline duel requests. Each one is off until you switch it on, and each says in chat what it did.",
    check: ["each off until you switch it on, under Bars, map, chat): accept summons (out of combat), accept resurrections", "decline duel requests. Each says in chat what it did"], from: "Auto-accept" },
  QuestDialog: { more: "Talking to a quest giver opens Vanguard's own dialog instead of the game's quest and gossip windows: the NPC's portrait and name, the text, numbered lines, reward cards and the money and XP you'll get. Press a number to pick, Space for the main button and Escape to say goodbye.",
    check: ["talking to a quest giver opens Vanguard's own dialog", "instead of the game's quest and gossip windows", "the NPC's portrait", "numbered lines for quests", "reward cards with quality borders", "and the money and XP you'll get", "Press a number to pick a line or a reward, Space for the main button", "Escape to say goodbye"], from: "Quest dialog" },
  QuestTracker: { more: "Each quest you watch, with its level in its difficulty color, its objectives (green when done) or \"Ready to turn in\", and its quest item as a button beside it. Left-click a quest to open it, right-click to stop watching it, and order it as the game does or nearest first.",
    check: ["each quest you watch as \"[12] Title\" in its difficulty color", "its objectives (gray, then green when done) or \"Ready to turn in\"", "its usable quest item as a button beside it", "Left-click a quest to open it, right-click to stop watching it", "order it as the game does or nearest first"], from: "Quest tracker" },
  QuestLog: { more: "Your quests under their zones (click a zone to fold it), with the chosen quest's text, objectives and rewards, and Track, Share, Abandon and Map buttons. The game's quest log key and /vg quests open it.",
    check: ["your quests under their zones (click a zone to fold it", "the chosen quest's text, objectives and reward cards, and Track/Untrack, Share (in a group), Abandon", "and Map", "the game's quest log key", "`/vg quests`) open Vanguard's own"], from: "Quest log" },
  QuestAuto: { more: "Accept quests, turn in finished ones and skip the chatter when an NPC has just one quest for you. It never picks a reward for you unless you also switch on taking the one that sells for most. Hold Shift while talking to skip it.",
    check: ["accept quests, turn in finished ones (it never chooses among rewards for you, unless you also switch on \"take the one that sells for most\"), and skip the chatter when an NPC has just one quest for you", "hold Shift while talking to skip it"], from: "Quest automation" },
  GameAlerts: { more: "Loss of control and the talking head on flat panels (or the talking head hidden). On a Hardcore realm, death notices take the theme's font and red. If you like, a rare that shows up on your minimap is announced once, out of combat.",
    check: ["Loss of control (stunned, feared...) shows on a flat panel", "the talking head on one at the top center (or hidden", "On a Hardcore realm, the game's death notices (the red lines at the top center) take the theme font and the theme's red", "a rare that shows up on your minimap is announced", "out of combat and once per rare"], from: "Game windows" },
  Errands: { more: "A Train all button on the trainer's window learns everything you can afford in one click. Keep stocked tops up items you name from merchants who sell them, while you can pay. The flight timer counts down to landing on routes you've flown before.",
    check: ["a **Train all** button on the trainer's window learns everything you can afford in one click", "**Keep stocked**", "a merchant who sells it tops you up", "while you can pay", "The **flight timer** saves each flight's time by route, and the next flight on that route shows a bar (movable) counting down to landing"], from: "Errands" },
  InstancePrep: { more: "Stepping into a dungeon or raid, a card lists what you're short of: ammo, soul shards, your class's reagents, food and drink, bandages, potions, worn gear and your stocked items. A ready check or /vg prep always shows it, saying \"Everything's packed.\" when nothing is short.",
    check: ["a card at the door listing what you're short of", "Stepping into a dungeon or raid, it lists what is low", "ammo (hunters), soul shards (warlocks), your class's reagents", "food and drink, bandages, potions, durability under 50%, and anything on your Keep-stocked list", "A ready check (or `/vg prep`) always shows it, saying \"Everything's packed.\" when nothing is short"], from: "Instance prep" },
  GameTools: { more: "The game's Cooldown Manager gets square icons and the theme's font, with its rows between the player and target frames. The game's damage meter gets a flat panel above the bag and menu bar.",
    check: ["the game's Cooldown Manager", "gets square icons in thin borders with the theme font", "its rows sit between the player and target frames", "The game's damage meter gets a flat panel with theme bars and text, above the bag and menu bar"], from: "The game's tools" },
  FightHistory: { more: "A row of bars under the damage meter, one per fight, as tall as its share of your best. Hover it for each fight's length, your DPS and your place in a group; /vg fights prints the same. Fights are forgotten when you log out.",
    check: ["a sparkline of your DPS over the last 20 fights", "under the damage meter", "Each fight is one bar, as tall as its share of your best", "with its length, your DPS and, in a group, your place", "`/vg fights` prints the same", "forgotten when you log out"], from: "Fight history" },
  Windows: { more: "Character, merchant, mail, trade, loot and roll windows, the game menu, the ready check, popups, the spellbook, the breath bar and more get a flat Vanguard panel, title and buttons, and so do the windows that load later, like the auction house and professions.",
    check: ["character, merchant, mail", "trade, loot and roll windows, the game menu, the ready check, popups, the spellbook and the breath and fatigue bars get a flat Vanguard panel, close button, title and buttons", "the windows that load later (auction house, professions"], from: "Game windows" },
  DataBars: { more: "Thin experience and reputation bars under the action bars. The game's own XP bar is hidden while Vanguard's shows.",
    check: ["three bars of 38 px buttons under them over thin XP and reputation bars", "the game's own XP bar is hidden while Vanguard's shows (no more double XP bar)"], from: "Centered layout; The game's extras, tidied" },
  Tooltips: { more: "Themed tooltips with class colors and a target line. Item tooltips show what the stack sells for and how many you have in your bags and bank, with an optional item ID line.",
    check: ["themed tooltips with class colors and a Target line", "Item tooltips show what the stack sells for", "how many you have, bags and bank, with an optional item ID line"], from: "Everything else; At a merchant" },
  VendorMemory: { more: "Once you've visited a merchant, item tooltips say who sells an item and where, for example \"Sold by Thomas Miller (Elwynn Forest, Goldshire)\", with \"limited stock\" when they carry only a few. It's remembered for every character on the account.",
    check: ["tooltips say which merchant sells an item (and where) once you've visited one", "\"Sold by Thomas Miller (Elwynn Forest, Goldshire)\"", "with \"limited stock\" when the merchant carries only a few", "What merchants sell is remembered for every character on the account"], from: "Vendor memory" },
  AuctionHelper: { more: "A panel beside the auction house window. Shop: shopping lists searched one item at a time. Sell: suggests a price just under the cheapest and posts. Your auctions: marks the ones someone undercut, each with a Cancel button. Scan: prices from your scans in item tooltips. It only posts or cancels when you click; buying stays in the game's own window.",
    check: ["a Vanguard panel docks to the left of the game's window", "**Shop**: named shopping lists", "searches each item in turn (one search at a time", "**Sell**", "the price it will ask: 1 silver under the cheapest", "**Post** puts up one stack per click", "**Your auctions**", "marks with a red square each auction someone else asks less for per unit; each row has a **Cancel** button", "only a click on it cancels", "**Scan the auction house**", "item tooltips everywhere say \"AH: ", "Buying and bidding stay in the game's own window"], from: "Auction helper" },
  Nameplates: { more: "Class, reaction and threat colors, the name in outlined text with the level, your debuffs with timers and your crowd control, casts, the raid icon, an accent border and diamond on your target, and a gold \"!\" by units your quests need.",
    check: ["class/reaction/threat colors, the name in outlined text with the level", "your debuffs (soonest to expire first, with timers) and your crowd control, casts, raid icon, an accent border", "a diamond on your target", "a gold \"!\" by the name of units your quests need"], from: "Nameplates" },
  Situations: { more: "Record a different layout and settings for raids, PvP, instances or resting: pick what to record for, move frames and change settings, then save. They apply out of combat as you move between them, and leaving puts your own layout back.",
    check: ["record a different layout and settings for raids, PvP, instances or resting; they apply out of combat as you move between them", "**Record for: Raid**", "move frames with `/vg unlock`", "change settings as usual, then **Stop recording and save**", "Leaving the situation puts your own layout back"], from: "Situations" },
};

// v1.1: a few more sentences per module, beyond `more`, still in player
// language (clifftaylor2325/wow-vanguard-ui#107). Each sentence carries its
// source: `readme` lists phrases the addon's README must still contain (the
// build stops with an error if one is gone, so the page can't drift from the
// README), or `code` names the addon file and lines the sentence was checked
// against where the README says less (test/features.test.mjs checks those).
// Sources are never shown on the site.
const R = (s, ...readme) => ({ s, readme });
const C = (s, file, ...has) => ({ s, code: { file, has } });
// Both: README phrases (checked at build time) and the code that settles the rest.
const RC = (s, readme, file, ...has) => ({ s, readme, code: { file, has } });

export const LONGER = {
  UnitFrames: [
    R("The game's own boss frames are hidden.", "the game's own boss frames are hidden"),
    R("The player and target frames are sized for a 1080p screen at the 80% UI scale that first-run setup picks.", "sized for a 1080p screen at setup's 80% UI scale"),
    R("Player and target sit either side of your character, with your cast bar and swing timer between them, the pet and target of target outside them and the focus above the player.", "Player and target sit either side of your character with your cast bar and swing timer between them", "the pet and target of target outside them, the focus above the player"),
  ],
  CastBars: [
    R("Your own cast bar sits between the player and target frames, with the swing timer.", "with your cast bar and swing timer between them"),
    R("Like every Vanguard frame, each cast bar can be moved with /vg unlock.", "Every frame can be moved in unlock mode (`/vg unlock`)"),
  ],
  FrameAuras: [
    R("Each row wraps at the frame's width.", "each row wrapping at the frame's width"),
    R("Timer numbers are off by default, since the dark sweep shows the time left, and can be turned on.", "Timer numbers are off by default (the dark sweep shows time left) and can be turned on"),
    R("With the Masque addon installed, Masque skins these icons instead, as a group with its own skin.", "Masque skins the buttons instead of Vanguard", "Target and focus auras), each with its own skin"),
  ],
  PlayerAuras: [
    R("They replace the game's buff frame, and you can move them with /vg unlock.", "replace the game's buff frame", "Move them with `/vg unlock`."),
    R("On WoW Forever a shaman's imbues show here too, which the game's own enchant cells miss.", "a shaman's imbues on WoW Forever, which the game's own enchant cells miss"),
    R("With the Masque addon installed, your buffs, debuffs and weapon enchants are a Masque group with their own skin.", "Buffs and debuffs, with the weapon enchants"),
  ],
  ComboPoints: [
    C("Five small pips light up in the energy color, and the row shows only while you have points on your target.", "Modules/ComboPoints.lua", "CP.MAX = 5", "\"energy\")", "CP.bar:SetShown(count > 0)"),
    C("Other classes don't get the row.", "Modules/ComboPoints.lua", "local CLASSES = { ROGUE = true, DRUID = true }", "not CLASSES[class] then return end"),
  ],
  ClassBars: [
    R("The game keeps totems and a druid's mana inside its own player frame, which Vanguard replaces, so they get bars of their own.", "the game keeps both inside its own player frame, which Vanguard replaces"),
    C("The druid mana bar is a thin bar in the mana color just under the player frame, shown only while you're in a form.", "Modules/ClassBars.lua", "-- The thin mana bar just under the player frame, in the mana color.", "CB.manaHolder:SetShown(CB.InForm())"),
    C("Each class gets only its own bar.", "Modules/ClassBars.lua", "if class == \"SHAMAN\" and settings.totems then", "if class == \"DRUID\" and settings.druidMana then"),
  ],
  PowerTicks: [
    C("The mana spark is timed from your spells, not your mana: only a spell that costs mana starts the five seconds again.", "Modules/PowerTicks.lua", "-- One of your spells went off: a mana spell starts the five seconds again.", "PT.CostsMana(spellID) then PT.Start() end"),
    C("The energy spark starts again each time your energy goes up, so it stays in step with the energy ticks.", "Modules/PowerTicks.lua", "-- Your power changed: energy going up is a server tick, and the sweep restarts from it.", "if now and PT.last and now > PT.last then PT.Start() end"),
    C("When a druid changes form, the spark switches to the new kind of power.", "Modules/PowerTicks.lua", "-- Your power type may have changed (a druid's form): a new kind starts with no spark."),
  ],
  SwingTimer: [
    R("It runs on WoW Forever's own swing events.", "from WoW Forever's own swing events"),
    R("It sits between the player and target frames, with your cast bar.", "with your cast bar and swing timer between them"),
  ],
  UnitExtras: [
    R("Each one shows only where your client answers.", "Each shows only where the client answers"),
    C("The threat number sits just above the top-right corner of the target frame, and the mood dot in the pet frame's top-right corner.", "Modules/UnitExtras.lua", "UX.threat:SetPoint(\"BOTTOMRIGHT\", target, \"TOPRIGHT\"", "-- The mood dot in the pet frame's top-right corner, following your pet."),
  ],
  PartyExtras: [
    R("Turn it on under Unit frames in /vg.", "off until you turn it on under Unit frames"),
    R("Each tile shows only while its unit exists.", "each while its unit exists"),
  ],
  RaidFrames: [
    R("Party and raid frames grow up from just above your player frame, centered on it.", "Party and raid frames grow up from just above your player frame, centered on it"),
    R("A raid of more than 10 is drawn at 80% size, or 72% above 25.", "a raid of more than 10 is drawn smaller (80%, or 72% above 25)"),
    R("A thin line in the full class color runs along each tile's top, so close colors like shaman and mage blues still tell apart; you can also pick dark bars with class-colored names, or bright class colors.", "so close colors (shaman and mage blues, rogue and paladin yellows) still tell apart", "or dark bars with class-colored names, or bright class colors"),
    R("Tanks get a small shield and healers a cross before the name, and the raid's main tank gets the shield in your accent color.", "a small shield for tanks and a cross for healers before the name", "The raid's main tank gets the shield in your accent color"),
  ],
  RaidAuras: [
    R("These small icons have no timer numbers.", "no timer numbers on these small icons"),
    R("The color of a debuff you can dispel washes the tile from the bottom and colors its edge.", "washes the tile in its type's color from the bottom and colors its edge"),
  ],
  RaidHealing: [
    R("Click casting and hover keys work on the tiles, and a hover key can carry Shift, Ctrl or Alt: with the pointer over a player, Shift-Q casts on them.", "a hover key can carry Shift, Ctrl or Alt: while the pointer is over a frame, Shift-Q casts on that player"),
    R("Your target gets an accent edge, and the tile under the mouse a faint wash.", "an accent edge on your target, a faint wash under the mouse"),
  ],
  RaidStatus: [
    R("The ready check and resurrection marks show big in the middle of the tile, and the missing-health text steps aside while they do.", "the ready check and resurrection big in the center", "the missing-health text steps aside"),
    R("The ready check marks are drawn in the theme colors.", "a check, cross or three dots in the theme colors"),
  ],
  MainTanks: [
    R("They sit beside the raid tools.", "(beside the raid tools)"),
    R("Move them with /vg unlock, or turn them off under Modules.", "Move them with `/vg unlock`; turn them off under Modules"),
  ],
  RaidTools: [
    R("Click a raid target icon to mark your target; the last button clears it.", "click to mark your target; the last button clears it"),
    R("Click a world marker to place or remove it and right-click to clear it; the last button clears them all.", "click to place or remove one; right-click clears it; the last button clears them all"),
    R("The bar shows and hides out of combat.", "It shows and hides out of combat"),
  ],
  ClickCast: [
    R("Spells bind by name, so one you haven't learned yet starts working the day you learn it, and left click stays Target and middle click the unit menu.", "Spells bind by name, so one you haven't learned yet starts working the day you learn it", "Left click stays Target and middle click the unit menu"),
    R("A spell with ranks binds at its highest rank unless you open its ranks and pick one; the cell then says \"Flash Heal (Rank 3)\".", "A spell with ranks binds as its highest rank unless you open its ranks and pick one", "Flash Heal (Rank 3)"),
    R("Bindings are per character and spec, and changes apply at once, or when the fight ends if you're in one.", "Bindings are per character and spec; changes apply at once, or when the fight ends if you're in one"),
    R("Where your client has its own click casting, a switch at the bottom of the page (off by default) uses the game's bindings instead.", "(where the client has its own click casting)", "a switch at the bottom of the page, off by default, uses the game's instead"),
  ],
  ActionBars: [
    R("The bottom bars stack with bar 1 on top, and a bar with bigger buttons or more rows pushes the ones above it up.", "The bottom bars stack with bar 1 on top", "pushes the ones above it up"),
    R("In keybind mode (/vg keybind), hover a button and press a key to bind it; it works out of combat only.", "Keybind mode (`/vg keybind`", "hover a button and press a key", "It works out of combat only"),
    R("The right-edge bars (4 and 5) start off, and show on mouseover once you turn them on.", "The right-edge bars (4 and 5) start off; turned on, they show on mouseover"),
    R("With the Masque addon installed, Masque skins the buttons instead.", "With the Masque addon installed, Masque skins the buttons instead of Vanguard"),
  ],
  SpecialBars: [
    R("They get their own spots because the game's spot for them lies over the bar stack.", "(the game's own spot for them lies over the bar stack)"),
    R("Move them with /vg unlock, or turn that off under Action bars to leave them to the game's Edit Mode, where your client has it.", "or turn that off under Action bars to leave them to Edit Mode"),
  ],
  DataBars: [
    RC("Hover a bar to see its numbers: your level, XP and rested XP, or the watched faction's name and progress.", ["over thin XP and reputation bars", "Everything else**: XP and reputation bars"], "Modules/DataBars.lua", "text = \"hover\"", "\"Level %d  %s / %s (%d%%)\"", "-- Shows the bar's text only while hovered (text = \"hover\"), or always."),
    RC("The XP bar shows rested XP as a lighter strip and hides at the level cap; the reputation bar takes its standing's color and shows only while you watch a faction.", ["over thin XP and reputation bars", "Everything else**: XP and reputation bars"], "Modules/DataBars.lua", "-- The rested overlay: a lighter strip from the left edge", "-- Fills the XP bar, or hides it at max level", "-- Fills the reputation bar in its standing color, or hides it with no watched"),
    R("They're always shown unless you pick another visibility (On mouseover, In combat, Hidden or the action bars' row of conditions), one setting for both.", "On mouseover, In combat, Hidden or the action bars' row of conditions", "so are the XP and reputation bars, which share one setting"),
  ],
  Minimap: [
    R("The addon compartment moves onto a corner too, and the expansion button, which has nothing to show in vanilla content, is put away.", "the addon compartment and the group finder eye", "the expansion button (nothing to show in vanilla content) is put away"),
    R("The game's emptied minimap frame at the top right stops taking mouse clicks.", "the game's emptied minimap frame at the top right stops taking mouse clicks"),
    R("The brass corner diamonds take your accent color.", "brass diamonds on its corners, in your accent"),
  ],
  InfoStrip: [
    R("Durability turns orange at 25% or less and red at 10% or less; ammo shows for hunters, warriors and rogues, and soul shards for warlocks.", "durability (orange at 25% or less, red at 10% or less)", "ammo for hunters, warriors and rogues (soul shards for warlocks"),
    R("The leveling row waits a minute for the numbers to settle, and the XP figures hide at the level cap.", "they wait a minute for the numbers to settle, and the XP ones hide at the level cap"),
    R("In a group, the fourth row can also show your place in the last fight's DPS (\"#2 of 5\"), also off until you turn it on.", "in a group, your place in that fight's DPS", "also off until you turn it on"),
    R("The strip is always shown unless you pick another visibility for it, like On mouseover or In combat.", "The strip is always shown unless you pick another visibility for it"),
  ],
  MenuStrip: [
    R("The bags sit in a row centered over the menu buttons, with the key ring too where your client has one.", "in a row centered over the menu buttons", "the key ring too, where the client has one"),
    R("A bag's bar turns red when it's full (a soul bag or quiver counts only its own slots), and the backpack shows how many slots your bags have free.", "red when it is full; a soul bag or quiver counts only its own slots", "the backpack shows how many slots your bags have free"),
    R("Vanguard's line icons can stand in for the game's menu icons; they're off until you switch them on.", "Vanguard's line icons can stand in for the game's menu icons (off until you switch them on"),
    R("The bar is always shown, or you can pick On mouseover, Auto-hide after 10 s, In combat or Hidden under Bars, map, chat.", "Auto-hide after 10 s", "In combat, Hidden or the same row of conditions as the action bars instead, under Bars, map, chat"),
  ],
  MinimapButtons: [
    R("The \"...\" button only shows once there's a button to gather.", "it only shows once there's a button to gather"),
    C("Click \"...\" again to close the drawer.", "Modules/MinimapButtons.lua", "MB.drawer:SetShown(not MB.drawer:IsShown())"),
    C("Buttons that other addons make late are gathered too: the drawer looks again a few seconds after you log in.", "Modules/MinimapButtons.lua", "MB.RESCAN_AFTER = 3", "C_Timer.After(MB.RESCAN_AFTER, MB.Scan)"),
  ],
  Chat: [
    R("Chat is sized once in its spot; after you move it with /vg unlock, the game's own layout and your resizing are left alone.", "sized once; move it with `/vg unlock`", "the game's own layout and your resizing are left alone after that"),
    R("You can switch the spot off under Bars, map, chat.", "or switch the spot off under Bars, map, chat"),
    R("If you prefer, chat keeps the game's own chat size instead.", "or keeps the game's own chat size if you prefer"),
    R("/vg status shows how many pixels tall chat text draws on your screen.", "how many pixels tall chat text draws on your screen"),
  ],
  ChatExtras: [
    R("Short channel names are off until you switch them on: [2. Trade - City] shows as [T] and [Guild] as [G], and clicking the short tag still opens the channel.", "Short channel names (off until you switch it on)", "`[2. Trade - City]` shows as `[T]`, `[Guild]` as `[G]`", "clicking the short tag still opens the channel"),
    R("The game's own chat timestamps and class-colored names can be set from /vg too, under Bars, map, chat → Chat.", "The game's own chat timestamps and class-colored names can be set under"),
    R("Chat the game hides from addons in instances is left untouched, never shortened, and left out of the copy.", "Chat the game hides from addons (in instances) is left untouched, never shortened, and out of the copy"),
  ],
  ChatWatch: [
    R("Add phrases under Bars, map, chat → Chat watch or with /vg watch add LFM; numbered channels such as Trade and LFG, and yell, are watched by default.", "with `/vg watch add LFM`", "numbered channels such as Trade and LFG, and yell, by default"),
    R("A match ignores case and works on item links too; the toast stays for 8 seconds, and right-click dismisses it.", "(any case, item links included)", "for 8 seconds", "right-click to dismiss"),
    R("There's one alert per sender and phrase every 30 seconds, for up to 20 phrases of 40 characters.", "One alert per sender and phrase every 30 seconds", "Up to 20 phrases of 40 characters"),
    R("In dungeons, raids and encounters, where the game hides chat from addons, nothing matches.", "In dungeons, raids and encounters, where the game hides chat from addons, nothing matches"),
  ],
  Bags: [
    R("The combined bag is switched on once, not at every login, and given back when you switch the module off.", "switched on once, not at every login, and given back when you switch the module off"),
    R("Sort sits beside the search box where the game can sort bags, and search dimming is kept.", "with a Sort button beside the search box where the game can sort bags", "search dimming kept"),
    R("In combat the bag keeps its layout and catches up when combat ends.", "in combat the bag keeps its layout and catches up when combat ends"),
    R("One switch under Bars, map, chat gives back the plain grid at once.", "one switch under Bars, map, chat gives back the plain grid at once"),
  ],
  Merchant: [
    R("Selling is tried again a few times, since the server limits how fast items sell.", "tried again a few times, since the server limits how fast items sell"),
    R("Errors you can act on stay, shown by the game's own error line.", "errors you can act on stay, shown by the game's own error line"),
  ],
  Errands: [
    R("Train all says what it cost, and buying and training stop in combat.", "and says what it cost", "Buying and training stop in combat"),
    R("Type /vg stock, shift-click an item and add a number (say 20) to keep that many in your bags; ammo comes 200 at a time.", "`/vg stock <shift-click an item> 20` keeps 20 in your bags", "ammo comes 200 at a time"),
    R("The flight timer's bar can be moved.", "shows a bar (movable) counting down to landing"),
    R("Each has a switch under Bars, map, chat.", "Each has a switch under Bars, map, chat"),
  ],
  VendorMemory: [
    R("Up to three merchants show per item, the one you saw last first.", "for up to three merchants per item, the one you saw last first"),
    R("The Keep stocked list (/vg stock) says where to buy each item too.", "The Keep stocked list (`/vg stock`) says where to buy each item too"),
    R("/vg vendors says how many merchants are remembered, and /vg vendors clear forgets them.", "`/vg vendors` says how many merchants are remembered and `/vg vendors clear` forgets them"),
  ],
  AuctionHelper: [
    R("Up to 20 shopping lists of 50 items are kept for the account, and a list is searched at most one item a second, well under the game's limit.", "up to 20 lists of 50 items, kept for the account", "at most one a second, so well under the game's limit"),
    R("The asking price is 1 silver under the cheapest (or 1 copper, 1 %, or the same price), or under your 7-day low when nothing is up.", "1 silver under the cheapest (or 1 copper, 1 %, or the same price", "else under the 7-day low when nothing is up"),
    R("A full scan is allowed once every 15 minutes, the game's own limit, and after one, item tooltips everywhere show the price, like \"AH: 1s 0c · market 1s 50c (today)\".", "one scan every 15 minutes, the game's own limit", "AH: 1s 0c · market 1s 50c (today)"),
    R("Prices are kept per realm and faction, since each has its own auction house, with each day's low, units up and market value for 30 days.", "Prices are kept per realm and faction, since each has its own auction house", "with each day's low, units up and market value for 30 days"),
  ],
  QuestDialog: [
    R("It sits just above the frames around your character, clear of the cast bars, and can be moved with /vg unlock.", "just above the frames around your character (clear of the cast bars)", "Movable with `/vg unlock`"),
    R("Long text scrolls with the mouse wheel once the dialog reaches its greatest height.", "scrolls with the mouse wheel once the dialog reaches its greatest height"),
    R("Hiding the whole UI with Alt-Z hides the dialog with it and keeps the conversation open.", "hiding the whole UI with Alt-Z hides the dialog with it and keeps the conversation open"),
    R("Switch it off under /vg → Quests to get the game's windows back.", "switch it off under `/vg` → Quests to get the game's windows back"),
  ],
  QuestTracker: [
    R("A quest item's button shows its cooldown, and a red tint while the target is out of range.", "with its cooldown, a red tint while the target is out of range"),
    R("In combat the counts and text keep updating, and the item buttons take their new places when combat ends.", "In combat the counts and text keep updating", "they take their new places when combat ends"),
    R("Quests that don't fit are counted (\"+3 more\").", "Quests that don't fit are counted (\"+3 more\")"),
    R("The game's tracker is hidden while it shows; switch it off to get the game's back, in Vanguard's look.", "The game's tracker is hidden while it shows; switch it off to get the game's back (in Vanguard's look)"),
  ],
  QuestLog: [
    R("The quest log button on the bag and menu bar opens it too, and clicking a quest in the tracker opens it here.", "the quest log button on the bag and menu bar", "Clicking a quest in the tracker opens it here"),
    R("A quest ready to turn in gets a check, and Abandon goes through the game's own confirmation.", "with a check when ready to turn in", "Abandon (through the game's own confirmation)"),
    R("A long list and a long quest text scroll with the mouse wheel.", "a long list, and a long quest text, scroll with the mouse wheel"),
    R("Switch it off under /vg → Quests to keep the game's.", "Switch it off under `/vg` → Quests to keep the game's"),
  ],
  QuestAuto: [
    R("Each part is off until you switch it on, under /vg → Quests.", "each off until you switch it on, under `/vg` → Quests"),
    R("Each says in chat what it did.", "Each says in chat what it did"),
  ],
  AfkScreen: [
    R("It shows when you type /afk or the game marks you idle.", "(`/afk`, or the game marks you idle)"),
    R("A click or a key puts it away until you're next away.", "a click or a key puts it away until you're next away"),
    R("It only shows out of combat and never hides the game's own frames.", "It only shows out of combat and never hides the game's own frames"),
  ],
  AutoAccept: [
    R("Turn each one on under Bars, map, chat.", "(each off until you switch it on, under Bars, map, chat)"),
    R("Accepting a resurrection closes the game's prompt, whichever kind it was.", "the game's prompt closes whichever kind it was"),
  ],
  GameAlerts: [
    R("Loss of control (stunned, feared...) shows a little above your character and the talking head at the top center; hiding the talking head is your choice under Bars, map, chat.", "Loss of control (stunned, feared...) shows on a flat panel a little above your character", "the talking head on one at the top center (or hidden; your choice under Bars, map, chat)"),
    R("The rare announcement is off until you switch it on under Bars, map, chat; it plays the raid warning sound with one chat line, out of combat and once per rare.", "(off until you switch it on, under Bars, map, chat), a rare", "with the raid warning sound and one chat line, out of combat and once per rare"),
  ],
  InstancePrep: [
    R("Each item you're short of gets a red mark and \"have / want\", and the reagents are your class's for your level.", "each with a red mark and \"have / want\"", "your class's reagents for your level"),
    R("With nothing short it stays away.", "with nothing short it stays away"),
    R("The card fades after 20 s or on its close button, never checks in combat, and moves with /vg unlock.", "It fades after 20 s or on its close button, never checks in combat"),
    R("/vg prep want food 30 sets how many to carry.", "`/vg prep want food 30` sets how many to carry"),
  ],
  GameTools: [
    R("Turn the Cooldown Manager on in the game's Options (Gameplay Enhancements), or with Vanguard's switch \"Show the game's Cooldown Manager\" under Bars, map, chat.", "Options, Gameplay Enhancements", "Show the game's Cooldown Manager"),
    R("With the damage meter there, the tooltip corner moves just above it.", "the tooltip corner moves just above it"),
    RC("Move them with /vg unlock; where your client has Edit Mode, Vanguard stands aside while it's open, and one switch leaves placing them to Edit Mode.", ["Move them with `/vg unlock`; while Edit Mode is open, Vanguard stands aside", "One switch leaves placing them to Edit Mode"], "Core/Movers.lua", "local edit = _G.EditModeManagerFrame", "if type(edit) ~= \"table\" or not edit.HookScript then return end"),
  ],
  FightHistory: [
    R("Turn it on under Bars, map, chat.", "(off until you turn it on under Bars, map, chat)"),
    R("The latest fight is in your accent color, and a fight whose figure the game kept hidden leaves an empty slot.", "the latest in your accent color; a fight whose figure the game kept hidden leaves an empty slot"),
    R("Fights are kept even while the strip is off, and it has its own visibility and moves with /vg unlock.", "Fights are kept even while the strip is off", "It has its own visibility"),
  ],
  Windows: [
    R("Friends, the dressing room, the flight map, books and letters get the same look, with pages in light text on the dark panel.", "Friends, the dressing room, the flight map, books and letters (their pages in light text on the dark panel)"),
    R("The quest and gossip windows get it only when Vanguard's quest dialog is switched off.", "quest and gossip (only when Vanguard's quest dialog is switched off)"),
    R("The character pane shows each worn item's durability on its slot, colored like the info strip's.", "The character pane shows each worn item's durability on its slot, colored like the info strip's"),
    R("Their own layout and buttons stay as the game has them.", "Their own layout and buttons stay as the game has them"),
  ],
  Tooltips: [
    R("Vanguard's text size slider (under General, 70% to 130%) sizes tooltip text too.", "one slider (/vg > General, 70% to 130%) sizes all of Vanguard's text, chat and tooltips included"),
    R("The sell price is left out where the game already shows a price.", "(unless the game already shows a price)"),
  ],
  Nameplates: [
    R("The level is colored by how hard the unit is for you, and your target also gets a 2-pixel accent glow.", "the level (colored by how hard the unit is for you)", "a 2-pixel accent glow"),
    R("The quest \"!\" shows only when the game says so plainly, and a switch turns it off.", "(only when the game says so plainly; a switch turns it off)"),
    R("A plate first drawn during a fight uses Vanguard's own icons, and switches to the game's when the fight ends.", "A plate first drawn during a fight uses Vanguard's own icons", "switches to the client's when the fight ends"),
  ],
  Situations: [
    R("One situation holds at a time: the first of PvP, Instance, Raid, Party, Resting and Solo.", "One situation holds at a time, the first of PvP"),
    R("/vg situation record raid starts recording, and /vg situation stop saves it.", "`/vg situation record raid`", "(`/vg situation stop`)"),
    R("Only what you changed is kept, and only frames' spot, scale and opacity, the info strip, menu bar and XP bar visibility, the info strip's parts and the nameplates' levels, threat colors, target border and quest marks can be recorded.", "only what you changed is kept", "An override can hold any frame's spot, scale and opacity, the info strip's, menu bar's and XP bars' visibility, the info strip's blocks, and the nameplates' levels, threat colors, target border and quest marks; nothing else is recorded"),
    R("Your profile is always saved and exported with your own values, and profiles carry their situations.", "your profile is always saved and exported with your own values", "Profiles carry their overrides"),
  ],
};

// A module's longer sentences, in order (empty when none).
export function longerOf(key) {
  return (LONGER[key] || []).map((x) => x.s);
}

// README phrases the longer text needs that the README no longer has, as "Module: phrase".
export function longerGaps(readme) {
  const gaps = [];
  for (const [key, list] of Object.entries(LONGER)) for (const x of list) for (const p of x.readme || []) if (!readme.includes(p)) gaps.push(`${key}: ${p}`);
  return gaps;
}
