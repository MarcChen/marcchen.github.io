"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
import MagneticButton from "@/components/ui/MagneticButton";
import type { ProjectsSection } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { assetPath } from "@/lib/paths";
import { t } from "@/lib/i18n";
import filterStyles from "@/styles/components/Skills.module.css";
import styles from "@/styles/components/Projects.module.css";

interface ProjectsProps {
  locale: Locale;
  data: ProjectsSection;
  alternate?: boolean;
}

export default function Projects({ locale, data, alternate }: ProjectsProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all"
      ? data.projects
      : data.projects.filter((p) => p.tags.includes(activeFilter));

  const featuredProject = filtered.length > 0 ? filtered[0] : null;
  const standardProjects = filtered.length > 1 ? filtered.slice(1) : [];

  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <div className={styles.sectionHeader}>
        <span className="section-label">{t(locale, "section_work_label")}</span>
        <AnimatedHeading title={data.section.name} />
      </div>

      <div className={filterStyles.filterContainer}>
        <div className={filterStyles.filterTrack}>
          {data.buttons.map((btn) => (
            <button
              key={btn.filter}
              className={`${filterStyles.filterBtn} ${activeFilter === btn.filter ? filterStyles.active : ""}`}
              onClick={() => setActiveFilter(btn.filter)}
            >
              {activeFilter === btn.filter && (
                <motion.div 
                  layoutId="projectsFilter" 
                  className={filterStyles.activeFilterBg} 
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className={filterStyles.filterText}>{btn.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.projectsContainer}>
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <motion.div layout className={styles.projectsLayout}>
              
              {/* Featured Project Spotlight */}
              {featuredProject && (
                <motion.div
                  key={`feat-${featuredProject.name}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className={styles.featuredCard}
                >
                  <div className={styles.featuredGlow} />
                  <div className={styles.featuredContent}>
                    <div className={styles.featuredHeader}>
                      {featuredProject.logo && (
                        <div className={styles.featuredLogoWrapper}>
                          <Image
                            src={assetPath(featuredProject.logo)}
                            alt={featuredProject.name}
                            width={48}
                            height={48}
                            className={styles.featuredLogo}
                          />
                        </div>
                      )}
                      <div>
                        <span className={styles.featuredBadge}>{t(locale, "featured_project")}</span>
                        <h3 className={styles.featuredTitle}>{featuredProject.name}</h3>
                      </div>
                    </div>
                    
                    <p className={styles.featuredSummary}>{featuredProject.summary}</p>
                    
                    <div className={styles.featuredMeta}>
                       <span className={styles.metaLabel}>{t(locale, "role_label")}</span>
                       <span className={styles.metaValue}>{featuredProject.role}</span>
                       <span className={styles.metaDivider}>•</span>
                       <span className={styles.metaValue}>{featuredProject.timeline}</span>
                    </div>

                    <div className={styles.featuredTags}>
                      {featuredProject.tags.map((tag) => (
                        <span key={tag} className={styles.featuredTag}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className={styles.featuredActions}>
                      {featuredProject.url && (
                        <MagneticButton href={featuredProject.url} target="_blank" icon={ArrowUpRight}>
                          {t(locale, "live_preview")}
                        </MagneticButton>
                      )}
                      {featuredProject.repo && (
                        <MagneticButton href={featuredProject.repo} variant="outline" target="_blank" icon={GithubIcon}>
                          {t(locale, "source_code")}
                        </MagneticButton>
                      )}
                    </div>
                  </div>
                  
                  {/* Abstract graphic for the featured project */}
                  <div className={styles.featuredVisual}>
                    <div className={styles.visualCircles}>
                      <div className={styles.circle1} />
                      <div className={styles.circle2} />
                      <div className={styles.circle3} />
                    </div>
                    <div className={styles.visualGrid} />
                  </div>
                </motion.div>
              )}

              {/* Standard Masonry Grid */}
              {standardProjects.length > 0 && (
                <div className={styles.standardGrid}>
                  {standardProjects.map((project, idx) => (
                    <motion.div
                      key={`std-${project.name}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className={styles.standardCard}
                    >
                      <div className={styles.standardHeader}>
                        <div className={styles.standardTitleGroup}>
                          {project.logo && (
                            <Image
                              src={assetPath(project.logo)}
                              alt={project.name}
                              width={32}
                              height={32}
                              className={styles.standardLogo}
                            />
                          )}
                          <h4 className={styles.standardTitle}>{project.name}</h4>
                        </div>
                        <div className={styles.standardLinks}>
                          {project.repo && (
                            <a href={project.repo} target="_blank" rel="noopener noreferrer" className={styles.iconLink}>
                              <GithubIcon size={18} />
                            </a>
                          )}
                          {project.url && (
                            <a href={project.url} target="_blank" rel="noopener noreferrer" className={styles.iconLink}>
                              <ArrowUpRight size={18} />
                            </a>
                          )}
                        </div>
                      </div>

                      <p className={styles.standardSummary}>{project.summary}</p>

                      <div className={styles.standardMeta}>
                         <span>{project.role}</span>
                         <span>•</span>
                         <span>{project.timeline}</span>
                      </div>

                      <div className={styles.standardTags}>
                        {project.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="tag tag-secondary">
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                           <span className={styles.moreTags}>+{project.tags.length - 3}</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="empty" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className={styles.emptyState}
            >
              <p>{t(locale, "no_projects")}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionWrapper>
  );
}
