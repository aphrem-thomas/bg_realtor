/**
 * The listing search model shared by the UI (URL query string) and the server
 * (DDF query builder). Kept free of server-only imports so client components
 * can build search URLs with it.
 */

export const PROPERTY_CATEGORIES = [
  { value: "house", label: "House" },
  { value: "condo", label: "Condo / Apartment" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi-family", label: "Multi-family" },
  { value: "land", label: "Vacant land" },
] as const;

export type PropertyCategory = (typeof PROPERTY_CATEGORIES)[number]["value"];

export const TRANSACTION_TYPES = [
  { value: "sale", label: "For sale" },
  { value: "lease", label: "For rent / lease" },
] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number]["value"];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest listings" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export const LISTED_WITHIN_OPTIONS = [
  { value: 1, label: "Last 24 hours" },
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
] as const;

export const PRICE_OPTIONS = [
  200_000, 300_000, 400_000, 500_000, 600_000, 700_000, 800_000, 900_000, 1_000_000, 1_250_000, 1_500_000,
  2_000_000, 3_000_000, 5_000_000,
] as const;

export const COUNT_OPTIONS = [1, 2, 3, 4, 5] as const;

export type ListingSearch = {
  /** Free-text location: city, neighbourhood or community. */
  location?: string;
  city?: string;
  neighbourhood?: string;
  category?: PropertyCategory;
  transaction?: TransactionType;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  minBaths?: number;
  minSqft?: number;
  minParking?: number;
  /** Only listings added within this many days. */
  listedWithin?: number;
  sort: SortOption;
  page: number;
};

export const DEFAULT_SEARCH: ListingSearch = { sort: "newest", page: 1 };

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

function read(params: RawParams, key: string): string | undefined {
  const value = params instanceof URLSearchParams ? params.get(key) : params[key];
  const single = Array.isArray(value) ? value[0] : value;
  const trimmed = single?.trim();
  return trimmed ? trimmed : undefined;
}

function readInt(params: RawParams, key: string, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const raw = read(params, key)?.replace(/[^0-9]/g, "");
  if (!raw) return undefined;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value < min) return undefined;
  return Math.min(value, max);
}

function readText(params: RawParams, key: string) {
  // Allow letters (incl. accents), digits, spaces and common punctuation in place names.
  const value = read(params, key)
    ?.replace(/[^\p{L}\p{N}\s'’.\-]/gu, "")
    .replace(/\s+/g, " ")
    .slice(0, 60)
    .trim();
  return value || undefined;
}

function readEnum<T extends string>(params: RawParams, key: string, allowed: readonly { value: T }[]) {
  const raw = read(params, key);
  return allowed.find((option) => option.value === raw)?.value;
}

/** Parse and sanitise untrusted query-string input into a ListingSearch. */
export function parseListingSearch(params: RawParams): ListingSearch {
  let minPrice = readInt(params, "minPrice", { max: 100_000_000 });
  let maxPrice = readInt(params, "maxPrice", { max: 100_000_000 });
  if (minPrice && maxPrice && minPrice > maxPrice) [minPrice, maxPrice] = [maxPrice, minPrice];

  return {
    location: readText(params, "location"),
    city: readText(params, "city"),
    neighbourhood: readText(params, "neighbourhood"),
    category: readEnum(params, "type", PROPERTY_CATEGORIES),
    transaction: readEnum(params, "transaction", TRANSACTION_TYPES),
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    minBeds: readInt(params, "beds", { min: 1, max: 10 }),
    minBaths: readInt(params, "baths", { min: 1, max: 10 }),
    minSqft: readInt(params, "minSqft", { min: 1, max: 100_000 }),
    minParking: readInt(params, "parking", { min: 1, max: 10 }),
    listedWithin: readInt(params, "listed", { min: 1, max: 365 }),
    sort: readEnum(params, "sort", SORT_OPTIONS) ?? "newest",
    page: readInt(params, "page", { min: 1, max: 1_000 }) ?? 1,
  };
}

/** Serialise a search back to a query string (omits defaults and empty values). */
export function searchToQuery(search: Partial<ListingSearch>): string {
  const params = new URLSearchParams();
  const entries: [string, string | number | undefined][] = [
    ["location", search.location],
    ["city", search.city],
    ["neighbourhood", search.neighbourhood],
    ["type", search.category],
    ["transaction", search.transaction],
    ["minPrice", search.minPrice],
    ["maxPrice", search.maxPrice],
    ["beds", search.minBeds],
    ["baths", search.minBaths],
    ["minSqft", search.minSqft],
    ["parking", search.minParking],
    ["listed", search.listedWithin],
    ["sort", search.sort && search.sort !== "newest" ? search.sort : undefined],
    ["page", search.page && search.page > 1 ? search.page : undefined],
  ];
  for (const [key, value] of entries) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function countActiveFilters(search: ListingSearch): number {
  return [
    search.location,
    search.city,
    search.neighbourhood,
    search.category,
    search.transaction,
    search.minPrice,
    search.maxPrice,
    search.minBeds,
    search.minBaths,
    search.minSqft,
    search.minParking,
    search.listedWithin,
  ].filter((value) => value !== undefined).length;
}

const CATEGORY_PLURALS: Record<PropertyCategory, string> = {
  house: "houses",
  condo: "condos",
  townhouse: "townhouses",
  "multi-family": "multi-family homes",
  land: "lots & land",
};

const titleCase = (value: string) => value.toLowerCase().replace(/(^|[\s\-'’.])(\p{L})/gu, (_m, sep: string, c: string) => sep + c.toUpperCase());

/** Human-readable summary, e.g. "3+ bed houses for sale in Kanata". Used in titles. */
export function describeSearch(search: ListingSearch): string {
  const noun = search.category ? CATEGORY_PLURALS[search.category] : "homes";
  const verb = search.transaction === "lease" ? " for rent" : search.transaction === "sale" ? " for sale" : "";
  const placeRaw = search.location ?? search.neighbourhood ?? search.city;
  const place = placeRaw ? ` in ${titleCase(placeRaw)}` : "";
  const text = `${search.minBeds ? `${search.minBeds}+ bed ` : ""}${noun}${verb}${place}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
