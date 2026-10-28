# CLAUDE.md: Vanguard website

Read this before touching anything. README.md has the full detail on how the site is generated and deployed; this file is how to work in the repo.

## What this is

- The player website for Vanguard (vanguardui.com), the UI addon for WoW Forever. Author Clifton Taylor.
- It is a static site: plain HTML and CSS, plus a little vanilla JS (search, copy buttons, mobile menu). Built to `dist/` by Node scripts.
- **The site is generated from the addon's own Lua.** Commands, modules, settings, colours and release facts come from the addon at build time. Never hand-edit those facts on the site. If one is wrong, fix the addon or the generator in `scripts/`.
- The addon is `clifftaylor2325/wow-vanguard-ui`. The build clones it through `gh`. It is public now; a read-only token (`ADDON_READ_TOKEN`) is needed only if it goes private.
- The site doesn't host or offer a download. It points players to CurseForge, which is "coming soon" until the listing is live.

## Commands

```sh
npm install           # once: playwright-core, wawoff2
npm run build         # fetch the addon source and release metadata, then generate dist/
npm test              # tests against the generated site (node --test test/*.test.mjs)
npm run check:encoding
npm run check         # build + encoding + tests. Run this before a PR.
npm run serve         # dist/ at http://localhost:8080
npm run shots         # browser checks (needs Chrome; set CHROME_PATH if not found)
npm run fonts         # remake src/fonts/*.woff2 from the addon's TTFs
npm run dev           # wrangler pages dev, with the feedback Function, at http://localhost:8788
```

Needs Node 20 or newer (CI uses 22) and `gh` signed in. Local overrides: `FUI_SRC=/path/to/wow-vanguard-ui` builds from a local checkout. `FUI_REF` and `FUI_RELEASE` pick a different source commit or release.

## Source pins

`site.config.json` sets two things:
- `sourceRef`: the addon commit the site reads for the **next release**. Changing it is a deliberate act. It changes what the site says is coming.
- `release`: `latest`. The current release.
- `launch`: WoW Forever's launch time (UTC). Home counts down to it, says the game is live for a week after, then drops it.
- `notice`: one line shown above every page on a launch or hotfix day, `""` the rest of the time. A string is English for every language; `{ "en": …, "de": … }` gives each language its own.

Anything only in `sourceRef` is tagged "Next release" and hidden until the reader switches on "Show what's coming in the next release". Never show next-release features as current.

## Rules

- **Player-facing pages never link to the GitHub repo**, and there is no download.
- **Store links:** `CURSEFORGE_URL` and `WAGO_URL` in `scripts/lib/html.mjs` are both set. Set one back to `null` and that store's button becomes a "Coming soon" badge.
- **Hand-written words** are limited to three pages (Cliff approved the third, Support, on 2026-10-13), and each claim stays traceable:
  - `scripts/lib/help-content.mjs` (Troubleshooting & FAQ): every message an answer quotes is read from the addon at build time. If a message can't be found in the code, leave the answer off the page. Don't guess.
  - `supportPage()` in `scripts/lib/pages-more.mjs` (Support): what support pays for and the Ko-fi link. It makes no claim about Vanguard's features. Ko-fi asks elsewhere are one sentence each (`supportAsk()`), on Install, Changelog and Troubleshooting, with a `utm_campaign` per page. No Ko-fi script is ever loaded.
  - `scripts/lib/changelog-content.mjs`: release notes in player language. Each line lists the merged PRs it came from. Those PR numbers are never shown on the site.
  - Also approved by Cliff on 2026-10-28: the `notice` line in `site.config.json`, and the Credits page's press section (what writers may use the artwork for) and privacy section (`creditsPress()` and `creditsPrivacy()` in `scripts/lib/pages-more.mjs`). Keep each to what is true of the site today.
- **Languages:** English is at the root; other languages live under `/<code>/` and are published only when listed in `locales` in `site.config.json`. All ten are listed: the translations (`scripts/lib/i18n-strings-*.mjs`, and Troubleshooting and Support in `scripts/lib/i18n-pages-*.mjs`) ship as machine drafts and players' feedback corrects them (Cliff, 2026-10-26). The site's own words in other languages are translations of the English strings in `scripts/lib/i18n-site.mjs`, never new claims; the addon's words, Troubleshooting's quoted messages included, come from its `Locales/` files and are never translated by hand. README.md (Languages) has the detail.
- **Encoding:** every text file is UTF-8 without BOM, with LF endings. Use real `…`, `“`, `”`, `’`, `→`, `·`. `npm run check:encoding` fails on garbled characters. See CONTRIBUTING.md for Windows PowerShell pitfalls.
- **Fonts:** the WOFF2 files in `src/fonts/` are committed. Run `npm run fonts` when the addon's fonts change, and commit the result. Each `@font-face` lists WOFF2 first, then the addon's TTF as fallback.
- **Feedback form:** the page (`src/feedback/`) and the Function (`functions/api/feedback.js`, `functions/_lib/`) share code. Never bypass Turnstile, the rate caps, or the sanitizing that keeps player text inside code fences.
- **Secrets never go in the repo.** `.dev.vars` is git-ignored; `.dev.vars.example` holds test keys only. `GITHUB_API_URL` (the local stub) must never be set on Cloudflare; the Function refuses it anywhere but localhost. Don't use Turnstile's test keys in production.

## Screenshots

- Real in-game captures only (addon issue #85): no mock renders. Files live in `src/assets/shots/` as WebP, at most 1600 px wide, listed in `scripts/lib/shots-content.mjs` with a caption that describes only what is in the picture.
- Before adding one, look at it: blur or crop other players' names (Trade chat, nameplates in cities, group frames, guild tags) and the game's "Press F6 to submit an issue" tooltip line.
- A shot that shows something only in the next release gets `next: true`.

## Page structure

- Pages are generated by `scripts/lib/pages-*.mjs`. Shared pieces live in `scripts/lib/html.mjs` (`layout()`, `pageHero()`, `glance()`, `disclosure()`, `ornament()`, `heroFrame()`).
- Styles are in `src/assets/site.css`. The brass and slate look comes from `Core/Theme.lua` via `assets/theme.css`.
- Every reference page (Features, Commands, Settings, Profiles, Troubleshooting, Changelog, Credits, Support) must fit one screen as it opens, at 1280x800 and 390x844. Sections fold with `<details>`. A section that starts open is marked `open data-open`. Home, Install, Getting started and Screenshots show their content open instead (Cliff, 2026-10-28), and Feedback is its form (`OPEN_PAGES` in `scripts/shots.mjs`).
- The sidebar (`NAV`) is the only navigation; Discord and Support buttons sit above its page list. The header holds the brand and, under 900px, a language button and Menu. The footer links no pages, only the stores, Discord and X.
- Deep links must keep working. Section ids stay on the `h2`/`h3`.

## Deploying

- Merging to `main` runs the `check` workflow. If it passes, `deploy.yml` deploys to the Cloudflare Pages project `vanguard-ui`.
- Don't run `npm run deploy` by hand unless the user asks.
- Feedback bindings (KV, Turnstile, GitHub token) are set through `feedback-setup.yml`, not in files.

## Working method

- Run `npm run check` before you say a change is done. Run `npm run shots` too if you changed layout, the menu, search or the feedback form.
- Read the affected generator and its test in `test/` before changing it.
- Branch and open a PR. Don't commit to `main` directly.
- Don't commit `dist/`, `.cache/`, `shots/`, `.dev.vars` or `node_modules/`.
- Don't add a doc file unless the user asks.

## Commit and PR attribution

Cliff's rule for this project and both repos (`clifftaylor2325/wow-vanguard-ui` and `clifftaylor2325/wow-vanguard-ui-site`). It overrides any default attribution guidance.

- Attribute commits only to Cliff (`clifftaylor2325`). Don't add `Co-Authored-By`, `Claude-Session` or any other author or co-author line that names anyone else, Claude included.
- Don't set any other git author or committer identity.
- Don't add "Generated with Claude Code" or session links to PR descriptions.
- Don't rewrite past commits to change their attribution.

## Don't

- Don't hand-edit anything in `dist/`. It is rebuilt every time.
- Don't copy addon text, code or art into the site by hand. Generate it from the addon.
- Don't describe a feature as current when it is only in the next release.
