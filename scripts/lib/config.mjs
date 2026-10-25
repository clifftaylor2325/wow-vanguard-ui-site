// Loads site.config.json and applies environment overrides.
//   FUI_SRC      path to a local clone of the addon repo (default: .cache/wow-vanguard-ui)
//   FUI_REF      commit or branch of the addon source to document (default: the pinned sourceRef)
//   FUI_RELEASE  release tag to document as "the current release" (default: latest)
//   SITE_LOCALES languages to publish besides English, comma separated (default: `locales`;
//                "all" for every language scripts/lib/i18n-site.mjs knows, for tests and previews)
//   SITE_OUT     where the site is built (default: outDir)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALES } from "./i18n-site.mjs";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

// The languages to publish besides English: SITE_LOCALES when set, else the config's list.
function localeCodes(env, listed = []) {
  if (env === undefined) return listed;
  if (env.trim() === "all") return LOCALES.map((l) => l.code);
  return env.split(",").map((c) => c.trim()).filter(Boolean);
}

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
    outDir: path.resolve(root, process.env.SITE_OUT || raw.outDir),
    locales: localeCodes(process.env.SITE_LOCALES, raw.locales),
    releaseJson: path.join(cacheDir, "release.json"),
  };
}
