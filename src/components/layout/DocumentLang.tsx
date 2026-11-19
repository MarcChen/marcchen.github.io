"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n";

export default function DocumentLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale === "zh-cn" ? "zh-CN" : locale;
  }, [locale]);
  return null;
}
