import type { ReactNode } from "react";

/**
 * A very small inline renderer for the two pieces of markdown that live in
 * the YAML: **emphasis** and [links](https://example.com). Everything is
 * rendered as React nodes, never as raw HTML.
 */
const TOKEN = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g;

export default function InlineText({ text }: { text: string }) {
  const parts = text.split(TOKEN).filter((part) => part !== "");
  const out: ReactNode[] = [];

  parts.forEach((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      out.push(<strong key={index}>{part.slice(2, -2)}</strong>);
      return;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      const external = /^https?:\/\//.test(href);
      out.push(
        <a
          key={index}
          href={href}
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {label}
        </a>
      );
      return;
    }
    out.push(<span key={index}>{part}</span>);
  });

  return <>{out}</>;
}
