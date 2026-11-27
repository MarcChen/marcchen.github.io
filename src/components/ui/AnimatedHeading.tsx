interface AnimatedHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

/** Section heading: wide uppercase display that slides up inside a mask as it
 *  scrolls into view (CSS view timeline; static where unsupported). */
export default function AnimatedHeading({ title, subtitle, className = "" }: AnimatedHeadingProps) {
  return (
    <div className={`section-heading ${className}`}>
      <h2 className="section-title">
        <span className="title-mask">
          <span className="title-rise">{title}</span>
        </span>
      </h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
}
