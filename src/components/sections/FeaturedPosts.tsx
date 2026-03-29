import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import type { FeaturedPostsSection, PostMeta } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import styles from "@/styles/components/Posts.module.css";

interface FeaturedPostsProps {
  locale: Locale;
  data: FeaturedPostsSection;
  posts: PostMeta[];
  alternate?: boolean;
}

export default function FeaturedPosts({
  locale,
  data,
  posts,
  alternate,
}: FeaturedPostsProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <h2 className="section-title">{data.section.name}</h2>

      <div className={styles.postsGrid}>
        {posts.map((post) => {
          const heroUrl = post.hero?.startsWith("http") || post.hero?.startsWith("/") 
            ? post.hero 
            : post.hero 
              ? `/images/posts/${post.slug}/${post.hero}` 
              : null;

          return (
            <Link
              key={post.slug}
              href={`/${locale}/blog/${post.slug}/`}
              className={styles.postCard}
            >
              {heroUrl && (
                <img
                  src={heroUrl}
                  alt={post.title}
                  className={styles.postImage}
                />
              )}
              <div className={styles.postContent}>
              <h3 className={styles.postTitle}>{post.title}</h3>
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
                  {post.tags.slice(0, 3).map((tag) => (
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
    </SectionWrapper>
  );
}
