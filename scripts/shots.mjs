#!/usr/bin/env node
// Checks every page for sideways scrolling, failed requests and console errors at
// 390px and 360px wide, that every page but Feedback fits one screen as it
// opens (1280x800 and 390x844, every section folded), that the Menu button
// opens the nav drawer at 390px, checks the Commands and Settings search, and takes
// full-page screenshots of Home, Install, Features, Commands, Settings,
// Feedback, Troubleshooting and Changelog at 1280px and 390px.
// Uses playwright-core with the browser in CHROME_PATH, else Edge on Windows
// (msedge.exe under Program Files or Program Files (x86)), else an installed
// Chrome/Chromium. Screenshots go to SHOTS_DIR (default: shots/).
// It also checks the skip link with the keyboard on every page: the first Tab
// must focus it, and Enter must move focus to <main id="main">.
// When the build publishes other languages (SITE_LOCALES, or `locales` in
// site.config.json), it checks each of them too: every page fits one screen,
// nothing scrolls sideways, the search speaks that language, the language
// select (and at 390px the header's language button) opens the same page in it,
// and a browser that asks for the language is offered it once.
// The local server listens on SHOTS_PORT (default: any free port).
//   npm run shots
// It also walks the feedback form (field errors, the feature fields, the
// preview, the confirmation, and at 390px a repeat of the same bug) at 1280px
// and 390px. By default the page's /api/feedback calls are answered in this
// process by the real Function code, filing into the local GitHub stub, with
// a Turnstile stand-in (scripts/lib/feedback-mock.mjs). With SHOTS_BASE set to
// a running `npm run dev` (wrangler pages dev with the stub, see README) it
// uses that instead, with the real Turnstile test widget. Either way reports
// go to the stub, never to GitHub.
//   SHOTS_BASE=http://localhost:8788 npm run shots
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { loadConfig, root } from "./lib/config.mjs";
import { serve } from "./serve.mjs";
import { NAV } from "./lib/html.mjs";
import { LOCALES } from "./lib/i18n-site.mjs";
import { mockFeedback, routeFeedbackApi } from "./lib/feedback-mock.mjs";

// msedge.exe in the usual Windows install folders (none on other systems).
function edgePaths() {
  if (process.platform !== "win32") return [];
  const dirs = [process.env.ProgramFiles || "C:\\Program Files", process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)"];
  return dirs.map((d) => path.join(d, "Microsoft", "Edge", "Application", "msedge.exe"));
}

const CANDIDATES = [process.env.CHROME_PATH, ...edgePaths(), "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "C:/Program Files/Google/Chrome/Application/chrome.exe"].filter(Boolean);
const outDir = path.resolve(root, process.env.SHOTS_DIR || "shots");
const SHOOT = [["home", "/"], ["install", "/install/"], ["features", "/features/"], ["commands", "/commands/"], ["settings", "/settings/"], ["feedback", "/feedback/"], ["help", "/help/"], ["changelog", "/changelog/"], ["start", "/start/"], ["profiles", "/profiles/"]];

// The first browser binary that exists.
function browserPath() {
  const p = CANDIDATES.find((c) => fs.existsSync(c));
  if (!p) throw new Error("no Edge, Chrome or Chromium found; set CHROME_PATH");
  return p;
}

// Logs one check and records it when it fails.
function report(failures, what, ok) {
  console.log(`${ok ? "ok  " : "FAIL"} ${what}`);
  if (!ok) failures.push(what);
}

// Records every response of 400 or more and every console error on a page (a missing favicon shows up here).
function watchErrors(page, failures) {
  page.on("response", (r) => { if (r.status() >= 400) report(failures, `${r.status()} ${r.url()}`, false); });
  page.on("console", (m) => { if (m.type() === "error") report(failures, `console error on ${page.url()}: ${m.text()}`, false); });
}

// The static server has no Pages Functions, so /api/feedback is answered by the
// one handler in scripts/lib/feedback-mock.mjs: with no bindings, GET gets the
// real Function's "not accepting" reply and any other method still 404s and
// fails the run. The form walk-through uses the same handler with bindings.
const stubFeedbackApi = (page) => routeFeedbackApi(page, null);

// A page of the given width on the static server, with the feedback stub and the error watch.
async function watchedPage(browser, width, failures) {
  const page = await browser.newPage({ viewport: { width, height: 844 } });
  await stubFeedbackApi(page);
  watchErrors(page, failures);
  return page;
}

// Types a search and returns the counter text and the no-match message (null while hidden).
async function searchFor(page, query) {
  await page.fill(".search input[type=search]", query);
  return page.evaluate(() => {
    const e = document.querySelector(".search-empty");
    return { count: document.querySelector(".search .count").textContent, empty: e && !e.hidden ? e.textContent : null };
  });
}

// A search with no matches shows a message, and Clear search empties the box and hides it.
async function checkNoMatch(page, base, url, noun, failures) {
  await page.goto(base + url, { waitUntil: "load" });
  const r = await searchFor(page, "zzqqxx");
  report(failures, `${url} "zzqqxx": ${r.count}; message: ${r.empty}`, r.count === `0 ${noun} shown` && (r.empty || "").includes(`No ${noun} match “zzqqxx”`));
  await page.click(".search-clear");
  const after = await page.evaluate(() => [document.querySelector(".search-empty").hidden, document.querySelector(".search input[type=search]").value]);
  report(failures, `${url} Clear search empties the box and hides the message`, after[0] === true && after[1] === "");
}

// With "Show next-release settings" unticked, the counter matches the header's release count.
async function checkSettingsCount(page, base, failures) {
  await page.goto(base + "/settings/", { waitUntil: "load" });
  const want = await page.evaluate(() => [...document.querySelectorAll("main p")].find((p) => / settings in v/.test(p.textContent)).querySelector("strong").textContent);
  // Right after a release there's no next-release box (nothing to hide): the count is the release's either way.
  if (await page.$('.search input[data-filter="next"]')) await page.uncheck('.search input[data-filter="next"]');
  const r = await searchFor(page, "");
  report(failures, `/settings/ next release hidden: "${r.count}" (header ${want})`, r.count === `${want} settings shown`);
}

// A Commands search shows rows, not just a count: groups with a match open, the rest are hidden.
async function checkCommandRows(page, base, failures) {
  await page.goto(base + "/commands/", { waitUntil: "load" });
  const r = await searchFor(page, "reset");
  const rows = await page.evaluate(() => ({
    visible: [...document.querySelectorAll("tr.cmd")].filter((tr) => tr.getClientRects().length).length,
    collapsed: [...document.querySelectorAll(".cmd-group")].filter((g) => !g.hidden && g.classList.contains("collapsed")).length
  }));
  report(failures, `/commands/ "reset": ${r.count}; ${rows.visible} rows visible, ${rows.collapsed} shown groups still collapsed`, rows.visible > 0 && rows.collapsed === 0);
}

// Two quick clicks on a Copy button say "Copied" (announced in the status line), then the label comes back.
async function checkCopyButton(page, base, failures) {
  await page.goto(base + "/commands/", { waitUntil: "load" });
  await page.click("tbody button[aria-expanded]");
  const btn = page.locator("button.copy:visible").first();
  const before = await btn.textContent();
  await btn.dblclick();
  await page.waitForTimeout(200);
  const during = [await btn.textContent(), await page.locator(".sr-only[role=status]").textContent()];
  await page.waitForTimeout(1700);
  const after = await btn.textContent();
  report(failures, `/commands/ double-click on Copy: "${during[0]}" announced "${during[1]}", back to "${after}"`, during[0] !== before && during[1] === during[0] && after === before);
}

// With JavaScript off, the Menu button and the search boxes are hidden, and the nav and the full lists show.
async function checkNoScript(browser, base, failures) {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(base + "/commands/", { waitUntil: "load" });
  const r = await page.evaluate(() => ["nav-toggle", "search"].map((c) => getComputedStyle(document.querySelector("." + c)).display));
  const nav = await page.evaluate(() => getComputedStyle(document.getElementById("site-nav")).visibility);
  report(failures, `/commands/ without JavaScript: Menu ${r[0]}, search ${r[1]}, nav ${nav}`, r[0] === "none" && r[1] === "none" && nav === "visible");
  await context.close();
}

// The search checks for Commands and Settings, at 390px.
async function checkSearch(browser, base, failures) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await checkNoScript(browser, base, failures);
  await checkCommandRows(page, base, failures);
  await checkCopyButton(page, base, failures);
  await checkNoMatch(page, base, "/commands/", "commands", failures);
  await checkNoMatch(page, base, "/settings/", "settings", failures);
  await checkSettingsCount(page, base, failures);
  await page.close();
}

// Fails when the page as it opens (every section folded) doesn't fit the screen:
// everything above the footer must end inside the first screen, and nothing may
// start open except what the page marks open by default (data-open), which on
// a phone is folded too. Feedback is the exception: its form is the page.
async function fitsOneScreen(page, label, failures) {
  const r = await page.evaluate(() => {
    // The content's own end, not main's box (beside the sidebar, main is stretched to its height).
    const bottom = Math.round(Math.max(0, ...[...document.querySelector("main").children].map((el) => el.getBoundingClientRect().bottom + window.scrollY)));
    const open = document.querySelectorAll("main details[open]:not([data-open])").length;
    const small = window.matchMedia("(max-width: 559px)").matches;
    const openDefault = small ? document.querySelectorAll("main details[data-open][open]").length : 0;
    return { bottom, ih: window.innerHeight, open: open + openDefault };
  });
  const ok = r.bottom <= r.ih && r.open === 0;
  console.log(`${ok ? "ok  " : "FAIL"} ${label} fits one screen: content ends at ${r.bottom} of ${r.ih}${r.open ? `, ${r.open} section(s) open` : ""}`);
  if (!ok) failures.push(`${label} one screen`);
}

// The Menu button opens the nav as a drawer, and Escape closes it.
async function checkDrawer(page, base, url, failures) {
  await page.goto(base + url, { waitUntil: "load" });
  await page.click(".nav-toggle");
  const opened = await page.evaluate(() => {
    const nav = document.getElementById("site-nav");
    return nav.classList.contains("open") && getComputedStyle(nav).visibility === "visible" && document.querySelector(".nav-toggle").getAttribute("aria-expanded") === "true";
  });
  const stray = await tabStraysFromDrawer(page);
  await page.keyboard.press("Escape");
  const closed = await page.evaluate(() => !document.getElementById("site-nav").classList.contains("open"));
  report(failures, `${url} Menu opens the drawer and Escape closes it`, opened && closed);
  report(failures, `${url} with the drawer open, Tab stays in it (${stray} stops outside)`, stray === 0);
}

// Presses Tab 30 times in the open drawer and counts the stops outside it (the Menu button, the skip link and the body are fine).
async function tabStraysFromDrawer(page) {
  let stray = 0;
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press("Tab");
    stray += await page.evaluate(() => {
      const a = document.activeElement;
      return a === document.body || a.closest("#site-nav") || a.matches(".nav-toggle, .skip") ? 0 : 1;
    });
  }
  return stray;
}

// Fails when the page scrolls sideways.
async function noSideScroll(page, label, failures) {
  const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  const ok = sw <= iw;
  console.log(`${ok ? "ok  " : "FAIL"} ${label} scrollWidth ${sw} innerWidth ${iw}`);
  if (!ok) failures.push(label);
}

// The feedback form's steps, against SHOTS_BASE or the in-process mock.
async function feedbackFlow(browser, base, failures, distDir) {
  const report = fs.readFileSync(path.join(root, "test/fixtures/vg-errors-next.txt"), "utf8");
  console.log(process.env.SHOTS_BASE ? `feedback walk-through: ${base}` : "feedback walk-through: in-process Function + GitHub stub");
  const fillBug = async (page) => {
    await page.check("input[name=kind][value=bug]");
    await page.fill("#fb-title", "Raid frames go blank after a reload");
    await page.fill("#fb-report", report);
    await page.fill("#fb-did", "Typed /reload in a raid group.");
    await page.fill("#fb-happened", "The raid frames stayed empty until I left the group.");
    await page.check("#fb-public_ack");
    await page.click("#fb-form button[type=submit]");
    await page.waitForSelector("#fb-preview:not([hidden])");
    await page.waitForFunction(() => (document.querySelector("#fb-turnstile input[name=cf-turnstile-response]") || {}).value, null, { timeout: 30000 });
  };
  for (const width of [1280, 390]) {
    // A fresh context (and, without SHOTS_BASE, a fresh stub) for each width.
    const context = await browser.newContext();
    const mock = process.env.SHOTS_BASE ? null : await mockFeedback(context, distDir);
    const page = await context.newPage();
    await page.setViewportSize({ width, height: width === 390 ? 844 : 800 });
    // Failed requests (400 or more) and console errors fail the run here too,
    // with the in-process mock and with SHOTS_BASE alike.
    watchErrors(page, failures);
    const shot = async (name) => {
      const file = path.join(outDir, `feedback-${name}-${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      await noSideScroll(page, `feedback ${name} at ${width}px`, failures);
      console.log(`shot ${path.relative(process.cwd(), file)}`);
    };
    await page.goto(`${base}/feedback/`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.click("#fb-form button[type=submit]");
    await shot("errors");
    await page.check("input[name=kind][value=feature]");
    await shot("feature");
    await fillBug(page);
    await page.waitForTimeout(3500);
    await shot("preview");
    await page.click("#fb-send");
    await page.waitForSelector("#fb-done:not([hidden])", { timeout: 30000 });
    await shot("done");
    if (width === 390) {
      // The same bug again: added to the first report, with its own reference.
      await page.click("#fb-again");
      await fillBug(page);
      await page.click("#fb-send");
      await page.waitForSelector("#fb-done:not([hidden])", { timeout: 30000 });
      await shot("duplicate");
    }
    await context.close();
    if (mock) {
      console.log(`stub got ${mock.issues.length} issue(s), ${mock.issues.reduce((n, i) => n + i.comments.length, 0)} comment(s)`);
      mock.close();
    }
  }
}

// The languages the build published besides English.
function builtLocales(dir) {
  return LOCALES.filter((l) => fs.existsSync(path.join(dir, l.code, "index.html")));
}

// The no-match message and the counter on a page in another language: neither is English.
async function checkLocaleSearch(page, base, loc, failures) {
  await page.goto(`${base}/${loc.code}/settings/`, { waitUntil: "load" });
  const r = await searchFor(page, "zzqqxx");
  const want = loc.strings["js.noMatch"].replace("{q}", "zzqqxx");
  report(failures, `/${loc.code}/settings/ "zzqqxx": ${r.count}; message: ${r.empty}`, !/ shown$/.test(r.count) && (r.empty || "").startsWith(want));
}

// The language select opens the same page in the language picked, keeping the section link.
async function checkLangSelect(page, base, loc, failures) {
  await page.goto(`${base}/settings/#general`, { waitUntil: "load" });
  await page.selectOption("#lang-select", `/${loc.code}/settings/`);
  await page.waitForURL(`**/${loc.code}/settings/**`, { timeout: 5000 }).catch(() => {});
  const r = await page.evaluate(() => [location.pathname + location.hash, document.documentElement.lang]);
  report(failures, `language select on /settings/#general opens ${r[0]} (lang ${r[1]})`, r[0] === `/${loc.code}/settings/#general` && r[1] === loc.lang);
}

// At 390px the header's language button opens its list without sideways scroll, and a
// pick opens the same page in that language, keeping the section link.
async function checkLangMenu(page, base, loc, failures) {
  await page.goto(`${base}/settings/#general`, { waitUntil: "load" });
  await page.click(".lang-menu summary");
  await noSideScroll(page, `/settings/ language list open at 390px`, failures);
  await page.click(`.lang-menu-list a[lang="${loc.lang}"]`);
  await page.waitForURL(`**/${loc.code}/settings/**`, { timeout: 5000 }).catch(() => {});
  const r = await page.evaluate(() => [location.pathname + location.hash, document.documentElement.lang]);
  report(failures, `language button on /settings/#general opens ${r[0]} (lang ${r[1]})`, r[0] === `/${loc.code}/settings/#general` && r[1] === loc.lang);
}

// The offer never covers the open drawer's language select, nor a footer link once it has focus.
async function checkOfferClear(page, failures) {
  await page.click(".nav-toggle");
  await page.locator("#lang-select").scrollIntoViewIfNeeded();
  const hit = await page.evaluate(() => {
    const r = document.getElementById("lang-select").getBoundingClientRect();
    return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.id;
  });
  await page.keyboard.press("Escape");
  let covered = 0;
  for (const link of await page.$$(".site-footer a")) {
    await link.focus();
    covered += await page.evaluate(() => {
      const a = document.activeElement.getBoundingClientRect(), o = document.querySelector(".lang-offer").getBoundingClientRect();
      return a.left >= o.left && a.right <= o.right && a.top >= o.top && a.bottom <= o.bottom ? 1 : 0;
    });
  }
  report(failures, "the language offer leaves the drawer's select and every focused footer link uncovered", hit === "lang-select" && covered === 0);
}

// A browser asking for the language gets one offer on an English page, and none once it is turned down.
async function checkLangOffer(browser, base, loc, failures) {
  const context = await browser.newContext({ locale: loc.lang, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/install/`, { waitUntil: "load" });
  const offer = await page.evaluate(() => document.querySelector(".lang-offer a")?.textContent || null);
  report(failures, `a ${loc.lang} browser on /install/ is offered "${offer}"`, offer === loc.strings["lang.offer"]);
  if (offer) await checkOfferClear(page, failures);
  if (offer) await page.click(".lang-offer button");
  await page.goto(`${base}/start/`, { waitUntil: "load" });
  const again = await page.evaluate(() => !!document.querySelector(".lang-offer"));
  report(failures, `after "${loc.strings["lang.dismiss"]}" no offer on /start/`, !again);
  await context.close();
}

// A Latin American Spanish browser (es-419) is offered /es-mx/, and the offer keeps the section link.
async function checkSpanishRegionOffer(browser, base, loc, failures) {
  const context = await browser.newContext({ locale: "es-419", viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/install/#by-hand`, { waitUntil: "load" });
  const href = await page.evaluate(() => document.querySelector(".lang-offer a")?.getAttribute("href") || null);
  report(failures, `an es-419 browser on /install/#by-hand is offered ${href}`, href === `/${loc.code}/install/#by-hand`);
  await context.close();
}

// At 320px no page of the language scrolls sideways, folded or with every section open.
async function checkNarrowest(browser, base, loc, failures) {
  const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
  for (const n of NAV) {
    await page.goto(`${base}/${loc.code}${n.path}`, { waitUntil: "load" });
    await noSideScroll(page, `/${loc.code}${n.path} at 320px folded`, failures);
    await page.evaluate(() => document.querySelectorAll("main details").forEach((d) => { d.open = true; }));
    await noSideScroll(page, `/${loc.code}${n.path} at 320px all open`, failures);
  }
  await page.close();
}

// From 560px up, no line of the page title runs under the Expand all button.
async function checkTitleClear(browser, base, loc, failures) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  let under = 0;
  for (const n of NAV) {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${base}/${loc.code}${n.path}`, { waitUntil: "load" });
    if (!(await page.$(".expand-all"))) continue;
    for (let width = 560; width <= 1280; width += 80) {
      await page.setViewportSize({ width, height: 800 });
      under += await page.evaluate(() => {
        const b = document.querySelector(".expand-all").getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(document.querySelector(".page-title"));
        return [...range.getClientRects()].some((q) => q.width && q.left < b.right && q.right > b.left && q.top < b.bottom && q.bottom > b.top) ? 1 : 0;
      });
    }
  }
  report(failures, `/${loc.code}/ titles stay clear of Expand all from 560 to 1280px (${under} overlaps)`, under === 0);
  await page.close();
}

// Every check of one published language, with screenshots of its Settings and Commands.
async function checkLanguage(browser, base, loc, failures) {
  for (const [width, height] of [[1280, 800], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await stubFeedbackApi(page);
    for (const n of NAV.filter((x) => x.path !== "/feedback/")) {
      await page.goto(`${base}/${loc.code}${n.path}`, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      await fitsOneScreen(page, `/${loc.code}${n.path} at ${width}x${height}`, failures);
      if (width === 390) await noSideScroll(page, `/${loc.code}${n.path} at ${width}px`, failures);
    }
    for (const name of ["settings", "commands"]) {
      await page.goto(`${base}/${loc.code}/${name}/`, { waitUntil: "load" });
      const file = path.join(outDir, `${loc.code}-${name}-${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`shot ${path.relative(process.cwd(), file)}`);
    }
    if (width === 390) {
      await checkLocaleSearch(page, base, loc, failures);
      await checkLangMenu(page, base, loc, failures);
    } else await checkLangSelect(page, base, loc, failures);
    await page.close();
  }
  await checkLangOffer(browser, base, loc, failures);
  if (loc.code === "es-mx") await checkSpanishRegionOffer(browser, base, loc, failures);
  await checkNarrowest(browser, base, loc, failures);
  await checkTitleClear(browser, base, loc, failures);
}

// Entry point.
async function main() {
  const server = await serve(loadConfig().outDir, Number(process.env.SHOTS_PORT || 0));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ executablePath: browserPath() });
  const failures = [];
  fs.mkdirSync(outDir, { recursive: true });
  try {
    for (const width of [390, 360]) {
      const page = await watchedPage(browser, width, failures);
      for (const n of NAV) {
        await page.goto(base + n.path, { waitUntil: "load" });
        await noSideScroll(page, `${n.path} at ${width}px`, failures);
      }
      await page.close();
    }
    // Skip link, with real keyboard focus: first Tab, then Enter.
    {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      for (const n of NAV) {
        await page.goto(base + n.path, { waitUntil: "load" });
        await page.keyboard.press("Tab");
        const first = await page.evaluate(() => document.activeElement?.matches("a.skip[href='#main']") || false);
        await page.keyboard.press("Enter");
        await page.waitForFunction(() => location.hash === "#main", null, { timeout: 2000 }).catch(() => {});
        const toMain = await page.evaluate(() => document.activeElement === document.querySelector("main#main"));
        const ok = first && toMain;
        console.log(`${ok ? "ok  " : "FAIL"} skip link ${n.path} first Tab: ${first ? "skip link" : "something else"}, Enter: ${toMain ? "focus on main" : "focus not on main"}`);
        if (!ok) failures.push(`skip link on ${n.path}`);
      }
      await page.close();
    }
    // One screen as it opens, at desktop and phone sizes; and the drawer on the phone.
    for (const [width, height] of [[1280, 800], [390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      await stubFeedbackApi(page);
      for (const n of NAV.filter((x) => x.path !== "/feedback/")) {
        await page.goto(base + n.path, { waitUntil: "load" });
        await page.evaluate(() => document.fonts.ready);
        await fitsOneScreen(page, `${n.path} at ${width}x${height}`, failures);
      }
      if (width === 390) await checkDrawer(page, base, "/features/", failures);
      await page.close();
    }
    await checkSearch(browser, base, failures);
    for (const loc of builtLocales(loadConfig().outDir)) await checkLanguage(browser, base, loc, failures);
    for (const width of [1280, 390]) {
      const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 800 } });
      await stubFeedbackApi(page);
      for (const [name, url] of SHOOT) {
        await page.goto(base + url, { waitUntil: "load" });
        await page.evaluate(() => document.fonts.ready);
        const file = path.join(outDir, `${name}-${width}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log(`shot ${path.relative(process.cwd(), file)}`);
      }
      await page.close();
    }
    await feedbackFlow(browser, (process.env.SHOTS_BASE || base).replace(/\/+$/, ""), failures, loadConfig().outDir);
  } finally {
    await browser.close();
    server.close();
  }
  if (failures.length) {
    console.error(`failed: ${failures.join(", ")}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
