"use client";

import { useState } from "react";
import type { ProjectsSection } from "@/lib/types";
import { t, type Locale } from "@/lib/i18n";
import SectionHead from "@/components/sections/SectionHead";
import InlineText from "@/components/ui/InlineText";

interface ProjectsProps {
  locale: Locale;
  data: ProjectsSection;
}

const PROJECT_FILTER_KEY: Record<string, string> = { all: "proj_all", professional: "proj_professional", academic: "proj_academic", hobby: "proj_hobby" }; function localizeInternal(url: string, locale: Locale): string {
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
        <SectionHead
          title={t(locale, "projects_title")}
          label={t(locale, "label_selected")}
        />

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
              {button.filter === "all" ? t(locale, "proj_all") : t(locale, PROJECT_FILTER_KEY[button.filter] ?? button.name)}
            </button>
          ))}
        </div>

        <ol className="project-list">
          {filtered.map((project) => {
            const href = project.url || project.repo;
            const mainHref = href ? localizeInternal(href, locale) : null;
            const external = mainHref ? /^https?:\/\//.test(mainHref) : false;

            return (
              <li className="project-row" key={project.name}>
                <p className="project-time">{project.timeline}</p>

                <div className="project-body">
                  <h3 className="project-title">
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
                  <p className="project-role">{project.role}</p>
                  <p className="project-summary">
                    <InlineText text={project.summary} />
                  </p>
                  <p className="project-tags">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </p>
                </div>

                <div className="project-links">
                  {project.url && (
                    <a
                      className="project-link"
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
                      className="project-link"
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t(locale, "source_code")}
                    </a>
                  )}
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
