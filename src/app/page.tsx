import type { Metadata } from "next";
import { getAuthor, getSiteConfig } from "@/lib/data";
import LocaleShell from "@/components/layout/LocaleShell";
import HomePage from "@/app/[locale]/page";

export function generateMetadata(): Metadata {
  const siteConfig = getSiteConfig("en");
  const author = getAuthor("en");
  const canonicalUrl = "https://marcchen.github.io/";

  return {
    title: `${author.name} — Data Engineer & AI/ML Engineer`,
    description: siteConfig.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${author.name} — Data Engineer & AI/ML Engineer`,
      description: siteConfig.description,
      url: canonicalUrl,
      siteName: author.name,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${author.name} — Data Engineer & AI/ML Engineer`,
      description: siteConfig.description,
    },
  };
}

export default async function RootPage() {
  return (
    <LocaleShell locale="en">
      <HomePage params={Promise.resolve({ locale: "en" })} />
    </LocaleShell>
  );
}
