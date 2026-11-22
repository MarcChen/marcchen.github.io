#!/usr/bin/env node

/**
 * Upload the timelapse clips to Cloudinary.
 *
 * The MP4s are deliberately NOT committed: they are build inputs, like
 * photos/ is for stills. `src/data/timelapses.json` holds the resulting
 * absolute delivery URLs, so the site works regardless of whether
 * NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set at build time.
 *
 * Usage:
 *   npm run videos:upload             (upload everything in videos/)
 *   npm run videos:upload -- --dry-run
 *   npm run videos:upload -- --overwrite
 */

import { existsSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import cloudinary from "cloudinary";
import "dotenv/config";

const SOURCE_DIR = path.join(process.cwd(), "videos");

/** Cloudinary folder prefix – must match the URLs in src/data/timelapses.json */
const FOLDER_PREFIX = "portfolio/videos";

const VIDEO_EXTS = new Set([".mp4", ".mov", ".webm"]);

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const OVERWRITE = args.includes("--overwrite");

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

try {
  await cloudinary.v2.api.ping();
} catch {
  console.error(
    "Cloudinary credentials not configured.\n" +
      "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET " +
      "(or CLOUDINARY_URL) in your .env file.",
  );
  process.exit(1);
}

function log(label, msg) {
  console.log(`  ${label.padEnd(10)} ${msg}`);
}

async function main() {
  if (!existsSync(SOURCE_DIR)) {
    console.error(`No videos/ directory at ${SOURCE_DIR}`);
    process.exit(1);
  }

  const entries = (await readdir(SOURCE_DIR, { withFileTypes: true }))
    .filter((e) => e.isFile() && VIDEO_EXTS.has(path.extname(e.name).toLowerCase()))
    .map((e) => e.name)
    .sort();

  if (entries.length === 0) {
    console.error("videos/ contains no uploadable files.");
    process.exit(1);
  }

  console.log(`\nUploading ${entries.length} clip(s) to Cloudinary …\n`);

  const urls = {};

  for (const name of entries) {
    const filePath = path.join(SOURCE_DIR, name);
    const publicId = `${FOLDER_PREFIX}/${name.replace(/\.[^/.]+$/, "")}`;

    if (DRY_RUN) {
      log("DRY-RUN", `${name} -> ${publicId}`);
      continue;
    }

    if (!OVERWRITE) {
      try {
        const existing = await cloudinary.v2.api.resource(publicId, {
          resource_type: "video",
        });
        if (existing) {
          log("SKIP", `${publicId}  (already exists)`);
          urls[name] = existing.secure_url;
          continue;
        }
      } catch (err) {
        const code = err.http_code || err.error?.http_code;
        if (code !== 404) {
          console.warn(`  Warning checking ${publicId}:`, err.message || err);
        }
      }
    }

    const { size } = await stat(filePath);
    const result = await cloudinary.v2.uploader.upload(filePath, {
      public_id: publicId,
      resource_type: "video",
      overwrite: OVERWRITE,
      eager: [{ format: "mp4", quality: "auto" }],
      eager_async: false,
    });

    urls[name] = result.secure_url;
    log("UPLOAD", `${publicId}  (${(size / 1024 / 1024).toFixed(2)} MB in, ` +
      `${(result.bytes / 1024 / 1024).toFixed(2)} MB stored)`);
  }

  if (DRY_RUN) {
    console.log("\nDry run — nothing uploaded.\n");
    return;
  }

  console.log("\nDelivery URLs (paste into src/data/timelapses.json):\n");
  for (const [name, url] of Object.entries(urls)) {
    console.log(`  ${name}\n    ${url}`);
  }
  console.log();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
