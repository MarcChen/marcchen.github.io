import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { isValidLocale, locales, t, type Locale } from "@/lib/i18n";
import { getPhotos, hasLocalPhotos } from "@/lib/photos";
import { assetPath } from "@/lib/paths";
import PhotoSwipeGallery from "@/components/photos/PhotoSwipeGallery";

interface PhotosPageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PhotosPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";
  const siteUrl = "https://marcchen.github.io";
  const title = `${t(locale, "photos_title")} — Marc Chen`;
  const description = t(locale, "photos_intro");

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/photos/`,
      languages: {
        en: `${siteUrl}/en/photos/`,
        fr: `${siteUrl}/fr/photos/`,
        "zh-CN": `${siteUrl}/zh-cn/photos/`,
      },
    },
    openGraph: { title, description, type: "website" },
  };
}

export default async function PhotosPage({ params }: PhotosPageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";

  const photos = getPhotos();
  const gallery = photos.length > 0 && hasLocalPhotos();

  return (
    <div className="page">
      <div className="shell">
        <header className="page-head">
          <div>
            <h1 className="page-title">{t(locale, "photos_title")}</h1>
            <p className="page-intro">{t(locale, "photos_intro")}</p>
          </div>
          <p className="page-aside sec-label">{t(locale, "photos_archive")}</p>
        </header>

        {gallery ? (
          <>
            <p className="gallery-hint">{t(locale, "photos_gallery_hint")}</p>
            <PhotoSwipeGallery photos={photos} />
          </>
        ) : (
          <div className="photo-layout">
            <figure>
              <div className="photo-frame">
                <Image
                  src={assetPath("/images/photos/mont-saint-michel.jpg")}
                  alt={t(locale, "photos_caption")}
                  fill
                  sizes="(max-width: 760px) 100vw, 62vw"
                />
              </div>
              <figcaption className="photo-caption">
                {t(locale, "photos_caption")}
              </figcaption>
            </figure>

            <div className="photo-copy">
              <h2 className="photo-empty-title">
                {t(locale, "photos_empty_title")}
              </h2>
              <p className="photo-empty-body">
                {t(locale, "photos_empty_body")}
              </p>
              <Link
                className="photo-journal"
                href={`/${locale}/blog/bike/`}
              >
                {t(locale, "photos_journal")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
