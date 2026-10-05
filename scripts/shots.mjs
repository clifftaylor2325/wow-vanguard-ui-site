#!/usr/bin/env node
// Checks every page for sideways scrolling at 390px and 360px wide, and takes
// full-page screenshots of Home, Install, Features, Commands, Settings,
// Feedback, Troubleshooting and Changelog at 1280px and 390px.
// Uses playwright-core with an installed Chrome/Chromium (set CHROME_PATH if
// it isn't found). Screenshots go to SHOTS_DIR (default: shots/).
//   npm run shots
// With SHOTS_BASE set to a running `npm run dev` (wrangler pages dev with the
// local GitHub stub, see README), it also walks the feedback form: field
// errors, the feature fields, the preview and the confirmation, at 1280px and
// 390px. Reports it sends go to the stub, never to GitHub.
//   SHOTS_BASE=http://localhost:8788 npm run shots
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { loadConfig, root } from "./lib/config.mjs";
import { serve } from "./serve.mjs";
import { NAV } from "./lib/html.mjs";

const CANDIDATES = [process.env.CHROME_PATH, "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "C:/Program Files/Google/Chrome/Application/chrome.exe"].filter(Boolean);
const outDir = path.resolve(root, process.env.SHOTS_DIR || "shots");
const SHOOT = [["home", "/"], ["install", "/install/"], ["features", "/features/"], ["commands", "/commands/"], ["settings", "/settings/"], ["feedback", "/feedback/"], ["help", "/help/"], ["changelog", "/changelog/"], ["start", "/start/"], ["profiles", "/profiles/"]];

// The first browser binary that exists.
function browserPath() {
  const p = CANDIDATES.find((c) => fs.existsSync(c));
  if (!p) throw new Error("no Chrome/Chromium found; set CHROME_PATH");
  return p;
}

// Fails when the page scrolls sideways.
async function noSideScroll(page, label, failures) {
  const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  const ok = sw <= iw;
  console.log(`${ok ? "ok  " : "FAIL"} ${label} scrollWidth ${sw} innerWidth ${iw}`);
  if (!ok) failures.push(label);
}

// The feedback form's steps against a running wrangler pages dev (SHOTS_BASE).
async function feedbackFlow(browser, base, failures) {
  const report = fs.readFileSync(path.join(root, "test/fixtures/fui-errors-next.txt"), "utf8");
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 800 } });
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
    await page.check("input[name=kind][value=bug]");
    await page.fill("#fb-title", "Raid frames go blank after a reload");
    await page.fill("#fb-report", report);
    await page.fill("#fb-did", "Typed /reload in a raid group.");
    await page.fill("#fb-happened", "The raid frames stayed empty until I left the group.");
    await page.check("#fb-public_ack");
    await page.click("#fb-form button[type=submit]");
    await page.waitForSelector("#fb-preview:not([hidden])");
    await page.waitForFunction(() => (document.querySelector("#fb-turnstile input[name=cf-turnstile-response]") || {}).value, null, { timeout: 30000 });
    await page.waitForTimeout(3500);
    await shot("preview");
    await page.click("#fb-send");
    await page.waitForSelector("#fb-done:not([hidden])", { timeout: 30000 });
    await shot("done");
    await page.close();
  }
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
      for (const n of NAV) {
        await page.goto(base + n.path, { waitUntil: "load" });
        await noSideScroll(page, `${n.path} at ${width}px`, failures);
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
    if (process.env.SHOTS_BASE) await feedbackFlow(browser, process.env.SHOTS_BASE.replace(/\/+$/, ""), failures);
  } finally {
    await browser.close();
    server.close();
  }
  if (failures.length) {
    console.error(`horizontal scroll on: ${failures.join(", ")}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
