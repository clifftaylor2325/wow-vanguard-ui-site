// The launch additions: the Forever countdown on Home, the launch-day notice, the release feed,
// the other-addons table on Features, the Credits press and privacy sections and the Feedback
// form's Troubleshooting suggestions. Like site.test.mjs, the other-addons check reads the Lua
// itself (git show at the current release). Run after a build.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { loadConfig } from "../scripts/lib/config.mjs";
import { siteNotice, DISCORD_URL } from "../scripts/lib/html.mjs";
import { launchCountdown } from "../scripts/lib/pages-main.mjs";
import { publishedLocales, siteLocale, ENGLISH, LOCALES } from "../scripts/lib/i18n-site.mjs";

const cfg = loadConfig();
const dist = cfg.outDir;
const meta = JSON.parse(fs.readFileSync(cfg.releaseJson, "utf8"));
const html = (p) => fs.readFileSync(path.join(dist, p, "index.html"), "utf8");
const LANG_DIRS = publishedLocales(cfg.locales).map((l) => (l.code === "en" ? "" : `${l.code}/`));
const DE = siteLocale(LOCALES.find((l) => l.code === "de"));
const EN = siteLocale(ENGLISH);
const DAY = 24 * 3600 * 1000;
const LAUNCH = "2026-11-04T23:00:00Z";

// A file of the addon at the current release (empty string when missing).
function show(file) {
  try {
    return execFileSync("git", ["show", `${meta.current}:${file}`], { cwd: cfg.sourcePath, maxBuffer: 64 << 20, stdio: ["ignore", "pipe", "ignore"] }).toString();
  } catch {
    return "";
  }
}

test("the countdown says the launch in UTC before it, and the times site.js needs", () => {
  const out = launchCountdown({ launch: LAUNCH, now: Date.parse(LAUNCH) - 3 * DAY }, EN);
  assert.match(out, /WoW Forever launches November 4, 2026 at 11:00\s?PM UTC\./);
  assert.match(out, /data-launch="2026-11-04T23:00:00.000Z"/);
  assert.match(out, /data-until="2026-11-11T23:00:00.000Z"/);
  assert.match(out, /data-soon="WoW Forever launches in \{time\} \(\{when\} your time\)\."/);
});

test("the countdown says the game is live for a week after launch, then goes", () => {
  assert.match(launchCountdown({ launch: LAUNCH, now: Date.parse(LAUNCH) + DAY }, EN), />WoW Forever is live\.</);
  assert.equal(launchCountdown({ launch: LAUNCH, now: Date.parse(LAUNCH) + 8 * DAY }, EN), "");
  assert.equal(launchCountdown({ launch: null, now: 0 }, EN), "");
});

test("Home carries the countdown in every language while the launch is ahead or a week behind", { skip: !cfg.launch && "no launch time in site.config.json" }, () => {
  const due = Date.now() <= Date.parse(cfg.launch) + 7 * DAY;
  for (const d of LANG_DIRS) assert.equal(html(d).includes(`data-launch="${new Date(cfg.launch).toISOString()}"`), due, `/${d}`);
});

test("the notice is off when blank, English in other languages unless given theirs, and escaped", () => {
  assert.equal(siteNotice("", EN), "");
  assert.equal(siteNotice({ en: " " }, EN), "");
  const en = siteNotice("Known since today's patch: tooltips <b>twice</b>.", DE);
  assert.match(en, /<span lang="en">Known since today's patch: tooltips &lt;b&gt;twice&lt;\/b&gt;\.<\/span>/);
  assert.ok(en.includes(`href="${DISCORD_URL}"`), "links Discord");
  assert.match(siteNotice({ en: "Fixed.", de: "Behoben." }, DE), /<span>Behoben\.<\/span>/);
  assert.match(siteNotice({ en: "Fixed.", fr: "Corrigé." }, DE), /<span lang="en">Fixed\.<\/span>/);
});

test("the live config's notice matches what every page shows", () => {
  for (const d of LANG_DIRS) assert.equal(html(d).includes('class="site-notice"'), !!String(cfg.notice || "").trim(), `/${d}`);
});

test("each language has a release feed with every release, linked from every page's head", () => {
  for (const d of LANG_DIRS) {
    const feed = fs.readFileSync(path.join(dist, d, "changelog", "feed.xml"), "utf8");
    assert.match(feed, /^<\?xml version="1.0" encoding="utf-8"\?>\n<feed xmlns="http:\/\/www.w3.org\/2005\/Atom"/);
    for (const r of meta.releases) assert.ok(feed.includes(`<title>Vanguard ${r.tagName}</title>`), `${d}feed.xml: ${r.tagName}`);
    assert.equal((feed.match(/<entry>/g) || []).length, meta.releases.length);
    assert.doesNotMatch(feed, /github\.com/i, "no GitHub links in the feed");
    assert.ok(html(d).includes(`type="application/atom+xml"`) && html(d).includes(`href="/${d}changelog/feed.xml"`), `/${d} links its feed`);
  }
});

test("Features lists every addon Vanguard notices at login, with the module it overlaps", () => {
  const lua = show("Modules/Coexist.lua");
  const block = (lua.match(/CX\.OVERLAPS = \{([\s\S]*?)\n\}/) || ["", ""])[1].replace(/--[^\n]*/g, "");
  const names = [...block.matchAll(/(?:^|\},)\s*(?:\["([^"]+)"\]|([A-Za-z_]\w*))\s*=\s*\{/gm)].map((m) => m[1] || m[2]);
  assert.ok(names.length > 20, "the release lists the other addons");
  const section = html("features").split('id="other-addons"')[1] || "";
  for (const n of names) assert.ok(section.includes(`<code>${n}</code>`), `Features names ${n}`);
  assert.match(section, /<a href="\/features\/#bags">Bags<\/a>/);
});

test("Credits has the press and privacy sections, and the crest drawing ships", () => {
  const credits = html("credits");
  assert.ok(credits.includes('id="press"') && credits.includes('id="privacy"'));
  assert.ok(credits.includes('href="/assets/vanguard-crest.svg"') && fs.existsSync(path.join(dist, "assets", "vanguard-crest.svg")));
  assert.match(credits, /This site sets no cookies/);
});

test("the Feedback form carries the Troubleshooting questions, each linking an answer that exists", () => {
  for (const d of LANG_DIRS) {
    const data = JSON.parse((html(`${d}feedback`).match(/<script type="application\/json" id="fb-faq-data">([\s\S]*?)<\/script>/) || [])[1] || "[]");
    assert.ok(data.length >= 10, `/${d}feedback has the questions`);
    const help = html(`${d}help`);
    for (const f of data) {
      assert.ok(f.href.startsWith(`/${d}help/#`), f.href);
      assert.ok(help.includes(`id="${f.href.split("#")[1]}"`), `${f.href} exists`);
      assert.ok(f.q && f.en, "question in the page's language and in English");
    }
  }
});
