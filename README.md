# Vanguard website

Author: Cliff Hearthvale.

The player website for [Vanguard](https://github.com/clifftaylor2325/wow-vanguard-ui), a fan UI addon for WoW Forever. Vanguard is going to be on CurseForge, so the site doesn't host or offer the addon as a download: it points players to CurseForge instead (a "Coming soon on CurseForge" badge until the listing is live). It's a static site (plain HTML and CSS, plus a little vanilla JS for search, copy buttons and the mobile menu). It is **generated from the addon's own source**, so the commands, modules, settings, colors and release facts on the site always match the addon.

Pages: Home (a hero drawn in pure CSS and inline SVG in the addon's Slate & Brass colors), Install & Update, Getting started, Features, Commands (searchable), Settings (searchable), Profiles & sharing, Troubleshooting & FAQ, Feedback, Changelog, Credits & license. Every inner page shares a grouped sidebar (Get started, Learn, Reference, Help, About); Home has a top bar. Each page opens on one screen: a slim title band, a strip of facts, and folded sections the reader opens (see Page look).

## Requirements

- Node 20 or newer
- [`gh`](https://cli.github.com/), signed in (or `GH_TOKEN` set) with read access to `clifftaylor2325/wow-vanguard-ui`. The addon repo is private, and the build uses `gh` to clone it and read its release metadata (tags, dates, notes).

## Commands

```sh
npm install        # once: dev tools (playwright-core for screenshots, wawoff2 for fonts)
npm run build      # fetch the addon source and release metadata, then generate dist/
npm test           # check the generated site against the addon's Lua
npm run check      # build, then test
npm run serve      # serve dist/ at http://localhost:8080
npm run shots      # full-page screenshots; checks: no horizontal scroll at 390 and 360px, every page but Feedback fits one screen as it opens (1280x800 and 390x844), the Menu drawer, the search boxes, the skip link by keyboard, and the feedback form (needs Chrome)
npm run fonts      # re-make src/fonts/*.woff2 from the addon's TTF fonts (after npm run fetch)
npm run stub:github  # a stand-in GitHub API on 127.0.0.1:8789 for the feedback Function (see Feedback form)
npm run dev        # wrangler pages dev: dist/ plus the feedback Function, at http://localhost:8788
npm run deploy     # npx wrangler pages deploy dist --project-name vanguard-ui
```

To build from a local checkout of the addon, skip the clone (use the same `FUI_SRC` for `npm test`):

```sh
FUI_SRC=/path/to/wow-vanguard-ui npm run check
```

`npm run shots` looks for Chrome in the usual places; point `CHROME_PATH` at another Chromium browser (Edge works) if it isn't found. `SHOTS_PORT` picks the port of its local server (default: any free port) and `SHOTS_DIR` where the screenshots go (default: `shots/`, git-ignored). On every page it also presses Tab and Enter for real: the first Tab must focus the skip link, and Enter must move focus to `<main id="main">`.

Other overrides: `FUI_REF` (the source commit to read for the next release) and `FUI_RELEASE` (a release tag instead of `latest`).

## How content is generated

`site.config.json` pins the addon source: `sourceRef` is the commit the site reads for the **next release**, and `release` (`latest`) is the GitHub release the site calls the **current release**.

1. `scripts/fetch.mjs` clones the addon into `.cache/wow-vanguard-ui` (or uses `FUI_SRC`). It reads every release's metadata (tag, date, notes) into `.cache/release.json` with `gh release view`. It doesn't download the release zip.
2. `scripts/build.mjs` reads the Lua at **two refs**: the release tag (the current release) and the pinned `sourceRef` (what's coming). Each file is read with `git show <ref>:<file>`, so the checkout is never changed. `scripts/lib/lua.mjs` is a small reader for the Lua tables the addon uses. `scripts/lib/extract.mjs` pulls out:
   - `Core/Slash.lua`: every command word, its aliases and its help line, verbatim
   - `Core/Modules.lua`, `Modules/*.lua` and `Core/Options.lua`: modules, their descriptions, and every options page, row, default, range and reload flag
   - `Core/Theme.lua`: the theme colors and accent presets (they become `assets/theme.css`)
   - `Core/Setup.lua`: the setup wizard
   - `README.md`, the `.toc` file and the release: feature text, tagline, version, interface and release notes
3. `scripts/lib/model.mjs` merges the two refs. The current release is the default and gets no label. Anything only the pinned source has is tagged **Next release** and carries `data-avail="next"`, which hides it until the reader turns on **Show what's coming in the next release** (the switch at the foot of the sidebar, and the same box in the Commands and Settings search forms; the choice is kept in the browser as `vg-show-next`). Something only the release has is tagged **v0.3.0 only**. Without JavaScript everything shows. The site never presents next-release features as part of the current release.
4. Two pages have hand-written words, kept traceable:
   - Troubleshooting & FAQ (`scripts/lib/help-content.mjs`): every message an answer quotes is read from the addon at build time, each with its file. An answer whose message can't be found in the code is left off the page instead of guessed.
   - Changelog (`scripts/lib/changelog-content.mjs`): each release in player language, and "What's coming in the next release" from the changes merged since the current release. Every line lists the merged pull requests it came from (never shown on the site). The next-release part only shows while the release it was written after is still the current one.
5. The pages (`scripts/lib/pages-*.mjs`) are written into `dist/`, with the Fira Sans Condensed fonts (and their OFL license) from the addon. No zip is copied into `dist/`.

## Fonts

The site serves the addon's own Fira Sans Condensed fonts. Each `@font-face` in `src/assets/site.css` lists the WOFF2 file first and the addon's TTF as the fallback, with `font-display: swap`. The WOFF2 files are committed in `src/fonts/`: `npm run fonts` (`scripts/fonts.mjs`) makes them from the TTFs at the current release with [wawoff2](https://www.npmjs.com/package/wawoff2) (Google's WOFF2 encoder as WebAssembly, so the output is the same on every OS). The build copies them into `dist/fonts/` next to the TTFs, and fails if one is missing. Run `npm run fonts` again if the addon's fonts change, and commit the result.

## Page look

Every page shares the Home page's Slate & Brass pieces, from `scripts/lib/html.mjs` and `src/assets/site.css`: `ornament()` (the brass divider), `heroFrame()` (the brass frame with corner pieces) and `pageHero()`, which opens every page but Home with its h1 and a one-line lede in a slim framed band with the hero's sky. Showcase cards (the Home highlights and tiles, the CurseForge box) carry the brass edge, glow and corner diamonds; plain cards keep the brass-tinted edge only. Section headings (`h2`) carry a brass diamond and rule.

The structure is built for one screen. `layout()` puts the grouped sidebar (`NAV[].group`, drawer behind the Menu button under 900px) beside `<main>` on every inner page, and the Home page's top bar lists the `primary` pages. Under the band, `glance()` is the strip of facts, and `disclosure()` makes each section a native `<details>` whose summary is the heading (its id stays on the `h2`/`h3`, so every deep link still works: `site.js` opens the folded sections around the link's target). A section that should start open says so with `open data-open` (on phones it starts folded too). Lists of sections sit two across in a `.dis-grid`; an open one takes the full width. Features folds by area, then by module; Settings folds by options page; Commands keeps one table and folds its row groups by module; the FAQ folds by section, then by question. `npm run shots` checks that every page but Feedback (its form is the page) fits one screen as it opens, at 1280x800 and 390x844.

The site never links to the private GitHub repo from player-facing pages, and it offers no download.

## Deploying

The site is published to the Cloudflare Pages project `vanguard-ui`, at `https://vanguardui.com` (its custom domain) and `https://vanguard-ui.pages.dev`. Two ways:

- **From GitHub (no local setup):** add three repository secrets (Settings → Secrets and variables → Actions): `ADDON_READ_TOKEN` (read-only token for the addon repo, also used by the check), `CLOUDFLARE_API_TOKEN` (a Cloudflare API token with the **Cloudflare Pages: Edit** permission) and `CLOUDFLARE_ACCOUNT_ID` (dashboard → Workers & Pages, right-hand column). Then Actions → **deploy** → **Run workflow**. It runs the full check first, creates the Pages project the first time, and uploads `dist/` with the feedback Function. It only runs when started by hand.
- **From your machine:** `npm run check`, then `npm run deploy` (Wrangler asks you to sign in to Cloudflare the first time, and offers to create the project).

The site works without the feedback form's bindings; until they're set (see Feedback form → Bindings), the form says reports can't be sent from the page right now.

## Feedback form

`/feedback/` has a form (with a preview step) that sends a bug report or feature request to a Cloudflare Pages Function, `POST /api/feedback` (`functions/api/feedback.js`, with the code in `functions/_lib/`). The Function checks the report, runs Cloudflare Turnstile, applies the rate caps, and files it as an issue in the maintainers' private repository (or comments on the open issue for the same error). The player gets a short reference like `VG-AB12CD`, never a link or the repository's name. `dist/_routes.json` sends only `/api/*` to the Function.

The page and the Function share `src/feedback/` (checks, sanitizing, `/vg report` parsing, the error fingerprint and the issue text). The build copies it to `dist/assets/feedback/`, so the preview is exactly what's filed.

### Bindings

The **feedback setup** workflow (Actions tab → feedback setup → Run workflow) sets all of them, then deploys and checks that the form takes reports. The comment at the top of `.github/workflows/feedback-setup.yml` lists what it needs first: two more permissions on the Cloudflare token (Workers KV Storage → Edit and Turnstile Sites → Edit, next to Cloudflare Pages → Edit; it needs nothing else), a fine-grained GitHub token, and the repository to file into. It covers `vanguardui.com` (and its subdomains) and `vanguard-ui.pages.dev`; run it again with any other hostname the site gets in its box, since the Turnstile widget only passes on the hostnames it lists.

By hand instead, set these on the Pages project (Settings → Variables and Secrets, and Bindings), not in a file in the repo:

| Name | Kind | What |
|---|---|---|
| `GITHUB_TOKEN` | secret | Fine-grained token: only the feedback repository, Issues read and write. Not a personal `gh` token. |
| `TURNSTILE_SECRET` | secret | The Turnstile widget's secret key |
| `RL_SALT` | secret | A long random string for the hashed rate-cap keys |
| `TURNSTILE_SITEKEY` | variable | The Turnstile widget's sitekey (the page gets it from `GET /api/feedback`) |
| `FEEDBACK_REPO` | variable | `owner/name` of the repository issues go to |
| `FEEDBACK_KV` | KV namespace | Rate caps, fingerprint → issue, and contact details (90 days) |
| `GITHUB_API_URL` | local only | Points the Function at the local stub. Leave it unset on Cloudflare. |

Until they're all set, `GET /api/feedback` says it isn't accepting, and the page shows "Reports can't be sent from this page right now". The rest of the page (the steps and copyable templates) still works. The Function also refuses Turnstile's test keys and a `GITHUB_API_URL` stub anywhere but localhost.

### Running it locally

`npm run shots` walks the form on its own (errors, feature fields, preview, confirmation, a repeat of the same bug): it answers the page's `/api/feedback` calls in-process with the real Function code, the GitHub stub, an in-memory KV and a Turnstile stand-in (`scripts/lib/feedback-mock.mjs`), so it needs no Wrangler and no network.

To try the real thing with `wrangler pages dev`: nothing is sent to GitHub: reports go to an in-memory stub on your machine. Turnstile uses Cloudflare's public test keys, which always pass. Wrangler 4 needs Node 22 or newer.

```sh
npm run build
cp .dev.vars.example .dev.vars   # test keys and the stub address; .dev.vars is gitignored
npm run stub:github              # terminal 1: the GitHub stand-in (lists what it got at http://127.0.0.1:8789/_stub/issues)
npm run dev                      # terminal 2: http://localhost:8788/feedback/ (local KV for FEEDBACK_KV)
SHOTS_BASE=http://localhost:8788 npm run shots   # optional: the form walk-through against this server (3 reports to the stub)
```

### What gets filed

- Labels: `bug` + `from-site`, or `feature-request` + `from-site`.
- Every free-text field and the pasted report go in fenced code blocks, each fence longer than any run of backticks inside, so nothing a player types can add headings, tables, quotes, lists, rules, HTML or mentions, or close its block early. Inside a fence HTML shows as typed, so nothing there is stripped (text like `a<b and c>d` stays as written). Titles have HTML stripped and `@mentions` and `#123` broken (GitHub shows titles as plain text). One-line values in the body, such as the environment table, also have HTML stripped, inline markdown escaped, and bare URLs broken with a zero-width space so they don't autolink.
- Every report has its own reference (`Reference: VG-…` and a hidden `<!-- fui-ref VG-… -->`; reports sent before the rename have `FUI-…` references, which still work). A repeat of an open bug becomes a comment carrying the repeat reporter's own reference; the player gets that reference back, never the first reporter's.
- Bugs with a caught error carry a fingerprint (`fp:` + 8 hex characters from the first error and its top stack line, with line numbers, addresses and counts removed). A second report of the same open bug becomes a comment on it.
- Contact details (only when the player ticks the box) are kept in `FEEDBACK_KV` for 90 days, never in the issue. No IP address is stored: the rate cap keys are `sha256(IP + RL_SALT + date)`, kept for 2 hours.
- Caps: 5 sends in any rolling hour per player, and 60 new issues per UTC day in all (see Rate caps).
- No uploads in v1: a request with a screenshot or file field is refused.

### Removal requests (maintainers)

A player asks for removal by sending a report titled "Remove VG-…" with their reference. References are shown only to the player who sent the report, and each report has its own, so:

1. Search the repository's issues and comments for the reference (for example `"VG-AB12CD"`, which matches the visible `Reference:` line).
2. If it is in an **issue body**, that issue is the player's own report: delete the issue (if other players' comments are on it, delete or edit the body instead and keep their comments).
3. If it is in a **comment**, delete only that comment; the issue and the other reports on it stay.
4. Then delete the removal request issue too, and any `contact:<reference>:…` key in `FEEDBACK_KV`.

### Rate caps

Workers KV has no atomic increment, so the caps don't use counters. Each send that passes Turnstile **writes its own slot key first** (`rl:p:<sha256(IP + RL_SALT + UTC date)>:<time>:<random>`, kept 2 hours), then **lists** the player's slots from the last hour (today's and yesterday's key, so midnight doesn't reset it) and goes ahead only if fewer than 5 are as old as its own or older. Otherwise it deletes its slot and answers 429 with `retry-after` (when the oldest send in the way turns an hour old). The day cap works the same way with `rl:d:<date>:…` slots, one per new issue. A send that fails, and the day slot of a repeat that became a comment, are given back. Turnstile is checked before any of this, so a request without a valid token never writes to KV.

This makes a fixed-hour reset and simple read-then-write races go away, but KV can't make it exact:

- KV is eventually consistent. Writes are usually visible at once in the location that made them, but `list` results can lag (up to about a minute), and other locations can take longer. Requests that don't see each other's slots can all get through, so a burst spread across Cloudflare locations, or faster than KV shows writes, can still go over the cap.
- Ties and clock differences between Cloudflare machines can make it refuse a send that could have gone through (it errs on the side of refusing).
- Each send that passes Turnstile costs 2 writes (a player slot and a day slot) and 3 lists (today's player key, yesterday's player key, and the day key), plus a delete for each slot given back, and the usual `fp:`/`contact:` writes. That counts against KV's daily limits.

For an exact cap, a future change could keep the counters in a Durable Object (one per player key, and one for the day), which handles requests one at a time, or rely on Turnstile as the main gate (for example a stricter widget mode or pre-clearance) with KV only as a backstop. Neither is built.

## CurseForge

Installing is going to be through CurseForge (the CurseForge app or website). `CURSEFORGE_URL` in `scripts/lib/html.mjs` is `null` until Vanguard is listed, so every call to action (Home, Install, the footer) renders as a styled, non-link "Coming soon on CurseForge" badge. When the listing is live, set `CURSEFORGE_URL` to its URL and run `npm run check`: the badges become links, and the tests switch to checking for the link.

To move the site to a newer addon commit, update `sourceRef` and run `npm run check`. When a new release is published, `latest` picks it up on the next build.

## Tests

`npm test` (`test/site.test.mjs`) re-reads the Lua with its own, separate extraction. It fails if any slash command, help line, module or options page is missing from the generated site. It also checks:

- that no `.zip` is shipped in `dist/` and nothing links to a download (no `download` links, no `/download/` paths, no checksums)
- that Home and Install have the CurseForge call to action (a non-link "Coming soon" badge while `CURSEFORGE_URL` is `null`)
- that the home page's decoration is `aria-hidden` and its UI mock is labeled as an illustration
- one `h1` per page and no duplicate ids
- that the skip link is the first focusable element and targets `<main id="main">`, and that every inner page opens with the shared page hero
- that every inner page has the grouped sidebar with all 11 pages (Home the top bar), that nothing is tagged "In vX", that every page hiding next-release parts has the switch that shows them, and that folded sections start closed unless marked open by default (Features and Settings start fully folded)
- that each `@font-face` lists WOFF2 first and the TTF second, keeps `font-display: swap`, and that `dist/fonts/` ships the committed WOFF2 files
- that every internal link and anchor resolves
- that nothing in `dist/` links to github.com

`test/feedback.test.mjs` covers the feedback form: sanitizing, the parser (with real `/vg status` and `/vg errors` output in `test/fixtures/`), fingerprints, the issue text and checks, hostile markdown in every free-text field, and the Function's paths (create, duplicate → comment with its own reference, spam, Turnstile, rate caps including 10 sends at once, the turn of the hour and midnight, missing settings) against a mock GitHub and an in-memory KV (`scripts/lib/memory-kv.mjs`). It never calls GitHub.

## License

MIT, the same as the addon. See `LICENSE`. The bundled fonts are under the SIL Open Font License 1.1 (`dist/fonts/OFL.txt`).
