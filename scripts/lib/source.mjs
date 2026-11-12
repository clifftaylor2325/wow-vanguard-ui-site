// Reads addon files from git at a fixed ref (never the working tree), so the
// site always documents an exact, reproducible commit.
import { execFileSync } from "node:child_process";

// A string table lookup, L["…"] or ns.L["…"] (either quote), with its key.
const L_LOOKUP = /(?<![\w.])(?:ns\.)?L\[\s*("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')\s*\]/g;

// Lua source with each string table lookup replaced by its English key, so the
// extractors read L["Experience bar"] as the literal "Experience bar" they always read.
export function unwrapLocale(text) {
  return text.replace(L_LOOKUP, "$1");
}

// A reader for one ref of the repo at repoPath: read(file) -> text or null.
// Lua files come back with their string table lookups unwrapped (unwrapLocale).
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
    if (text != null && /\.lua$/i.test(file)) text = unwrapLocale(text);
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
    .map((l) => l.trim().replace(/(\s*\[[^\]]*\])+$/, ""))
    .filter((l) => l && !l.startsWith("#") && /\.lua$/i.test(l))
    .map((l) => l.replace(/\\/g, "/"));
}

// The files only one client loads: the TOC line allows `allowed` and excludes `excluded` (game types).
function tocLoadedOnlyOn(tocText, allowed, excluded) {
  const out = new Set();
  for (const raw of tocText.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line.includes(`[AllowLoadGameType ${allowed}]`) || !line.includes(`[ExcludeLoadGameType ${excluded}]`)) continue;
    out.add(line.replace(/(\s*\[[^\]]*\])+$/, "").replace(/\\/g, "/"));
  }
  return out;
}

// The files only the Retail client loads: the TOC line allows `standard` and excludes `camelot` (WoW Forever).
export function tocRetailOnly(tocText) {
  return tocLoadedOnlyOn(tocText, "standard", "camelot");
}

// The files only WoW Forever loads: the TOC line allows `camelot` and excludes `standard` (Retail).
export function tocForeverOnly(tocText) {
  return tocLoadedOnlyOn(tocText, "camelot", "standard");
}

// "## Key: value" metadata from the TOC.
export function tocMeta(tocText) {
  const meta = {};
  for (const m of tocText.matchAll(/^##\s*([\w-]+):\s*(.*?)\s*$/gm)) meta[m[1]] = m[2];
  return meta;
}
