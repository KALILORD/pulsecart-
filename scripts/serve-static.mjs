import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "storefront/out");
const port = Number(process.env.PORT ?? process.argv[3] ?? 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

async function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0] ?? "/");
  const relative = clean.replace(/^\/+/, "");
  const candidate = path.resolve(root, relative);

  if (!candidate.startsWith(root)) return null;

  try {
    const info = await stat(candidate);
    if (info.isFile()) return candidate;
    if (info.isDirectory()) {
      const index = path.join(candidate, "index.html");
      const indexInfo = await stat(index).catch(() => null);
      if (indexInfo?.isFile()) return index;
    }
  } catch {
    // Fall through to the extension-less / trailing-slash fallback.
  }

  if (!path.extname(relative)) {
    const index = path.join(candidate, "index.html");
    const indexInfo = await stat(index).catch(() => null);
    if (indexInfo?.isFile()) return index;
  }

  return null;
}

const server = createServer(async (request, response) => {
  const pathname = request.url ?? "/";
  const file = await resolveFile(pathname);

  if (!file) {
    const notFound = await readFile(path.join(root, "404.html")).catch(() => null);
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    response.end(notFound ?? "Not found");
    return;
  }

  const body = await readFile(file);
  const type = TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream";
  const cache =
    file.includes(`${path.sep}_next${path.sep}`) || file.includes(`${path.sep}products${path.sep}`)
      ? "public, max-age=31536000, immutable"
      : "no-cache";

  response.writeHead(200, { "Content-Type": type, "Cache-Control": cache });
  response.end(body);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Serving ${root} at http://127.0.0.1:${port}`);
});
