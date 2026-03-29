"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import SectionWrapper from "@/components/ui/SectionWrapper";
import type { ProjectsSection } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import filterStyles from "@/styles/components/Skills.module.css";
import styles from "@/styles/components/Projects.module.css";

interface ProjectsProps {
  locale: Locale;
  data: ProjectsSection;
  alternate?: boolean;
}

export default function Projects({ data, alternate }: ProjectsProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all"
      ? data.projects
      : data.projects.filter((p) => p.tags.includes(activeFilter));

  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <h2 className="section-title">{data.section.name}</h2>

      <div className={filterStyles.filterBar}>
        {data.buttons.map((btn) => (
          <button
            key={btn.filter}
            className={`${filterStyles.filterBtn} ${activeFilter === btn.filter ? filterStyles.active : ""}`}
            onClick={() => setActiveFilter(btn.filter)}
          >
            {btn.name}
          </button>
        ))}
      </div>

      <div className={styles.projectsGrid}>
        {filtered.map((project) => (
          <div key={project.name} className={styles.projectCard}>
            <div className={styles.projectHeader}>
              {project.logo && (
                <Image
                  src={project.logo}
                  alt={project.name}
                  width={40}
                  height={40}
                  className={styles.projectLogo}
                />
              )}
              <div className={styles.projectHeaderInfo}>
                <h3 className={styles.projectName}>{project.name}</h3>
                <div className={styles.projectMeta}>
                  <span>{project.role}</span>
                  <span>•</span>
                  <span>{project.timeline}</span>
                </div>
              </div>
            </div>

            <p className={styles.projectSummary}>{project.summary}</p>

            <div className={styles.projectTags}>
              {project.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>

            <div className={styles.projectLinks}>
              {project.repo && (
                <a
                  href={project.repo}
                  className={styles.projectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubIcon size={16} />
                  GitHub
                </a>
              )}
              {project.url && (
                <a
                  href={project.url}
                  className={styles.projectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={16} />
                  Website
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
