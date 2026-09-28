import "server-only";

import { realtor } from "@/config/realtor";
import { siteConfig } from "@/config/site";
import type { Listing } from "@/lib/ddf/types";

/** schema.org JSON-LD builders. Rendered with <JsonLd /> in server components. */

export function realEstateAgentJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${siteConfig.url}/#agent`,
    name: realtor.name,
    url: siteConfig.url,
    image: realtor.photo.src,
    email: `mailto:${realtor.email}`,
    telephone: realtor.phone,
    description: realtor.shortBio,
    areaServed: realtor.areasServed.map((name) => ({ "@type": "City", name })),
    knowsLanguage: realtor.languages.length ? realtor.languages : undefined,
    parentOrganization: {
      "@type": "RealEstateAgent",
      name: realtor.brokerage.name,
      address: realtor.brokerage.address,
      telephone: realtor.brokerage.phone,
      url: realtor.brokerage.url,
    },
    sameAs: [realtor.website, ...realtor.social.map((s) => s.url)].filter(Boolean),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/properties?location={location}`,
      "query-input": "required name=location",
    },
  };
}

function residenceType(listing: Listing): string {
  if (listing.ownership === "Condo/Strata") return "Apartment";
  if (/house|detached/i.test(listing.propertyType)) return "SingleFamilyResidence";
  if (/town|row/i.test(listing.propertyType)) return "House";
  return "Residence";
}

export function listingJsonLd(listing: Listing) {
  const url = `${siteConfig.url}/properties/${listing.slug}`;
  const address = {
    "@type": "PostalAddress",
    ...(listing.addressVisible ? { streetAddress: listing.streetAddress, postalCode: listing.postalCode ?? undefined } : {}),
    addressLocality: listing.city ?? undefined,
    addressRegion: listing.province ?? undefined,
    addressCountry: "CA",
  };

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": url,
    url,
    name: listing.addressVisible ? `${listing.streetAddress}, ${listing.city ?? ""}`.trim() : listing.streetAddress,
    description: listing.description?.slice(0, 500),
    datePosted: listing.listedAt ?? undefined,
    image: listing.photos.slice(0, 6).map((p) => p.url),
    offers: listing.price
      ? {
          "@type": "Offer",
          price: listing.price,
          priceCurrency: "CAD",
          availability: "https://schema.org/InStock",
          businessFunction: listing.transaction === "lease" ? "http://purl.org/goodrelations/v1#LeaseOut" : "http://purl.org/goodrelations/v1#Sell",
        }
      : undefined,
    about: {
      "@type": residenceType(listing),
      address,
      numberOfRooms: listing.beds ?? undefined,
      numberOfBedrooms: listing.beds ?? undefined,
      numberOfBathroomsTotal: listing.baths ?? undefined,
      floorSize: listing.livingArea
        ? { "@type": "QuantitativeValue", value: listing.livingArea.value, unitText: listing.livingArea.units }
        : undefined,
      yearBuilt: listing.yearBuilt ?? undefined,
      // Only publish coordinates when the address itself may be displayed.
      geo:
        listing.location && listing.addressVisible
          ? { "@type": "GeoCoordinates", latitude: listing.location.lat, longitude: listing.location.lng }
          : undefined,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}
