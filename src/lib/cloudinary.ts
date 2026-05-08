import { assetPath } from "@/lib/paths";

/**
 * Build a Cloudinary image URL or fall back to the local path.
 *
 * Requires NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME env var for CDN mode.
 * Falls back to local basePath-prefixed path when unset.
 */
export function cloudinaryUrl(
  path: string,
  options?: { width?: number; height?: number },
): string {
  if (!path || path.startsWith("http") || path.startsWith("//")) return path;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return assetPath(path);

  const isSvg = /\.svg$/i.test(path);
  const cleanPath = path.replace(/^\//, "").replace(/\.[^/.]+$/, "");

  const transforms: string[] = [];
  if (isSvg) {
    transforms.push("f_svg");
  } else {
    transforms.push("f_auto", "q_auto");
  }
  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms.join(",")}/v1/portfolio/${cleanPath}`;
}
