#!/usr/bin/env node
// Fails when a text file in the repo has garbled characters or a byte-order
// mark, printing file:line for each. Part of `npm run check`.
//   npm run check:encoding
import { root } from "./lib/config.mjs";
import { repoTextFiles, scanFiles } from "./lib/encoding.mjs";

// Scans the repo's text files and sets the exit code.
function main() {
  const files = repoTextFiles(root);
  const problems = scanFiles(root, files);
  for (const p of problems) console.error(p);
  console.log(problems.length ? `encoding: ${problems.length} problem(s); see CONTRIBUTING.md` : `encoding: ${files.length} text files clean`);
  process.exitCode = problems.length ? 1 : 0;
}

main();
