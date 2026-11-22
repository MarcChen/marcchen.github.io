import type { GalleryItem, TimelapseItem } from "./types";

/**
 * Shared by server and client code, so it must stay free of `fs` imports —
 * the manifests live in gallery.ts / photos.ts / timelapses.ts, which are
 * server-only.
 */
export function isTimelapse(item: GalleryItem): item is TimelapseItem {
  return "loop" in item;
}
