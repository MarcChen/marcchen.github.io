"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
import type { ProjectsSection } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { assetPath } from "@/lib/paths";
import { cloudinaryUrl } from "@/lib/cloudinary";
import styles from "@/styles/components/Projects.module.css";

interface ProjectsProps {
  locale: Locale;
  data: ProjectsSection;
  alternate?: boolean;
}

const KIND_TAGS = new Set(["hobby", "academic", "professional"]);
const isInternal = (url?: string) => !!url && url.startsWith("/");
const href = (url: string) => (isInternal(url) ? assetPath(url) : url);
const imgSrc = (src: string) => (src.startsWith("http") ? src : assetPath(src));
const yearOf = (timeline: string) => timeline.match(/(\d{4})(?!.*\d{4})/)?.[1] ?? timeline;

/** Side projects as an index. Hovering or focusing a line opens it in place:
 *  the picture slides in inside the row and the summary appears. */
export default function Projects({ locale, data, alternate }: ProjectsProps) {
  const [filter, setFilter] = useState("all");
  const list = data.projects.filter((p) => filter === "all" || p.tags.includes(filter));

  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <AnimatedHeading title={data.section.name} />

      <div className={styles.filters} role="group" aria-label={data.section.name}>
        {data.buttons.map((btn) => (
          <button
            key={btn.filter}
            type="button"
            aria-pressed={filter === btn.filter}
            onClick={() => setFilter(btn.filter)}
          >
            {btn.name}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className={styles.empty}>{t(locale, "no_projects")}</p>
      ) : (
        <ul className={styles.index}>
          {list.map((p) => {
            const picture = p.image ?? p.logo;
            const tags = p.tags.filter((tag) => !KIND_TAGS.has(tag)).slice(0, 3);
            return (
              <li key={p.name} className={`${styles.item} ${p.url ? styles.linked : ""}`}>
                <span className={styles.year}>{yearOf(p.timeline)}</span>
                <div className={styles.main}>
                  <h3 className={styles.name}>
                    {p.url ? (
                      <a
                        href={href(p.url)}
                        className={styles.stretched}
                        {...(isInternal(p.url) ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                      >
                        {p.name}
                      </a>
                    ) : (
                      p.name
                    )}
                  </h3>
                  <div className={styles.more}>
                    <div>
                      <p className={styles.summary}>
                        {p.summary.replace(/\*\*/g, "")}
                      </p>
                      <p className={styles.meta}>
                        {p.role} · {p.timeline}
                        {p.url && isInternal(p.url) && <> · {t(locale, "read_post")}</>}
                      </p>
                    </div>
                  </div>
                </div>
                <span className={styles.tags}>
                  {tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </span>
                <span className={styles.thumb} aria-hidden="true">
                  {picture ? (
                    <Image
                      src={p.image ? imgSrc(picture) : cloudinaryUrl(picture)}
                      alt=""
                      fill
                      sizes="220px"
                      loading="lazy"
                      unoptimized
                    />
                  ) : (
                    <span className={styles.mono}>
                      {p.name
                        .split(/\s+/)
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 3)}
                    </span>
                  )}
                </span>
                <span className={styles.end}>
                  {p.repo && (
                    <a
                      href={p.repo}
                      className={styles.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${t(locale, "source_code")}: ${p.name}`}
                    >
                      <GithubIcon size={18} aria-hidden="true" />
                    </a>
                  )}
                  {p.url && <ArrowUpRight className={styles.arrow} size={20} aria-hidden="true" />}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </SectionWrapper>
  );
}
