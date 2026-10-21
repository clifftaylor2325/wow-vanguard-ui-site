# ADR 0001: Redesign the site around the UI itself

- Status: proposed
- Date: 2026-10-21
- Deciders: Clifton Taylor
- Scope: `vanguardui.com` (this repo). The addon is not changed.

## Context

The site is generated from the addon's Lua and dressed in the addon's Slate & Brass look: a dark page, brass accents, the crest, ornamental rules, framed corners and diamond marks. Every page opens on one screen and folds its sections. That part works and stays.

Three things were wrong with the look as it stood on 2026-10-21:

1. **The page titles were invisible.** `site.css` painted every `h1` with a gradient that named `--accent-ember` and `--accent-void`. Those were accent presets in the addon's `Core/Theme.lua` at the time the hero was drawn. The addon has since renamed its presets (brass, arcane, jade, orchid, copper), so `theme.css` no longer defines them, the gradient is invalid, and `color: transparent` is all that is left: "Vanguard" on Home and the title of every inner page did not render. The Home hero's sky and the ember sparks lost their colour the same way. Nothing caught it, because the tests check structure and not computed styles, and the build cannot know which variables the CSS expects.
2. **Home does not show the product.** The hero is an illustration (rings, ridges, embers) with the crest and a tagline. The site has 37 real in-game screenshots, but they are on the Screenshots page and beside modules on Features. A player landing on Home sees no UI.
3. **The ornament is spread thin.** Corner frames, inner hairlines, corner diamonds and ornamental rules appear on the Home hero, every inner-page band, every showcase card and the CurseForge box. Spread over everything, the brass stops meaning anything, and on a phone the inner-page band costs a fifth of the first screen to show one sentence.

Everything else holds: the content is generated from the addon, the sidebar is the only navigation, there is no download and no link to GitHub, the fonts are the addon's, and every page but Feedback fits one screen as it opens.

## Decision

**Redesign in the "show the UI" direction**, keeping the architecture and the rules in `CLAUDE.md`.

1. **A palette contract between the build and the CSS.** `site.css` may only reference the colour variables that `theme.css` always generates (`--bg`, `--panel`, `--raised`, `--divider`, `--text`, `--text2`, `--muted`, `--accent`, `--good`, `--warn`, `--bad`) and the site's own aliases, which `site.css` declares with a fallback so a renamed preset degrades to the accent instead of to nothing (for example `--glow: var(--accent-copper, var(--accent))`). A new test reads `site.css` and fails when a `var(--…)` has no definition in `theme.css` or `site.css` and no fallback. The addon can rename its presets again without the site losing its titles.
2. **Home leads with the UI.** The hero is the crest, the title, the addon's own tagline, the two store buttons and a framed screenshot of the HUD beside them. Under it, the quick tiles and the early-release notice stay. *What's in v…* becomes the tour: the same flagship modules it lists today, each described in the addon's own words (the module description the build already reads), each beside a screenshot of it, with the accent presets as swatches drawn from `theme.css` at the end. *The layout at a glance* stays as it is. Both sections still start folded, so Home opens on the hero, the tiles and the notice.
3. **Screenshot slots are placeholders until a real capture fills them.** A slot names the capture it wants (what to show, roughly how to frame it). While its file is missing, the build renders an honest placeholder: a framed panel that says what will go there, in words, with no mock render. Filling one is the usual screenshot process: a WebP in `src/assets/shots/`, an entry in `scripts/lib/shots-content.mjs`, and the slot's `file` set. The Home hero's illustration goes; it is not a picture of the product.
4. **One motif, used where it does work.** The brass diamond stays as the marker of every folded section and in the ornamental rule of the footer and the Home hero. Cards lose their corner diamonds and inner hairlines; the brass-tinted edge is enough. Inner pages open with a plain title block (the `h1`, the one-line lede, a thin brass rule) instead of the sky band with corner frames. `pageHero()` keeps its name and signature, so every generator that calls it is unchanged; the one test that pinned the band's inner markup is updated with it.
5. **Phones get the same hero, stacked.** The two store buttons sit side by side where they fit; *See the features* becomes a text link under them. The screenshot sits under the text.

## Options considered

- **Open it up (docs first).** Sections start open with an in-page table of contents, dropping the one-screen rule. Rejected for now: it changes a rule, the browser checks and most page generators at once, and it does not address the three problems above. It can be its own decision later.
- **Clean, modern restyle.** Drop the frames and diamonds for a flat, typographic look in the same colours. Rejected: the addon itself carries the Slate & Brass look (its options window, its crest), and a site that drops it would no longer look like the thing it describes. The ornament is reduced, not removed.
- **Fix the title bug and keep the hero.** Rejected: the bug is a symptom of borrowing preset names from the addon, and fixing the symptom leaves Home without a picture of the UI.
- **Use the existing screenshots in the new slots now.** Rejected by Cliff on 2026-10-21: the slots stay as placeholders so the hero and tour get captures framed for them, rather than crops of shots taken for other pages.

## Consequences

- Home shows the UI as soon as its slots are filled; until then it shows, honestly, where the UI will be.
- A renamed preset in the addon can no longer blank a title. The new test turns that class of failure into a red build.
- `site.css` gets shorter: the hero's rings, ridges, embers and their animations go, as do the card-corner rules.
- The site needs real captures for the new slots (listed in the PR), taken and cropped under the existing screenshot rules.
- The one-screen rule still holds on every page; the tour starts folded so Home opens on the hero, the tiles and the folded sections as before.
- Deep links, the sidebar, the next-release switch, search, the feedback form and the footer are untouched.
- `README.md` (Page look, The crest) and `CLAUDE.md` (Page structure) are updated in the same change to describe the new pieces.

## Follow-ups

- Capture the slot screenshots in the game and fill the slots.
- Decide separately whether to open sections by default (the "docs first" option above).
