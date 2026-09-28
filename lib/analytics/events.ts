/**
 * Catalogue of tracked product events. Provider-agnostic: see ./client.ts for
 * how events are dispatched (Google Tag Manager dataLayer, gtag, Plausible,
 * PostHog, … whichever is present on the page).
 */
export type AnalyticsEventMap = {
  property_viewed: { listing_key: string; price?: number | null; city?: string | null };
  property_search: { location?: string; type?: string; min_price?: number; max_price?: number; beds?: number };
  property_inquiry: { listing_key: string; viewing_request: boolean };
  property_favorited: { listing_key: string; saved: boolean };
  eligibility_started: Record<string, never>;
  eligibility_completed: { tier: string; high_price: number };
  contact_form_submitted: { reason?: string };
  seller_form_submitted: Record<string, never>;
  buyer_form_submitted: Record<string, never>;
  realtor_phone_clicked: { location: string };
  realtor_email_clicked: { location: string };
  realtor_ca_link_clicked: { listing_key: string };
};

export type AnalyticsEvent = keyof AnalyticsEventMap;
