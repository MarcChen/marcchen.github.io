"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { MotionConfig, motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
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
function videoMarkup(item: TimelapseItem, autoPlay: boolean): string {
  const autoplayAttr = autoPlay ? "autoplay " : "";
  return (
    `<video src="${item.src}" poster="${item.poster}" width="${item.width}" height="${item.height}" controls ${autoplayAttr}loop muted playsinline ` +
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

function subscribeReducedMotion(callback: () => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

export default function PhotoSwipeGallery({ items }: PhotoSwipeGalleryProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const hasTimelapses = items.some(isTimelapse);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const loopsPaused = userPaused ?? prefersReducedMotion;

  // Pause or resume grid <video> loops when user toggles control or reduced-motion changes
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const videos = grid.querySelectorAll<HTMLVideoElement>("video");
    for (const video of videos) {
      if (loopsPaused) {
        video.removeAttribute("autoplay");
        video.pause();
      } else if (video.getAttribute("src")) {
        video.play().catch(() => {});
      }
    }
  }, [loopsPaused]);

  // IntersectionObserver fallback for Safari/Firefox where HTMLMediaElement.loading is unsupported
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (
      typeof HTMLMediaElement === "undefined" ||
      Object.hasOwn(HTMLMediaElement.prototype, "loading")
    ) {
      return;
    }

    const lazyVideos = grid.querySelectorAll<HTMLVideoElement>('video[loading="lazy"]');
    if (lazyVideos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const video = entry.target as HTMLVideoElement;

          if (video.dataset.poster) {
            video.poster = video.dataset.poster;
            delete video.dataset.poster;
          }
          if (video.dataset.preload) {
            const preload = video.dataset.preload;
            if (preload === "none" || preload === "metadata" || preload === "auto" || preload === "") {
              video.preload = preload;
            }
            delete video.dataset.preload;
          }
          if (video.dataset.src) {
            video.src = video.dataset.src;
            delete video.dataset.src;
          }

          video.load();
          if (video.dataset.paused !== "true") {
            video.play().catch(() => {});
          }
          obs.unobserve(video);
        }
      },
      { rootMargin: "200px 0px" },
    );

    for (const video of lazyVideos) {
      if (video.hasAttribute("poster")) {
        video.dataset.poster = video.getAttribute("poster") ?? "";
        video.removeAttribute("poster");
      }
      const preload = video.getAttribute("preload");
      if (preload && preload !== "none") {
        video.dataset.preload = preload;
      }
      video.preload = "none";
      if (video.hasAttribute("src")) {
        video.dataset.src = video.getAttribute("src") ?? "";
        video.removeAttribute("src");
      }
      observer.observe(video);
    }

    return () => observer.disconnect();
  }, [items]);

  const openLightbox = useCallback(
    (index: number) => {
      const dataSource = items.map((item) => {
        if (isTimelapse(item)) {
          return {
            html: videoMarkup(item, !prefersReducedMotion),
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
    },
    [items, prefersReducedMotion],
  );

  if (!items || items.length === 0) {
    return <p className={styles.emptyState}>No photos yet.</p>;
  }

  return (
    <MotionConfig reducedMotion="user">
      {hasTimelapses && (
        <div className={styles.galleryControls}>
          <button
            type="button"
            className={styles.motionToggle}
            onClick={() => setUserPaused((prev) => !(prev ?? prefersReducedMotion))}
          >
            {loopsPaused ? (
              <Play size={14} aria-hidden="true" />
            ) : (
              <Pause size={14} aria-hidden="true" />
            )}
            <span>{loopsPaused ? "Play timelapses" : "Pause timelapses"}</span>
          </button>
        </div>
      )}
      <div ref={gridRef} className={styles.galleryGrid}>
        {items.map((item, idx) => (
          <motion.button
            key={item.id}
            type="button"
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
                  width={item.width}
                  height={item.height}
                  autoPlay={!loopsPaused}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                  data-paused={loopsPaused ? "true" : undefined}
                  {...({ loading: "lazy" } as Record<string, string>)}
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
                priority={idx === 0}
                sizes="(max-width: 768px) 50vw, 300px"
                className={styles.galleryImage}
              />
            )}
          </motion.button>
        ))}
      </div>
    </MotionConfig>
  );
}
