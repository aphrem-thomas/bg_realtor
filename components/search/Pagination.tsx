import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { searchToQuery, type ListingSearch } from "@/lib/search/params";
import { cn } from "@/lib/utils/cn";

/** Server-rendered, crawlable pagination links. */
export function Pagination({ search, totalPages }: { search: ListingSearch; totalPages: number }) {
  if (totalPages <= 1) return null;
  const current = Math.min(search.page, totalPages);
  const href = (page: number) => `/properties${searchToQuery({ ...search, page })}`;

  const pages = new Set([1, totalPages, current - 1, current, current + 1].filter((p) => p >= 1 && p <= totalPages));
  const sorted = [...pages].sort((a, b) => a - b);

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1.5">
      <PageLink href={current > 1 ? href(current - 1) : null} label="Previous page">
        <ChevronLeft className="size-4" aria-hidden="true" />
      </PageLink>
      {sorted.map((page, index) => (
        <span key={page} className="flex items-center gap-1.5">
          {index > 0 && page - sorted[index - 1] > 1 ? <span className="px-1 text-muted">…</span> : null}
          <Link
            href={href(page)}
            aria-current={page === current ? "page" : undefined}
            className={cn(
              "grid size-11 place-items-center rounded-full text-sm font-semibold transition-colors",
              page === current ? "bg-ink text-white" : "text-ink-soft hover:bg-ink/5",
            )}
          >
            {page}
          </Link>
        </span>
      ))}
      <PageLink href={current < totalPages ? href(current + 1) : null} label="Next page">
        <ChevronRight className="size-4" aria-hidden="true" />
      </PageLink>
    </nav>
  );
}

function PageLink({ href, label, children }: { href: string | null; label: string; children: React.ReactNode }) {
  const className = "grid size-11 place-items-center rounded-full border border-line bg-surface";
  if (!href) {
    return (
      <span aria-disabled="true" aria-label={label} className={cn(className, "opacity-40")}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} rel={label.startsWith("Next") ? "next" : "prev"} className={cn(className, "hover:border-ink/30")}>
      {children}
    </Link>
  );
}
