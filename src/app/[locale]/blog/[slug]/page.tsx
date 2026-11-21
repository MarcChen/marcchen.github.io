import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  isValidLocale,
  locales,
  formatDate,
  dateISO,
  t,
  type Locale,
} from "@/lib/i18n";
import { getPost, getAllPostSlugs, getAllPosts } from "@/lib/mdx";
import { markdownToHtml } from "@/components/blog/markdown";
import Comments from "@/components/blog/Comments";

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  const slugs = getAllPostSlugs();
  const params: { locale: Locale; slug: string }[] = [];
  for (const locale of locales) {
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const post = getPost(slug, locale);
  if (!post) return { title: "Writing — Marc Chen" };

  const siteUrl = "https://marcchen.github.io";
  const title = `${post.frontmatter.title} — Marc Chen`;
  const description = post.frontmatter.description;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/blog/${slug}/`,
      languages: {
        en: `${siteUrl}/en/blog/${slug}/`,
        fr: `${siteUrl}/fr/blog/${slug}/`,
        "zh-CN": `${siteUrl}/zh-cn/blog/${slug}/`,
      },
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: dateISO(post.frontmatter.date),
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";

  const post = getPost(slug, locale);
  if (!post) notFound();

  const { frontmatter, content } = post;
  const html = markdownToHtml(content, slug);
  const published = dateISO(frontmatter.date);

  const allPosts = getAllPosts(locale);
  const index = allPosts.findIndex((entry) => entry.slug === slug);
  const older = index >= 0 ? allPosts[index + 1] : undefined;
  const newer = index > 0 ? allPosts[index - 1] : undefined;

  return (
    <div className="page post-page">
      <div className="shell">
        <div className="post-topbar">
          <Link className="post-back" href={`/${locale}/blog/`}>
            {t(locale, "back_to_blog")}
          </Link>
        </div>

        <div className="post-grid">
          <header className="post-head">
            <h1 className="post-h1" id="post-title">
              {frontmatter.title}
            </h1>
            {frontmatter.description && (
              <p className="post-dek">{frontmatter.description}</p>
            )}
          </header>

          <aside className="post-rail">
            <div className="post-rail-block">
              <p className="meta">{t(locale, "post_date")}</p>
              <time className="post-rail-value" dateTime={published}>
                {formatDate(frontmatter.date, locale)}
              </time>
            </div>

            {frontmatter.tags && frontmatter.tags.length > 0 && (
              <div className="post-rail-block">
                <p className="meta">{t(locale, "post_tags")}</p>
                <ul className="post-tags">
                  {frontmatter.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          <article className="post-article" aria-labelledby="post-title">
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <nav className="post-nav" aria-label={t(locale, "blog_nav")}>
              {older ? (
                <Link href={`/${locale}/blog/${older.slug}/`}>
                  <span className="post-nav-label">
                    {t(locale, "post_previous")}
                  </span>
                  <span className="post-nav-title">{older.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {newer ? (
                <Link
                  className="post-nav--next"
                  href={`/${locale}/blog/${newer.slug}/`}
                >
                  <span className="post-nav-label">
                    {t(locale, "post_next")}
                  </span>
                  <span className="post-nav-title">{newer.title}</span>
                </Link>
              ) : (
                <span />
              )}
            </nav>

            <Comments locale={locale} />
          </article>
        </div>
      </div>
    </div>
  );
}
