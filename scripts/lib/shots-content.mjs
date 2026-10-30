// The screenshots on the Screenshots page and beside the features they show.
// Every file is a real in-game capture (no mock renders) from src/assets/shots/, cropped or
// blurred where a real player's name or the game's own help line was in frame. `next` marks a
// shot of something only the next release has, which hides with the rest of the next
// release until the reader switches it on. Captions describe only what is in the picture.
// `retake` marks a shot whose file no longer matches Vanguard (Cliff retakes them at WoW
// Forever's launch): it shows as a placeholder with its caption until the new file lands
// in src/assets/shots/ and the mark comes off.
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
        "next": false,
        "retake": true
      },
      {
        "file": "02-setup-wizard",
        "w": 640,
        "h": 525,
        "alt": "The first-run setup wizard, step 1",
        "caption": "The first-run setup wizard, step 1: pick a layout, or keep the one you have.",
        "next": false,
        "retake": true
      },
      {
        "file": "03-options-general",
        "w": 1041,
        "h": 815,
        "alt": "The options window",
        "caption": "The options window (/vg): General, with a live preview at the top and the page list on the left.",
        "next": false,
        "retake": true
      },
      {
        "file": "04-options-modules",
        "w": 1041,
        "h": 815,
        "alt": "The Modules page",
        "caption": "The Modules page: every part is a module you can switch off, and an off module costs nothing.",
        "next": false,
        "retake": true
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
        "next": false,
        "retake": true
      },
      {
        "file": "06-mover-popover",
        "w": 475,
        "h": 525,
        "alt": "Right-click a handle for its anchor, offsets, scale, opacity and whether it matches another frame's width or height",
        "caption": "Right-click a handle for its anchor, offsets, scale, opacity and whether it matches another frame's width or height.",
        "next": false,
        "retake": true
      },
      {
        "file": "07a-profile-picker",
        "w": 1041,
        "h": 815,
        "alt": "The profile picker in the options header, with the backups Vanguard keeps beside each profile",
        "caption": "The profile picker in the options header, with the backups Vanguard keeps beside each profile.",
        "next": false,
        "retake": true
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
        "next": false,
        "retake": true
      },
      {
        "file": "08a-theme-contrast",
        "w": 1135,
        "h": 836,
        "alt": "High contrast",
        "caption": "High contrast: opaque panels and white text.",
        "next": false,
        "retake": true
      },
      {
        "file": "08b-theme-vellum",
        "w": 1073,
        "h": 834,
        "alt": "Vellum and ink",
        "caption": "Vellum and ink: a warm dark with cream text.",
        "next": false,
        "retake": true
      },
      {
        "file": "08c-theme-classic",
        "w": 1063,
        "h": 827,
        "alt": "Classic look",
        "caption": "Classic look: dark leather and bronze.",
        "next": false,
        "retake": true
      },
      {
        "file": "08d-theme-midnight",
        "w": 1061,
        "h": 823,
        "alt": "Midnight",
        "caption": "Midnight.",
        "next": false,
        "retake": true
      },
      {
        "file": "08e-theme-obsidian",
        "w": 1055,
        "h": 823,
        "alt": "Obsidian",
        "caption": "Obsidian.",
        "next": false,
        "retake": true
      },
      {
        "file": "08f-theme-moss",
        "w": 1090,
        "h": 818,
        "alt": "Moss",
        "caption": "Moss.",
        "next": false,
        "retake": true
      },
      {
        "file": "08g-theme-ember",
        "w": 1081,
        "h": 848,
        "alt": "Ash and ember",
        "caption": "Ash and ember.",
        "next": false,
        "retake": true
      }
    ]
  },
  {
    "id": "windows",
    "title": "Bags and windows",
    "intro": "The game's own windows in Vanguard's flat panels.",
    "shots": [
      {
        "file": "10-bags",
        "w": 602,
        "h": 464,
        "alt": "The combined backpack, in sections with a Sort button and a search box",
        "caption": "The combined backpack, in sections with a Sort button and a search box.",
        "next": false,
        "retake": true
      },
      {
        "file": "11-bag-menu-bar",
        "w": 390,
        "h": 182,
        "alt": "The bag and menu bar in the corner",
        "caption": "The bag and menu bar in the corner: a bar on each bag slot shows how full it is.",
        "next": false,
        "retake": true
      },
      {
        "file": "12-game-windows",
        "w": 1206,
        "h": 843,
        "alt": "The character pane in Vanguard's look, with durability on each slot",
        "caption": "The character pane in Vanguard's look, with durability on each slot.",
        "next": false,
        "retake": true
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
        "next": false,
        "retake": true
      },
      {
        "file": "15-quest-dialog",
        "w": 958,
        "h": 429,
        "alt": "The quest dialog, above your frames",
        "caption": "The quest dialog, above your frames.",
        "next": false,
        "retake": true
      },
      {
        "file": "16-quest-log",
        "w": 1018,
        "h": 632,
        "alt": "The quest log, with zones folded and the chosen quest's text and buttons",
        "caption": "The quest log, with zones folded and the chosen quest's text and buttons.",
        "next": false,
        "retake": true
      },
      {
        "file": "17-quest-tracker",
        "w": 366,
        "h": 195,
        "alt": "The quest tracker",
        "caption": "The quest tracker under the info strip, with its objectives and a quest item button.",
        "next": false,
        "retake": true
      },
      {
        "file": "18-trainer-train-all",
        "w": 572,
        "h": 798,
        "alt": "A profession trainer, with Train all beside Train",
        "caption": "A profession trainer, with Train all beside Train.",
        "next": false,
        "retake": true
      },
      {
        "file": "37-flight-timer",
        "w": 550,
        "h": 560,
        "alt": "The flight timer counting down to landing, above your action bars",
        "caption": "The flight timer counting down to landing, above your action bars.",
        "next": false,
        "retake": true
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
        "w": 379,
        "h": 573,
        "alt": "Party frames growing up from just above your player frame",
        "caption": "Party frames growing up from just above your player frame (shown with /vg preview).",
        "next": false,
        "retake": true
      },
      {
        "file": "21-raid-preview-25",
        "w": 728,
        "h": 507,
        "alt": "A raid of 25, with roles, a dead and an offline tile",
        "caption": "A raid of 25, with roles, a dead and an offline tile (/vg preview 25).",
        "next": false,
        "retake": true
      },
      {
        "file": "21b-raid-preview-40",
        "w": 589,
        "h": 439,
        "alt": "A raid of 40 drawn smaller so it fits",
        "caption": "A raid of 40 drawn smaller so it fits (/vg preview 40).",
        "next": false,
        "retake": true
      },
      {
        "file": "21c-raid-preview-10",
        "w": 345,
        "h": 550,
        "alt": "A raid of 10",
        "caption": "A raid of 10 (/vg preview 10).",
        "next": false,
        "retake": true
      },
      {
        "file": "22-click-casting",
        "w": 1184,
        "h": 852,
        "alt": "Click casting",
        "caption": "Click casting: keys while hovering a frame, and a Try it tile.",
        "next": false,
        "retake": true
      }
    ]
  },
  {
    "id": "field",
    "title": "In the field",
    "intro": "Nameplates and combat tools.",
    "shots": [
      {
        "file": "32d-nameplates-enemies",
        "w": 1600,
        "h": 836,
        "alt": "Nameplates on enemies",
        "caption": "Nameplates on enemies: level, a quest mark and your target's marker.",
        "next": false,
        "retake": true
      },
      {
        "file": "32e-nameplates-cast",
        "w": 520,
        "h": 300,
        "alt": "A nameplate with a cast bar",
        "caption": "A nameplate with a cast bar under it.",
        "next": false,
        "retake": true
      },
      {
        "file": "35-vanguard-meter-dps",
        "w": 432,
        "h": 187,
        "alt": "The Vanguard meter showing damage per second",
        "caption": "The Vanguard meter showing damage per second.",
        "next": false,
        "retake": true
      },
      {
        "file": "36-cooldown-gaps",
        "w": 860,
        "h": 276,
        "alt": "The cooldown gaps row",
        "caption": "The cooldown gaps row: icons for what the game's Cooldown Manager misses.",
        "next": false,
        "retake": true
      }
    ]
  }
];

// A shot by file name.
export function shotByFile(file) {
  for (const g of SHOT_GROUPS) for (const s of g.shots) if (s.file === file) return s;
  return null;
}

// The shots whose file is current, not waiting on a retake.
export function readyShots() {
  return SHOT_GROUPS.flatMap((g) => g.shots).filter((s) => !s.retake);
}
