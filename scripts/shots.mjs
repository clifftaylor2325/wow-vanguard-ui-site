#!/usr/bin/env node
// Checks every page for sideways scrolling at 390px and 360px wide, and takes
// full-page screenshots of Home, Install, Commands, Settings and Feedback at 1280px and 390px.
// Uses playwright-core with an installed Chrome/Chromium (set CHROME_PATH if
// it isn't found). Screenshots go to SHOTS_DIR (default: shots/).
// It also checks the skip link with the keyboard on every page: the first Tab
// must focus it, and Enter must move focus to <main id="main">.
// The local server listens on SHOTS_PORT (default: any free port).
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

// Entry point.
async function main() {
  const server = await serve(loadConfig().outDir, Number(process.env.SHOTS_PORT || 0));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ executablePath: browserPath() });
  const failures = [];
  fs.mkdirSync(outDir, { recursive: true });
  try {
    for (const width of [390, 360]) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      for (const n of NAV) {
        await page.goto(base + n.path, { waitUntil: "load" });
        const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
        const ok = sw <= iw;
        console.log(`${ok ? "ok  " : "FAIL"} ${width}px ${n.path} scrollWidth ${sw} innerWidth ${iw}`);
        if (!ok) failures.push(`${n.path} at ${width}px`);
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
