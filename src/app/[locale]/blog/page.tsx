import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, type Locale, formatDate, t } from "@/lib/i18n";
import { getAllPosts } from "@/lib/mdx";

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return (["en", "fr", "zh-cn"] as const).map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const siteUrl = "https://marcchen.github.io";
  const title = `${t(locale, "blog_title")} — Marc Chen`;
  const description = t(locale, "blog_intro");

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/blog/`,
      languages: {
        en: `${siteUrl}/en/blog/`,
        fr: `${siteUrl}/fr/blog/`,
        "zh-CN": `${siteUrl}/zh-cn/blog/`,
      },
    },
    openGraph: { title, description, type: "website" },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const posts = getAllPosts(locale);

  return (
    <div className="page">
      <div className="shell">
        <header className="page-head">
          <div>
            <h1 className="page-title">{t(locale, "blog_title")}</h1>
            <p className="page-intro">{t(locale, "blog_intro")}</p>
          </div>
          <p className="page-aside sec-label">{t(locale, "label_archive")}</p>
        </header>

        {posts.length > 0 ? (
          <ol className="post-list">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  className="post-row"
                  href={`/${locale}/blog/${post.slug}/`}
                >
                  <span className="post-date">
                    {formatDate(post.date, locale)}
                  </span>
                  <div>
                    <h2 className="post-title">{post.title}</h2>
                    <span className="post-desc">{post.description}</span>
                  </div>
                  <span className="post-cat">{post.tags?.[0] ?? ""}</span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="empty-note">{t(locale, "no_posts")}</p>
        )}
      </div>
    </div>
  );
}
