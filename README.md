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
npm run stub:github  # a stand-in GitHub API on 127.0.0.1:8789 for the feedback Function (see Feedback form)
npm run dev        # wrangler pages dev: dist/ plus the feedback Function, at http://localhost:8788
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

## Feedback form

`/feedback/` has a form (with a preview step) that sends a bug report or feature request to a Cloudflare Pages Function, `POST /api/feedback` (`functions/api/feedback.js`, with the code in `functions/_lib/`). The Function checks the report, runs Cloudflare Turnstile, applies the rate caps, and files it as an issue in the maintainers' private repository (or comments on the open issue for the same error). The player gets a short reference like `FUI-AB12CD`, never a link or the repository's name. `dist/_routes.json` sends only `/api/*` to the Function.

The page and the Function share `src/feedback/` (checks, sanitizing, `/fui report` parsing, the error fingerprint and the issue text). The build copies it to `dist/assets/feedback/`, so the preview is exactly what's filed.

### Bindings

Set these on the Pages project (Settings → Variables and Secrets, and Bindings), not in a file in the repo:

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
- Every free-text field and the pasted report go in fenced code blocks, each fence longer than any run of backticks inside, so nothing a player types can add headings, tables, quotes, lists, rules, HTML or mentions, or close its block early. HTML is stripped from free text. Titles have HTML stripped and `@mentions` and `#123` broken (GitHub shows titles as plain text); one-line values in the body, such as the environment table, also have inline markdown escaped.
- Every report has its own reference (`Reference: FUI-…` and a hidden `<!-- fui-ref FUI-… -->`). A repeat of an open bug becomes a comment carrying the repeat reporter's own reference; the player gets that reference back, never the first reporter's.
- Bugs with a caught error carry a fingerprint (`fp:` + 8 hex characters from the first error and its top stack line, with line numbers, addresses and counts removed). A second report of the same open bug becomes a comment on it.
- Contact details (only when the player ticks the box) are kept in `FEEDBACK_KV` for 90 days, never in the issue. No IP address is stored: the rate cap keys are `sha256(IP + RL_SALT + date)`, kept for 2 hours.
- Caps: 5 sends in any rolling hour per player, and 60 new issues per UTC day in all (see Rate caps).
- No uploads in v1: a request with a screenshot or file field is refused.

### Removal requests (maintainers)

A player asks for removal by sending a report titled "Remove FUI-…" with their reference. References are shown only to the player who sent the report, and each report has its own, so:

1. Search the repository's issues and comments for the reference (for example `"FUI-AB12CD"`, which matches the visible `Reference:` line).
2. If it is in an **issue body**, that issue is the player's own report: delete the issue (if other players' comments are on it, delete or edit the body instead and keep their comments).
3. If it is in a **comment**, delete only that comment; the issue and the other reports on it stay.
4. Then delete the removal request issue too, and any `contact:<reference>:…` key in `FEEDBACK_KV`.

### Rate caps

Workers KV has no atomic increment, so the caps don't use counters. Each send that passes Turnstile **writes its own slot key first** (`rl:p:<sha256(IP + RL_SALT + UTC date)>:<time>:<random>`, kept 2 hours), then **lists** the player's slots from the last hour (today's and yesterday's key, so midnight doesn't reset it) and goes ahead only if fewer than 5 are as old as its own or older. Otherwise it deletes its slot and answers 429 with `retry-after` (when the oldest send in the way turns an hour old). The day cap works the same way with `rl:d:<date>:…` slots, one per new issue. A send that fails, and the day slot of a repeat that became a comment, are given back. Turnstile is checked before any of this, so a request without a valid token never writes to KV.

This makes a fixed-hour reset and simple read-then-write races go away, but KV can't make it exact:

- KV is eventually consistent. Writes are usually visible at once in the location that made them, but `list` results can lag (up to about a minute), and other locations can take longer. Requests that don't see each other's slots can all get through, so a burst spread across Cloudflare locations, or faster than KV shows writes, can still go over the cap.
- Ties and clock differences between Cloudflare machines can make it refuse a send that could have gone through (it errs on the side of refusing).
- Each send costs about 2 writes and 2 lists (plus deletes when refused), which counts against KV's daily limits.

For an exact cap, a future change could keep the counters in a Durable Object (one per player key, and one for the day), which handles requests one at a time, or rely on Turnstile as the main gate (for example a stricter widget mode or pre-clearance) with KV only as a backstop. Neither is built.

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

`test/feedback.test.mjs` covers the feedback form: sanitizing, the parser (with real `/fui status` and `/fui errors` output in `test/fixtures/`), fingerprints, the issue text and checks, hostile markdown in every free-text field, and the Function's paths (create, duplicate → comment with its own reference, spam, Turnstile, rate caps including 10 sends at once, the turn of the hour and midnight, missing settings) against a mock GitHub and an in-memory KV (`scripts/lib/memory-kv.mjs`). It never calls GitHub.

## License

MIT, the same as the addon. See `LICENSE`. The bundled fonts are under the SIL Open Font License 1.1 (`dist/fonts/OFL.txt`).
