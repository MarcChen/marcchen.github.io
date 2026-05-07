"use client";

import dynamic from "next/dynamic";

const Comments = dynamic(() => import("@/components/blog/Comments"), { ssr: false });

interface CommentsWrapperProps {
  locale: string;
}

export default function CommentsWrapper({ locale }: CommentsWrapperProps) {
  return <Comments locale={locale} />;
}