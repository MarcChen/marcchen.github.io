import { isValidLocale, locales, type Locale } from "@/lib/i18n";
import {
  getAuthor,
  getAbout,
  getSkills,
  getExperiences,
  getEducation,
  getProjects,
} from "@/lib/data";
import Hero from "@/components/sections/Hero";
import Certifications from "@/components/sections/Certifications";
import Skills from "@/components/sections/Skills";
import Experiences from "@/components/sections/Experiences";
import Education from "@/components/sections/Education";
import Projects from "@/components/sections/Projects";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Home: intro (hero + 3D ride), certifications, skills, professional
 * experience, education (grades + documents) and side projects linking to the
 * blog. Achievements live on the Photos page; accomplishments and featured
 * posts were retired from the home page.
 */
export default async function HomePage({ params }: PageProps) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : "en";

  const author = getAuthor(locale);
  const about = getAbout(locale);
  const skills = getSkills(locale);
  const experiences = getExperiences(locale);
  const education = getEducation(locale);
  const projects = getProjects(locale);

  return (
    <>
      <Hero locale={locale} author={author} />
      {about.section.enable && <Certifications data={about} />}
      {skills.section.enable && <Skills locale={locale} data={skills} alternate />}
      {experiences.section.enable && <Experiences locale={locale} data={experiences} />}
      {education.section.enable && <Education locale={locale} data={education} alternate />}
      {projects.section.enable && <Projects locale={locale} data={projects} />}
    </>
  );
}
