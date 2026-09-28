import "server-only";

import { cache } from "react";
import { siteConfig } from "@/config/site";
import { ddfEnv } from "@/lib/env";
import { DEFAULT_SEARCH, type ListingSearch } from "@/lib/search/params";
import { isValidListingKey } from "@/lib/utils/slug";
import { liveSource } from "./live-source";
import { isDisplayable, mapListing, mapSummary } from "./mapper";
import { mockSource } from "./mock/source";
import type { ListingDataSource } from "./source";
import type { Listing, ListingSearchResult, ListingSummary } from "./types";

/**
 * Listings service — the only module UI code should import for listing data.
 * Chooses the data source, maps raw DDF records to domain objects and applies
 * display rules. Results are cached per request (React `cache`) and across
 * requests (Next.js Data Cache inside the DDF client).
 */

function source(): ListingDataSource {
  return ddfEnv.mode === "live" ? liveSource : mockSource;
}

export function isMockMode(): boolean {
  return ddfEnv.mode !== "live";
}

// React's cache() compares arguments by identity, so key the cached search by
// its serialised form to dedupe metadata + page renders within a request.
const searchBySerialisedQuery = cache(async (serialised: string, pageSize: number): Promise<ListingSearchResult> => {
  const search = JSON.parse(serialised) as ListingSearch;
  const { records, total } = await source().search(search, pageSize);
  const listings = records.filter(isDisplayable).map(mapSummary);
  return {
    listings,
    total,
    page: search.page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
});

export function searchListings(search: ListingSearch, pageSize: number = siteConfig.pageSize): Promise<ListingSearchResult> {
  return searchBySerialisedQuery(JSON.stringify(search), pageSize);
}

export const getFeaturedListings = cache(async (count: number = siteConfig.featuredCount): Promise<ListingSummary[]> => {
  // Featured = newest active listings for sale. Swap this for the realtor's own
  // listings (e.g. filter by ListAgentKey) if preferred.
  const { listings } = await searchListings({ ...DEFAULT_SEARCH, transaction: "sale" }, count);
  return listings;
});

export const getListing = cache(async (key: string): Promise<Listing | null> => {
  if (!isValidListingKey(key)) return null;
  const record = await source().getByKey(key);
  if (!record || !isDisplayable(record)) return null;
  return mapListing(record);
});

export const getListingOfficeName = cache(async (officeKey: string | null): Promise<string | null> => {
  if (!officeKey) return null;
  try {
    const office = await source().getOffice(officeKey);
    return office?.OfficeName?.trim() || null;
  } catch (error) {
    // Office lookup is non-critical; the listing still renders without it.
    console.error("[ddf] office lookup failed", error);
    return null;
  }
});

export async function getListingsByKeys(keys: string[]): Promise<ListingSummary[]> {
  const valid = Array.from(new Set(keys.filter(isValidListingKey))).slice(0, 50);
  if (valid.length === 0) return [];
  const records = await source().getByKeys(valid);
  const byKey = new Map(records.filter(isDisplayable).map((r) => [r.ListingKey, mapSummary(r)]));
  // Preserve the caller's order (e.g. most recently saved first).
  return valid.map((key) => byKey.get(key)).filter((l): l is ListingSummary => Boolean(l));
}

/** Similar homes: same city and category-ish price band, excluding the current listing. */
export async function getSimilarListings(listing: Listing, count = 3): Promise<ListingSummary[]> {
  if (!listing.city) return [];
  const band = listing.price ? { minPrice: Math.round(listing.price * 0.75), maxPrice: Math.round(listing.price * 1.25) } : {};
  const { listings } = await searchListings(
    { ...DEFAULT_SEARCH, city: listing.city, transaction: listing.transaction, ...band },
    count + 1,
  );
  return listings.filter((l) => l.key !== listing.key).slice(0, count);
}

export async function getSitemapListings(limit = 2_000): Promise<{ slug: string; updatedAt: string | null }[]> {
  const records = await source().listForSitemap(limit);
  return records.filter(isDisplayable).map((r) => ({ slug: mapSummary(r).slug, updatedAt: r.ModificationTimestamp ?? null }));
}
