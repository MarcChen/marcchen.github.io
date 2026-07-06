import fs from "fs";
import path from "path";
import { assetPath } from "@/lib/paths";
import { cloudinaryUrl } from "@/lib/cloudinary";
import type { PhotoItem } from "./types";

interface ManifestEntry {
  id: string;
  path: string;
  width: number;
  height: number;
  title?: string;
  caption?: string;
  tags?: string[];
}

interface PhotoManifest {
  _copyright?: string;
  photos: ManifestEntry[];
}

const MANIFEST_PATH = path.join(process.cwd(), "src", "data", "photos.json");
const PHOTOS_PUBLIC_DIR = path.join(process.cwd(), "public", "photos");
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"]);

function hasLocalPhotos(): boolean {
  if (!fs.existsSync(PHOTOS_PUBLIC_DIR)) return false;
  try {
    const entries = fs.readdirSync(PHOTOS_PUBLIC_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && IMAGE_EXTS.has(path.extname(entry.name).toLowerCase())) {
        return true;
      }
      if (entry.isDirectory()) {
        const sub = fs.readdirSync(path.join(PHOTOS_PUBLIC_DIR, entry.name));
        if (sub.some((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))) {
          return true;
        }
      }
    }
  } catch {
    return false;
  }
  return false;
}

export function getPhotos(): PhotoItem[] {
  let manifest: PhotoManifest;

  try {
    const raw = fs.readFileSync(MANIFEST_PATH, "utf-8");
    manifest = JSON.parse(raw) as PhotoManifest;
  } catch {
    return [];
  }

  if (!manifest?.photos || manifest.photos.length === 0) return [];

  const useLocal = hasLocalPhotos();
  const globalCopyright = manifest._copyright || "";

  return manifest.photos.map((entry) => {
    // alt = title if present, otherwise humanize the id
    const alt = entry.title || entry.id.replace(/[/\\]/g, " ").replace(/[-_]/g, " ");

    const base: Omit<PhotoItem, "src" | "msrc"> = {
      id: entry.id,
      width: entry.width,
      height: entry.height,
      alt,
      ...(entry.title && { title: entry.title }),
      ...(entry.caption && { caption: entry.caption }),
      ...(globalCopyright && { copyright: globalCopyright }),
      ...(entry.tags && { tags: entry.tags }),
    };

    if (useLocal) {
      return {
        ...base,
        src: assetPath(entry.path),
        msrc: assetPath(entry.path),
      };
    }

    return {
      ...base,
      src: cloudinaryUrl(entry.path),
      msrc: cloudinaryUrl(entry.path, { width: 400 }),
    };
  });
}


