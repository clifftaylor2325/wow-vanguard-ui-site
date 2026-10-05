# ForeverUI website

Author: Cliff Hearthvale.

The player website for [ForeverUI](https://github.com/clifftaylor2325/wow-forever-ui), a fan UI addon for WoW Forever. ForeverUI is going to be on CurseForge, so the site doesn't host or offer the addon as a download: it points players to CurseForge instead (a "Coming soon on CurseForge" badge until the listing is live). It's a static site (plain HTML and CSS, plus a little vanilla JS for search, copy buttons and the mobile menu). It is **generated from the addon's own source**, so the commands, modules, settings, colors and release facts on the site always match the addon.

Pages: Home (a hero drawn in pure CSS and inline SVG in the addon's Slate & Brass colors), Install & Update, Getting started, Features, Commands (searchable), Settings (searchable), Profiles & sharing, Troubleshooting & FAQ, Feedback, Changelog, Credits & license.

## Requirements

- Node 20 or newer
- [`gh`](https://cli.github.com/), signed in (or `GH_TOKEN` set) with read access to `clifftaylor2325/wow-forever-ui`. The addon repo is private, and the build uses `gh` to clone it and read its release metadata (tags, dates, notes).

## Commands

```sh
npm install        # once: dev tools (playwright-core, for screenshots only)
npm run build      # fetch the addon source and release metadata, then generate dist/
npm test           # check the generated site against the addon's Lua
npm run check      # build, then test
npm run serve      # serve dist/ at http://localhost:8080
npm run shots      # full-page screenshots and a no-horizontal-scroll check at 390 and 360px (needs Chrome)
npm run deploy     # npx wrangler pages deploy dist --project-name foreverui
```

To build from a local checkout of the addon, skip the clone (use the same `FUI_SRC` for `npm test`):

```sh
FUI_SRC=/path/to/wow-forever-ui npm run check
```

Other overrides: `FUI_REF` (the source commit to read for the next release) and `FUI_RELEASE` (a release tag instead of `latest`).

## How content is generated

`site.config.json` pins the addon source: `sourceRef` is the commit the site reads for the **next release**, and `release` (`latest`) is the GitHub release the site calls the **current release**.

1. `scripts/fetch.mjs` clones the addon into `.cache/wow-forever-ui` (or uses `FUI_SRC`). It reads every release's metadata (tag, date, notes) into `.cache/release.json` with `gh release view`. It doesn't download the release zip.
2. `scripts/build.mjs` reads the Lua at **two refs**: the release tag (the current release) and the pinned `sourceRef` (what's coming). Each file is read with `git show <ref>:<file>`, so the checkout is never changed. `scripts/lib/lua.mjs` is a small reader for the Lua tables the addon uses. `scripts/lib/extract.mjs` pulls out:
   - `Core/Slash.lua`: every command word, its aliases and its help line, verbatim
   - `Core/Modules.lua`, `Modules/*.lua` and `Core/Options.lua`: modules, their descriptions, and every options page, row, default, range and reload flag
   - `Core/Theme.lua`: the theme colors and accent presets (they become `assets/theme.css`)
   - `Core/Setup.lua`: the setup wizard
   - `README.md`, the `.toc` file and the release: feature text, tagline, version, interface and release notes
3. `scripts/lib/model.mjs` merges the two refs. Everything is labeled **In v0.3.0** (in the current release), **Next release** (only in the pinned source) or **v0.3.0 only**. The site never presents next-release features as part of the current release.
4. Two pages have hand-written words, kept traceable:
   - Troubleshooting & FAQ (`scripts/lib/help-content.mjs`): every message an answer quotes is read from the addon at build time, each with its file. An answer whose message can't be found in the code is left off the page instead of guessed.
   - Changelog (`scripts/lib/changelog-content.mjs`): each release in player language, and "What's coming in the next release" from the changes merged since the current release. Every line lists the merged pull requests it came from (never shown on the site). The next-release part only shows while the release it was written after is still the current one.
5. The pages (`scripts/lib/pages-*.mjs`) are written into `dist/`, with the Fira Sans Condensed fonts (and their OFL license) from the addon. No zip is copied into `dist/`.

The site never links to the private GitHub repo from player-facing pages, and it offers no download.

## CurseForge

Installing is going to be through CurseForge (the CurseForge app or website). `CURSEFORGE_URL` in `scripts/lib/html.mjs` is `null` until ForeverUI is listed, so every call to action (Home, Install, the footer) renders as a styled, non-link "Coming soon on CurseForge" badge. When the listing is live, set `CURSEFORGE_URL` to its URL and run `npm run check`: the badges become links, and the tests switch to checking for the link.

To move the site to a newer addon commit, update `sourceRef` and run `npm run check`. When a new release is published, `latest` picks it up on the next build.

## Tests

`npm test` (`test/site.test.mjs`) re-reads the Lua with its own, separate extraction. It fails if any slash command, help line, module or options page is missing from the generated site. It also checks:

- that no `.zip` is shipped in `dist/` and nothing links to a download (no `download` links, no `/download/` paths, no checksums)
- that Home and Install have the CurseForge call to action (a non-link "Coming soon" badge while `CURSEFORGE_URL` is `null`)
- that the home page's decoration is `aria-hidden` and its UI mock is labeled as an illustration
- one `h1` per page and no duplicate ids
- that every internal link and anchor resolves
- that nothing in `dist/` links to github.com

## License

MIT, the same as the addon. See `LICENSE`. The bundled fonts are under the SIL Open Font License 1.1 (`dist/fonts/OFL.txt`).
