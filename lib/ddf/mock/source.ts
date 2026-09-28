import "server-only";

import type { ListingSearch } from "@/lib/search/params";
import { CATEGORY_RULES } from "../constants";
import { toTitleCase } from "../odata";
import type { ListingDataSource } from "../source";
import type { DdfProperty } from "../types";
import { MOCK_PROPERTIES } from "./data";

/**
 * In-memory implementation of the same search semantics as the OData query
 * builder (see ../odata.ts). Lets the UI be developed without DDF credentials.
 */

const equalsPlace = (value: string | null | undefined, place: string) => (value ?? "") === place;

function matches(p: DdfProperty, s: ListingSearch, now: number): boolean {
  if (s.location) {
    const place = toTitleCase(s.location);
    if (!equalsPlace(p.City, place) && !equalsPlace(p.CityRegion, place) && !equalsPlace(p.SubdivisionName, place)) return false;
  }
  if (s.city && !equalsPlace(p.City, toTitleCase(s.city))) return false;
  if (s.neighbourhood) {
    const hood = toTitleCase(s.neighbourhood);
    if (!equalsPlace(p.CityRegion, hood) && !equalsPlace(p.SubdivisionName, hood)) return false;
  }
  if (s.category && !CATEGORY_RULES[s.category].matches(p)) return false;

  const price = s.transaction === "lease" ? p.LeaseAmount : p.ListPrice;
  if (s.transaction === "sale" && !(p.ListPrice && p.ListPrice > 0)) return false;
  if (s.transaction === "lease" && !(p.LeaseAmount && p.LeaseAmount > 0)) return false;
  if (s.minPrice && !(price != null && price >= s.minPrice)) return false;
  if (s.maxPrice && !(price != null && price <= s.maxPrice)) return false;

  if (s.minBeds && !((p.BedroomsTotal ?? 0) >= s.minBeds)) return false;
  if (s.minBaths && !((p.BathroomsTotalInteger ?? 0) >= s.minBaths)) return false;
  if (s.minSqft && !((p.LivingArea ?? 0) >= s.minSqft)) return false;
  if (s.minParking && !((p.ParkingTotal ?? 0) >= s.minParking)) return false;
  if (s.listedWithin) {
    const listed = p.OriginalEntryTimestamp ? new Date(p.OriginalEntryTimestamp).getTime() : 0;
    if (listed < now - s.listedWithin * 86_400_000) return false;
  }
  return true;
}

function compare(sort: ListingSearch["sort"]) {
  return (a: DdfProperty, b: DdfProperty) => {
    if (sort === "price-asc") return (a.ListPrice ?? Infinity) - (b.ListPrice ?? Infinity);
    if (sort === "price-desc") return (b.ListPrice ?? -Infinity) - (a.ListPrice ?? -Infinity);
    return (b.OriginalEntryTimestamp ?? "").localeCompare(a.OriginalEntryTimestamp ?? "");
  };
}

/** Simulate network latency in development so loading states are visible. */
const latency = () => new Promise((resolve) => setTimeout(resolve, process.env.NODE_ENV === "development" ? 250 : 0));

export const mockSource: ListingDataSource = {
  name: "mock",

  async search(search, pageSize) {
    await latency();
    const now = Date.now();
    const filtered = MOCK_PROPERTIES.filter((p) => matches(p, search, now)).sort(compare(search.sort));
    const start = (search.page - 1) * pageSize;
    return { records: filtered.slice(start, start + pageSize), total: filtered.length };
  },

  async getByKey(key) {
    await latency();
    return MOCK_PROPERTIES.find((p) => p.ListingKey === key) ?? null;
  },

  async getByKeys(keys) {
    const wanted = new Set(keys);
    return MOCK_PROPERTIES.filter((p) => wanted.has(p.ListingKey));
  },

  async getOffice(key) {
    return key === "mock-office-1" ? { OfficeKey: key, OfficeName: "Sample Realty Brokerage (mock data)" } : null;
  },

  async listForSitemap(limit) {
    return MOCK_PROPERTIES.slice(0, limit);
  },
};
