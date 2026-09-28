import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getSitemapListings } from "@/lib/ddf/listings";

// Regenerate hourly so new listings are discoverable and delisted ones drop out.
export const revalidate = 3600;

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/properties", priority: 0.9, changeFrequency: "hourly" },
  { path: "/buy", priority: 0.7, changeFrequency: "monthly" },
  { path: "/sell", priority: 0.7, changeFrequency: "monthly" },
  { path: "/eligibility", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${siteConfig.url}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let listingEntries: MetadataRoute.Sitemap = [];
  try {
    const listings = await getSitemapListings();
    listingEntries = listings.map((listing) => ({
      url: `${siteConfig.url}/properties/${listing.slug}`,
      lastModified: listing.updatedAt ? new Date(listing.updatedAt) : now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
  } catch (error) {
    // Serve the static part of the sitemap if DDF is unavailable.
    console.error("[sitemap] listing fetch failed", error);
  }

  return [...staticEntries, ...listingEntries];
}
