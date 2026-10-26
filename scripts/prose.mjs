#!/usr/bin/env node
// The site's page prose in other languages (scripts/lib/i18n-prose/<code>.json): what each
// language lacks, what it keeps that no page uses any more, and what a translation got wrong.
// Run after a build (it reads .cache/prose.json, the lines the build looked up).
//   node scripts/prose.mjs              a count per language
//   node scripts/prose.mjs <code>       that language's problems, and the keys it lacks; exits 1 on any
import fs from "node:fs";
import path from "node:path";
import { loadConfig } from "./lib/config.mjs";
import { gitReader } from "./lib/source.mjs";
import { commandWords } from "./lib/commands.mjs";
import { LOCALES, proseOf, proseProblems } from "./lib/i18n-site.mjs";

const cfg = loadConfig();
const used = new Map(Object.entries(JSON.parse(fs.readFileSync(path.join(cfg.cacheDir, "prose.json"), "utf8"))));
const words = commandWords(gitReader(cfg.sourcePath, cfg.sourceRef).read("Core/Slash.lua"));

// One language's report: keys it lacks, keys no page uses, and each translation's problems.
function report(loc) {
  const own = proseOf(loc.code);
  const missing = [...used.keys()].filter((k) => !own.has(k));
  const stale = [...own.keys()].filter((k) => !used.has(k));
  const problems = [...own].filter(([k]) => used.has(k)).flatMap(([k, t]) => proseProblems(used.get(k), t, loc.lang, words).map((p) => `${k}\n    ${p}`));
  return { missing, stale, problems };
}

const code = process.argv[2];
if (!code) {
  for (const l of LOCALES) {
    const r = report(l);
    console.log(`${l.code}: ${used.size - r.missing.length}/${used.size} translated, ${r.stale.length} stale, ${r.problems.length} problems`);
  }
} else {
  const loc = LOCALES.find((l) => l.code === code) || (console.error(`unknown language ${code}`), process.exit(2));
  const r = report(loc);
  for (const [title, list] of [["problems", r.problems], ["stale (no page uses them)", r.stale], ["missing", r.missing]]) if (list.length) console.log(`${title}:\n  ${list.join("\n  ")}`);
  process.exit(r.problems.length + r.stale.length + r.missing.length ? 1 : 0);
}
