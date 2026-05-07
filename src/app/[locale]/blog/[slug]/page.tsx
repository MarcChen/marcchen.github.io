import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidLocale, locales, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { getPost, getAllPostSlugs } from "@/lib/mdx";
import CommentsWrapper from "@/components/blog/CommentsWrapper";
import { assetPath } from "@/lib/paths";
import styles from "@/styles/components/BlogPost.module.css";

export function generateStaticParams() {
  const slugs = getAllPostSlugs();
  const params = [];
  for (const locale of locales) {
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }
  return params;
}

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";

  const post = getPost(slug, locale);
  if (!post) notFound();

  const { frontmatter, content } = post;

  // Simple markdown to HTML conversion for the content
  // For a full MDX pipeline, this could be replaced with next-mdx-remote
  const htmlContent = simpleMarkdownToHtml(content, slug);

  return (
    <div className={styles.postPage}>
      <div className={styles.postContainer}>
        <Link href={`/${locale}/blog/`} className={styles.backLink}>
          {t(locale, "back_to_blog")}
        </Link>

        <header className={styles.postHeader}>
          <h1 className={styles.postTitle}>{frontmatter.title}</h1>
          <div className={styles.postMeta}>
            <span className={styles.postDate}>
              {new Date(frontmatter.date).toLocaleDateString(
                locale === "zh-cn" ? "zh-CN" : locale,
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </span>
          </div>
          {frontmatter.tags && (
            <div className={styles.postTags}>
              {frontmatter.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <article
          className={styles.prose}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <div className={styles.comments}>
          <h3 className={styles.commentsTitle}>{t(locale, "comments")}</h3>
          <CommentsWrapper locale={locale} />
        </div>
      </div>
    </div>
  );
}

/**
 * Simple Markdown → HTML converter.
 * Handles headings, paragraphs, links, bold, italic, code blocks,
 * inline code, images, lists, blockquotes, and horizontal rules.
 */
function simpleMarkdownToHtml(md: string, slug: string): string {
  let html = md;

  // Code blocks (fenced)
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (_, lang, code) =>
      `<pre><code class="language-${lang || "text"}">${escapeHtml(code.trim())}</code></pre>`
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Images
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_, alt, src) => {
      let finalSrc = src;
      if (!src.startsWith("http") && !src.startsWith("/")) {
        finalSrc = `/images/posts/${slug}/${src}`;
      }
      return `<img src="${assetPath(finalSrc)}" alt="${alt}" loading="lazy" />`;
    }
  );

  // YouTube Shortcode
  html = html.replace(
    /\{\{\<\s*youtube\s+([\w-]+)\s*\>\}\}/g,
    (_, id) => `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%;"><iframe src="https://www.youtube.com/embed/${id}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen loading="lazy" title="YouTube video"></iframe></div>`
  );

  // Image Shortcode (Hugo {{< img >}})
  html = html.replace(
    /\{\{\<\s*img\s+([^>]+)\s*\>\}\}/g,
    (_, attrs) => {
      const srcMatch = attrs.match(/src="([^"]+)"/);
      const altMatch = attrs.match(/title="([^"]+)"/);
      const heightMatch = attrs.match(/height="(\d+)"/);
      const widthMatch = attrs.match(/width="(\d+)"/);
      const alignMatch = attrs.match(/align="([^"]+)"/);

      const src = srcMatch ? srcMatch[1] : "";
      const alt = altMatch ? altMatch[1] : "";
      const height = heightMatch ? ` height="${heightMatch[1]}"` : "";
      const width = widthMatch ? ` width="${widthMatch[1]}"` : "";
      const align = alignMatch ? ` align="${alignMatch[1]}"` : "";

      let finalSrc = src;
      if (!src.startsWith("http") && !src.startsWith("/")) {
        finalSrc = `/images/posts/${slug}/${src}`;
      }
      // Fix path: /posts/bike/images/... → /images/posts/bike-images/...
      if (finalSrc.startsWith("/posts/")) {
        finalSrc = finalSrc.replace(/^\/posts\/([^/]+)\/images\//, "/images/posts/$1-images/");
      }

      return `<img src="${assetPath(finalSrc)}" alt="${alt}"${height}${width}${align} loading="lazy" style="max-width:100%;height:auto;" />`;
    }
  );

  // Instagram Shortcode
  html = html.replace(
    /\{\{\<\s*instagram\s+([\w-]+)\s*\>\}\}/g,
    (_, id) => `<iframe src="https://www.instagram.com/p/${id}/embed" width="400" height="480" frameborder="0" scrolling="no" allowtransparency="true" style="border:1px solid var(--border-color); border-radius:var(--radius-lg);"></iframe>`
  );

  // Links (with target=_blank for external)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, text, href) => {
      const isExternal = href.startsWith("http");
      return `<a href="${href}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ""}>${text}</a>`;
    }
  );

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Headings
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr />");

  // Blockquotes
  html = html.replace(
    /^> (.+)$/gm,
    "<blockquote><p>$1</p></blockquote>"
  );

  // Unordered lists (basic)
  html = html.replace(
    /^[\-\*] (.+)$/gm,
    "<li>$1</li>"
  );
  // Wrap consecutive <li> in <ul>
  html = html.replace(
    /(<li>[\s\S]*?<\/li>\n?)+/g,
    (match) => `<ul>${match}</ul>`
  );

  // Paragraphs (wrap remaining lines)
  const lines = html.split("\n");
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (
      line === "" ||
      line.startsWith("<h") ||
      line.startsWith("<pre") ||
      line.startsWith("<ul") ||
      line.startsWith("<ol") ||
      line.startsWith("<li") ||
      line.startsWith("</") ||
      line.startsWith("<blockquote") ||
      line.startsWith("<hr") ||
      line.startsWith("<img")
    ) {
      result.push(lines[i]);
    } else {
      result.push(`<p>${line}</p>`);
    }
  }

  return result.join("\n");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
