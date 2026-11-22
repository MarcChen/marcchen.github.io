"use client";

import { useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import PhotoSwipeDynamicCaption from "photoswipe-dynamic-caption-plugin";
import "photoswipe/dist/photoswipe.css";
import "photoswipe-dynamic-caption-plugin/photoswipe-dynamic-caption-plugin.css";
import { isTimelapse } from "@/lib/gallery-item";
import type { GalleryItem, TimelapseItem } from "@/lib/types";
import styles from "@/styles/components/Gallery.module.css";

interface PhotoSwipeGalleryProps {
  items: GalleryItem[];
}

/** Inline-styled so the markup works inside the PhotoSwipe portal. */
function videoMarkup(item: TimelapseItem): string {
  return (
    `<video src="${item.src}" poster="${item.poster}" controls autoplay loop muted playsinline ` +
    `style="width:100%;height:100%;object-fit:contain;background:#000;display:block;"></video>`
  );
}

function buildCaptionHtml(item: GalleryItem): string {
  const parts: string[] = [];
  if (item.caption) {
    parts.push(item.caption);
  } else if (item.title) {
    parts.push(item.title);
  }
  if (item.copyright) {
    parts.push(`<small class="${styles.pswpCopyright}">${item.copyright}</small>`);
  }
  return parts.join("<br>");
}

export default function PhotoSwipeGallery({ items }: PhotoSwipeGalleryProps) {
  const openLightbox = useCallback((index: number) => {
    const dataSource = items.map((item) => {
      if (isTimelapse(item)) {
        return {
          html: videoMarkup(item),
          width: item.width,
          height: item.height,
        };
      }
      return {
        src: item.src,
        width: item.width,
        height: item.height,
        msrc: item.msrc,
        alt: item.alt,
      };
    });

    const lightbox = new PhotoSwipeLightbox({
      dataSource,
      showHideAnimationType: "fade",
      bgOpacity: 0.9,
      pswpModule: () => import("photoswipe"),
    });

    // Dynamic Caption plugin — renders caption below or aside each slide
    const captionPlugin = new PhotoSwipeDynamicCaption(lightbox, {
      type: "auto",
      captionContent: (slide: { index: number }) => {
        const item = items[slide.index];
        if (!item) return "";
        return buildCaptionHtml(item);
      },
    });

    void captionPlugin;

    // Cal.com injects a floating "Book a call" widget that outranks every
    // z-index we control; flag the open lightbox so CSS can hide it.
    const setLightboxOpen = (open: boolean) =>
      document.documentElement.toggleAttribute("data-lightbox-open", open);
    lightbox.on("beforeOpen", () => setLightboxOpen(true));
    lightbox.on("close", () => setLightboxOpen(false));

    lightbox.init();
    lightbox.loadAndOpen(index);
  }, [items]);

  if (!items || items.length === 0) {
    return <p className={styles.emptyState}>No photos yet.</p>;
  }

  return (
    <div className={styles.galleryGrid}>
      {items.map((item, idx) => (
        <motion.button
          key={item.id}
          className={styles.galleryItem}
          onClick={() => openLightbox(idx)}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
          aria-label={item.alt}
        >
          {isTimelapse(item) ? (
            <>
              {/* Silent loop stands in for a GIF: same autoplay feel, a fraction
                  of the weight, and full colour on smooth gradients. */}
              <video
                className={styles.galleryImage}
                src={item.loop}
                poster={item.poster}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
              />
              <span className={styles.timelapseBadge}>
                <Play size={10} fill="currentColor" />
                {item.duration ?? "Timelapse"}
              </span>
            </>
          ) : (
            <Image
              src={item.msrc || item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 768px) 50vw, 300px"
              className={styles.galleryImage}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}
