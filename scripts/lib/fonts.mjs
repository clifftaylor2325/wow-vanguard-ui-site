// The addon's bundled fonts the site serves. Each one ships as WOFF2 (made by
// `npm run fonts` into src/fonts/, committed) and as the addon's own TTF,
// which @font-face lists second as the fallback.
export const FONTS = ["FiraSansCondensed-Medium", "FiraSansCondensed-SemiBold"];

// Where the committed WOFF2 files live, relative to the repo root.
export const WOFF2_DIR = "src/fonts";
