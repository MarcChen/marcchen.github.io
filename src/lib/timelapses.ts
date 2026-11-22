import fs from "fs";
import path from "path";
import { assetPath } from "@/lib/paths";
import type { TimelapseItem } from "./types";

interface ManifestEntry {
  id: string;
  title?: string;
  caption?: string;
  src: string;
  loop: string;
  poster: string;
  width: number;
  height: number;
  duration?: string;
  tags?: string[];
}

interface TimelapseManifest {
  _copyright?: string;
  timelapses: ManifestEntry[];
}

const MANIFEST_PATH = path.join(process.cwd(), "src", "data", "timelapses.json");

/**
 * Timelapses are kept in their own manifest because `photos.json` is
 * regenerated from the photos/ directory on every build.
 */
export function getTimelapses(): TimelapseItem[] {
  let manifest: TimelapseManifest;

  try {
    const raw = fs.readFileSync(MANIFEST_PATH, "utf-8");
    manifest = JSON.parse(raw) as TimelapseManifest;
  } catch {
    return [];
  }

  if (!manifest?.timelapses || manifest.timelapses.length === 0) return [];

  const globalCopyright = manifest._copyright || "";

  return manifest.timelapses.map((entry) => {
    const alt = entry.title || entry.id.replace(/[-_]/g, " ");

    return {
      id: entry.id,
      src: assetPath(entry.src),
      loop: assetPath(entry.loop),
      poster: assetPath(entry.poster),
      width: entry.width,
      height: entry.height,
      alt,
      ...(entry.title && { title: entry.title }),
      ...(entry.caption && { caption: entry.caption }),
      ...(entry.duration && { duration: entry.duration }),
      ...(entry.tags && { tags: entry.tags }),
      ...(globalCopyright && { copyright: globalCopyright }),
    };
  });
}
