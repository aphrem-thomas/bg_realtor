/**
 * Site-wide, non-secret configuration.
 *
 * Only values that are genuinely public live here. Anything secret (DDF
 * credentials, database URL, email API keys) is read in `lib/env.ts`, which is
 * server-only.
 */

/**
 * Canonical site URL. Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL (set this to your production domain)
 *   2. Vercel's production domain, then the deployment URL (set automatically on Vercel)
 *   3. http://localhost:3000
 * Empty values are ignored and a missing protocol defaults to https://, so a
 * blank or partial env var can't break the build.
 */
function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_ENV === "production" ? process.env.VERCEL_PROJECT_PRODUCTION_URL : undefined,
    process.env.VERCEL_URL,
  ];
  for (const raw of candidates) {
    const value = raw?.trim();
    if (!value) continue;
    try {
      return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`).origin;
    } catch {
      // Ignore malformed values and try the next candidate.
    }
  }
  return "http://localhost:3000";
}

const siteUrl = resolveSiteUrl();

export const siteConfig = {
  /** Brand / business name shown in the header, titles and structured data. */
  name: "Biju George Real Estate",
  /** Logo wordmark: bold primary text followed by an italic accent. */
  logo: { primary: "Biju George", accent: "Real Estate" },
  /** Short tagline used in the default <title> template. */
  tagline: "Ottawa homes with Royal LePage Team Realty",
  description:
    "Search homes for sale across Ottawa, check how much home you can afford, and buy or sell with Biju George, Broker with Royal LePage Team Realty.",
  url: siteUrl,
  locale: "en_CA",
  /** Currency used for all price formatting. */
  currency: "CAD",
  /** Default Open Graph / hero image. Replace with the realtor's own photography. */
  heroImage: {
    src: "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
    alt: "Modern two-storey home with floor-to-ceiling windows and a pool",
  },
  ogImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=630&fit=crop&q=80",
  /** Number of listings per page on /properties. DDF allows at most 100 per request. */
  pageSize: 12,
  /** Number of listings shown on the homepage "Featured" section. */
  featuredCount: 6,
} as const;

export const mainNav = [
  { href: "/buy", label: "Buy" },
  { href: "/sell", label: "Sell" },
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const legalNav = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
] as const;
