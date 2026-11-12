#!/usr/bin/env node
// A tiny static server for dist/ (local preview and the screenshot script).
//   node scripts/serve.mjs [port]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./lib/config.mjs";

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".ttf": "font/ttf", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8", ".zip": "application/zip", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp", ".md": "text/markdown; charset=utf-8", ".xml": "application/xml; charset=utf-8" };

// The file a request URL names inside root: its path, 400 for a URL that can't be decoded, 403 for one that
// leaves root (a sibling folder that starts with root's name leaves it too).
export function resolveInside(root, url) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(url, "http://x").pathname);
  } catch {
    return 400;
  }
  const file = path.resolve(root, "." + pathname);
  return file === root || file.startsWith(root + path.sep) ? file : 403;
}

// Starts serving dir on port (0 = any free port); resolves to the server.
export function serve(dir, port = 0) {
  const root = path.resolve(dir);
  const server = http.createServer((req, res) => {
    const target = resolveInside(root, req.url);
    if (typeof target === "number") return res.writeHead(target).end();
    let file = target;
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) {
      res.writeHead(404, { "content-type": TYPES[".html"] });
      return res.end(fs.existsSync(path.join(dir, "404.html")) ? fs.readFileSync(path.join(dir, "404.html")) : "Not found");
    }
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const s = await serve(loadConfig().outDir, Number(process.argv[2] || 8788));
  console.log(`serving dist/ at http://127.0.0.1:${s.address().port}/`);
}
