/* ============================================================
   TypeScript interfaces mirroring the YAML data structures
   from the existing Hugo / Toha theme.
   ============================================================ */

// ---- Shared ----

export interface SectionConfig {
  name: string;
  id: string;
  enable: boolean;
  weight: number;
  showOnNavbar: boolean;
  hideTitle?: boolean;
  template?: string;
  filter?: boolean;
}

// ---- Author & Site ----

export interface ContactInfo {
  email: string;
  github: string;
  linkedin: string;
  phone?: string;
}

export interface Author {
  name: string;
  nickname: string;
  greeting: string;
  image: string;
  contactInfo: ContactInfo;
  summary: string[];
}

export interface SiteConfig {
  copyright: string;
  description: string;
}

// ---- About section ----

export interface SocialLink {
  name: string;
  icon: string;
  url: string;
}

export interface Badge {
  type: "soft-skill-indicator" | "certification";
  name: string;
  percentage?: number;
  color?: string;
  url?: string;
  badge?: string; // image url for certifications
}

export interface ResourceLink {
  title: string;
  url: string;
}

export interface AboutSection {
  section: SectionConfig;
  designation: string;
  company?: { name: string; url: string };
  resourceLinks: ResourceLink[];
  summary: string;
  socialLinks: SocialLink[];
  badges: Badge[];
}

// ---- Skills section ----

export interface FilterButton {
  name: string;
  filter: string;
}

export interface Skill {
  name: string;
  logo: string;
  summary: string;
  categories: string[];
  url?: string;
}

export interface SkillsSection {
  section: SectionConfig;
  buttons: FilterButton[];
  skills: Skill[];
}

// ---- Experiences section ----

export interface Company {
  name: string;
  url: string;
  location: string;
  logo: string;
  overview?: string;
  darkLogo?: string;
}

export interface Position {
  designation: string;
  start: string;
  end?: string;
  responsibilities: string[];
}

export interface Experience {
  company: Company;
  positions: Position[];
}

export interface ExperiencesSection {
  section: SectionConfig;
  experiences: Experience[];
}

// ---- Education section ----

export interface Institution {
  name: string;
  url?: string;
  logo: string;
  darkLogo?: string;
}

export interface Grade {
  scale: string;
  achieved: number;
  outOf: number;
}

export interface Course {
  name: string;
  outOf?: number;
  achieved?: number;
}

export interface TakenCourses {
  showGrades?: boolean;
  hideScale?: boolean;
  collapseAfter?: number;
  courses: Course[];
}

export interface GradesReport {
  name: string;
  url: string;
}

export interface Degree {
  name: string;
  icon: string;
  timeframe: string;
  institution: Institution;
  grade?: Grade;
  takenCourses?: TakenCourses;
  gradesReport?: GradesReport;
  extracurricularActivities?: string[];
  publications?: { title: string; url?: string }[];
  customSections?: { name: string; content: string }[];
}

export interface EducationSection {
  section: SectionConfig;
  degrees: Degree[];
}

// ---- Projects section ----

export interface Project {
  name: string;
  logo?: string;
  role: string;
  timeline: string;
  repo?: string;
  url?: string;
  summary: string;
  tags: string[];
}

export interface ProjectsSection {
  section: SectionConfig;
  buttons: FilterButton[];
  projects: Project[];
}

// ---- Accomplishments section ----

export interface Accomplishment {
  name: string;
  timeline: string;
  organization: {
    name: string;
    url: string;
  };
  courseOverview: string;
  certificateURL?: string;
}

export interface AccomplishmentsSection {
  section: SectionConfig;
  accomplishments: Accomplishment[];
}

// ---- Achievements section ----

export interface Achievement {
  title: string;
  image: string;
  summary: string;
  url?: string;
}

export interface AchievementsSection {
  section: SectionConfig;
  achievements: Achievement[];
}

// ---- Featured Posts section ----

export interface FeaturedPostsSection {
  section: SectionConfig;
  posts: string[]; // slug references
}

// ---- Recent Posts section ----

export interface RecentPostsSection {
  section: SectionConfig;
}

// ---- Blog Post ----

export interface PostFrontmatter {
  title: string;
  date: string;
  description: string;
  hero?: string;
  tags?: string[];
  menu?: {
    sidebar: {
      name: string;
      identifier: string;
      parent?: string;
      weight: number;
    };
  };
}

export interface PostMeta extends PostFrontmatter {
  slug: string;
  locale: string;
}

// ---- Section union ----

export type SectionData =
  | AboutSection
  | SkillsSection
  | ExperiencesSection
  | EducationSection
  | ProjectsSection
  | AccomplishmentsSection
  | AchievementsSection
  | FeaturedPostsSection
  | RecentPostsSection;
