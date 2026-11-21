import Image from "next/image";
import type { AchievementsSection } from "@/lib/types";
import { assetPath } from "@/lib/paths";

interface AchievementsProps {
  data: AchievementsSection;
}

export default function Achievements({ data }: AchievementsProps) {
  if (!data.achievements.length) return null;

  return (
    <section
      id={data.section.id}
      className="achievements"
      aria-label={data.section.name}
    >
      {data.achievements.map((achievement) => (
        <article className="achievement-media" key={achievement.title}>
          <Image
            src={assetPath(achievement.image)}
            alt=""
            fill
            sizes="100vw"
            loading="eager"
          />
          <div className="achievement-scrim" aria-hidden="true" />
          <div className="achievement-inner">
            <h2 className="achievement-title">{achievement.title}</h2>
            <p className="achievement-summary">{achievement.summary}</p>
            {achievement.url && (
              <a
                className="achievement-link"
                href={achievement.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {achievement.title}
              </a>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
