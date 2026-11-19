import fs from "fs";
import path from "path";
import { cloudinaryUrl } from "@/lib/cloudinary";

/**
 * Markdown for the journal.
 *
 * The posts were written for Hugo, so this renderer understands the small
 * shortcode set used in them (youtube, img, instagram) and passes their raw
 * HTML wrappers through. Everything else is the markdown the posts actually
 * use: headings, paragraphs, lists, code, quotes, tables, images and links.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

// One image in the UAV post was written as a hotlink. Its local copy keeps
// the journal self-contained (and the static export offline-safe).
const REMOTE_IMAGE_MAP: Record<string, string> = {
  "https://www.ensta.fr/sites/default/files/styles/paragraph_image/public/content/actualites/images/Hexacopt_re_ENSTA.jpg.webp?itok=IyVf1Axd":
    "/images/posts/ensta-uav-challenge/hexacopter.webp",
};

function resolveImage(src: string, slug: string): string {
  let finalSrc = REMOTE_IMAGE_MAP[src] ?? src;
  if (!/^(https?:)?\/\//.test(src) && !src.startsWith("/")) {
    finalSrc = `/images/posts/${slug}/${src}`;
  }
  // Hugo wrote /posts/bike/images/...; the public copies live in
  // /images/posts/bike-images/...
  if (finalSrc.startsWith("/posts/")) {
    finalSrc = finalSrc.replace(
      /^\/posts\/([^/]+)\/images\//,
      "/images/posts/$1-images/"
    );
  }
  return finalSrc;
}

function imageExists(src: string): boolean {
  if (!src.startsWith("/")) return true;
  const clean = src.split("?")[0].split("#")[0];
  return fs.existsSync(path.join(process.cwd(), "public", clean));
}

function figure(
  src: string,
  alt: string,
  caption: string,
  slug: string
): string {
  const finalSrc = resolveImage(src, slug);
  if (!imageExists(finalSrc)) {
    return `<p class="prose-missing">${escapeHtml(alt || caption)}</p>`;
  }
  return `<figure><img src="${escapeAttr(
    cloudinaryUrl(finalSrc)
  )}" alt="${escapeAttr(alt)}" loading="lazy" />${
    caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""
  }</figure>`;
}

function inline(text: string): string {
  const saved: string[] = [];
  const hold = (html: string) => {
    saved.push(html);
    return `\u0000${saved.length - 1}\u0000`;
  };

  let out = text;

  // Code spans first, so nothing inside them is touched by the other rules.
  out = out.replace(/`([^`]+)`/g, (_, code) =>
    hold(`<code>${escapeHtml(code)}</code>`)
  );

  // Links — external links open in a new tab.
  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_, label, href) =>
      hold(
        /^https?:\/\//.test(href)
          ? `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`
          : `<a href="${escapeAttr(href)}">${label}</a>`
      )
  );

  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");

  out = out.replace(/\u0000(\d+)\u0000/g, (_, index) => saved[Number(index)]);
  return out;
}

function renderTable(rows: string[]): string {
  const split = (row: string) =>
    row
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());

  const head = split(rows[0]);
  const body = rows.slice(2).map(split);

  return `<table><thead><tr>${head
    .map((cell) => `<th scope="col">${inline(cell)}</th>`)
    .join("")}</tr></thead><tbody>${body
    .map(
      (cells) =>
        `<tr>${cells
          .map((cell) => `<td>${inline(cell)}</td>`)
          .join("")}</tr>`
    )
    .join("")}</tbody></table>`;
}

function isTableStart(lines: string[], index: number): boolean {
  if (index + 1 >= lines.length) return false;
  const first = lines[index].trim();
  const second = lines[index + 1].trim();
  return (
    first.includes("|") &&
    /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?$/.test(second)
  );
}

function isBlockStart(line: string): boolean {
  return (
    /^#{1,6}\s/.test(line) ||
    /^```/.test(line) ||
    /^>\s?/.test(line) ||
    /^[-*]\s+/.test(line) ||
    /^\d+\.\s+/.test(line) ||
    /^---+$/.test(line.trim()) ||
    /^!\[/.test(line.trim()) ||
    /^\{\{</.test(line.trim()) ||
    /^</.test(line.trim()) ||
    line.includes("|")
  );
}

export function markdownToHtml(markdown: string, slug: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // Fenced code
    if (trimmed.startsWith("```")) {
      const type = trimmed.slice(3).trim();
      const code: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      html.push(
        `<pre><code class="language-${escapeAttr(
          type || "text"
        )}">${escapeHtml(code.join("\n"))}</code></pre>`
      );
      continue;
    }

    // Raw HTML container lines (the image grids and the Instagram wrapper)
    if (
      /^<div\b/.test(trimmed) ||
      /^<\/div>/.test(trimmed) ||
      /^<figure\b/.test(trimmed) ||
      /^<\/figure>/.test(trimmed)
    ) {
      html.push(trimmed);
      i += 1;
      continue;
    }

    // Headings
    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = Math.min(heading[1].length, 4);
      html.push(`<h${level}>${inline(heading[2].trim())}</h${level}>`);
      i += 1;
      continue;
    }

    // Horizontal rule
    if (/^-{3,}$/.test(trimmed)) {
      html.push("<hr />");
      i += 1;
      continue;
    }

    // Tables
    if (isTableStart(lines, i)) {
      const rows = [lines[i], lines[i + 1]];
      i += 2;
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
        rows.push(lines[i]);
        i += 1;
      }
      html.push(renderTable(rows));
      continue;
    }

    // Blockquotes
    if (/^>\s?/.test(trimmed)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      html.push(`<blockquote><p>${inline(quote.join(" "))}</p></blockquote>`);
      continue;
    }

    // Unordered lists
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i += 1;
      }
      html.push(
        `<ul>${items.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`
      );
      continue;
    }

    // Ordered lists
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      html.push(
        `<ol>${items.map((item) => `<li>${inline(item)}</li>`).join("")}</ol>`
      );
      continue;
    }

    // Hugo shortcodes
    const youtube = trimmed.match(/^\{\{<\s*youtube\s+([\w-]+)\s*>\}\}$/);
    if (youtube) {
      html.push(
        `<div class="video-frame"><iframe src="https://www.youtube.com/embed/${escapeAttr(
          youtube[1]
        )}" title="YouTube video" loading="lazy" allowfullscreen></iframe></div>`
      );
      i += 1;
      continue;
    }

    const instagram = trimmed.match(
      /^\{\{<\s*instagram\s+([\w-]+)\s*>\}\}$/
    );
    if (instagram) {
      html.push(
        `<div class="video-frame"><iframe src="https://www.instagram.com/p/${escapeAttr(
          instagram[1]
        )}/embed" title="Instagram post" loading="lazy"></iframe></div>`
      );
      i += 1;
      continue;
    }

    const hugoImage = trimmed.match(/^\{\{<\s*img\s+([^>]+?)\s*>\}\}$/);
    if (hugoImage) {
      const attrs: Record<string, string> = {};
      hugoImage[1].replace(/(\w+)="([^"]*)"/g, (_, key, value) => {
        attrs[key] = value;
        return "";
      });
      html.push(
        figure(attrs.src || "", attrs.title || "", attrs.title || "", slug)
      );
      i += 1;
      continue;
    }

    // Markdown images on their own line
    const image = trimmed.match(
      /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/
    );
    if (image) {
      html.push(figure(image[2], image[1], image[3] || "", slug));
      i += 1;
      continue;
    }

    // Paragraphs: collect until a blank line or the start of another block.
    const paragraph: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      (paragraph.length === 0 || !isBlockStart(lines[i]))
    ) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    if (paragraph.length > 0) {
      html.push(`<p>${inline(paragraph.join(" "))}</p>`);
    } else {
      // A safety valve: never loop forever on an unexpected line.
      html.push(`<p>${inline(trimmed)}</p>`);
      i += 1;
    }
  }

  return html.join("\n");
}
