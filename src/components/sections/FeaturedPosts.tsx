"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
import type { PostMeta } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { cloudinaryUrl } from "@/lib/cloudinary";
import { t } from "@/lib/i18n";
import styles from "@/styles/components/FeaturedPosts.module.css";
import MagneticButton from "@/components/ui/MagneticButton";

interface FeaturedPostsProps {
  id: string;
  locale: Locale;
  posts: PostMeta[];
  title: string;
  alternate?: boolean;
}

export default function FeaturedPosts({
  id,
  locale,
  posts,
  title,
  alternate,
}: FeaturedPostsProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <SectionWrapper id={id} alternate={alternate}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerTitles}>
          <span className="section-label">08. Writing</span>
          <AnimatedHeading title={title} className={styles.headingOverride} />
        </div>
        
        <div className={styles.headerActions}>
           <MagneticButton 
             href={`/${locale}/blog`} 
             variant="outline" 
             icon={BookOpen}
           >
             {t(locale, "view_all_posts")}
           </MagneticButton>
        </div>
      </div>

      <div className={styles.magazineGrid}>
        {posts.map((post, idx) => {
          // Highlight the first post in a larger card
          const isFeatured = idx === 0;

          return (
            <motion.article 
              key={post.slug}
              className={`${styles.postCard} ${isFeatured ? styles.featuredPost : ""}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Link href={`/${locale}/blog/${post.slug}`} className={styles.postLink}>
                <div className={styles.imageContainer}>
                  {post.hero ? (
                    <Image
                      src={cloudinaryUrl(post.hero.startsWith("http") || post.hero.startsWith("/") ? post.hero : `/images/posts/${post.slug}/${post.hero}`)}
                      alt={post.title}
                      fill
                      sizes={isFeatured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                      className={styles.postImage}
                    />
                  ) : (
                    <div className={styles.fallbackImage}>
                      <span className={styles.fallbackInitials}>
                         {post.title.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className={styles.postOverlay} />
                  
                  {isFeatured && (
                    <div className={styles.featuredBadge}>
                       Latest Story
                    </div>
                  )}
                </div>

                <div className={styles.postContent}>
                  <div className={styles.postMeta}>
                    <span className={styles.postDate}>
                      {new Date(post.date).toLocaleDateString(locale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className={styles.metaDivider}>•</span>
                  </div>

                  <h3 className={styles.postTitle}>
                    {post.title}
                    <ArrowRight size={20} className={styles.titleArrow} />
                  </h3>
                  
                  <p className={styles.postExcerpt}>{post.description}</p>
                  
                  {post.tags && (
                    <div className={styles.postTags}>
                      {post.tags.slice(0, isFeatured ? 4 : 2).map((tag: string) => (
                        <span key={tag} className={styles.postTag}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </motion.article>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
