"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProjectsSection } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n";
import { assetPath } from "@/lib/paths";
import SectionHead from "@/components/sections/SectionHead";
import InlineText from "@/components/ui/InlineText";

interface ProjectsProps {
  locale: Locale;
  data: ProjectsSection;
}

const PROJECT_FILTER_KEY: Record<string, string> = {
  all: "proj_all",
  professional: "proj_professional",
  academic: "proj_academic",
  hobby: "proj_hobby",
};

/** Local plates only. Projects without one keep a typographic plate. */
const PROJECT_IMAGES: Record<
  string,
  { src: string; altKey: string; mark?: boolean }
> = {
  "Vision Vendor": {
    src: "/images/sections/projects/visionvendor-miniature.jpg",
    altKey: "project_img_visionvendor_alt",
    mark: true,
  },
  "Dassault UAV Challenge": {
    src: "/images/posts/ensta-uav-challenge/hexacopter.webp",
    altKey: "project_img_uav_alt",
  },
};

function localizeInternal(url: string, locale: Locale): string {
  if (locale !== "en" && url.startsWith("/en/")) {
    return url.replace(/^\/en\//, `/${locale}/`);
  }
  return url;
}

export default function Projects({ locale, data }: ProjectsProps) {
  const [active, setActive] = useState("all");

  const filtered =
    active === "all"
      ? data.projects
      : data.projects.filter((project) => project.tags.includes(active));

  return (
    <section id={data.section.id} className="section section--tone1">
      <div className="shell">
        <SectionHead title={t(locale, "projects_title")} />

        <div
          className="project-filters"
          role="group"
          aria-label={t(locale, "projects_filter")}
        >
          {data.buttons.map((button) => (
            <button
              key={button.filter}
              type="button"
              className="filter-btn"
              aria-pressed={active === button.filter}
              onClick={() => setActive(button.filter)}
            >
              {button.filter === "all"
                ? t(locale, "proj_all")
                : t(locale, PROJECT_FILTER_KEY[button.filter] ?? button.name)}
            </button>
          ))}
        </div>

        <ol className="plates">
          {filtered.map((project, index) => {
            const image = PROJECT_IMAGES[project.name];
            const href = project.url || project.repo;
            const mainHref = href ? localizeInternal(href, locale) : null;
            const external = mainHref ? /^https?:\/\//.test(mainHref) : false;

            return (
              <li
                className={[
                  "plate",
                  image ? "" : "plate--text",
                  index % 2 === 1 ? "plate--flip" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={project.name}
              >
                {image && (
                  <div
                    className={
                      image.mark ? "plate-media plate-media--mark" : "plate-media"
                    }
                  >
                    <Image
                      src={assetPath(image.src)}
                      alt={t(locale, image.altKey)}
                      fill
                      sizes="(max-width: 960px) 100vw, 58vw"
                    />
                  </div>
                )}

                <div className="plate-body">
                  <p className="plate-meta">
                    {project.role} · {project.timeline}
                  </p>
                  <h3 className="plate-title">
                    {mainHref ? (
                      <a
                        href={mainHref}
                        {...(external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {project.name}
                      </a>
                    ) : (
                      project.name
                    )}
                  </h3>
                  <p className="plate-summary">
                    <InlineText text={project.summary} />
                  </p>
                  <p className="plate-tags">
                    {project.tags.join(", ")}
                  </p>
                  <div className="plate-links">
                    {project.url && (
                      <a
                        className="plate-link"
                        href={localizeInternal(project.url, locale)}
                        {...(/^https?:\/\//.test(project.url)
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {t(locale, "live_preview")}
                      </a>
                    )}
                    {project.repo && (
                      <a
                        className="plate-link"
                        href={project.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t(locale, "source_code")}
                      </a>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {filtered.length === 0 && (
          <p className="project-empty">{t(locale, "no_projects")}</p>
        )}
      </div>
    </section>
  );
}
