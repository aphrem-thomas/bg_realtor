# Biju George Real Estate — realtor website

A production-ready real estate website for Biju George, Broker with Royal LePage Team Realty, built with **Next.js 16 (App Router)**, **TypeScript** and **Tailwind CSS v4**. Listings come from the **REALTOR.ca DDF® Web API**. The site has two goals: help visitors find homes, and turn interested visitors into qualified leads.

- Property search with filters, sorting and pagination (server-rendered, crawlable)
- Property detail pages with SEO-friendly URLs, a gallery with full-screen viewer, facts, features, rooms, map, and an inquiry or viewing-request form
- Lead capture everywhere: property inquiry, viewing request, affordability check, contact, buyer consultation, and seller home evaluation
- Affordability ("eligibility") estimator using Canadian mortgage rules
- Realtor profile, testimonials, saved homes, and legal pages
- SEO: metadata, canonical URLs, Open Graph, JSON-LD, sitemap and robots
- DDF credentials and all other secrets stay on the server

---

## 1. Quick start

Requires Node.js 20.9+ (tested on 24).

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. With no DDF credentials the site runs in **mock mode**. It uses a built-in sample dataset shaped exactly like DDF records, so every page and form works right away. Leads are saved to `.data/leads.json` and notification emails are printed to the terminal.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm test` | Unit tests (affordability calculator, OData query builder, form validation) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run db:migrate` | Apply SQL migrations to `DATABASE_URL` |
| `npm run ddf:check` | Verify DDF credentials and print a sample listing |
| `npm run ddf:metadata` | Download DDF `$metadata` and print the lookup values used by filters |

---

## 2. Configuring DDF credentials

Add these to `.env.local`, or to your host's environment variables:

```bash
DDF_CLIENT_ID=your-data-feed-username
DDF_CLIENT_SECRET=your-data-feed-password
DDF_DESTINATION_ID=12345   # your feed's Destination ID (for CREA analytics)
DDF_MODE=auto              # auto | live | mock
```

`DDF_USERNAME` / `DDF_PASSWORD` are accepted as aliases. Then run:

```bash
npm run ddf:check
npm run ddf:metadata
```

`ddf:metadata` prints the real lookup values for `StructureType`, `PropertySubType` and `CommonInterest`. Compare them with `CATEGORY_RULES` in [`lib/ddf/constants.ts`](lib/ddf/constants.ts) and adjust if needed (see §10).

### How DDF authentication works

This follows CREA's published DDF® Web API documentation (https://ddfapi-docs.realtor.ca/).

1. **Token.** The server POSTs `grant_type=client_credentials`, `client_id`, `client_secret` and `scope=DDFApi_Read` to `https://identity.crea.ca/connect/token`. The response has a Bearer `access_token` that lasts 60 minutes and does not slide.
2. **Data.** Requests go to the OData v4 API at `https://ddfapi.realtor.ca/odata/v1/` (`Property`, `Property('{key}')`, `Office`, `Member`, `OpenHouse`, replication endpoints) with `Authorization: Bearer …`. Supported query options are `$filter`, `$select`, `$orderby`, `$top` (max 100), `$skip` and `$count`.
3. **Caching.** [`lib/ddf/auth.ts`](lib/ddf/auth.ts) keeps the token in memory and refreshes it 2 minutes before expiry. Concurrent requests share one token request, and a `401` triggers a single retry with a fresh token.

```
Browser ──▶ Next.js server (Server Components / Route Handlers)
                 │  lib/ddf/listings.ts   → domain objects, display rules
                 │  lib/ddf/live-source.ts→ OData queries
                 │  lib/ddf/client.ts     → bearer token, timeout, typed errors, Data Cache
                 ▼
          identity.crea.ca (token)   ddfapi.realtor.ca (listings)
```

The browser never talks to DDF. Credentials live only in server-only modules: `lib/env.ts` imports `server-only`, so the build fails if client code imports it. A production build was scanned and contains no credentials or DDF endpoints in client bundles.

### What's available from DDF and how it's used

| Need | DDF field(s) |
| --- | --- |
| Price (sale / lease) | `ListPrice`, `LeaseAmount` + `LeaseAmountFrequency` |
| Address | `StreetNumber`, `StreetName`, `StreetSuffix`, `UnitNumber`, `City`, `CityRegion`, `StateOrProvince`, `PostalCode` |
| Type | `StructureType[]`, `PropertySubType`, `CommonInterest` (Condo/Strata vs Freehold) |
| Size / rooms | `BedroomsTotal`, `BathroomsTotalInteger`, `LivingArea`, `LotSizeArea`, `LotSizeDimensions`, `ParkingTotal`, `Rooms[]` |
| Features | `Heating`, `Cooling`, `Basement`, `Flooring`, `Appliances`, `ParkingFeatures`, `CommunityFeatures`, … |
| Photos | `Media[]` (`MediaURL`, `Order`, `PreferredPhotoYN`, `MediaCategory`) |
| Location | `Latitude`, `Longitude` |
| Compliance | `ListingURL` (REALTOR.ca link), `ListOfficeKey` → `Office.OfficeName`, `InternetEntireListingDisplayYN`, `InternetAddressDisplayYN` |

### Caching and performance

- DDF responses are cached in the Next.js Data Cache for 5 minutes (`complianceConfig.listingCacheSeconds`), so repeat views don't call DDF again. Office names are cached for 24 hours and the sitemap for 1 hour.
- Search results request only the card fields (`$select`) with 12 per page and `$count`.
- The homepage is statically generated and revalidated every 5 minutes.
- Listing and search pages render per request, but read from the cache.
- Listing pages deliberately have no route-level `loading.tsx`. That keeps real `404` (delisted home) and `308` (non-canonical slug) status codes, which matter for SEO. Streaming would force a `200` status.
- To scale to a large feed (for example the National Shared Pool), add a data source that reads from your own database, kept in sync with DDF's replication endpoints (`PropertyReplication`). The `ListingDataSource` interface in [`lib/ddf/source.ts`](lib/ddf/source.ts) is the only thing that needs a new implementation.

### Mock / development mode

`DDF_MODE=auto` (the default) uses live DDF when credentials exist and mock data otherwise. Mock mode ([`lib/ddf/mock/`](lib/ddf/mock)) serves 24 fictional Ottawa-area listings **in raw DDF shape**. They go through the same mapper, display rules and filter semantics as live data, so nothing in the UI is mock-specific. Results pages show a "Sample data" badge in mock mode. Photos are Unsplash placeholders.

---

## 3. Leads database

**Choice: PostgreSQL**, via the `pg` driver and a plain SQL migration.

- Leads are relational, append-heavy records that an admin will filter by status, source, date and property. Postgres does this well, and `jsonb` stores source-specific details such as eligibility inputs and results without schema churn.
- Every major host offers managed Postgres (Neon, Supabase, Vercel Postgres, RDS, Render, Railway), often with free tiers.
- There's no ORM lock-in. The schema is one readable SQL file, and the `LeadRepository` interface makes swapping storage (or adding Prisma or Drizzle later) a local change.

Setup:

```bash
# .env.local
DATABASE_URL=postgres://user:pass@host:5432/dbname
# DATABASE_SSL=verify   # verify (default) | no-verify | off

npm run db:migrate      # creates the `leads` table (db/migrations/001_create_leads.sql)
```

Storage selection (`LEAD_STORE=auto`): Postgres when `DATABASE_URL` is set. Otherwise a JSON file at `.data/leads.json`, which is **development only**. In production the app refuses to fall back to the file store silently, because serverless filesystems are ephemeral.

---

## 4. Realtor information and branding

All personal content lives in **[`config/realtor.ts`](config/realtor.ts)**: name, photo, bio, brokerage, areas served, specialties, designations, languages, social links and testimonials. Name, email and phone can also be overridden with `REALTOR_NAME`, `REALTOR_EMAIL` and `REALTOR_PHONE`.

| To change | Edit |
| --- | --- |
| Business name, tagline, hero image, OG image, page size | [`config/site.ts`](config/site.ts) |
| Colours, radii, shadows, fonts | `@theme` tokens at the top of [`app/globals.css`](app/globals.css) (components only use semantic names like `ink`, `paper`, `accent`) |
| Fonts | [`app/layout.tsx`](app/layout.tsx) (Manrope + Instrument Serif via `next/font`) |
| Logo | [`components/layout/Logo.tsx`](components/layout/Logo.tsx) (replace the SVG mark or use an image) |
| Navigation | `mainNav` / `legalNav` in `config/site.ts` |
| Affordability assumptions (rates, ratios, tax rate) | [`config/finance.ts`](config/finance.ts). **Update `contractRate` regularly.** |
| Photos | Replace the Unsplash placeholder URLs with the realtor's own images. Add their host to `images.remotePatterns` in `next.config.ts`, or put files in `/public`. |

---

## 5. Running locally

```bash
npm run dev              # mock mode, file-based leads, console emails
```

To go "fully live" locally, set the DDF credentials and `DATABASE_URL`, then run `npm run db:migrate`.

## 6. Deploying

Any Node host that supports Next.js works. Vercel is the simplest.

1. Create a managed Postgres database, then run `DATABASE_URL=… npm run db:migrate` once.
2. Set the environment variables in your host's dashboard:
   - Required: `NEXT_PUBLIC_SITE_URL` (your https domain; if left empty, Vercel's production domain is used, so canonical URLs and the sitemap still work), `DDF_CLIENT_ID`, `DDF_CLIENT_SECRET`, `DATABASE_URL`
   - Recommended: `DDF_DESTINATION_ID`, `EMAIL_PROVIDER=resend`, `EMAIL_API_KEY`, `EMAIL_FROM` (a verified sender domain), `LEAD_NOTIFICATION_EMAIL`
3. Deploy. `robots.txt` blocks crawlers on non-production Vercel deployments automatically.
4. Submit `https://yourdomain/sitemap.xml` to Google Search Console.

Security headers (HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`) are set in `next.config.ts`.

---

## 7. How the lead system works

```
Form (Client Component, useActionState)
  → Server Action (app/actions/leads.ts)
      honeypot + per-IP rate limit
      zod validation (lib/leads/schemas.ts) — field errors returned to the form
      server-side enrichment (e.g. listing address/URL snapshot for inquiries)
  → createLead() (lib/leads/service.ts)
      1. save via LeadRepository (Postgres or dev file)
      2. after the response is sent: email the realtor + run CRM integrations
      ↳ if saving fails, email the realtor synchronously as a fallback;
        the visitor only sees an error if BOTH fail
  → success message shown to the visitor
```

**Lead model** ([`lib/leads/types.ts`](lib/leads/types.ts)): `id`, `source`, `status`, `name`, `email`, `phone`, `message`, `propertyId` (DDF ListingKey), `propertyAddress` and `propertyUrl` (snapshots), `details` (JSON: eligibility input and result, seller or buyer details, preferred contact, viewing time), `marketingConsent`, `attribution` (page URL, referrer, UTM), `createdAt`, `updatedAt`.

- **Sources:** `PROPERTY_INQUIRY`, `VIEWING_REQUEST`, `ELIGIBILITY_CHECK`, `CONTACT_FORM`, `SELLER_INQUIRY`, `BUYER_INQUIRY`
- **Statuses:** `NEW`, `CONTACTED`, `QUALIFIED`, `NURTURING`, `CLOSED`, `ARCHIVED`

**Email** ([`lib/email`](lib/email)): provider abstraction with `console` (dev), `resend` and `none`. Add Postmark, SES, SMTP and so on by implementing `EmailProvider`. Notifications set `Reply-To` to the lead, so the realtor can simply hit reply.

**CRM integrations** ([`lib/leads/integrations`](lib/leads/integrations/index.ts)): set `LEAD_WEBHOOK_URL` to POST every new lead as JSON. It works with Zapier, Make, n8n and HubSpot workflows, and is HMAC-signed when `LEAD_WEBHOOK_SECRET` is set. Native HubSpot, Salesforce or Mailchimp connectors are small classes implementing `LeadIntegration`.

**Admin API** (foundation for a future dashboard). Set `ADMIN_API_TOKEN` (24+ random characters) to enable it:

```bash
curl -H "Authorization: Bearer $ADMIN_API_TOKEN" "https://yourdomain/api/admin/leads?status=NEW&source=ELIGIBILITY_CHECK"
curl -X PATCH -H "Authorization: Bearer $ADMIN_API_TOKEN" -H "Content-Type: application/json" \
     -d '{"status":"CONTACTED"}' https://yourdomain/api/admin/leads/<id>
```

The endpoints return 404 when the token is unset. A full admin UI should add real user authentication (for example Auth.js or Clerk) rather than a shared token.

**Spam protection:** hidden honeypot field plus an in-memory rate limit of 5 submissions per 10 minutes per IP per form. On multi-instance hosting, swap `lib/security/rate-limit.ts` for a shared store such as Upstash Redis.

### Affordability estimate

[`lib/eligibility/calculator.ts`](lib/eligibility/calculator.ts) (unit-tested):

- Qualifies at the stress-test rate: max(contract + 2%, 5.25%).
- Applies GDS/TDS limits. The range runs from a "comfortable" 32/40% up to the typical maximum of 39/44%.
- Enforces minimum down payment tiers (5% / 10% / 20% at $1.5M+) and adds default insurance premiums.
- Uses semi-annual compounding, with 30-year amortization for insured first-time buyers.

Results are labelled **"Estimated Home Buying Range"** with a clear statement that it's not a pre-approval or financial advice.

### Analytics

`track(event, props)` in [`lib/analytics/client.ts`](lib/analytics/client.ts) dispatches to whatever is installed: the GTM `dataLayer`, `gtag`, Plausible, PostHog, plus a DOM `app:analytics` event. Enable GTM or Plausible with `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.

Tracked events: `property_viewed`, `property_search`, `property_inquiry`, `property_favorited`, `eligibility_started`, `eligibility_completed`, `contact_form_submitted`, `seller_form_submitted`, `buyer_form_submitted`, `realtor_phone_clicked`, `realtor_email_clicked`, `realtor_ca_link_clicked`.

---

## 8. Project structure

```
app/
  page.tsx                     Homepage
  properties/page.tsx          Search results (filters, sort, pagination)
  properties/[slug]/           Listing details (+ not-found, error)
  eligibility/ contact/ sell/ buy/ about/ saved/ privacy/ terms/
  actions/leads.ts             Server Actions for all lead forms
  api/properties               Read-only listing JSON (used by Saved homes)
  api/listing-view             CREA listing-view analytics beacon
  api/admin/leads              Token-protected lead API
  sitemap.ts robots.ts
components/  layout/ home/ property/ search/ forms/ realtor/ ui/ analytics/
config/      site.ts realtor.ts finance.ts compliance.ts
lib/
  ddf/         auth, client, odata, mapper, listings service, live + mock sources, CREA analytics
  leads/       types, schemas, repository (+ postgres/file stores), service, integrations
  eligibility/ calculator
  email/ analytics/ seo/ security/ search/ favorites/ utils/ db/
db/migrations/ SQL migrations
scripts/       migrate.mjs, ddf-metadata.mjs
```

---

## 9. Accessibility

The site uses semantic landmarks, a skip link, labelled form controls with `aria-invalid` / `aria-describedby` errors, and visible focus rings. The mobile menu and photo viewer use native `<dialog>`, so focus is trapped and Esc closes them. The gallery supports keyboard arrows and swipe. Reduced-motion preferences are respected, and every image has alt text.

---

## 10. DDF® compliance: what still needs confirming

Settings live in [`config/compliance.ts`](config/compliance.ts). Nothing here is legal advice. **Review every item with the realtor, their brokerage and board, and their DDF® agreement before launch.**

**Implemented per CREA's published DDF® Web API documentation:**

- ✅ "Powered by: REALTOR.ca" badge on every listing, linking to the listing's `ListingURL` on REALTOR.ca (CREA's snippet and badge image).
- ✅ CREA listing analytics: `view` events are sent to `analytics.crea.ca` with the Destination ID and an anonymous visitor ID. **Requires `DDF_DESTINATION_ID`.**
- ✅ Listings are never persisted. They're cached for 5 minutes only, so delisted properties disappear, in line with CREA's guidance to remove records absent from the master list.
- ✅ `InternetEntireListingDisplayYN = false` listings are hidden. `InternetAddressDisplayYN = false` hides the street address, exact map pin and coordinates in structured data.
- ✅ Credentials are used server-to-server only, as CREA recommends.

**Marked `TODO(compliance)`, to be confirmed:**

- ☐ **Trademark notice wording** (REALTOR®, MLS® etc.). The standard CREA notice is used in the footer and on listings.
- ☐ **Listing disclaimer wording** ("deemed reliable but not guaranteed").
- ☐ **Listing brokerage attribution.** "Listed by {Office}" is shown; confirm whether the listing agent name is also required by your board.
- ☐ **MLS® number display** is enabled; confirm it's permitted for your feed.
- ☐ **Maximum cache staleness**, if your agreement specifies one (`listingCacheSeconds`).
- ☐ **Provincial advertising rules** (for example RECO in Ontario): brokerage name prominence, "not intended to solicit…" wording, testimonial rules.
- ☐ **Lookup values** for property-type filters (`lib/ddf/constants.ts`). Run `npm run ddf:metadata` and confirm `House`, `Row / Townhouse`, `Condo/Strata`, `Multi-family` and `Vacant Land` match your feed.
- ☐ **Privacy policy and terms** are templates. Have them reviewed for PIPEDA and CASL (the marketing opt-in is a separate, unticked checkbox).
- ☐ The DDF® **Lead API** isn't used: CREA's docs say member websites aren't required to use it.

---

## 11. Known limitations and next steps

- **Location search is exact-match** on City, CityRegion or SubdivisionName (title-cased). CREA doesn't document OData string functions like `contains()`, so partial matches aren't attempted. The inputs suggest the realtor's areas served. A local replica database would allow full-text and fuzzy search.
- **No lot-size filter.** DDF lot sizes come in mixed units (acres, square feet, m²), so they're displayed but not filtered.
- **Listing display flags are applied after fetching**, so a hidden listing can make a page show one fewer card than the page size.
- **Plain pagination is capped at 10,000 results** by DDF. Beyond that, use replication.
- **Maps** use an OpenStreetMap embed with no key. For Google Maps, set `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` and restrict it to your domain.
- **Saved homes** are stored per device (localStorage). A future step is accounts or email alerts.
- **Suggested roadmap:** an admin dashboard over the lead repository, saved-search email alerts via replication, open houses (`/OpenHouse`), map search, and French localisation (DDF supports `fr-CA`).
