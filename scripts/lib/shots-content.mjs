// The screenshots on the Screenshots page and beside the features they show.
// Every file is a real in-game capture (no mock renders) from src/assets/shots/, cropped or
// blurred where a real player's name or the game's own help line was in frame. `next` marks a
// shot that shows something only the next release has: it hides with the rest of the next
// release until the reader switches it on. Captions describe only what is in the picture.
export const SHOT_GROUPS = [
  {
    "id": "first-look",
    "title": "First look",
    "intro": "The default layout, the setup wizard and the options window.",
    "shots": [
      {
        "file": "01-hud-overview",
        "w": 1600,
        "h": 899,
        "alt": "The default layout",
        "caption": "The default layout: your frames either side of your character, the action bars, the quest tracker and the info strip under the minimap, and the bag and menu bar in the corner.",
        "next": true
      },
      {
        "file": "02-setup-wizard",
        "w": 1600,
        "h": 899,
        "alt": "The first-run setup wizard, step 1",
        "caption": "The first-run setup wizard, step 1: pick a layout, or keep the one you have.",
        "next": false
      },
      {
        "file": "03-options-general",
        "w": 1600,
        "h": 899,
        "alt": "The options window",
        "caption": "The options window (/vg): General, with a live preview at the top and the page list on the left.",
        "next": false
      },
      {
        "file": "04-options-modules",
        "w": 1600,
        "h": 899,
        "alt": "The Modules page",
        "caption": "The Modules page: every part is a module you can switch off, and an off module costs nothing.",
        "next": false
      }
    ]
  },
  {
    "id": "moving",
    "title": "Moving frames and profiles",
    "intro": "Everything can be moved, and settings belong to profiles.",
    "shots": [
      {
        "file": "05-unlock-mode",
        "w": 1600,
        "h": 899,
        "alt": "Unlock mode",
        "caption": "Unlock mode (/vg unlock): a handle on every frame, a grid, and Exit without saving or Save and lock at the top.",
        "next": true
      },
      {
        "file": "06-mover-popover",
        "w": 1600,
        "h": 899,
        "alt": "Right-click a handle for its anchor, offsets, scale, opacity and whether it matches another frame's width or height",
        "caption": "Right-click a handle for its anchor, offsets, scale, opacity and whether it matches another frame's width or height.",
        "next": true
      },
      {
        "file": "07a-profile-picker",
        "w": 1600,
        "h": 899,
        "alt": "The profile picker in the options header, with the backups Vanguard keeps beside each profile",
        "caption": "The profile picker in the options header, with the backups Vanguard keeps beside each profile.",
        "next": true
      },
      {
        "file": "07b-profile-picker-general",
        "w": 1600,
        "h": 899,
        "alt": "The same picker from the General page",
        "caption": "The same picker from the General page.",
        "next": true
      }
    ]
  },
  {
    "id": "looks",
    "title": "Looks",
    "intro": "Slate and brass is the default; each look changes surfaces and text, not your layout.",
    "shots": [
      {
        "file": "08-theme-slate-brass",
        "w": 1145,
        "h": 875,
        "alt": "Slate and brass, the default",
        "caption": "Slate and brass, the default.",
        "next": false
      },
      {
        "file": "08a-theme-contrast",
        "w": 1135,
        "h": 836,
        "alt": "High contrast",
        "caption": "High contrast: opaque panels and white text.",
        "next": true
      },
      {
        "file": "08b-theme-vellum",
        "w": 1073,
        "h": 834,
        "alt": "Vellum and ink",
        "caption": "Vellum and ink: a warm dark with cream text.",
        "next": true
      },
      {
        "file": "08c-theme-classic",
        "w": 1063,
        "h": 827,
        "alt": "Classic look",
        "caption": "Classic look: dark leather and bronze.",
        "next": true
      },
      {
        "file": "08d-theme-midnight",
        "w": 1061,
        "h": 823,
        "alt": "Midnight",
        "caption": "Midnight.",
        "next": true
      },
      {
        "file": "08e-theme-obsidian",
        "w": 1055,
        "h": 823,
        "alt": "Obsidian",
        "caption": "Obsidian.",
        "next": true
      },
      {
        "file": "08f-theme-moss",
        "w": 1090,
        "h": 818,
        "alt": "Moss",
        "caption": "Moss.",
        "next": true
      },
      {
        "file": "08g-theme-ember",
        "w": 1081,
        "h": 848,
        "alt": "Ash and ember",
        "caption": "Ash and ember.",
        "next": true
      }
    ]
  },
  {
    "id": "windows",
    "title": "Bags, windows and talents",
    "intro": "The game's own windows in Vanguard's flat panels.",
    "shots": [
      {
        "file": "10-bags",
        "w": 612,
        "h": 741,
        "alt": "The combined backpack, in sections with a Sort button and a search box",
        "caption": "The combined backpack, in sections with a Sort button and a search box.",
        "next": false
      },
      {
        "file": "11-bag-menu-bar",
        "w": 390,
        "h": 182,
        "alt": "The bag and menu bar in the corner",
        "caption": "The bag and menu bar in the corner: a bar on each bag slot shows how full it is.",
        "next": false
      },
      {
        "file": "12-game-windows",
        "w": 1206,
        "h": 843,
        "alt": "The character pane in Vanguard's look, with durability on each slot",
        "caption": "The character pane in Vanguard's look, with durability on each slot.",
        "next": false
      },
      {
        "file": "13-spellbook-talents",
        "w": 1600,
        "h": 939,
        "alt": "The talent planner on the game's talents window",
        "caption": "The talent planner on the game's talents window: planned ranks as badges, and the bar along the foot.",
        "next": false
      }
    ]
  },
  {
    "id": "town",
    "title": "Quests and town",
    "intro": "Vendors, quests, trainers and flights.",
    "shots": [
      {
        "file": "14-merchant",
        "w": 528,
        "h": 934,
        "alt": "A merchant's window",
        "caption": "A merchant's window.",
        "next": false
      },
      {
        "file": "15-quest-dialog",
        "w": 958,
        "h": 429,
        "alt": "The quest dialog, above your frames",
        "caption": "The quest dialog, above your frames.",
        "next": false
      },
      {
        "file": "16-quest-log",
        "w": 1018,
        "h": 625,
        "alt": "The quest log, with zones folded and the chosen quest's text and buttons",
        "caption": "The quest log, with zones folded and the chosen quest's text and buttons.",
        "next": true
      },
      {
        "file": "18-trainer-train-all",
        "w": 572,
        "h": 798,
        "alt": "A class trainer, with Train all beside Train",
        "caption": "A class trainer, with Train all beside Train.",
        "next": false
      },
      {
        "file": "37-flight-timer",
        "w": 330,
        "h": 195,
        "alt": "The flight timer counting down to landing, above your action bars",
        "caption": "The flight timer counting down to landing, above your action bars.",
        "next": false
      }
    ]
  },
  {
    "id": "groups",
    "title": "Groups and raids",
    "intro": "Party and raid frames, click casting and rolls.",
    "shots": [
      {
        "file": "20-party-preview",
        "w": 656,
        "h": 574,
        "alt": "Party frames growing up from just above your player frame",
        "caption": "Party frames growing up from just above your player frame (shown with /vg preview).",
        "next": false
      },
      {
        "file": "21-raid-preview-25",
        "w": 691,
        "h": 545,
        "alt": "A raid of 25, with roles, a dead and an offline tile",
        "caption": "A raid of 25, with roles, a dead and an offline tile (/vg preview 25).",
        "next": false
      },
      {
        "file": "21b-raid-preview-40",
        "w": 765,
        "h": 674,
        "alt": "A raid of 40 drawn smaller so it fits",
        "caption": "A raid of 40 drawn smaller so it fits (/vg preview 40).",
        "next": false
      },
      {
        "file": "21c-raid-preview-10",
        "w": 540,
        "h": 603,
        "alt": "A raid of 10",
        "caption": "A raid of 10 (/vg preview 10).",
        "next": false
      },
      {
        "file": "22-click-casting",
        "w": 1184,
        "h": 852,
        "alt": "Click casting",
        "caption": "Click casting: keys while hovering a frame, and a Try it tile.",
        "next": false
      },
      {
        "file": "22b-click-casting-grid",
        "w": 1046,
        "h": 816,
        "alt": "Click casting",
        "caption": "Click casting: a grid of mouse buttons and modifier keys, with a starter layout for your class.",
        "next": false
      },
      {
        "file": "26-roll-tracker",
        "w": 807,
        "h": 790,
        "alt": "The roll tracker, with the top roll in the accent color",
        "caption": "The roll tracker, with the top roll in the accent color.",
        "next": true
      }
    ]
  },
  {
    "id": "auction",
    "title": "Auction house",
    "intro": "Vanguard's Lists and Posting tabs on the game's window.",
    "shots": [
      {
        "file": "29-ah-deals",
        "w": 1137,
        "h": 812,
        "alt": "The Lists tab showing Deals",
        "caption": "The Lists tab showing Deals: listings under a vendor's price or well under the market value.",
        "next": true
      },
      {
        "file": "29b-ah-upgrades",
        "w": 1120,
        "h": 789,
        "alt": "The Lists tab showing Upgrades",
        "caption": "The Lists tab showing Upgrades: armor and weapons that beat what you wear.",
        "next": true
      }
    ]
  },
  {
    "id": "field",
    "title": "In the field",
    "intro": "Nameplates, minimap, map and combat tools.",
    "shots": [
      {
        "file": "32d-nameplates-enemies",
        "w": 1600,
        "h": 836,
        "alt": "Nameplates on enemies",
        "caption": "Nameplates on enemies: level, a quest mark and your target's marker.",
        "next": false
      },
      {
        "file": "33-minimap-info-strip",
        "w": 259,
        "h": 422,
        "alt": "The minimap with its zone and coordinate bands, and the info strip under it",
        "caption": "The minimap with its zone and coordinate bands, and the info strip under it.",
        "next": true
      },
      {
        "file": "33b-minimap-field",
        "w": 330,
        "h": 451,
        "alt": "The minimap in the field",
        "caption": "The minimap in the field.",
        "next": true
      },
      {
        "file": "34-world-map",
        "w": 1063,
        "h": 560,
        "alt": "The world map with a /way waypoint, shown over the quest list",
        "caption": "The world map with a /way waypoint, shown over the quest list.",
        "next": false
      },
      {
        "file": "35-vanguard-meter-dps",
        "w": 432,
        "h": 187,
        "alt": "The Vanguard meter showing damage per second",
        "caption": "The Vanguard meter showing damage per second.",
        "next": true
      },
      {
        "file": "35b-vanguard-meter-hps",
        "w": 459,
        "h": 179,
        "alt": "The Vanguard meter showing healing per second",
        "caption": "The Vanguard meter showing healing per second.",
        "next": true
      },
      {
        "file": "36-cooldown-gaps",
        "w": 880,
        "h": 276,
        "alt": "The cooldown gaps row",
        "caption": "The cooldown gaps row: icons for what the game's Cooldown Manager misses.",
        "next": true
      }
    ]
  }
];

// A shot by file name.
export function shotByFile(file) {
  for (const g of SHOT_GROUPS) for (const s of g.shots) if (s.file === file) return s;
  return null;
}
