#!/usr/bin/env node

/**
 * Site verification & non-regression test suite.
 *
 * Verifies:
 * 1. TypeScript compilation (`npx tsc --noEmit`) unless `--skip-typecheck`.
 * 2. Static export build (`npx next build`) if `--build` or `out/` is missing.
 * 3. Every HTML route returns HTTP 200.
 * 4. Every referenced local image/video/poster asset loads with HTTP 200,
 *    non-zero bytes, and a valid media content-type.
 * 5. Non-regression invariants (color-scheme meta, skip link + #main-content,
 *    html[lang], explicit button[type], no broken Markdown image titles).
 *
 * Usage:
 *   node scripts/verify-site.mjs [--build] [--skip-typecheck] [--check-external] [--url http://localhost:3000]
 */

import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "out");
const args = new Set(process.argv.slice(2));

const urlArgIndex = process.argv.indexOf("--url");
const externalBaseUrl = urlArgIndex !== -1 ? process.argv[urlArgIndex + 1] : null;
const shouldBuild = args.has("--build");
const skipTypecheck = args.has("--skip-typecheck");
const checkExternal = args.has("--check-external");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
};

function walkHtmlFiles(dir, base = "") {
  const routes = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.posix.join(base, entry.name);
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      routes.push(...walkHtmlFiles(full, rel));
    } else if (entry.name === "index.html") {
      const route = base ? `/${base}/` : "/";
      routes.push(route);
    }
  }
  return routes.sort();
}

function startStaticServer(rootDir) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const reqPath = decodeURIComponent((req.url || "/").split("?")[0]);
      let filePath = path.join(rootDir, reqPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        res.writeHead(404);
        res.end("Not Found");
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${addr.port}` });
    });
  });
}

function extractMatches(html, regex) {
  const results = [];
  for (const match of html.matchAll(regex)) {
    results.push(match[1]);
  }
  return results;
}

async function main() {
  const failures = [];

  if (!skipTypecheck) {
    console.log("1/4 Running TypeScript check (tsc --noEmit)...");
    execSync("npx tsc --noEmit", { cwd: ROOT, stdio: "inherit" });
  }

  if (!externalBaseUrl && (shouldBuild || !fs.existsSync(OUT_DIR))) {
    console.log("2/4 Building static export (npx next build)...");
    execSync("npx next build", { cwd: ROOT, stdio: "inherit" });
  }

  let serverHandle = null;
  let baseUrl = externalBaseUrl;
  let routes = [];

  if (!baseUrl) {
    if (!fs.existsSync(OUT_DIR)) {
      throw new Error("out/ directory not found. Run with --build or run `npm run build` first.");
    }
    routes = walkHtmlFiles(OUT_DIR);
    serverHandle = await startStaticServer(OUT_DIR);
    baseUrl = serverHandle.baseUrl;
  } else {
    routes = ["/en/", "/fr/", "/zh-cn/", "/en/blog/", "/en/photos/"];
  }

  console.log(`3/4 Verifying ${routes.length} routes and all media assets against ${baseUrl}...`);

  const checkedAssets = new Map();
  let totalAssetRefs = 0;

  try {
    // If testing against a live dev server without out/, discover blog post slugs from /en/blog/
    if (externalBaseUrl) {
      const blogRes = await fetch(`${baseUrl}/en/blog/`);
      if (blogRes.ok) {
        const blogHtml = await blogRes.text();
        const slugs = new Set(extractMatches(blogHtml, /href="(\/(?:en|fr|zh-cn)\/blog\/[^"]+\/?)"/g));
        for (const s of slugs) {
          if (!routes.includes(s)) routes.push(s);
        }
      }
    }

    for (const route of routes) {
      const pageRes = await fetch(`${baseUrl}${route}`);
      if (!pageRes.ok) {
        failures.push(`Route ${route} returned HTTP ${pageRes.status}`);
        continue;
      }
      const html = await pageRes.text();
      if (!html || html.length < 100) {
        failures.push(`Route ${route} returned empty or truncated HTML`);
        continue;
      }

      // Skip redirect/404 shells outside [locale] layout
      if (route !== "/" && route !== "/404/" && !route.startsWith("/_not-found")) {
        if (!/<html[^>]+lang="/i.test(html)) {
          failures.push(`${route}: missing lang attribute on <html>`);
        }
        if (!/<meta[^>]+name="color-scheme"[^>]+content="light dark"/i.test(html)) {
          failures.push(`${route}: missing <meta name="color-scheme" content="light dark">`);
        }
        if (!html.includes('href="#main-content"') || !html.includes('id="main-content"')) {
          failures.push(`${route}: missing skip link (#main-content) or <main id="main-content">`);
        }
      }

      // Check every <button ...> has explicit type=
      for (const btnMatch of html.matchAll(/<button\b([^>]*)>/gi)) {
        const attrs = btnMatch[1];
        if (!/\btype\s*=\s*"(button|submit|reset)"/i.test(attrs)) {
          failures.push(`${route}: <button> missing explicit type attribute (${btnMatch[0].slice(0, 80)})`);
        }
      }

      // Check for unstripped Markdown image titles inside src=""
      for (const src of extractMatches(html, /<(?:img|video|source)\b[^>]*\bsrc="([^"]*)"/gi)) {
        if (/\s+"[^"]*"/.test(src) || src.trim() !== src) {
          failures.push(`${route}: malformed media src="${src}"`);
        }
      }

      // Collect all image, video, and poster assets
      const assetUrls = [
        ...extractMatches(html, /<img\b[^>]*\bsrc="([^"]+)"/gi),
        ...extractMatches(html, /<video\b[^>]*\bsrc="([^"]+)"/gi),
        ...extractMatches(html, /<video\b[^>]*\bdata-src="([^"]+)"/gi),
        ...extractMatches(html, /<video\b[^>]*\bposter="([^"]+)"/gi),
        ...extractMatches(html, /<video\b[^>]*\bdata-poster="([^"]+)"/gi),
        ...extractMatches(html, /<source\b[^>]*\bsrc="([^"]+)"/gi),
      ];

      const hasLocalPhotos = fs.existsSync(path.join(ROOT, "public", "photos"));

      for (const rawAsset of assetUrls) {
        if (!rawAsset || rawAsset.startsWith("data:")) continue;
        // Local /photos/* assets are gitignored unless `photos/` is present or Cloudinary is configured
        if (rawAsset.startsWith("/photos/") && !hasLocalPhotos) continue;
        totalAssetRefs += 1;

        const isExternal = rawAsset.startsWith("http://") || rawAsset.startsWith("https://");
        if (isExternal && !checkExternal) continue;

        const targetUrl = isExternal ? rawAsset : `${baseUrl}${rawAsset.startsWith("/") ? rawAsset : `/${rawAsset}`}`;
        if (!checkedAssets.has(targetUrl)) {
          try {
            const assetRes = await fetch(targetUrl, { signal: AbortSignal.timeout(5000) });
            const buf = await assetRes.arrayBuffer();
            const contentType = assetRes.headers.get("content-type") || "";
            const ok =
              assetRes.ok &&
              buf.byteLength > 0 &&
              (contentType.startsWith("image/") ||
                contentType.startsWith("video/") ||
                contentType.includes("octet-stream"));
            checkedAssets.set(targetUrl, { ok, status: assetRes.status, bytes: buf.byteLength, contentType });
            if (!ok) {
              failures.push(
                `${route}: broken asset ${rawAsset} (HTTP ${assetRes.status}, ${buf.byteLength}B, ${contentType})`
              );
            }
          } catch (err) {
            checkedAssets.set(targetUrl, { ok: false, error: err.message });
            failures.push(`${route}: failed to fetch asset ${rawAsset} (${err.message})`);
          }
        } else if (!checkedAssets.get(targetUrl).ok) {
          const prev = checkedAssets.get(targetUrl);
          failures.push(`${route}: broken asset ${rawAsset} (HTTP ${prev.status ?? "ERR"})`);
        }
      }
    }
  } finally {
    if (serverHandle) {
      serverHandle.server.close();
    }
  }

  console.log(`4/4 Checked ${routes.length} pages and ${checkedAssets.size} unique assets (${totalAssetRefs} total refs).`);

  if (failures.length > 0) {
    console.error("\nVerification FAILED:");
    for (const f of failures) {
      console.error(`  - ${f}`);
    }
    process.exit(1);
  }

  console.log("Verification PASSED: all routes, media assets, and non-regression checks succeeded.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
