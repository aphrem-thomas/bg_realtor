import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchX, WifiOff } from "lucide-react";
import { realtor } from "@/config/realtor";
import { siteConfig } from "@/config/site";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { Pagination } from "@/components/search/Pagination";
import { PropertyFilters } from "@/components/search/PropertyFilters";
import { SortSelect } from "@/components/search/SortSelect";
import { PropertyGridSkeleton } from "@/components/ui/Skeleton";
import { StateMessage } from "@/components/ui/StateMessage";
import { friendlyDdfMessage } from "@/lib/ddf/errors";
import { isMockMode, searchListings } from "@/lib/ddf/listings";
import { countActiveFilters, describeSearch, parseListingSearch, searchToQuery, type ListingSearch } from "@/lib/search/params";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const search = parseListingSearch(await searchParams);
  const title = countActiveFilters(search) ? describeSearch(search) : "Homes for sale";
  const filtered = countActiveFilters(search) > 0 || search.page > 1 || search.sort !== "newest";
  return {
    title,
    description: `${title}. Browse photos, prices and details for every active listing, then book a viewing with ${realtor.name}.`,
    // Canonicalise filtered/sorted variants to the main listing index to avoid thin duplicate pages.
    alternates: { canonical: "/properties" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function PropertiesPage({ searchParams }: Props) {
  const search = parseListingSearch(await searchParams);
  const heading = countActiveFilters(search) ? describeSearch(search) : "Homes for sale";

  return (
    <div className="container-page pt-8 sm:pt-12">
      <header className="max-w-3xl">
        <p className="eyebrow">Property search</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-5xl">{heading}</h1>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr] lg:items-start">
        <aside className="lg:sticky lg:top-24">
          {/* key: reset uncontrolled inputs when the URL changes */}
          <PropertyFilters key={searchToQuery(search)} search={search} areas={realtor.areasServed} />
        </aside>
        <section aria-label="Search results" aria-live="polite" className="min-w-0">
          <Suspense key={searchToQuery(search)} fallback={<ResultsSkeleton />}>
            <Results search={search} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <>
      <div className="mb-6 h-10" />
      <PropertyGridSkeleton count={6} />
    </>
  );
}

async function Results({ search }: { search: ListingSearch }) {
  let result;
  try {
    result = await searchListings(search);
  } catch (error) {
    console.error("[properties] search failed", error);
    const { title, description } = friendlyDdfMessage(error);
    return (
      <StateMessage
        tone="error"
        icon={<WifiOff className="size-6" aria-hidden="true" />}
        title={title}
        description={description}
        actions={
          <>
            <Link href={`/properties${searchToQuery(search)}`} className="btn-primary">
              Try again
            </Link>
            <Link href="/contact" className="btn-secondary">
              Contact {realtor.firstName}
            </Link>
          </>
        }
      />
    );
  }

  if (result.listings.length === 0) {
    return (
      <StateMessage
        icon={<SearchX className="size-6" aria-hidden="true" />}
        title="No homes match those filters"
        description={
          <>
            Try widening your price range or removing a filter. Tip: location search matches a full city or neighbourhood name
            (e.g. “Ottawa” or “Westboro”). Or let {realtor.firstName} search for you — many homes sell before they hit the market.
          </>
        }
        actions={
          <>
            <Link href="/properties" className="btn-secondary">
              Clear filters
            </Link>
            <Link href="/buy" className="btn-primary">
              Get personalized matches
            </Link>
          </>
        }
      />
    );
  }

  const start = (result.page - 1) * result.pageSize + 1;
  const end = start + result.listings.length - 1;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Showing <span className="font-semibold text-ink">{start}–{end}</span> of{" "}
          <span className="font-semibold text-ink">{result.total.toLocaleString("en-CA")}</span> homes
          {isMockMode() ? <span className="ml-2 rounded-full bg-sand px-2 py-0.5 text-xs">Sample data</span> : null}
        </p>
        <SortSelect value={search.sort} />
      </div>
      <PropertyGrid listings={result.listings} priorityCount={3} />
      <Pagination search={search} totalPages={result.totalPages} />
      <p className="mt-10 text-center text-xs text-muted">
        Listings refresh every few minutes. Results limited to {siteConfig.pageSize} per page.
      </p>
    </>
  );
}
