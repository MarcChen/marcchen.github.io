"use client";

import { useState } from "react";
import Giscus from "@giscus/react";
import { t, type Locale } from "@/lib/i18n";

interface CommentsProps {
  locale: Locale;
}

const GISCUS_LANG: Record<Locale, string> = {
  en: "en",
  fr: "fr",
  "zh-cn": "zh-CN",
};

export default function Comments({ locale }: CommentsProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="comments" aria-labelledby="comments-title">
      <div className="comments-head">
        <div>
          <h2 className="comments-title" id="comments-title">
            {t(locale, "comments")}
          </h2>
          <p className="comments-intro">{t(locale, "comments_intro")}</p>
        </div>
        <button
          type="button"
          className="comments-button"
          aria-expanded={open}
          aria-controls="comments-panel"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? t(locale, "comments_hide") : t(locale, "comments_load")}
        </button>
      </div>

      {open && (
        <div className="comments-panel" id="comments-panel">
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
            theme="transparent_dark"
            lang={GISCUS_LANG[locale]}
            loading="lazy"
          />
          <p className="comments-fallback">
            {t(locale, "comments_fallback")}{" "}
            <a
              href="https://github.com/MarcChen/marcchen.github.io/discussions"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t(locale, "comments_help")}
            </a>
          </p>
        </div>
      )}
    </section>
  );
}
