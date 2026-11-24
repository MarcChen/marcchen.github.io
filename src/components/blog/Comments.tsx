"use client";

import { useSyncExternalStore } from "react";
import Giscus from "@giscus/react";

interface CommentsProps {
  locale: string;
}

function subscribeTheme(callback: () => void) {
  const meta = document.querySelector('meta[name="color-scheme"]');
  const observer = new MutationObserver(callback);
  if (meta) {
    observer.observe(meta, {
      attributes: true,
      attributeFilter: ["content"],
    });
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", callback);

  return () => {
    observer.disconnect();
    mediaQuery.removeEventListener("change", callback);
  };
}

function getClientThemeSnapshot(): "transparent_dark" | "light" {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
  const content = meta?.content?.trim();
  if (content === "dark") return "transparent_dark";
  if (content === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "transparent_dark"
    : "light";
}

function getServerThemeSnapshot(): null {
  return null;
}

export default function Comments({ locale }: CommentsProps) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getClientThemeSnapshot,
    getServerThemeSnapshot
  );

  if (theme === null) return null;

  // Map locale to giscus language
  const langMap: Record<string, string> = {
    en: "en",
    fr: "fr",
    "zh-cn": "zh-CN",
  };

  return (
    <Giscus
      repo="MarcChen/marcchen.github.io"
      repoId="R_kgDOM76AQQ"
      category="Blog comments"
      categoryId="DIC_kwDOM76AQc4C5ixh"
      mapping="pathname"
      strict="0"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="bottom"
      theme={theme}
      lang={langMap[locale] || "en"}
      loading="lazy"
    />
  );
}
