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
import type { ReactNode } from "react";

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
  const about = getAbout(locale);
  const skills = getSkills(locale);
  const experiences = getExperiences(locale);
  const education = getEducation(locale);
  const projects = getProjects(locale);
  const accomplishments = getAccomplishments(locale);
  const achievements = getAchievements(locale);
  const featured = getFeaturedPosts(locale);
  const featuredPosts = getPostsByIdentifiers(featured.posts || [], locale);

  const currentExperience = experiences.experiences[0];
  const currentPosition = currentExperience?.positions[0];

  const sections: { weight: number; node: ReactNode }[] = [];

  if (about.section.enable) {
    sections.push({
      weight: about.section.weight,
      node: (
        <About
          key="about"
          locale={locale}
          data={about}
          author={author}
          current={
            currentExperience && currentPosition
              ? {
                  designation: currentPosition.designation,
                  company: {
                    name: currentExperience.company.name,
                    url: currentExperience.company.url,
                  },
                  location: currentExperience.company.location,
                }
              : undefined
          }
        />
      ),
    });
  }

  if (skills.section.enable) {
    sections.push({
      weight: skills.section.weight,
      node: <Skills key="skills" locale={locale} data={skills} />,
    });
  }

  if (experiences.section.enable) {
    sections.push({
      weight: experiences.section.weight,
      node: (
        <Experiences key="experiences" locale={locale} data={experiences} />
      ),
    });
  }

  if (education.section.enable) {
    sections.push({
      weight: education.section.weight,
      node: <Education key="education" locale={locale} data={education} />,
    });
  }

  if (projects.section.enable) {
    sections.push({
      weight: projects.section.weight,
      node: <Projects key="projects" locale={locale} data={projects} />,
    });
  }

  if (accomplishments.section.enable) {
    sections.push({
      weight: accomplishments.section.weight,
      node: (
        <Accomplishments
          key="accomplishments"
          locale={locale}
          data={accomplishments}
        />
      ),
    });
  }

  if (featured.section.enable && featuredPosts.length > 0) {
    sections.push({
      weight: featured.section.weight,
      node: (
        <FeaturedPosts
          key="featured-posts"
          id={featured.section.id}
          locale={locale}
          posts={featuredPosts}
        />
      ),
    });
  }

  if (achievements.section.enable) {
    sections.push({
      weight: achievements.section.weight,
      node: <Achievements key="achievements" data={achievements} />,
    });
  }

  const ordered = sections
    .sort((a, b) => a.weight - b.weight)
    .map((entry) => entry.node);

  return (
    <>
      <Hero locale={locale} author={author} />
      {ordered}
    </>
  );
}
