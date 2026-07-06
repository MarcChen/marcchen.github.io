import { isValidLocale, locales, type Locale } from "@/lib/i18n";
import { getPhotos } from "@/lib/photos";
import PhotoSwipeGallery from "@/components/photos/PhotoSwipeGallery";
import styles from "@/styles/components/Gallery.module.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface PhotosPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PhotosPage({ params }: PhotosPageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";

  const photos = getPhotos();

  return (
    <div className={styles.galleryPage}>
      <div className="container">
        <h1 className={`section-title ${styles.galleryTitle}`}>
          {locale === "fr" ? "Photos" : locale === "zh-cn" ? "照片" : "Photos"}
        </h1>
        <PhotoSwipeGallery photos={photos} />
      </div>
    </div>
  );
}
