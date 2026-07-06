#!/usr/bin/env node

/**
 * Upload portfolio images to Cloudinary.
 *
 * Walks public/images/ and/or photos/ and uploads every image to a
 * `portfolio/` folder on Cloudinary, preserving the relative directory
 * structure.
 *
 * Images exceeding Cloudinary's 10 MB limit are compressed in-memory
 * (with sharp) before upload – the original file is NOT modified.
 *
 * Usage:
 *   npm run images:upload              (default: public/images/ only)
 *   npm run images:upload -- --photos  (photos/ only)
 *   npm run images:upload -- --all     (both public/images/ and photos/)
 *   npm run images:upload -- --dry-run
 *   npm run images:upload -- --overwrite
 */

import { existsSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import cloudinary from "cloudinary";
import sharp from "sharp";
import "dotenv/config";

// ---- Config -----------------------------------------------------------

const args = process.argv.slice(2);
const UPLOAD_PHOTOS = args.includes("--photos");
const UPLOAD_IMAGES = args.includes("--images");
const UPLOAD_ALL = args.includes("--all") || (!UPLOAD_PHOTOS && !UPLOAD_IMAGES);

const SOURCE_DIRS = [];
if (UPLOAD_ALL || UPLOAD_IMAGES) SOURCE_DIRS.push("public/images");
if (UPLOAD_ALL || UPLOAD_PHOTOS) SOURCE_DIRS.push("photos");

/** Cloudinary folder prefix – must match src/lib/cloudinary.ts */
const FOLDER_PREFIX = "portfolio";

/** Exclude .webp: optimize-images generates sidecar .webp files that would
 *  collide with originals on the same public_id (extension is stripped).
 *  Cloudinary's f_auto handles format conversion automatically. */
const IMAGE_EXTS = new Set([
  ".jpg", ".jpeg", ".png", ".gif", ".svg", ".ico",
]);

/** Cloudinary free-tier max file size (bytes) */
const CLOUDINARY_MAX_BYTES = 10_000_000;

/** Max dimension for auto-resize before upload */
const MAX_DIMENSION = 2560;

// ---- Parse args -------------------------------------------------------

const OVERWRITE = args.includes("--overwrite");
const DRY_RUN = args.includes("--dry-run");

// ---- Init Cloudinary --------------------------------------------------

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

// ---- Helpers ----------------------------------------------------------

const ROOT = new URL("..", import.meta.url).pathname;
const PUBLIC_ROOT = path.join(ROOT, "public");

function log(action, msg) {
  console.log(`  ${action.padEnd(10)} ${msg}`);
}

function publicIdFromPath(filePath) {
  let relative;
  if (filePath.startsWith(PUBLIC_ROOT)) {
    relative = path.relative(PUBLIC_ROOT, filePath);
  } else {
    relative = path.relative(ROOT, filePath);
  }
  return `${FOLDER_PREFIX}/${relative.replace(/\.[^/.]+$/, "")}`;
}

async function* walkDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDir(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTS.has(ext)) {
        yield fullPath;
      }
    }
  }
}

/**
 * Compress an oversized image in memory and return a Buffer suitable
 * for upload.  Returns { buffer, ext, originalKb, compressedKb }.
 * Returns null if the file doesn't need compression.
 */
async function compressIfNeeded(filePath, fileKb) {
  const fileBytes = fileKb * 1024;
  if (fileBytes <= CLOUDINARY_MAX_BYTES) return null;

  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".svg" || ext === ".ico" || ext === ".gif") return null;

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

  if (ext === ".png") {
    pipeline = pipeline.png({ compressionLevel: 9, palette: true });
  } else if (ext === ".jpg" || ext === ".jpeg") {
    pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
  }

  const buffer = await pipeline.toBuffer();
  return {
    buffer,
    ext: ext === ".jpeg" ? ".jpg" : ext,
    originalKb: fileKb,
    compressedKb: Math.round(buffer.length / 1024),
  };
}

// ---- Main -------------------------------------------------------------

async function uploadAll() {
  const scopeLabel = UPLOAD_ALL ? "all" : UPLOAD_PHOTOS ? "photos" : "images";
  console.log(`\nUploading ${scopeLabel} images to Cloudinary (folder: ${FOLDER_PREFIX}/) ...\n`);

  let uploaded = 0;
  let skipped = 0;
  let errors = 0;

  for (const dir of SOURCE_DIRS) {
    const absDir = path.join(ROOT, dir);
    if (!existsSync(absDir)) {
      console.warn(`  Directory not found: ${dir}`);
      continue;
    }

    for await (const filePath of walkDir(absDir)) {
      const publicId = publicIdFromPath(filePath);
      const relativePath = path.relative(ROOT, filePath);

      if (DRY_RUN) {
        log("DRY-RUN", `${relativePath} -> ${publicId}`);
        continue;
      }

      try {
        const st = await stat(filePath);
        const fileKb = Math.round(st.size / 1024);

        const compressed = await compressIfNeeded(filePath, fileKb);

        if (compressed) {
          log("COMPRESS", `${relativePath}  (${compressed.originalKb}K -> ${compressed.compressedKb}K)`);
          const result = await cloudinary.v2.uploader.upload(
            `data:image/${path.extname(filePath).replace(".", "")};base64,${compressed.buffer.toString("base64")}`,
            {
              public_id: publicId,
              overwrite: OVERWRITE,
              resource_type: "image",
              colors: false,
              faces: false,
              quality_analysis: false,
            },
          );
          log("UPLOAD", `${publicId}  (${(result.bytes / 1024).toFixed(0)}K)`);
          uploaded++;
        } else {
          const result = await cloudinary.v2.uploader.upload(filePath, {
            public_id: publicId,
            overwrite: OVERWRITE,
            resource_type: "image",
            colors: false,
            faces: false,
            quality_analysis: false,
          });
          if (result.bytes > 0) {
            log("UPLOAD", `${publicId}  (${fileKb}K)`);
            uploaded++;
          }
        }
      } catch (err) {
        if (err.error?.http_code === 400 && err.error?.message?.includes("already exists")) {
          skipped++;
        } else {
          console.error(`  Error uploading ${filePath}:`, err.error?.message || err.message);
          errors++;
        }
      }
    }
  }

  console.log(`\nDone. ${uploaded} uploaded, ${skipped} skipped (already exist), ${errors} errors.`);
  if (DRY_RUN) console.log("   DRY RUN - nothing was actually uploaded.\n");
}

uploadAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
