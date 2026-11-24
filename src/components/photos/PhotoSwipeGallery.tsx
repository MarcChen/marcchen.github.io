"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import PhotoSwipeDynamicCaption from "photoswipe-dynamic-caption-plugin";
import "photoswipe/dist/photoswipe.css";
import "photoswipe-dynamic-caption-plugin/photoswipe-dynamic-caption-plugin.css";
import { isTimelapse } from "@/lib/gallery-item";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import type { GalleryItem, TimelapseItem } from "@/lib/types";
import styles from "@/styles/components/Gallery.module.css";

interface PhotoSwipeGalleryProps {
  items: GalleryItem[];
}

/** Inline-styled so the markup works inside the PhotoSwipe portal. */
function videoMarkup(item: TimelapseItem): string {
  return (
    `<video src="${item.src}" poster="${item.poster}" width="${item.width}" height="${item.height}" controls autoplay loop muted playsinline ` +
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
  const gridRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [loadedVideoIds, setLoadedVideoIds] = useState<Record<string, boolean>>({});

  // Pause autoplaying timelapse previews when user prefers reduced motion,
  // and defer offscreen timelapse video `src` via IntersectionObserver when native `<video loading="lazy">` is unsupported.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    for (const video of grid.querySelectorAll<HTMLVideoElement>("video")) {
      if (prefersReducedMotion) {
        video.pause();
      } else if (video.src) {
        void video.play().catch(() => {});
      }
    }
  }, [prefersReducedMotion, loadedVideoIds]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const lazyVideos = grid.querySelectorAll<HTMLVideoElement>("video[data-lazy-video-id]");
    if (lazyVideos.length === 0) return;

    if (Object.hasOwn(HTMLMediaElement.prototype, "loading")) {
      const allIds: Record<string, boolean> = {};
      for (const video of lazyVideos) {
        const id = video.dataset.lazyVideoId;
        if (id) allIds[id] = true;
      }
      setLoadedVideoIds((prev) => ({ ...prev, ...allIds }));
      return;
    }

    const mediaObserver = new IntersectionObserver(
      (entries, observer) => {
        const newlyVisible: Record<string, boolean> = {};
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const video = entry.target as HTMLVideoElement;
          const id = video.dataset.lazyVideoId;
          if (id) newlyVisible[id] = true;
          observer.unobserve(video);
        }
        if (Object.keys(newlyVisible).length > 0) {
          setLoadedVideoIds((prev) => ({ ...prev, ...newlyVisible }));
        }
      },
      { rootMargin: "200px 0px" }
    );

    for (const video of lazyVideos) {
      mediaObserver.observe(video);
    }

    return () => mediaObserver.disconnect();
  }, [items]);

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
    <div ref={gridRef} className={styles.galleryGrid}>
      {items.map((item, idx) => {
        const isBelowFold = idx >= 4;
        const isLcpCandidate = idx < 2;

        return (
          <motion.button
            key={item.id}
            type="button"
            className={`${styles.galleryItem} ${isBelowFold ? styles.galleryItemDeferred : ""}`}
            onClick={() => openLightbox(idx)}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }
            }
            aria-label={item.alt}
          >
            {isTimelapse(item) ? (
              <>
                {/* Silent loop stands in for a GIF: same autoplay feel, a fraction
                    of the weight, and full colour on smooth gradients. */}
                <video
                  className={styles.galleryImage}
                  src={!isBelowFold || loadedVideoIds[item.id] ? item.loop : undefined}
                  poster={item.poster}
                  width={item.width}
                  height={item.height}
                  autoPlay={!prefersReducedMotion}
                  muted
                  loop
                  playsInline
                  preload={isBelowFold ? "none" : "metadata"}
                  data-lazy-video-id={isBelowFold ? item.id : undefined}
                  aria-hidden="true"
                  {...(isBelowFold ? ({ loading: "lazy" } as Record<string, string>) : {})}
                />
                <span className={styles.timelapseBadge}>
                  <Play size={10} fill="currentColor" aria-hidden="true" />
                  {item.duration ?? "Timelapse"}
                </span>
              </>
            ) : (
              <Image
                src={item.msrc || item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 50vw, 300px"
                fetchPriority={isLcpCandidate ? "high" : undefined}
                loading={isLcpCandidate ? "eager" : "lazy"}
                className={styles.galleryImage}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
