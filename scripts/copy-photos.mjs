#!/usr/bin/env node

/**
 * Copy & compress photos from photos/ → public/photos/ and generate manifest.
 *
 * Features:
 *  - Compresses JPEG/PNG via sharp (q85 mozjpeg, max 2560px)
 *  - Reads photos/meta.json for global _copyright + per-photo title/caption/tags
 *  - Writes src/data/photos.json (committed, source of truth for the build)
 *
 * Usage:
 *   node scripts/copy-photos.mjs
 *   DRY_RUN=1 node scripts/copy-photos.mjs
 */

import { existsSync } from "node:fs";
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import "dotenv/config";

// ---- Config ---------------------------------------------------------------

const SOURCE_DIR = path.join(process.cwd(), "photos");
const DEST_DIR = path.join(process.cwd(), "public", "photos");
const MANIFEST_PATH = path.join(process.cwd(), "src", "data", "photos.json");
const META_PATH = path.join(SOURCE_DIR, "meta.json");

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"]);

/** Max dimension — photos wider/taller are resized (no upscaling). */
const MAX_DIMENSION = 2560;

/** JPEG quality — 85 with mozjpeg is a good balance for portfolio photos. */
const JPEG_QUALITY = 85;

/** PNG compression level (0-9). */
const PNG_COMPRESSION = 8;

/** Skip files smaller than this (already optimized). */
const MIN_COMPRESS_BYTES = 50_000;

const dryRun = process.env.DRY_RUN === "1";

// ---- Helpers --------------------------------------------------------------

function log(action, msg) {
  console.log(`  ${action.padEnd(10)} ${msg}`);
}

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

function buildId(rootDir, filePath) {
  const relative = path.relative(rootDir, filePath);
  return relative.replace(/\.[^/.]+$/, "").replace(/\\/g, "/");
}

function buildPublicPath(rootDir, filePath) {
  const relative = path.relative(rootDir, filePath).replace(/\\/g, "/");
  return `/photos/${relative}`;
}

/**
 * Load photos/meta.json.
 * Returns { globalCopyright, entries } where entries is a map of id → metadata.
 */
async function loadMeta() {
  const result = { globalCopyright: "", entries: {} };
  if (!existsSync(META_PATH)) return result;

  try {
    const raw = await readFile(META_PATH, "utf-8");
    const data = JSON.parse(raw);

    if (data._copyright) {
      result.globalCopyright = data._copyright;
    }

    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith("_")) continue; // skip reserved keys
      result.entries[key] = value;
    }
  } catch (err) {
    console.warn(`  Warning: could not read meta.json: ${err.message}`);
  }

  return result;
}

/**
 * Compress an image buffer with sharp.
 * Returns { buffer, width, height } after compression.
 */
async function compressImage(inputBuffer, ext) {
  let pipeline = sharp(inputBuffer);
  const meta = await pipeline.metadata();

  // Resize if oversized (preserving aspect ratio, no upscaling)
  if (meta.width > MAX_DIMENSION || meta.height > MAX_DIMENSION) {
    pipeline = pipeline.resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Format-specific compression
  if (ext === ".jpg" || ext === ".jpeg") {
    pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
  } else if (ext === ".png") {
    pipeline = pipeline.png({ compressionLevel: PNG_COMPRESSION, palette: true });
  }
  // .webp/.avif/.gif: pass through without re-encoding

  const outputBuffer = await pipeline.toBuffer();
  const outputMeta = await sharp(outputBuffer).metadata();

  return {
    buffer: outputBuffer,
    width: outputMeta.width || meta.width || 0,
    height: outputMeta.height || meta.height || 0,
  };
}

// ---- Main -----------------------------------------------------------------

async function copyPhotos() {
  console.log("\nCopying & compressing photos...\n");

  if (!existsSync(SOURCE_DIR)) {
    console.warn(`  Source directory not found: photos/`);
    console.warn(`  Skipping manifest write — using committed src/data/photos.json`);
    console.warn(`  (On CI, missing photos/ is expected; photos/ is gitignored.)`);
    return;
  }

  if (!dryRun) {
    await mkdir(DEST_DIR, { recursive: true });
  }

  const meta = await loadMeta();
  if (meta.globalCopyright) {
    log("COPYRIGHT", meta.globalCopyright);
  }
  if (Object.keys(meta.entries).length > 0) {
    log("META", `${Object.keys(meta.entries).length} entries from meta.json`);
  }

  const photos = [];

  for await (const filePath of walkImages(SOURCE_DIR)) {
    const id = buildId(SOURCE_DIR, filePath);
    const publicPath = buildPublicPath(SOURCE_DIR, filePath);
    const destPath = path.join(DEST_DIR, path.relative(SOURCE_DIR, filePath));
    const ext = path.extname(filePath).toLowerCase();

    const inputBuffer = await readFile(filePath);
    const inputKb = Math.round(inputBuffer.length / 1024);

    let width = 0;
    let height = 0;

    // Compress or pass through
    const shouldCompress = inputBuffer.length >= MIN_COMPRESS_BYTES &&
      [".jpg", ".jpeg", ".png"].includes(ext);

    if (shouldCompress) {
      try {
        const result = await compressImage(inputBuffer, ext);
        const outputKb = Math.round(result.buffer.length / 1024);
        width = result.width;
        height = result.height;

        if (dryRun) {
          log("DRY-RUN", `${id} (${inputKb}K → ${outputKb}K)`);
        } else {
          await mkdir(path.dirname(destPath), { recursive: true });
          await writeFile(destPath, result.buffer);
          log("COMPRESS", `${id} (${inputKb}K → ${outputKb}K)`);
        }
      } catch (err) {
        console.error(`  Error compressing ${id}: ${err.message}`);
        // Fallback: copy original
        if (!dryRun) {
          await mkdir(path.dirname(destPath), { recursive: true });
          await writeFile(destPath, inputBuffer);
        }
        try {
          const m = await sharp(inputBuffer).metadata();
          width = m.width || 0;
          height = m.height || 0;
        } catch { /* ignore */ }
        log("COPY", `${id} (${inputKb}K, compression failed)`);
      }
    } else {
      // Small file or unsupported format — copy as-is
      try {
        const m = await sharp(inputBuffer).metadata();
        width = m.width || 0;
        height = m.height || 0;
      } catch { /* ignore */ }

      if (dryRun) {
        log("DRY-RUN", `${id} (${inputKb}K, skip compress)`);
      } else {
        await mkdir(path.dirname(destPath), { recursive: true });
        await writeFile(destPath, inputBuffer);
        log("COPY", `${id} (${inputKb}K)`);
      }
    }

    // Build manifest entry — title/caption come from meta.json, default to ""
    const photoMeta = meta.entries[id] || {};

    const entry = {
      id,
      path: publicPath,
      width,
      height,
      title: photoMeta.title || "",
      caption: photoMeta.caption || "",
    };

    if (photoMeta.tags) entry.tags = photoMeta.tags;

    photos.push(entry);
  }

  // Write manifest: top-level _copyright + photos array
  const output = {
    _copyright: meta.globalCopyright || "",
    photos,
  };

  if (dryRun) {
    log("DRY-RUN", `manifest → src/data/photos.json (${photos.length} entries)`);
  } else {
    await writeFile(MANIFEST_PATH, JSON.stringify(output, null, 2) + "\n", "utf-8");
    log("MANIFEST", `src/data/photos.json (${photos.length} entries)`);
  }

  console.log(`\nDone. ${photos.length} photos processed.`);
  if (dryRun) console.log("   DRY RUN - no files were written.\n");
}

copyPhotos().catch((err) => {
  console.error(err);
  process.exit(1);
});

