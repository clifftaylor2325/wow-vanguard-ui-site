# ForeverUI website

The player website for [ForeverUI](https://github.com/clifftaylor2325/wow-forever-ui), a fan UI addon for WoW Forever. It's a static site (plain HTML and CSS, plus a little vanilla JS for search, copy buttons and the mobile menu). It is **generated from the addon's own source**, so the commands, modules, settings, colors and release facts on the site always match the addon.

Pages: Home, Install & Update, Getting started, Features, Commands (searchable), Settings (searchable), Profiles & sharing, Troubleshooting & FAQ, Feedback, Changelog, Credits & license.

## Requirements

- Node 20 or newer
- [`gh`](https://cli.github.com/), signed in (or `GH_TOKEN` set) with read access to `clifftaylor2325/wow-forever-ui`. The addon repo is private, and the build uses `gh` to clone it and download the release zip.

## Commands

```sh
npm install        # once: dev tools (playwright-core, for screenshots only)
npm run build      # fetch the addon source and latest release, then generate dist/
npm test           # check the generated site against the addon's Lua
npm run check      # build, then test
npm run serve      # serve dist/ at http://localhost:8080
npm run shots      # full-page screenshots and a no-horizontal-scroll check (needs Chrome)
npm run deploy     # npx wrangler pages deploy dist --project-name foreverui
```

To build from a local checkout of the addon, skip the clone (use the same `FUI_SRC` for `npm test`):

```sh
FUI_SRC=/path/to/wow-forever-ui npm run check
```

Other overrides: `FUI_REF` (the source commit to read for the next release) and `FUI_RELEASE` (a release tag instead of `latest`).

## How content is generated

`site.config.json` pins the addon source: `sourceRef` is the commit the site reads for the **next release**, and `release` (`latest`) is the GitHub release that players download.

1. `scripts/fetch.mjs` clones the addon into `.cache/wow-forever-ui` (or uses `FUI_SRC`). It reads the release's metadata into `.cache/release.json` with `gh release view`, and downloads the release zip with `gh release download`.
2. `scripts/build.mjs` reads the Lua at **two refs**: the release tag (what's in the zip) and the pinned `sourceRef` (what's coming). Each file is read with `git show <ref>:<file>`, so the checkout is never changed. `scripts/lib/lua.mjs` is a small reader for the Lua tables the addon uses. `scripts/lib/extract.mjs` pulls out:
   - `Core/Slash.lua`: every command word, its aliases and its help line, verbatim
   - `Core/Modules.lua`, `Modules/*.lua` and `Core/Options.lua`: modules, their descriptions, and every options page, row, default, range and reload flag
   - `Core/Theme.lua`: the theme colors and accent presets (they become `assets/theme.css`)
   - `Core/Setup.lua`: the setup wizard
   - `README.md`, the `.toc` file and the release: feature text, version, interface, size, SHA-256 and release notes
3. `scripts/lib/model.mjs` merges the two refs. Everything is labeled **In v0.3.0** (in the download), **Next release** (only in the pinned source) or **v0.3.0 only**. The site never presents next-release features as part of the current download.
4. The pages (`scripts/lib/pages-*.mjs`) are written into `dist/`, with the release zip in `dist/download/` and the Fira Sans Condensed fonts (and their OFL license) from the addon.

The site never links to the private GitHub repo from player-facing pages. The zip is hosted on the site itself.

To move the site to a newer addon commit, update `sourceRef` and run `npm run check`. When a new release is published, `latest` picks it up on the next build.

## Tests

`npm test` (`test/site.test.mjs`) re-reads the Lua with its own, separate extraction. It fails if any slash command, help line, module or options page is missing from the generated site. It also checks:

- the zip's size and hash
- one `h1` per page and no duplicate ids
- that every internal link and anchor resolves
- that nothing in `dist/` links to github.com

## License

MIT, the same as the addon. See `LICENSE`. The bundled fonts are under the SIL Open Font License 1.1 (`dist/fonts/OFL.txt`).
