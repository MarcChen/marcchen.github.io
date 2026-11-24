import type { Metadata } from "next";
import { getAuthor } from "@/lib/data";
import LocaleShell from "@/components/layout/LocaleShell";
import BlogPage from "@/app/[locale]/blog/page";

export function generateMetadata(): Metadata {
  const author = getAuthor("en");
  return {
    title: `Blog — ${author.name}`,
    description: `Technical writing and project notes by ${author.name}.`,
    alternates: { canonical: "https://marcchen.github.io/blog/" },
  };
}

export default async function RootBlogPage() {
  return (
    <LocaleShell locale="en">
      <BlogPage params={Promise.resolve({ locale: "en" })} />
    </LocaleShell>
  );
}
