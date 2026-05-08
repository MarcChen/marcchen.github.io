import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { isValidLocale, type Locale, locales } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { getAllPosts } from "@/lib/mdx";
import styles from "@/styles/components/Posts.module.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";

  const posts = getAllPosts(locale);

  return (
    <div style={{ paddingTop: "calc(var(--nav-height) + var(--space-12))" }}>
      <div className="container">
        <h1 className="section-title" style={{ marginBottom: "var(--space-12)" }}>
          {t(locale, "all_posts")}
        </h1>

        <div className={styles.postsGrid}>
          {posts.map((post) => {
            const heroUrl = post.hero?.startsWith("http") || post.hero?.startsWith("/")
              ? cloudinaryUrl(post.hero)
              : post.hero
                ? cloudinaryUrl(`/images/posts/${post.slug}/${post.hero}`) 
                : null;

            return (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}/`}
                className={styles.postCard}
              >
                {heroUrl && (
                  <div style={{ position: "relative", width: "100%", height: "200px" }}>
                    <Image
                      src={heroUrl}
                      alt={post.title}
                      fill
                      className={styles.postImage}
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                )}
                <div className={styles.postContent}>
                <h2 className={styles.postTitle}>{post.title}</h2>
                <span className={styles.postDate}>
                  {new Date(post.date).toLocaleDateString(
                    locale === "zh-cn" ? "zh-CN" : locale,
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </span>
                <p className={styles.postDescription}>{post.description}</p>
                {post.tags && (
                  <div className={styles.postTags}>
                    {post.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <span className={styles.readMore}>
                  {t(locale, "read_more")} <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          )})}
        </div>

        {posts.length === 0 && (
          <p style={{ textAlign: "center", color: "var(--text-muted)" }}>
            {t(locale, "no_posts")}
          </p>
        )}
      </div>
    </div>
  );
}
