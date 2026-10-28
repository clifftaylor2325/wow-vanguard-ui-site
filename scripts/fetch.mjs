#!/usr/bin/env node
// Gets everything the build reads from the (private) addon repo into .cache/:
//   - a clone of the addon repo (or uses FUI_SRC), with the pinned sourceRef present
//   - the release metadata for every release (tag, date, notes)
// The site doesn't host or download the release zip: Vanguard is going to be
// installed through CurseForge, so only release metadata is read.
// Needs the GitHub CLI (gh) signed in, or GH_TOKEN / GITHUB_TOKEN in the
// environment. Nothing is ever pushed to the addon repo; the token is never printed.
//
//   node scripts/fetch.mjs [--force]
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { loadConfig } from "./lib/config.mjs";

const cfg = loadConfig();
const force = process.argv.includes("--force");
const env = { ...process.env };
if (!env.GH_TOKEN && env.GITHUB_TOKEN) env.GH_TOKEN = env.GITHUB_TOKEN;

// Runs a command quietly and returns stdout; errors never echo the environment.
function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { env, stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 << 20, ...opts }).toString();
}

// git, authenticating (if needed) through gh's credential helper, which reads GH_TOKEN.
function git(args, cwd) {
  return run("git", ["-c", "credential.helper=", "-c", "credential.helper=!gh auth git-credential", ...args], { cwd });
}

// True when the clone has the commit.
function hasCommit(ref) {
  try {
    run("git", ["cat-file", "-e", `${ref}^{commit}`], { cwd: cfg.sourcePath });
    return true;
  } catch {
    return false;
  }
}

// Makes sure a clone with the pinned source ref (and every release tag) exists.
function ensureSource() {
  if (!fs.existsSync(path.join(cfg.sourcePath, ".git"))) {
    console.log(`cloning ${cfg.addonRepo} into ${path.relative(process.cwd(), cfg.sourcePath)}`);
    fs.mkdirSync(path.dirname(cfg.sourcePath), { recursive: true });
    run("gh", ["repo", "clone", cfg.addonRepo, cfg.sourcePath, "--", "--quiet"]);
  }
  if (!hasCommit(cfg.sourceRef) || force) git(["fetch", "--quiet", "--tags", "origin"], cfg.sourcePath);
  if (!hasCommit(cfg.sourceRef)) throw new Error(`the addon clone has no commit ${cfg.sourceRef}`);
}

// Release metadata for every release, newest first, and which one players get.
function fetchReleases() {
  const list = JSON.parse(run("gh", ["release", "list", "-R", cfg.addonRepo, "--limit", "50", "--json", "tagName,isLatest,isDraft,isPrerelease,publishedAt"]));
  const published = list.filter((r) => !r.isDraft);
  const releases = published.map((r) => JSON.parse(run("gh", ["release", "view", r.tagName, "-R", cfg.addonRepo, "--json", "tagName,name,publishedAt,body,isPrerelease"])));
  const latest = cfg.release === "latest" ? (published.find((r) => r.isLatest) || published[0])?.tagName : cfg.release;
  if (!latest) throw new Error("the addon repo has no published release");
  for (const r of releases) delete r.assets;
  return { current: latest, releases };
}

// Entry point.
function main() {
  ensureSource();
  const meta = fetchReleases();
  // A clone made before the newest release has no tag for it yet.
  if (!hasCommit(meta.current)) git(["fetch", "--quiet", "--tags", "origin"], cfg.sourcePath);
  if (!hasCommit(meta.current)) throw new Error(`the addon clone has no tag ${meta.current}`);
  fs.mkdirSync(cfg.cacheDir, { recursive: true });
  fs.writeFileSync(cfg.releaseJson, JSON.stringify(meta, null, 2));
  console.log(`source ${cfg.sourceRef.slice(0, 7)} · current release ${meta.current}`);
}

try {
  main();
} catch (err) {
  const secret = env.GH_TOKEN;
  const msg = String(err.stderr || err.message || err);
  console.error("fetch failed:", secret ? msg.split(secret).join("***") : msg);
  process.exit(1);
}
