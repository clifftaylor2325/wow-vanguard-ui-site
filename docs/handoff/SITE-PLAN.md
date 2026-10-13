# Site plan: install path, support, discovery

The work plan from the October 2026 review of vanguardui.com. For whoever picks a task up (another
session or Cliff): one task is one commit, one phase is one PR, each ticked here in the same commit.
Repo rules: `CLAUDE.md`. Anything that loosens a rule the tests enforce says so in the task.

Summary of the review: the site is well built and needs no rebuild. Its weakness is conversion: a
player who arrives can't install Vanguard (every install button is a "Coming soon" badge), there are
no screenshots, and the one support link is a footer line. Search needs the pages to say what they
are, and the duplicate host needs a redirect.

## Phase 1: brand and sharing (done, PR #60)

- [x] The crest as the header mark, the hero and the favicon; Open Graph image and card tags; canonical links.
- [ ] After merge: upload `src/assets/brand/github-social-preview.png` under Settings → Social preview on both repos.

## Phase 2: install path (the one that matters before launch)

- [ ] **CurseForge listing.** Create the project (Forever flavor, game version 1.60.x), upload `Vanguard-<version>.zip`, website and source links, the crest as its logo. [DECIDE: Cliff does this; it is an account action.]
- [ ] Set `CURSEFORGE_URL` in `scripts/lib/html.mjs`, run `npm run check`: the badges become links and the tests switch to checking the link.
- [ ] Install page: a numbered manual-install section for the Forever client with the verified AddOns folder (the README says `_retail_`; confirm in the live client), and a check line ("the folder must hold `Interface/AddOns/Vanguard/Vanguard.toc`").
- [ ] An "Upgrading from the old name" box on Install (export before updating, import after, delete the old folder), linked from Troubleshooting.
- [ ] Rebuild on release: a `repository_dispatch` from the addon's release workflow to `deploy.yml`, so the site updates minutes after a release.

## Phase 3: support (in progress, branch `work/support-seo`)

Placements, each tagged with `utm_campaign` so Ko-fi's analytics say which brings people:

- [ ] `/support/` page (About group): a first-person note on what support pays for, the service buttons, "can't chip in" alternatives. The only page that asks at length.
- [ ] Header: a small Support button to `/support/` (loosens "the header links only the brand" in `test/site.test.mjs`).
- [ ] One-sentence asks at the high-intent moments: end of Install, under the current release on Changelog, end of Troubleshooting.
- [ ] Footer line stays; its wording covers one-off and monthly.
- [ ] Not doing: Ko-fi's floating widget site-wide (a third-party script on every page) and anything in the addon itself. The Tip Panel embed is an option for `/support/` only.
- [ ] Ko-fi side (Cliff): a public goal for launch season, a low monthly tier with a thank-you (no features behind it), Google Analytics on the Ko-fi page if the UTM clicks should be counted.

## Phase 4: search

- [x] Canonical, Open Graph and Twitter card tags on every page (Phase 1).
- [ ] Titles and descriptions per page that say what the page is for a searcher ("Install Vanguard in WoW Forever", "WoW Forever UI addon"); the brand always with a qualifier, never the bare word.
- [ ] `SoftwareApplication` JSON-LD on Home (name, category, version, free, URL, image, author). No ratings or reviews unless they are real.
- [ ] `sitemap.xml` with `lastmod`; already lists every page, with `robots.txt` pointing to it.
- [ ] Google Search Console (domain property, DNS record in Cloudflare) and Bing Webmaster Tools (import from Search Console, IndexNow on). [DECIDE: Cliff's accounts.]
- [ ] Cloudflare: a Bulk Redirect from `vanguard-ui.pages.dev` to `https://vanguardui.com` (301, keep path and query). A `_redirects` file can't do a domain-level redirect. Check whether an old pages.dev project for the previous name still serves anything; redirect or delete it. [DECIDE: Cliff's dashboard.]
- [ ] Off-site: list on CurseForge first (that is where players and the addon round-up sites look), then a short factual note to the round-up sites with a screenshot; release notes with screenshots in the Forever community spaces; a 2-minute setup video later.

## Phase 5: show the product

- [ ] Fix the five UI issues found while taking screenshots (addon #186 to #190), then capture real screenshots: `/assets/img/vanguard-<module>-<context>.webp`, sized, with alt text.
- [ ] A screenshots gallery page and one screenshot per area on Features; replace the hero's "not a screenshot" illustration.
- [ ] A short GIF or video of the setup wizard on Home and Install.

## Phase 6: cleanup

- [ ] README (site): drop the "once the addon repo is private" bullet and `ADDON_READ_TOKEN`, or mark them historical; make the "tagged vX only" line dynamic.
- [ ] Rename `FUI_SRC`, `FUI_REF`, `FUI_RELEASE` to `VG_*`, keeping the old names as fallbacks for one release; keep the old-report parsing.
- [ ] Close or relabel stale issues that still name the old repo names and the old pages.dev host.
- [ ] Changelog: fall back to GitHub release notes when a release has no hand-written entry yet.
