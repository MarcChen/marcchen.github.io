"use client";

import { useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import PhotoSwipeDynamicCaption from "photoswipe-dynamic-caption-plugin";
import "photoswipe/dist/photoswipe.css";
import "photoswipe-dynamic-caption-plugin/photoswipe-dynamic-caption-plugin.css";
import type { PhotoItem } from "@/lib/types";
import styles from "@/styles/components/Gallery.module.css";

interface PhotoSwipeGalleryProps {
  photos: PhotoItem[];
}

function buildCaptionHtml(photo: PhotoItem): string {
  const parts: string[] = [];
  if (photo.caption) {
    parts.push(photo.caption);
  } else if (photo.title) {
    parts.push(photo.title);
  }
  if (photo.copyright) {
    parts.push(`<small class="${styles.pswpCopyright}">${photo.copyright}</small>`);
  }
  return parts.join("<br>");
}

export default function PhotoSwipeGallery({ photos }: PhotoSwipeGalleryProps) {
  const openLightbox = useCallback((index: number) => {
    const lightbox = new PhotoSwipeLightbox({
      dataSource: photos.map((p) => ({
        src: p.src,
        width: p.width,
        height: p.height,
        msrc: p.msrc,
        alt: p.alt,
      })),
      showHideAnimationType: "fade",
      bgOpacity: 0.9,
      pswpModule: () => import("photoswipe"),
    });

    // Dynamic Caption plugin — renders caption below or aside each slide
    const captionPlugin = new PhotoSwipeDynamicCaption(lightbox, {
      type: "auto",
      captionContent: (slide: { index: number }) => {
        const photo = photos[slide.index];
        if (!photo) return "";
        return buildCaptionHtml(photo);
      },
    });

    lightbox.init();
    lightbox.loadAndOpen(index);
  }, [photos]);

  if (!photos || photos.length === 0) {
    return <p className={styles.emptyState}>No photos yet.</p>;
  }

  return (
    <div className={styles.galleryGrid}>
      {photos.map((photo, idx) => (
        <motion.button
          key={photo.id}
          className={styles.galleryItem}
          onClick={() => openLightbox(idx)}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
          aria-label={photo.alt}
        >
          <Image
            src={photo.msrc || photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 768px) 50vw, 300px"
            className={styles.galleryImage}
          />
        </motion.button>
      ))}
    </div>
  );
}


