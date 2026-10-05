#!/usr/bin/env node
// Checks every page for sideways scrolling, failed requests and console errors at
// 390px and 360px wide, checks the Commands and Settings search, and takes
// full-page screenshots of Home, Install, Commands, Settings and Feedback at 1280px and 390px.
// Uses playwright-core with an installed Chrome/Chromium (set CHROME_PATH if
// it isn't found). Screenshots go to SHOTS_DIR (default: shots/).
//   npm run shots
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { loadConfig, root } from "./lib/config.mjs";
import { serve } from "./serve.mjs";
import { NAV } from "./lib/html.mjs";

const CANDIDATES = [process.env.CHROME_PATH, "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "C:/Program Files/Google/Chrome/Application/chrome.exe"].filter(Boolean);
const outDir = path.resolve(root, process.env.SHOTS_DIR || "shots");
const SHOOT = [["home", "/"], ["install", "/install/"], ["commands", "/commands/"], ["settings", "/settings/"], ["feedback", "/feedback/"]];

// The first browser binary that exists.
function browserPath() {
  const p = CANDIDATES.find((c) => fs.existsSync(c));
  if (!p) throw new Error("no Chrome/Chromium found; set CHROME_PATH");
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

// Entry point.
async function main() {
  const server = await serve(loadConfig().outDir);
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ executablePath: browserPath() });
  const failures = [];
  fs.mkdirSync(outDir, { recursive: true });
  try {
    for (const width of [390, 360]) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      watchErrors(page, failures);
      for (const n of NAV) {
        await page.goto(base + n.path, { waitUntil: "load" });
        const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
        const ok = sw <= iw;
        console.log(`${ok ? "ok  " : "FAIL"} ${width}px ${n.path} scrollWidth ${sw} innerWidth ${iw}`);
        if (!ok) failures.push(`${n.path} at ${width}px`);
      }
      await page.close();
    }
    await checkSearch(browser, base, failures);
    for (const width of [1280, 390]) {
      const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 800 } });
      for (const [name, url] of SHOOT) {
        await page.goto(base + url, { waitUntil: "load" });
        await page.evaluate(() => document.fonts.ready);
        const file = path.join(outDir, `${name}-${width}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log(`shot ${path.relative(process.cwd(), file)}`);
      }
      await page.close();
    }
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
