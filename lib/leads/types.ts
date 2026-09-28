/**
 * Lead domain model. Designed to support a future admin dashboard (status
 * workflow, filtering by source/property) and CRM sync (stable ids, structured
 * `details` payload per source).
 */

export const LEAD_SOURCES = [
  "PROPERTY_INQUIRY",
  "VIEWING_REQUEST",
  "ELIGIBILITY_CHECK",
  "CONTACT_FORM",
  "SELLER_INQUIRY",
  "BUYER_INQUIRY",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "NURTURING", "CLOSED", "ARCHIVED"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  PROPERTY_INQUIRY: "Property inquiry",
  VIEWING_REQUEST: "Viewing request",
  ELIGIBILITY_CHECK: "Eligibility check",
  CONTACT_FORM: "Contact form",
  SELLER_INQUIRY: "Seller inquiry / home valuation",
  BUYER_INQUIRY: "Buyer consultation",
};

export type PreferredContact = "email" | "phone" | "text";

/** Structured, source-specific data. Stored as JSON (jsonb in Postgres). */
export type LeadDetails = {
  reason?: string;
  preferredContact?: PreferredContact;
  preferredViewingTime?: string;
  eligibility?: {
    input: Record<string, unknown>;
    result: Record<string, unknown>;
  };
  seller?: {
    propertyAddress: string;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    timeline?: string;
  };
  buyer?: {
    timeline?: string;
    budget?: string;
    areas?: string;
    preApproved?: string;
  };
};

export type LeadAttribution = {
  pageUrl?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

export type Lead = {
  id: string;
  source: LeadSource;
  status: LeadStatus;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  /** DDF ListingKey, when the lead relates to a listing. */
  propertyId: string | null;
  /** Snapshot of the listing address/URL at the time of the inquiry. */
  propertyAddress: string | null;
  propertyUrl: string | null;
  details: LeadDetails;
  marketingConsent: boolean;
  attribution: LeadAttribution;
  createdAt: string;
  updatedAt: string;
};

export type NewLead = Omit<Lead, "id" | "status" | "createdAt" | "updatedAt">;

export type LeadListFilter = {
  status?: LeadStatus;
  source?: LeadSource;
  propertyId?: string;
  limit?: number;
  offset?: number;
};
