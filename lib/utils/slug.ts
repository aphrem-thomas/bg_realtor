/** Turn arbitrary text into a URL-safe slug ("123 Main St, Ottawa" → "123-main-st-ottawa"). */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/**
 * Property URLs are `/properties/{readable-address}-{ListingKey}`.
 * The DDF ListingKey is always the final hyphen-separated segment.
 */
export function buildListingSlug(readable: string, listingKey: string): string {
  const base = slugify(readable);
  return base ? `${base}-${listingKey}` : listingKey;
}

const LISTING_KEY_PATTERN = /^[A-Za-z0-9]{1,32}$/;

export function listingKeyFromSlug(slug: string): string | null {
  const key = decodeURIComponent(slug).split("-").pop() ?? "";
  return LISTING_KEY_PATTERN.test(key) ? key : null;
}

export function isValidListingKey(key: string): boolean {
  return LISTING_KEY_PATTERN.test(key);
}
