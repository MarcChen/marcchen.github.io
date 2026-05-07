/**
 * Prepends the configured basePath to an absolute asset path.
 *
 * Next.js `<Image>` with `unoptimized: true` and `output: "export"` does NOT
 * automatically prepend basePath to `src`. This utility fills that gap for
 * both `<Image>` components and raw `<img>` tags.
 */
export function assetPath(path: string): string {
  if (!path || path.startsWith("http") || path.startsWith("//")) return path;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (path.startsWith("/")) return `${basePath}${path}`;
  return path;
}