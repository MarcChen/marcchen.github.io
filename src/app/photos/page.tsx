import type { Metadata } from "next";
import { getAuthor } from "@/lib/data";
import LocaleShell from "@/components/layout/LocaleShell";
import PhotosPage from "@/app/[locale]/photos/page";

export function generateMetadata(): Metadata {
  const author = getAuthor("en");
  return {
    title: `Photos — ${author.name}`,
    description: `Photography and timelapses by ${author.name}.`,
    alternates: { canonical: "https://marcchen.github.io/photos/" },
  };
}

export default async function RootPhotosPage() {
  return (
    <LocaleShell locale="en">
      <PhotosPage params={Promise.resolve({ locale: "en" })} />
    </LocaleShell>
  );
}
