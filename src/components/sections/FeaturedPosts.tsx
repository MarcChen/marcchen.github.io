import Link from "next/link";
import type { PostMeta } from "@/lib/types";
import { formatDate, t, type Locale } from "@/lib/i18n";
import SectionHead from "@/components/sections/SectionHead";

interface FeaturedPostsProps {
  id: string;
  locale: Locale;
  posts: PostMeta[];
}

export default function FeaturedPosts({
  id,
  locale,
  posts,
}: FeaturedPostsProps) {
  if (!posts.length) return null;

  return (
    <section id={id} className="section">
      <div className="shell">
        <SectionHead
          title={t(locale, "featured_title")}
          label={t(locale, "label_all_writing")}
          labelHref={`/${locale}/blog/`}
        />

        <ol className="home-posts">
          {posts.map((post) => (
            <li className="home-post" key={post.slug}>
              <p className="home-post-date">{formatDate(post.date, locale)}</p>

              <div>
                <h3 className="home-post-title">
                  <Link href={`/${locale}/blog/${post.slug}/`}>
                    {post.title}
                  </Link>
                </h3>
                <p className="home-post-desc">{post.description}</p>
              </div>

              <p className="home-post-cat">{post.tags?.[0] ?? ""}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
