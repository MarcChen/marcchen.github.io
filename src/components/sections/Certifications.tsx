import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
import type { AboutSection } from "@/lib/types";
import { cloudinaryUrl } from "@/lib/cloudinary";
import styles from "@/styles/components/Certifications.module.css";

interface CertificationsProps {
  data: AboutSection;
  alternate?: boolean;
}

/** Certification badges only (from about.yaml `badges` of type "certification"). */
export default function Certifications({ data, alternate }: CertificationsProps) {
  const certs = data.badges.filter((b) => b.type === "certification");
  if (certs.length === 0) return null;

  return (
    <SectionWrapper id={data.section.id} alternate={alternate}>
      <AnimatedHeading title={data.section.name} />
      <ul className={styles.list}>
        {certs.map((cert, i) => (
          <li key={cert.name} className={styles.item} style={{ ["--i" as string]: i }}>
            <a href={cert.url} target="_blank" rel="noopener noreferrer" className={styles.card}>
              {cert.badge && (
                <span className={styles.badge}>
                  <Image
                    src={cloudinaryUrl(cert.badge)}
                    alt=""
                    width={88}
                    height={88}
                    unoptimized
                  />
                </span>
              )}
              <span className={styles.name}>{cert.name}</span>
              <ArrowUpRight className={styles.arrow} size={18} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}
