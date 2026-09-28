import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Camera, Home, Ruler } from "lucide-react";
import type { ListingSummary } from "@/lib/ddf/types";
import { daysSince, formatArea } from "@/lib/utils/format";
import { FavoriteButton } from "./FavoriteButton";

/**
 * Listing card. Works in both Server and Client Components (no server-only
 * imports) so it can render search results and the client-side saved list.
 */
export function PropertyCard({ listing, priority = false }: { listing: ListingSummary; priority?: boolean }) {
  const href = `/properties/${listing.slug}`;
  const age = daysSince(listing.listedAt);
  const area = listing.livingArea ? formatArea(listing.livingArea.value, listing.livingArea.units) : null;
  const locationLine = [listing.neighbourhood, listing.city].filter(Boolean).join(", ");

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)] ring-1 ring-line/70 transition-shadow duration-300 hover:shadow-[var(--shadow-float)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        {listing.photo ? (
          <Image
            src={listing.photo.url}
            alt={listing.photo.caption ?? `${listing.propertyType} at ${listing.streetAddress}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            quality={75}
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted">
            <Home className="size-10" aria-hidden="true" />
            <span className="sr-only">No photo available</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-wrap gap-1.5">
            {listing.transaction === "lease" ? (
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">For rent</span>
            ) : null}
            {age !== null && age <= 7 ? (
              <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink">New</span>
            ) : null}
          </div>
        </div>
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton listingKey={listing.key} label={listing.streetAddress} />
        </div>
        {listing.photoCount > 1 ? (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            <Camera className="size-3.5" aria-hidden="true" /> {listing.photoCount}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xl font-bold tracking-tight">{listing.priceLabel}</p>
          <p className="shrink-0 text-xs font-medium text-muted">{listing.propertyType}</p>
        </div>
        <h3 className="mt-1.5 line-clamp-1 font-semibold text-ink">
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {listing.streetAddress}
          </Link>
        </h3>
        {locationLine ? <p className="line-clamp-1 text-sm text-muted">{locationLine}</p> : null}

        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-4 text-sm text-ink-soft">
          {listing.beds != null ? (
            <li className="inline-flex items-center gap-1.5">
              <BedDouble className="size-4 text-muted" aria-hidden="true" />
              {listing.beds} <span className="sr-only sm:not-sr-only">bed{listing.beds === 1 ? "" : "s"}</span>
            </li>
          ) : null}
          {listing.baths != null ? (
            <li className="inline-flex items-center gap-1.5">
              <Bath className="size-4 text-muted" aria-hidden="true" />
              {listing.baths} <span className="sr-only sm:not-sr-only">bath{listing.baths === 1 ? "" : "s"}</span>
            </li>
          ) : null}
          {area ? (
            <li className="inline-flex items-center gap-1.5">
              <Ruler className="size-4 text-muted" aria-hidden="true" />
              {area}
            </li>
          ) : null}
        </ul>
      </div>
      {/* Keyboard focus ring for the stretched link */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)] ring-accent ring-offset-2 group-has-[a:focus-visible]:ring-2" />
    </article>
  );
}
