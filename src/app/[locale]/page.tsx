import { isValidLocale, locales, type Locale } from "@/lib/i18n";
import {
  getAuthor,
  getAbout,
  getSkills,
  getExperiences,
  getEducation,
  getProjects,
  getAccomplishments,
  getAchievements,
  getFeaturedPosts,
  getEnabledSections,
} from "@/lib/data";
import { getPostsByIdentifiers } from "@/lib/mdx";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Experiences from "@/components/sections/Experiences";
import Education from "@/components/sections/Education";
import Projects from "@/components/sections/Projects";
import Accomplishments from "@/components/sections/Accomplishments";
import Achievements from "@/components/sections/Achievements";
import FeaturedPosts from "@/components/sections/FeaturedPosts";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";

  const author = getAuthor(locale);
  const enabledSections = getEnabledSections(locale);

  // Load all section data
  const about = getAbout(locale);
  const skills = getSkills(locale);
  const experiences = getExperiences(locale);
  const education = getEducation(locale);
  const projects = getProjects(locale);
  const accomplishments = getAccomplishments(locale);
  const achievements = getAchievements(locale);
  const featuredPostsConfig = getFeaturedPosts(locale);

  // Get featured post metadata
  const featuredPostsMeta = getPostsByIdentifiers(
    featuredPostsConfig.posts || [],
    locale
  );

  // Build ordered section rendering based on weight
  const sectionComponents: Record<
    string,
    { component: React.ReactNode; weight: number }
  > = {};

  if (about.section.enable) {
    sectionComponents[about.section.id] = {
      component: (
        <About
          key="about"
          locale={locale}
          data={about}
          alternate={false}
        />
      ),
      weight: about.section.weight,
    };
  }

  if (skills.section.enable) {
    sectionComponents[skills.section.id] = {
      component: (
        <Skills
          key="skills"
          locale={locale}
          data={skills}
          alternate={true}
        />
      ),
      weight: skills.section.weight,
    };
  }

  if (experiences.section.enable) {
    sectionComponents[experiences.section.id] = {
      component: (
        <Experiences
          key="experiences"
          locale={locale}
          data={experiences}
          alternate={false}
        />
      ),
      weight: experiences.section.weight,
    };
  }

  if (education.section.enable) {
    sectionComponents[education.section.id] = {
      component: (
        <Education
          key="education"
          locale={locale}
          data={education}
          alternate={true}
        />
      ),
      weight: education.section.weight,
    };
  }

  if (projects.section.enable) {
    sectionComponents[projects.section.id] = {
      component: (
        <Projects
          key="projects"
          locale={locale}
          data={projects}
          alternate={false}
        />
      ),
      weight: projects.section.weight,
    };
  }

  if (accomplishments.section.enable) {
    sectionComponents[accomplishments.section.id] = {
      component: (
        <Accomplishments
          key="accomplishments"
          locale={locale}
          data={accomplishments}
          alternate={true}
        />
      ),
      weight: accomplishments.section.weight,
    };
  }

  if (featuredPostsConfig.section.enable) {
    sectionComponents[featuredPostsConfig.section.id] = {
      component: (
        <FeaturedPosts
          key="featured-posts"
          id={featuredPostsConfig.section.id}
          locale={locale}
          title={featuredPostsConfig.section.name}
          posts={featuredPostsMeta}
          alternate={false}
        />
      ),
      weight: featuredPostsConfig.section.weight,
    };
  }

  if (achievements.section.enable) {
    sectionComponents[achievements.section.id] = {
      component: (
        <Achievements
          key="achievements"
          locale={locale}
          data={achievements}
          alternate={true}
        />
      ),
      weight: achievements.section.weight,
    };
  }

  // Sort by weight and alternate backgrounds
  const orderedSections = Object.entries(sectionComponents)
    .sort(([, a], [, b]) => a.weight - b.weight)
    .map(([, val]) => val.component);

  return (
    <>
      <Hero locale={locale} author={author} />
      {orderedSections}
    </>
  );
}
