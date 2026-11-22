import { getPhotos } from "./photos";
import { getTimelapses } from "./timelapses";
import type { GalleryItem } from "./types";

/**
 * Everything shown on /photos, in display order.
 *
 * Timelapses lead the grid: they are the only moving pieces, so they read
 * better as an opener than buried among the stills.
 *
 * Server-only (reads the manifests from disk). The client equivalent of the
 * timelapse predicate lives in gallery-item.ts.
 */
export function getGalleryItems(): GalleryItem[] {
  return [...getTimelapses(), ...getPhotos()];
}
