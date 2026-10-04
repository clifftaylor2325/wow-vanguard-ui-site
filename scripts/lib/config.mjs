// Loads site.config.json and applies environment overrides.
//   FUI_SRC      path to a local clone of the addon repo (default: .cache/wow-forever-ui)
//   FUI_REF      commit or branch of the addon source to document (default: the pinned sourceRef)
//   FUI_RELEASE  release tag to host and document as "the current download" (default: latest)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

// The merged config, with absolute paths.
export function loadConfig() {
  const raw = JSON.parse(fs.readFileSync(path.join(root, "site.config.json"), "utf8"));
  const cacheDir = path.resolve(root, raw.cacheDir);
  return {
    ...raw,
    sourcePath: path.resolve(root, process.env.FUI_SRC || raw.sourcePath),
    sourceRef: process.env.FUI_REF || raw.sourceRef,
    release: process.env.FUI_RELEASE || raw.release,
    cacheDir,
    outDir: path.resolve(root, raw.outDir),
    releaseJson: path.join(cacheDir, "release.json"),
    releaseDir: path.join(cacheDir, "release"),
  };
}
