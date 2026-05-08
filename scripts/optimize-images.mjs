/**
 * Build-time local image optimisation script.
 *
 * Uses sharp (already installed via Next.js) to:
 *  1. Compress JPEG / PNG images
 *  2. Generate WebP copies alongside originals
 *  3. Resize oversized images to a max dimension
 *
 * Designed to run before `next build` so that the smallest reasonable
 * files are committed.  Cloudinary will apply its own optimisation layer
 * when the env var is set, but local compression keeps the repo lean.
 *
 * Usage:
 *   node scripts/optimize-images.mjs
 *
 * Dry-run (no writes):
 *   DRY_RUN=1 node scripts/optimize-images.mjs
 */

import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import "dotenv/config";

// ---- Config -----------------------------------------------------------

const SOURCE_DIRS = ["public/images"];

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 82;
const PNG_COMPRESSION = 8;
const GENERATE_WEBP = true;
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png"]);

// Skip files smaller than this (bytes) – only worth shrinking big ones
const MIN_SHRINK_BYTES = 50_000;

// ---- Helpers ----------------------------------------------------------

const ROOT = new URL("..", import.meta.url).pathname;
const dryRun = process.env.DRY_RUN === "1";

async function* walkImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkImages(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTS.has(ext)) {
        yield fullPath;
      }
    }
  }
}

function log(action, file, detail = "") {
  console.log(`  ${action.padEnd(8)} ${path.relative(ROOT, file)}${detail ? `  (${detail})` : ""}`);
}

// ---- Main -------------------------------------------------------------

async function optimize() {
  console.log(`\nScanning images in ${SOURCE_DIRS.join(", ")} ...\n`);

  let totalOriginalBytes = 0;
  let totalOptimizedBytes = 0;
  let processedCount = 0;
  let skippedCount = 0;

  for (const sourceDir of SOURCE_DIRS) {
    const absDir = path.join(ROOT, sourceDir);
    if (!existsSync(absDir)) {
      console.warn(`  Directory not found: ${sourceDir}`);
      continue;
    }

    for await (const filePath of walkImages(absDir)) {
      const st = await stat(filePath);
      const ext = path.extname(filePath).toLowerCase();

      if (st.size < MIN_SHRINK_BYTES) {
        skippedCount++;
        continue;
      }

      const originalSize = st.size;
      totalOriginalBytes += originalSize;

      const dir = path.dirname(filePath);
      const name = path.basename(filePath, ext);
      const webpPath = path.join(dir, `${name}.webp`);

      try {
        const image = sharp(await readFile(filePath));
        const meta = await image.metadata();

        let pipeline = image;
        if (meta.width > MAX_DIMENSION || meta.height > MAX_DIMENSION) {
          pipeline = pipeline.resize({
            width: MAX_DIMENSION,
            height: MAX_DIMENSION,
            fit: "inside",
            withoutEnlargement: true,
          });
        }

        if (ext === ".jpg" || ext === ".jpeg") {
          pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
        } else if (ext === ".png") {
          pipeline = pipeline.png({ compressionLevel: PNG_COMPRESSION, palette: true });
        }

        const optimizedBuffer = await pipeline.toBuffer();
        const optimizedSize = optimizedBuffer.length;

        if (optimizedSize >= originalSize) {
          log("SKIP    ", filePath, `already optimal (${(originalSize / 1024).toFixed(0)}K)`);
          skippedCount++;
          continue;
        }

        if (!dryRun) {
          await writeFile(filePath, optimizedBuffer);
        }

        log("COMPRESS", filePath, `${(originalSize / 1024).toFixed(0)}K -> ${(optimizedSize / 1024).toFixed(0)}K`);

        if (GENERATE_WEBP) {
          const webpBuffer = await sharp(optimizedBuffer)
            .webp({ quality: JPEG_QUALITY })
            .toBuffer();

          if (!dryRun) {
            await writeFile(webpPath, webpBuffer);
          }

          log("WEBP   ", webpPath, `${(webpBuffer.length / 1024).toFixed(0)}K`);
        }

        totalOptimizedBytes += optimizedSize;
        processedCount++;
      } catch (err) {
        console.error(`  Error processing ${path.relative(ROOT, filePath)}:`, err.message);
      }
    }
  }

  const saved = totalOriginalBytes - totalOptimizedBytes;
  const pct = totalOriginalBytes > 0 ? ((saved / totalOriginalBytes) * 100).toFixed(1) : "0.0";
  console.log(`\nDone. ${processedCount} optimised, ${skippedCount} skipped (already small).`);
  console.log(`   ${(saved / 1024).toFixed(0)}K saved (${pct}% reduction)`);
  if (dryRun) console.log("   DRY RUN - no files were written.\n");
}

optimize().catch((err) => {
  console.error(err);
  process.exit(1);
});
