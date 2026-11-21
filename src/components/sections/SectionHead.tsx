import Link from "next/link";

interface SectionHeadProps {
  title: string;
  id?: string;
  /** Optional real navigation, rendered as a plain sentence-case link. */
  action?: { label: string; href: string };
}

export default function SectionHead({ title, id, action }: SectionHeadProps) {
  return (
    <div className="sec-head">
      <h2 className="sec-title" id={id}>
        {title}
      </h2>
      {action && (
        <Link className="sec-action" href={action.href}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
