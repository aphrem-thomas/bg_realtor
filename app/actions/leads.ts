"use server";

import type { z } from "zod";
import { siteConfig } from "@/config/site";
import { getListing } from "@/lib/ddf/listings";
import { calculateEligibility } from "@/lib/eligibility/calculator";
import type { EligibilityInput } from "@/lib/eligibility/types";
import type { EligibilityFormState, FormState } from "@/lib/forms/state";
import {
  CONTACT_REASONS,
  buyerSchema,
  contactSchema,
  eligibilitySchema,
  propertyInquirySchema,
  sellerSchema,
  toFieldErrors,
} from "@/lib/leads/schemas";
import { createLead } from "@/lib/leads/service";
import type { LeadAttribution, LeadSource, NewLead } from "@/lib/leads/types";
import { rateLimit } from "@/lib/security/rate-limit";
import { clientIp, isHoneypotTripped } from "@/lib/security/request";

/**
 * Server Actions for every lead-capture form. Each action:
 *   1. drops honeypot submissions and rate-limits by IP
 *   2. validates with zod (server-side, authoritative)
 *   3. hands a NewLead to the lead service (save → notify → integrations)
 * Internal errors are logged server-side; visitors only see friendly copy.
 */

const GENERIC_ERROR = "Something went wrong on our side and we couldn't send your message. Please try again, or call us directly.";
const RATE_LIMITED = "You've sent a few messages in a short time. Please wait a few minutes and try again.";

function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION")) values[key] = value.slice(0, 2000);
  }
  return values;
}

function attributionFrom(data: {
  pageUrl?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}): LeadAttribution {
  // Only keep page URLs that belong to this site.
  const pageUrl = data.pageUrl && data.pageUrl.startsWith(siteConfig.url) ? data.pageUrl : undefined;
  return { pageUrl, referrer: data.referrer, utmSource: data.utmSource, utmMedium: data.utmMedium, utmCampaign: data.utmCampaign };
}

async function guard(formData: FormData, bucket: string): Promise<FormState | null> {
  if (isHoneypotTripped(formData)) return { status: "success", message: "Thanks! Your message has been sent." };
  const ip = await clientIp();
  if (!rateLimit(`${bucket}:${ip}`, { limit: 5, windowMs: 10 * 60_000 }).allowed) {
    return { status: "error", message: RATE_LIMITED, values: formValues(formData) };
  }
  return null;
}

function parse<S extends z.ZodType>(schema: S, formData: FormData): { data: z.infer<S> } | { error: FormState } {
  const result = schema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return {
      error: {
        status: "error",
        message: "Please check the highlighted fields.",
        fieldErrors: toFieldErrors(result.error),
        values: formValues(formData),
      },
    };
  }
  return { data: result.data };
}

async function save(lead: NewLead, formData: FormData, successMessage: string): Promise<FormState> {
  const outcome = await createLead(lead);
  if (!outcome.ok) return { status: "error", message: GENERIC_ERROR, values: formValues(formData) };
  return { status: "success", message: successMessage };
}

// ---------------------------------------------------------------------------

export async function submitPropertyInquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const blocked = await guard(formData, "inquiry");
  if (blocked) return blocked;
  const parsed = parse(propertyInquirySchema, formData);
  if ("error" in parsed) return parsed.error;
  const data = parsed.data;

  // Snapshot listing details server-side (never trust client-supplied addresses).
  let listing = null;
  try {
    listing = await getListing(data.listingKey);
  } catch (error) {
    console.error("[leads] listing lookup failed during inquiry", error);
  }

  const source: LeadSource = data.requestViewing ? "VIEWING_REQUEST" : "PROPERTY_INQUIRY";
  return save(
    {
      source,
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      propertyId: data.listingKey,
      propertyAddress: listing ? `${listing.fullAddress}${listing.mlsNumber ? ` (MLS® ${listing.mlsNumber})` : ""}` : null,
      propertyUrl: listing ? `${siteConfig.url}/properties/${listing.slug}` : null,
      details: {
        preferredContact: data.preferredContact,
        preferredViewingTime: data.requestViewing ? data.preferredViewingTime : undefined,
      },
      marketingConsent: data.marketingConsent,
      attribution: attributionFrom(data),
    },
    formData,
    data.requestViewing
      ? "Thanks! Your viewing request has been sent. We'll be in touch shortly to confirm a time."
      : "Thanks! Your message has been sent. We'll get back to you shortly.",
  );
}

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const blocked = await guard(formData, "contact");
  if (blocked) return blocked;
  const parsed = parse(contactSchema, formData);
  if ("error" in parsed) return parsed.error;
  const data = parsed.data;

  const sourceByReason: Record<string, LeadSource> = {
    buying: "BUYER_INQUIRY",
    selling: "SELLER_INQUIRY",
    viewing: "VIEWING_REQUEST",
    property: "PROPERTY_INQUIRY",
    general: "CONTACT_FORM",
  };

  return save(
    {
      source: sourceByReason[data.reason] ?? "CONTACT_FORM",
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      propertyId: null,
      propertyAddress: null,
      propertyUrl: null,
      details: {
        reason: CONTACT_REASONS.find((r) => r.value === data.reason)?.label,
        preferredContact: data.preferredContact,
      },
      marketingConsent: data.marketingConsent,
      attribution: attributionFrom(data),
    },
    formData,
    "Thanks for reaching out! We'll get back to you within one business day.",
  );
}

export async function submitSellerLead(_prev: FormState, formData: FormData): Promise<FormState> {
  const blocked = await guard(formData, "seller");
  if (blocked) return blocked;
  const parsed = parse(sellerSchema, formData);
  if ("error" in parsed) return parsed.error;
  const data = parsed.data;

  return save(
    {
      source: "SELLER_INQUIRY",
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message ?? null,
      propertyId: null,
      propertyAddress: null,
      propertyUrl: null,
      details: {
        seller: {
          propertyAddress: data.propertyAddress,
          propertyType: data.propertyType,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          timeline: data.timeline,
        },
      },
      marketingConsent: data.marketingConsent,
      attribution: attributionFrom(data),
    },
    formData,
    "Thank you! We'll review your home's details and follow up with a personalized assessment.",
  );
}

export async function submitBuyerLead(_prev: FormState, formData: FormData): Promise<FormState> {
  const blocked = await guard(formData, "buyer");
  if (blocked) return blocked;
  const parsed = parse(buyerSchema, formData);
  if ("error" in parsed) return parsed.error;
  const data = parsed.data;

  return save(
    {
      source: "BUYER_INQUIRY",
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message ?? null,
      propertyId: null,
      propertyAddress: null,
      propertyUrl: null,
      details: { buyer: { timeline: data.timeline, budget: data.budget, areas: data.areas, preApproved: data.preApproved } },
      marketingConsent: data.marketingConsent,
      attribution: attributionFrom(data),
    },
    formData,
    "Thanks! We'll be in touch to schedule your buyer consultation.",
  );
}

export async function submitEligibility(_prev: EligibilityFormState, formData: FormData): Promise<EligibilityFormState> {
  const blocked = await guard(formData, "eligibility");
  if (blocked) return blocked;
  const parsed = parse(eligibilitySchema, formData);
  if ("error" in parsed) return parsed.error;
  const data = parsed.data;

  const input: EligibilityInput = {
    annualIncome: data.annualIncome,
    applicants: data.applicants,
    employmentType: data.employmentType as EligibilityInput["employmentType"],
    downPayment: data.downPayment,
    monthlyDebts: data.monthlyDebts,
    creditScore: data.creditScore as EligibilityInput["creditScore"],
    firstTimeBuyer: data.firstTimeBuyer,
    ownsProperty: data.ownsProperty,
    desiredPrice: data.desiredPrice,
  };
  const result = calculateEligibility(input);

  const outcome = await createLead({
    source: "ELIGIBILITY_CHECK",
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: null,
    propertyId: null,
    propertyAddress: null,
    propertyUrl: null,
    details: { eligibility: { input: { ...input }, result: { ...result } } },
    marketingConsent: data.marketingConsent,
    attribution: attributionFrom(data),
  });

  // The estimate is useful on its own, so show it even if the lead wasn't captured.
  return {
    status: "success",
    result,
    firstName: data.name.split(/\s+/)[0],
    message: outcome.ok
      ? undefined
      : "Your estimate is below, but we couldn't save your details. Please contact us directly for a consultation.",
  };
}
