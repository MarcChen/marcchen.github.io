import type { Metadata } from "next";
import { getAuthor } from "@/lib/data";
import { getAllPostSlugs, getPost } from "@/lib/mdx";
import LocaleShell from "@/components/layout/LocaleShell";
import BlogPostPage from "@/app/[locale]/blog/[slug]/page";

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug, "en");
  const author = getAuthor("en");
  const title = post ? `${post.frontmatter.title} — ${author.name}` : `Blog — ${author.name}`;
  return {
    title,
    description: post?.frontmatter.description,
    alternates: { canonical: `https://marcchen.github.io/blog/${slug}/` },
  };
}

export default async function RootBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <LocaleShell locale="en">
      <BlogPostPage params={Promise.resolve({ locale: "en", slug })} />
    </LocaleShell>
  );
}
