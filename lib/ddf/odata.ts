import type { ListingSearch } from "@/lib/search/params";
import { CATEGORY_RULES } from "./constants";

/**
 * Translate the site's ListingSearch into DDF® OData query options.
 *
 * Supported operators per CREA docs: eq, ne, gt, lt, ge, le, and, or, not, in,
 * has, and the `any` lambda. String functions such as contains()/startswith()
 * are NOT documented, so free-text location search uses exact (title-cased)
 * matches against City, CityRegion and SubdivisionName.
 */

/** Escape a string literal for OData: single quotes are doubled. */
export function odataString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/** "ottawa" → "Ottawa", "st. catharines" → "St. Catharines", "orléans" → "Orléans". */
export function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/(^|[\s\-'’.(])(\p{L})/gu, (_match, sep: string, letter: string) => `${sep}${letter.toUpperCase()}`);
}

export function buildFilter(search: ListingSearch, now: Date = new Date()): string | undefined {
  const clauses: string[] = [];

  if (search.location) {
    const place = odataString(toTitleCase(search.location));
    clauses.push(`(City eq ${place} or CityRegion eq ${place} or SubdivisionName eq ${place})`);
  }
  if (search.city) clauses.push(`City eq ${odataString(toTitleCase(search.city))}`);
  if (search.neighbourhood) {
    const hood = odataString(toTitleCase(search.neighbourhood));
    clauses.push(`(CityRegion eq ${hood} or SubdivisionName eq ${hood})`);
  }

  if (search.category) clauses.push(`(${CATEGORY_RULES[search.category].odata})`);

  const priceField = search.transaction === "lease" ? "LeaseAmount" : "ListPrice";
  if (search.transaction === "sale") clauses.push("ListPrice gt 0");
  if (search.transaction === "lease") clauses.push("LeaseAmount gt 0");
  if (search.minPrice) clauses.push(`${priceField} ge ${search.minPrice}`);
  if (search.maxPrice) clauses.push(`${priceField} le ${search.maxPrice}`);

  if (search.minBeds) clauses.push(`BedroomsTotal ge ${search.minBeds}`);
  if (search.minBaths) clauses.push(`BathroomsTotalInteger ge ${search.minBaths}`);
  if (search.minSqft) clauses.push(`LivingArea ge ${search.minSqft}`);
  if (search.minParking) clauses.push(`ParkingTotal ge ${search.minParking}`);

  if (search.listedWithin) {
    const since = new Date(now.getTime() - search.listedWithin * 86_400_000);
    since.setUTCHours(0, 0, 0, 0);
    clauses.push(`OriginalEntryTimestamp ge ${since.toISOString()}`);
  }

  return clauses.length ? clauses.join(" and ") : undefined;
}

export function buildOrderBy(sort: ListingSearch["sort"]): string {
  // A unique secondary key keeps pagination stable (CREA: "there is no guarantee on the order").
  switch (sort) {
    case "price-asc":
      return "ListPrice asc,ListingKey asc";
    case "price-desc":
      return "ListPrice desc,ListingKey asc";
    default:
      return "OriginalEntryTimestamp desc,ListingKey asc";
  }
}

export function buildKeyFilter(keys: string[]): string {
  return `ListingKey in (${keys.map(odataString).join(",")})`;
}
