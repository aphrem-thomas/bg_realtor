/**
 * REALTOR.ca DDF® display & attribution settings.
 *
 * Items marked CONFIRMED come from CREA's public DDF® Web API documentation
 * (https://ddfapi-docs.realtor.ca/). Items marked TODO(compliance) are
 * reasonable defaults that MUST be confirmed against the realtor's DDF®
 * agreement, their board/association rules and their provincial regulator
 * before launch. Nothing here is legal advice.
 */
export const complianceConfig = {
  /**
   * CONFIRMED: DDF® rules require the "Powered by REALTOR.ca" badge on all DDF®
   * listing content, linking to the original listing on REALTOR.ca.
   */
  poweredByBadge: {
    enabled: true,
    imageSrc: "https://www.realtor.ca/images/en-ca/powered_by_realtor.svg",
    fallbackHref: "https://www.realtor.ca/en",
    alt: "Powered by: REALTOR.ca",
    width: 125,
  },

  /**
   * CONFIRMED (documented by CREA): listing "view" events should be reported to
   * the CREA Analytics Web Service. Requires DDF_DESTINATION_ID.
   */
  creaAnalytics: {
    enabled: true,
    endpoint: "https://analytics.crea.ca/LogEvents.svc/LogEvents",
  },

  /**
   * TODO(compliance): Standard CREA trademark notice. Confirm wording with the
   * current CREA trademark guidelines.
   */
  trademarkNotice:
    "The trademarks REALTOR®, REALTORS®, and the REALTOR® logo are controlled by The Canadian Real Estate Association (CREA) and identify real estate professionals who are members of CREA. The trademarks MLS®, Multiple Listing Service® and the associated logos are owned by CREA and identify the quality of services provided by real estate professionals who are members of CREA.",

  /**
   * TODO(compliance): Data accuracy disclaimer shown under listing details and
   * in the footer. Confirm wording with your board / DDF® agreement.
   */
  listingDisclaimer:
    "Listing information is provided via REALTOR.ca DDF® and is deemed reliable but not guaranteed. Information should be independently verified.",

  /** TODO(compliance): Show the listing brokerage on each listing (commonly required). */
  showListingBrokerage: true,

  /** TODO(compliance): Show the MLS® number on listing pages. */
  showMlsNumber: true,

  /**
   * CONFIRMED (DDF field semantics): listings with InternetEntireListingDisplayYN = false
   * are never shown, and InternetAddressDisplayYN = false hides the street address
   * and map pin.
   */
  respectDisplayFlags: true,

  /**
   * How long (seconds) DDF® responses may be cached. Listings are never
   * persisted to our database; CREA's guidance is to keep any stored copy in
   * sync and remove delisted properties. TODO(compliance): confirm any maximum
   * staleness required by your agreement.
   */
  listingCacheSeconds: 300,
} as const;
