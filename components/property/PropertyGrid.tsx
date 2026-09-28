import type { ListingSummary } from "@/lib/ddf/types";
import { PropertyCard } from "./PropertyCard";

export function PropertyGrid({ listings, priorityCount = 0 }: { listings: ListingSummary[]; priorityCount?: number }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing, index) => (
        <li key={listing.key} className="animate-fade-in" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
          <PropertyCard listing={listing} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
