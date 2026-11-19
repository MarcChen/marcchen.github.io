import Link from "next/link";

interface SectionHeadProps {
  title: string;
  label?: string;
  labelHref?: string;
  id?: string;
}

export default function SectionHead({
  title,
  label,
  labelHref,
  id,
}: SectionHeadProps) {
  return (
    <div className="sec-head">
      <h2 className="sec-title" id={id}>
        {title}
      </h2>
      {label &&
        (labelHref ? (
          <Link className="sec-label sec-label--link" href={labelHref}>
            {label}
          </Link>
        ) : (
          <p className="sec-label">{label}</p>
        ))}
    </div>
  );
}
