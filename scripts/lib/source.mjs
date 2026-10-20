// Reads addon files from git at a fixed ref (never the working tree), so the
// site always documents an exact, reproducible commit.
import { execFileSync } from "node:child_process";

// A reader for one ref of the repo at repoPath: read(file) -> text or null.
export function gitReader(repoPath, ref) {
  const cache = new Map();
  const read = (file) => {
    if (cache.has(file)) return cache.get(file);
    let text = null;
    try {
      text = execFileSync("git", ["show", `${ref}:${file}`], { cwd: repoPath, maxBuffer: 64 << 20, stdio: ["ignore", "pipe", "ignore"] }).toString("utf8");
    } catch {
      text = null;
    }
    cache.set(file, text);
    return text;
  };
  const readBuffer = (file) => execFileSync("git", ["show", `${ref}:${file}`], { cwd: repoPath, maxBuffer: 64 << 20 });
  // The file names in one folder at this ref ([] when it has none).
  const list = (dir) => {
    try {
      return execFileSync("git", ["ls-tree", "--name-only", `${ref}:${dir}`], { cwd: repoPath, stdio: ["ignore", "pipe", "ignore"] }).toString("utf8").split("\n").filter(Boolean);
    } catch {
      return [];
    }
  };
  const commit = execFileSync("git", ["rev-parse", `${ref}^{commit}`], { cwd: repoPath }).toString().trim();
  return { ref, commit, read, readBuffer, list };
}

// The files the TOC loads, in load order (Lua only).
export function tocFiles(tocText) {
  return tocText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && /\.lua$/i.test(l))
    .map((l) => l.replace(/\\/g, "/"));
}

// "## Key: value" metadata from the TOC.
export function tocMeta(tocText) {
  const meta = {};
  for (const m of tocText.matchAll(/^##\s*([\w-]+):\s*(.*?)\s*$/gm)) meta[m[1]] = m[2];
  return meta;
}
