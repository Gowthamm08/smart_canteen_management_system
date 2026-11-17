import Link from "next/link";

type BrandLogoProps = {
  appearance?: "light" | "dark";
  size?: "regular" | "compact";
  className?: string;
};

/** The shared Smart Canteen wordmark, designed to read clearly on light and dark surfaces. */
export function BrandLogo({
  appearance = "dark",
  size = "regular",
  className = "",
}: BrandLogoProps) {
  return (
    <Link
      href="/"
      aria-label="Smart Canteen home"
      className={`brand-logo brand-logo--${appearance} brand-logo--${size} ${className}`.trim()}
    >
      <svg
        className="brand-logo__emblem"
        viewBox="0 0 48 48"
        role="img"
        aria-label="Plate and leaf emblem"
      >
        <circle cx="24" cy="24" r="20.5" fill="none" stroke="currentColor" strokeWidth="1" opacity=".48" />
        <circle cx="24" cy="24" r="16.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M19 29.5c.8-7 6.4-11.2 13.4-11.5-.2 7.6-4.8 13.1-12.3 13.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 33c3.2-5.2 6.7-8.7 11.5-12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M17 17.5v6m3-6v6m-6-6v4.2a3 3 0 0 0 6 0v-4.2m-3 7.2v6.8" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" opacity=".72" />
      </svg>
      <span className="brand-logo__type">
        <span className="brand-logo__name">SMART CANTEEN</span>
        <span className="brand-logo__tagline">CAMPUS DINING</span>
      </span>
    </Link>
  );
}
