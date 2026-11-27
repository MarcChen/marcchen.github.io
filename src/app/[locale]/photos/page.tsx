import { isValidLocale, locales, type Locale } from "@/lib/i18n";
import { getGalleryItems } from "@/lib/gallery";
import { getAchievements } from "@/lib/data";
import PhotoSwipeGallery from "@/components/photos/PhotoSwipeGallery";
import Achievements from "@/components/sections/Achievements";
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

  const items = getGalleryItems();
  const achievements = getAchievements(locale);

  return (
    <div className={styles.galleryPage}>
      <div className="container">
        <h1 className={`section-title ${styles.galleryTitle}`}>
          {locale === "fr" ? "Photos" : locale === "zh-cn" ? "照片" : "Photos"}
        </h1>
        <PhotoSwipeGallery items={items} />
      </div>
      {achievements.section.enable && achievements.achievements.length > 0 && (
        <Achievements locale={locale} data={achievements} />
      )}
    </div>
  );
}
