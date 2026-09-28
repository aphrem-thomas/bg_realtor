import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label={`${siteConfig.name} — home`}>
      <span
        aria-hidden="true"
        className={cn(
          "grid size-9 place-items-center rounded-xl transition-transform group-hover:-rotate-6",
          inverted ? "bg-white text-ink" : "bg-ink text-white",
        )}
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M6 10v9.5h12V10" />
          <path d="M10 19.5v-5h4v5" />
        </svg>
      </span>
      <span className={cn("text-lg font-bold tracking-tight", inverted ? "text-white" : "text-ink")}>
        {siteConfig.logo.primary}
        {siteConfig.logo.accent ? <span className="font-display font-normal italic"> {siteConfig.logo.accent}</span> : null}
      </span>
    </Link>
  );
}
