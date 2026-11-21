import type { PostMeta } from "./types";

/**
 * Local lead images for the journal index.
 *
 * Only files that exist under `public/images/posts/` are listed here: the
 * index never hotlinks. Posts without a local image render without a plate.
 * Brand marks are flagged so the index can contain them instead of cropping.
 */
const POST_IMAGES: Record<string, { src: string; mark?: boolean }> = {
  "bike": { src: "/images/posts/bike-images/bike_V2.JPG.webp" },
  "ensta-uav-challenge": {
    src: "/images/posts/ensta-uav-challenge/hexacopter.webp",
  },
  "ensta-enstraid": { src: "/images/posts/ensta-enstraid/motor.webp" },
  "ensta-technimage": { src: "/images/posts/ensta-technimage/technimage.webp" },
  "codelab-bus-countdown-timer": {
    src: "/images/posts/codelab-bus-countdown-timer/devboard.webp",
  },
  "codelab-notion2googletask": {
    src: "/images/posts/codelab-notion2googletask/notion-google-task.png",
  },
  "codelab-gemini-developper-contest": {
    src: "/images/posts/codelab-gemini-developper-contest/Google_Gemini_logo.webp",
    mark: true,
  },
  "learning": { src: "/images/posts/learning/tips.webp" },
  "spotify-free": {
    src: "/images/posts/spotify-free/Spotify_Logo.webp",
    mark: true,
  },
};

export function getPostImage(
  post: Pick<PostMeta, "slug">
): { src: string; mark: boolean } | null {
  const entry = POST_IMAGES[post.slug];
  return entry ? { src: entry.src, mark: Boolean(entry.mark) } : null;
}
