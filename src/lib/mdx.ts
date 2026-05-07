import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { PostFrontmatter, PostMeta } from "./types";
import type { Locale } from "./i18n";

const POSTS_DIR = path.join(process.cwd(), "src", "content", "posts");

/** Get locale-specific filename suffix */
function getLocaleFilename(locale: Locale): string {
  if (locale === "en") return "index.md";
  return `index.${locale}.md`;
}

/** Derive slug from directory path */
function dirToSlug(dirPath: string): string {
  // e.g. "bike" or "Codelab/Gemini-Developper-Contest"
  return dirPath.replace(/\\/g, "/").toLowerCase().replace(/\//g, "-");
}

/** Recursively find all post directories (those containing index.md) */
function findPostDirs(dir: string, base: string = ""): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subdir = path.join(dir, entry.name);
      const relPath = base ? `${base}/${entry.name}` : entry.name;

      // Check if this directory contains an index.md
      if (fs.existsSync(path.join(subdir, "index.md"))) {
        results.push(relPath);
      }

      // Also check subdirectories
      results.push(...findPostDirs(subdir, relPath));
    }
  }

  return results;
}

/** Get all post metadata for a locale */
export function getAllPosts(locale: Locale): PostMeta[] {
  const postDirs = findPostDirs(POSTS_DIR);
  const posts: PostMeta[] = [];

  for (const relDir of postDirs) {
    const filename = getLocaleFilename(locale);
    const filePath = path.join(POSTS_DIR, relDir, filename);

    // Fall back to English if locale file doesn't exist
    const actualPath = fs.existsSync(filePath)
      ? filePath
      : path.join(POSTS_DIR, relDir, "index.md");

    if (!fs.existsSync(actualPath)) continue;

    const raw = fs.readFileSync(actualPath, "utf-8");
    const { data } = matter(raw);
    const frontmatter = data as PostFrontmatter;

    posts.push({
      ...frontmatter,
      slug: dirToSlug(relDir),
      locale,
    });
  }

  // Sort by date descending
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/** Get a single post's content + frontmatter */
export function getPost(
  slug: string,
  locale: Locale
): { frontmatter: PostFrontmatter; content: string; slug: string } | null {
  const postDirs = findPostDirs(POSTS_DIR);

  for (const relDir of postDirs) {
    if (dirToSlug(relDir) !== slug) continue;

    const filename = getLocaleFilename(locale);
    const filePath = path.join(POSTS_DIR, relDir, filename);
    const actualPath = fs.existsSync(filePath)
      ? filePath
      : path.join(POSTS_DIR, relDir, "index.md");

    if (!fs.existsSync(actualPath)) return null;

    const raw = fs.readFileSync(actualPath, "utf-8");
    const { data, content } = matter(raw);

    return {
      frontmatter: data as PostFrontmatter,
      content,
      slug,
    };
  }

  return null;
}

/** Get all unique post slugs */
export function getAllPostSlugs(): string[] {
  return findPostDirs(POSTS_DIR).map(dirToSlug);
}

/** Get posts matching a list of slug identifiers (for featured posts) */
export function getPostsByIdentifiers(
  identifiers: string[],
  locale: Locale
): PostMeta[] {
  const allPosts = getAllPosts(locale);

  return identifiers
    .map((id) => {
      const normalizedId = id.toLowerCase();
      return allPosts.find(
        (p) =>
          p.slug.includes(normalizedId) ||
          p.slug === normalizedId ||
          p.title.toLowerCase().includes(normalizedId.replace(/-/g, " "))
      );
    })
    .filter((p): p is PostMeta => p !== undefined);
}
