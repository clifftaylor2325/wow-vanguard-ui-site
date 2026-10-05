// Encoding checks shared by `npm run check:encoding` and the site tests:
// garbled characters (UTF-8 that was read as code page 437 or Windows-1252
// and saved again) and byte-order marks in the repo's text files.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Garbled sequences, written as escapes so this file can't trip its own check:
// U+0393 then U+00C7/U+00E5/U+00C4 (curly quotes, ellipsis, arrows read as code
// page 437), U+252C U+2556 (a middle dot, the same way), U+00E2 U+20AC (curly
// quotes read as Windows-1252), U+00C3 or U+00C2 then a Latin-1 character
// (accented letters, middle dot, no-break space) and U+FFFD (bytes that aren't UTF-8).
export const MOJIBAKE = /\u0393[\u00c7\u00e5\u00c4]|\u252c[\u2556\u2591]|\u00e2\u20ac|\u00c3[\^@-\u00bf]|\u00c2[\u00a0-\u00bf]|\ufffd/;

// Text files by extension or name; fonts, images and other binaries never match.
const TEXT = /\.(m?js|cjs|json|md|css|html?|txt|xml|svg|ya?ml|toml|example)$|(^|\/)(LICENSE|\.gitignore|\.gitattributes|\.editorconfig)$/i;

// True for a path the check reads (never anything under node_modules).
export function isTextPath(p) {
  return TEXT.test(p) && !p.split("/").includes("node_modules");
}

// The repo's text files, tracked or new but not ignored, relative to root.
export function repoTextFiles(root) {
  const out = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd: root }).toString("utf8");
  return [...new Set(out.split("\0"))].filter((p) => p && isTextPath(p) && fs.existsSync(path.join(root, p)));
}

// What a file's first bytes say about its encoding, when that's a problem.
function bomOf(buf) {
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) return "UTF-8 byte-order mark (save without BOM)";
  if ((buf[0] === 0xff && buf[1] === 0xfe) || (buf[0] === 0xfe && buf[1] === 0xff)) return "UTF-16 file (save it as UTF-8)";
  return null;
}

// "name:line: problem" for a byte-order mark and for each line with garbled characters.
export function encodingProblems(buf, name) {
  const bom = bomOf(buf);
  if (bom && bom.startsWith("UTF-16")) return [`${name}:1: ${bom}`];
  const lines = buf.toString("utf8").split("\n");
  const garbled = lines.flatMap((l, i) => (MOJIBAKE.test(l) ? [`${name}:${i + 1}: garbled characters`] : []));
  return bom ? [`${name}:1: ${bom}`, ...garbled] : garbled;
}

// Every problem in a list of files (paths relative to root).
export function scanFiles(root, files) {
  return files.flatMap((f) => encodingProblems(fs.readFileSync(path.join(root, f)), f.split(path.sep).join("/")));
}
