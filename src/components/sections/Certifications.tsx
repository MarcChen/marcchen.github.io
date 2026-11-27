import Image from "next/image";
import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
import type { AboutSection } from "@/lib/types";
import { cloudinaryUrl } from "@/lib/cloudinary";
import styles from "@/styles/components/Certifications.module.css";

interface CertificationsProps {
  data: AboutSection;
  alternate?: boolean;
}

/** Certifications as round seals: the label runs around the ring, the real
 *  Credly badge sits in the centre. Hover turns the ring. */
export default function Certifications({ data, alternate }: CertificationsProps) {
  const certs = data.badges.filter((b) => b.type === "certification");
  if (certs.length === 0) return null;

  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <AnimatedHeading title={data.section.name} />
      <ul className={styles.seals}>
        {certs.map((cert, i) => {
          const ring = cert.ring ?? `${cert.name.toUpperCase()} · `;
          const pathId = `seal-ring-${i}`;
          return (
            <li key={cert.name}>
              <a href={cert.url} target="_blank" rel="noopener noreferrer" className={styles.seal}>
                <span className={styles.disc}>
                  <svg className={styles.ring} viewBox="0 0 200 200" aria-hidden="true">
                    <defs>
                      <path id={pathId} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
                    </defs>
                    <circle cx="100" cy="100" r="96" className={styles.outer} />
                    <circle cx="100" cy="100" r="63" className={styles.inner} />
                    <text className={styles.ringText}>
                      <textPath href={`#${pathId}`} textLength="486" lengthAdjust="spacing">
                        {ring}
                      </textPath>
                    </text>
                  </svg>
                  {cert.badge && (
                    <span className={styles.core}>
                      <Image src={cloudinaryUrl(cert.badge)} alt="" width={96} height={96} unoptimized />
                    </span>
                  )}
                </span>
                <span className={styles.name}>{cert.name}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </SectionWrapper>
  );
}
