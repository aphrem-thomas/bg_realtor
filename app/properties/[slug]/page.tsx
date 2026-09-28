import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Calculator, MapPin } from "lucide-react";
import { complianceConfig } from "@/config/compliance";
import { realtor } from "@/config/realtor";
import { siteConfig } from "@/config/site";
import { LeadForm } from "@/components/forms/LeadForm";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import { ListingViewTracker } from "@/components/property/ListingViewTracker";
import { PoweredByRealtor } from "@/components/property/PoweredByRealtor";
import { PropertyFactsTable, PropertyHighlights } from "@/components/property/PropertyFacts";
import { PropertyFeatures, RoomsTable } from "@/components/property/PropertyFeatures";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { PropertyMap } from "@/components/property/PropertyMap";
import { RealtorCard } from "@/components/realtor/RealtorCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { PropertyGridSkeleton } from "@/components/ui/Skeleton";
import { getListing, getListingOfficeName, getSimilarListings } from "@/lib/ddf/listings";
import type { Listing } from "@/lib/ddf/types";
import { breadcrumbJsonLd, listingJsonLd } from "@/lib/seo/structured-data";
import { daysSince } from "@/lib/utils/format";
import { listingKeyFromSlug } from "@/lib/utils/slug";

type Props = { params: Promise<{ slug: string }> };

// Rendered per request so DDF outages surface the friendly error boundary.
// DDF responses themselves are cached for 5 minutes in the Next.js Data
// Cache (see lib/ddf/client.ts), so this does not hit DDF on every view.

async function loadListing(slug: string): Promise<Listing> {
  const key = listingKeyFromSlug(slug);
  if (!key) notFound();
  // Errors other than "not found" bubble up to ./error.tsx (friendly retry UI).
  const listing = await getListing(key);
  if (!listing) notFound();
  return listing;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const key = listingKeyFromSlug(slug);
  let listing: Listing | null = null;
  try {
    listing = key ? await getListing(key) : null;
  } catch {
    // DDF unavailable: the page itself renders the error boundary.
    return { title: "Property details", robots: { index: false } };
  }
  if (!listing) return { title: "Property not found", robots: { index: false } };

  const place = [listing.city, listing.province].filter(Boolean).join(", ");
  const title = `${listing.streetAddress}${listing.addressVisible && listing.city ? `, ${listing.city}` : ""} — ${listing.priceLabel}`;
  const facts = [
    listing.beds != null ? `${listing.beds} bed` : null,
    listing.baths != null ? `${listing.baths} bath` : null,
    listing.propertyType,
  ]
    .filter(Boolean)
    .join(", ");
  const description = `${facts} ${listing.transaction === "lease" ? "for rent" : "for sale"} in ${place}. ${listing.description?.slice(0, 120) ?? ""}`.trim();

  return {
    title,
    description,
    alternates: { canonical: `/properties/${listing.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${siteConfig.url}/properties/${listing.slug}`,
      images: listing.photos.slice(0, 1).map((p) => ({ url: p.url, alt: listing.streetAddress })),
    },
  };
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const listing = await loadListing(slug);

  // Old or hand-typed URLs → canonical slug (address may have been corrected upstream).
  if (slug !== listing.slug) permanentRedirect(`/properties/${listing.slug}`);

  const officeName = complianceConfig.showListingBrokerage ? await getListingOfficeName(listing.listOfficeKey) : null;
  const age = daysSince(listing.listedAt);
  const location = [listing.neighbourhood, listing.city, listing.province].filter(Boolean).join(", ");
  const title = listing.addressVisible ? listing.streetAddress : `${listing.propertyType} in ${listing.city ?? "the area"}`;

  return (
    <article className="container-page pt-6 sm:pt-8">
      <JsonLd
        data={[
          listingJsonLd(listing),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Properties", path: "/properties" },
            { name: title, path: `/properties/${listing.slug}` },
          ]),
        ]}
      />
      <ListingViewTracker listingKey={listing.key} price={listing.price} city={listing.city} />

      <div className="mb-5 flex items-center justify-between gap-4">
        <Breadcrumbs
          items={[
            { name: "Properties", href: "/properties" },
            ...(listing.city ? [{ name: listing.city, href: `/properties?city=${encodeURIComponent(listing.city)}` }] : []),
            { name: title },
          ]}
        />
        <Link href="/properties" className="btn-ghost hidden shrink-0 sm:inline-flex">
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to search
        </Link>
      </div>

      <PropertyGallery photos={listing.photos} title={title} />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:mt-12 lg:grid-cols-[1fr_400px] lg:gap-14">
        <div className="min-w-0 space-y-12">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
                {listing.transaction === "lease" ? "For rent" : "For sale"}
              </span>
              <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold">{listing.propertyType}</span>
              {age !== null && age <= 7 ? <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">New listing</span> : null}
            </div>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
                {location ? (
                  <p className="mt-2 flex items-center gap-1.5 text-muted">
                    <MapPin className="size-4" aria-hidden="true" /> {location}
                    {listing.postalCode ? ` ${listing.postalCode}` : ""}
                  </p>
                ) : null}
              </div>
              <div className="text-left sm:text-right">
                <p className="text-3xl font-bold tracking-tight sm:text-4xl">{listing.priceLabel}</p>
                {complianceConfig.showMlsNumber && listing.mlsNumber ? <p className="mt-1 text-sm text-muted">MLS® {listing.mlsNumber}</p> : null}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <FavoriteButton listingKey={listing.key} label={title} variant="outline" />
              <a href="#inquire" className="btn-primary lg:hidden">
                Request a viewing
              </a>
            </div>
          </header>

          <PropertyHighlights listing={listing} />

          {listing.description ? (
            <section aria-labelledby="about-heading">
              <h2 id="about-heading" className="text-2xl font-semibold tracking-tight">
                About this home
              </h2>
              <p className="mt-4 leading-relaxed whitespace-pre-line text-ink-soft">{listing.description}</p>
              {listing.inclusions ? (
                <p className="mt-4 text-sm text-ink-soft">
                  <span className="font-semibold text-ink">Inclusions:</span> {listing.inclusions}
                </p>
              ) : null}
            </section>
          ) : null}

          <section aria-labelledby="details-heading">
            <h2 id="details-heading" className="text-2xl font-semibold tracking-tight">
              Property details
            </h2>
            <div className="mt-4">
              <PropertyFactsTable listing={listing} showMlsNumber={complianceConfig.showMlsNumber} />
            </div>
          </section>

          {listing.featureGroups.length ? (
            <section aria-labelledby="features-heading">
              <h2 id="features-heading" className="text-2xl font-semibold tracking-tight">
                Features & amenities
              </h2>
              <div className="mt-6">
                <PropertyFeatures groups={listing.featureGroups} />
              </div>
            </section>
          ) : null}

          {listing.rooms.length ? (
            <section aria-labelledby="rooms-heading">
              <h2 id="rooms-heading" className="text-2xl font-semibold tracking-tight">
                Rooms
              </h2>
              <div className="mt-4">
                <RoomsTable rooms={listing.rooms} />
              </div>
            </section>
          ) : null}

          {listing.location ? (
            <section aria-labelledby="map-heading">
              <h2 id="map-heading" className="text-2xl font-semibold tracking-tight">
                Location
              </h2>
              <div className="mt-4">
                <PropertyMap location={listing.location} exact={listing.addressVisible} label={title} />
              </div>
            </section>
          ) : null}

          {/* DDF® attribution — see config/compliance.ts */}
          <section aria-label="Listing attribution" className="space-y-3 rounded-2xl border border-line p-5 text-xs leading-relaxed text-muted">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                {officeName ? (
                  <p>
                    Listed by <span className="font-semibold text-ink">{officeName}</span>
                  </p>
                ) : null}
                {listing.board ? <p>Data provided by {listing.board}.</p> : null}
              </div>
              <PoweredByRealtor listingUrl={listing.realtorCaUrl} listingKey={listing.key} />
            </div>
            <p>{complianceConfig.listingDisclaimer}</p>
            <p>{complianceConfig.trademarkNotice}</p>
          </section>
        </div>

        <aside id="inquire" className="min-w-0 scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <h2 className="text-xl font-semibold tracking-tight">Interested in this property?</h2>
            <p className="mt-1 text-sm text-muted">Ask a question or book a private viewing. We usually reply within the hour.</p>
            <div className="mt-5 rounded-2xl bg-paper p-4">
              <RealtorCard location="property_sidebar" />
            </div>
            <div className="mt-5">
              <LeadForm listingKey={listing.key} address={title} realtorName={realtor.name} />
            </div>
          </div>
          {listing.transaction === "sale" && listing.price ? (
            <Link
              href="/eligibility"
              className="card mt-4 flex items-center gap-4 p-5 transition-colors hover:border-accent/40"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                <Calculator className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold">Can you afford this home?</span>
                <span className="text-sm text-muted">Get a free estimate in 2 minutes</span>
              </span>
            </Link>
          ) : null}
        </aside>
      </div>

      <section aria-labelledby="similar-heading" className="mt-24">
        <h2 id="similar-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Similar homes nearby
        </h2>
        <div className="mt-8">
          <Suspense fallback={<PropertyGridSkeleton count={3} />}>
            <SimilarHomes listing={listing} />
          </Suspense>
        </div>
      </section>
    </article>
  );
}

async function SimilarHomes({ listing }: { listing: Listing }) {
  const similar = await getSimilarListings(listing).catch(() => []);
  if (similar.length === 0) {
    return (
      <p className="text-muted">
        No similar homes right now.{" "}
        <Link href="/properties" className="font-semibold text-ink underline">
          Browse all properties
        </Link>
        .
      </p>
    );
  }
  return <PropertyGrid listings={similar} />;
}
