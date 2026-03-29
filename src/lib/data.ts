import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import type { Locale } from "./i18n";
import type {
  Author,
  SiteConfig,
  AboutSection,
  SkillsSection,
  ExperiencesSection,
  EducationSection,
  ProjectsSection,
  AccomplishmentsSection,
  AchievementsSection,
  FeaturedPostsSection,
  RecentPostsSection,
  SectionConfig,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "src", "data");

function readYaml<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf-8");
  return yaml.load(raw) as T;
}

// ---- Author & Site ----

export function getAuthor(locale: Locale): Author {
  return readYaml<Author>(path.join(DATA_DIR, locale, "author.yaml"));
}

export function getSiteConfig(locale: Locale): SiteConfig {
  return readYaml<SiteConfig>(path.join(DATA_DIR, locale, "site.yaml"));
}

// ---- Sections ----

export function getAbout(locale: Locale): AboutSection {
  return readYaml<AboutSection>(
    path.join(DATA_DIR, locale, "sections", "about.yaml")
  );
}

export function getSkills(locale: Locale): SkillsSection {
  return readYaml<SkillsSection>(
    path.join(DATA_DIR, locale, "sections", "skills.yaml")
  );
}

export function getExperiences(locale: Locale): ExperiencesSection {
  return readYaml<ExperiencesSection>(
    path.join(DATA_DIR, locale, "sections", "experiences.yaml")
  );
}

export function getEducation(locale: Locale): EducationSection {
  return readYaml<EducationSection>(
    path.join(DATA_DIR, locale, "sections", "education.yaml")
  );
}

export function getProjects(locale: Locale): ProjectsSection {
  return readYaml<ProjectsSection>(
    path.join(DATA_DIR, locale, "sections", "projects.yaml")
  );
}

export function getAccomplishments(locale: Locale): AccomplishmentsSection {
  return readYaml<AccomplishmentsSection>(
    path.join(DATA_DIR, locale, "sections", "accomplishments.yaml")
  );
}

export function getAchievements(locale: Locale): AchievementsSection {
  return readYaml<AchievementsSection>(
    path.join(DATA_DIR, locale, "sections", "achievements.yaml")
  );
}

export function getFeaturedPosts(locale: Locale): FeaturedPostsSection {
  return readYaml<FeaturedPostsSection>(
    path.join(DATA_DIR, locale, "sections", "featured-posts.yaml")
  );
}

export function getRecentPosts(locale: Locale): RecentPostsSection {
  return readYaml<RecentPostsSection>(
    path.join(DATA_DIR, locale, "sections", "recent-posts.yaml")
  );
}

/** Ordered list of all enabled sections */
export interface EnabledSection {
  id: string;
  name: string;
  weight: number;
  showOnNavbar: boolean;
}

export function getEnabledSections(locale: Locale): EnabledSection[] {
  const sectionFiles = [
    "about",
    "skills",
    "experiences",
    "education",
    "projects",
    "accomplishments",
    "achievements",
    "featured-posts",
    "recent-posts",
  ];

  const sections: EnabledSection[] = [];

  for (const name of sectionFiles) {
    const filePath = path.join(DATA_DIR, locale, "sections", `${name}.yaml`);
    if (!fs.existsSync(filePath)) continue;

    const data = readYaml<{ section: SectionConfig }>(filePath);
    if (data.section?.enable) {
      sections.push({
        id: data.section.id,
        name: data.section.name,
        weight: data.section.weight,
        showOnNavbar: data.section.showOnNavbar,
      });
    }
  }

  return sections.sort((a, b) => a.weight - b.weight);
}
