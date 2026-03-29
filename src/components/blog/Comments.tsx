"use client";

import { useEffect, useState } from "react";
import Giscus from "@giscus/react";

interface CommentsProps {
  locale: string;
}

export default function Comments({ locale }: CommentsProps) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Read initial theme
    const currentTheme = document.documentElement.getAttribute("data-theme");
    setTheme(currentTheme === "dark" ? "transparent_dark" : "light");

    // Observe changes to html data-theme attribute
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "data-theme") {
          const newTheme = document.documentElement.getAttribute("data-theme");
          setTheme(newTheme === "dark" ? "transparent_dark" : "light");
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

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
