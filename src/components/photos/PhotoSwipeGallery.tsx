"use client";

import { useCallback } from "react";
import Image from "next/image";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import PhotoSwipeDynamicCaption from "photoswipe-dynamic-caption-plugin";
import "photoswipe/dist/photoswipe.css";
import "photoswipe-dynamic-caption-plugin/photoswipe-dynamic-caption-plugin.css";
import type { PhotoItem } from "@/lib/types";

interface PhotoSwipeGalleryProps {
  photos: PhotoItem[];
}

function caption(photo: PhotoItem): string {
  const parts: string[] = [];
  if (photo.caption) parts.push(photo.caption);
  else if (photo.title) parts.push(photo.title);
  if (photo.copyright) parts.push(photo.copyright);
  return parts.join("<br>");
}

export default function PhotoSwipeGallery({ photos }: PhotoSwipeGalleryProps) {
  const open = useCallback(
    (index: number) => {
      const lightbox = new PhotoSwipeLightbox({
        dataSource: photos.map((photo) => ({
          src: photo.src,
          width: photo.width,
          height: photo.height,
          msrc: photo.msrc,
          alt: photo.alt,
        })),
        showHideAnimationType: "fade",
        bgOpacity: 1,
        pswpModule: () => import("photoswipe"),
      });

      new PhotoSwipeDynamicCaption(lightbox, {
        type: "auto",
        captionContent: (slide: { index: number }) => {
          const photo = photos[slide.index];
          return photo ? caption(photo) : "";
        },
      });

      lightbox.init();
      lightbox.loadAndOpen(index);
    },
    [photos]
  );

  return (
    <div className="gallery-grid">
      {photos.map((photo, index) => (
        <button
          key={photo.id}
          type="button"
          className="gallery-item"
          onClick={() => open(index)}
          aria-label={photo.alt}
        >
          <Image
            src={photo.msrc || photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 760px) 50vw, 33vw"
          />
        </button>
      ))}
    </div>
  );
}
