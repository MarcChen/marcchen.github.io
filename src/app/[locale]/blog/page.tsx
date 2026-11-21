import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { isValidLocale, type Locale, formatDate, t } from "@/lib/i18n";
import { assetPath } from "@/lib/paths";
import { getAllPosts } from "@/lib/mdx";
import { getPostImage } from "@/lib/postImages";

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
        </header>

        {posts.length > 0 ? (
          <ol className="post-list">
            {posts.map((post) => {
              const image = getPostImage(post);
              return (
                <li key={post.slug}>
                  <Link
                    className="post-row"
                    href={`/${locale}/blog/${post.slug}/`}
                  >
                    {image && (
                      <span
                        className={
                          image.mark ? "post-thumb post-thumb--mark" : "post-thumb"
                        }
                      >
                        <Image
                          src={assetPath(image.src)}
                          alt={post.title}
                          fill
                          sizes="(max-width: 760px) 40vw, 260px"
                        />
                      </span>
                    )}
                    <span className="post-body">
                      <span className="post-meta">
                        {formatDate(post.date, locale)}
                        {post.tags?.[0] ? ` · ${post.tags[0]}` : ""}
                      </span>
                      <span className="post-title">{post.title}</span>
                      <span className="post-desc">{post.description}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="empty-note">{t(locale, "no_posts")}</p>
        )}
      </div>
    </div>
  );
}
