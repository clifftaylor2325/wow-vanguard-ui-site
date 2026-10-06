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
  await page.uncheck('.search input[data-filter="next"]');
  const r = await searchFor(page, "");
  report(failures, `/settings/ next release hidden: "${r.count}" (header ${want})`, r.count === `${want} settings shown`);
}

// The search checks for Commands and Settings, at 390px.
async function checkSearch(browser, base, failures) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
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
  await page.keyboard.press("Escape");
  const closed = await page.evaluate(() => !document.getElementById("site-nav").classList.contains("open"));
  report(failures, `${url} Menu opens the drawer and Escape closes it`, opened && closed);
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
