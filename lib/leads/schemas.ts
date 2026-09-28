import { z } from "zod";
import { CREDIT_SCORE_RANGES, EMPLOYMENT_TYPES } from "@/lib/eligibility/types";

/**
 * Server-side validation for every lead form. Client-side HTML attributes
 * (required, type=email, …) are a convenience only; these schemas are the
 * source of truth.
 */

const trimmed = (max: number) => z.string().trim().max(max, `Please keep this under ${max} characters.`);

const name = trimmed(100).min(2, "Please enter your name.");
const email = z.string().trim().toLowerCase().max(200).email("Please enter a valid email address.");

const phoneRequired = z
  .string()
  .trim()
  .max(30)
  .refine((v) => v.replace(/\D/g, "").length >= 10, "Please enter a valid phone number.");
const phoneOptional = z
  .string()
  .trim()
  .max(30)
  .refine((v) => v === "" || v.replace(/\D/g, "").length >= 10, "Please enter a valid phone number.")
  .transform((v) => (v === "" ? null : v));

const optionalText = (max: number) =>
  trimmed(max)
    .optional()
    .transform((v) => (v ? v : undefined));

// Unchecked checkboxes are omitted from FormData entirely, so the key must be optional.
const checkbox = z
  .string()
  .optional()
  .transform((v) => v === "on" || v === "true");

/** Optional small integer from a <select>; "" (not chosen) becomes undefined rather than 0. */
const optionalCount = z
  .preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().int().min(0).max(20).optional())
  .catch(undefined);

/** Parse a currency-ish string ("$85,000") into a number. */
const money = (label: string, { min = 0, max = 100_000_000, required = true } = {}) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? Number.NaN : Number(v.replace(/[^0-9.]/g, ""))))
    .refine((v) => (required ? Number.isFinite(v) : true), `Please enter your ${label}.`)
    .refine((v) => !Number.isFinite(v) || (v >= min && v <= max), `Please enter a realistic ${label}.`);

const attribution = {
  pageUrl: optionalText(500),
  referrer: optionalText(500),
  utmSource: optionalText(100),
  utmMedium: optionalText(100),
  utmCampaign: optionalText(100),
};

export const propertyInquirySchema = z.object({
  name,
  email,
  phone: phoneOptional,
  message: trimmed(2000).min(2, "Please add a short message."),
  listingKey: z.string().trim().regex(/^[A-Za-z0-9]{1,32}$/, "Invalid listing."),
  requestViewing: checkbox,
  preferredViewingTime: optionalText(200),
  preferredContact: z.enum(["email", "phone", "text"]).default("email"),
  marketingConsent: checkbox,
  ...attribution,
});

export const CONTACT_REASONS = [
  { value: "buying", label: "Buying a home" },
  { value: "selling", label: "Selling a home" },
  { value: "property", label: "A specific property" },
  { value: "viewing", label: "Request a viewing" },
  { value: "general", label: "General question" },
] as const;

export const contactSchema = z.object({
  name,
  email,
  phone: phoneOptional,
  reason: z.enum(CONTACT_REASONS.map((r) => r.value) as [string, ...string[]], {
    message: "Please choose a reason.",
  }),
  message: trimmed(2000).min(2, "Please add a short message."),
  preferredContact: z.enum(["email", "phone", "text"]).default("email"),
  marketingConsent: checkbox,
  ...attribution,
});

export const SELLER_PROPERTY_TYPES = ["Detached house", "Semi-detached", "Townhouse", "Condo / apartment", "Multi-unit", "Land", "Other"] as const;
export const SELLER_TIMELINES = ["As soon as possible", "1–3 months", "3–6 months", "6–12 months", "Just curious"] as const;

export const sellerSchema = z.object({
  name,
  email,
  phone: phoneRequired,
  propertyAddress: trimmed(200).min(5, "Please enter the property address."),
  propertyType: z.enum(SELLER_PROPERTY_TYPES, { message: "Please choose a property type." }),
  bedrooms: optionalCount,
  bathrooms: optionalCount,
  timeline: z.enum(SELLER_TIMELINES).optional().catch(undefined),
  message: optionalText(2000),
  marketingConsent: checkbox,
  ...attribution,
});

export const BUYER_TIMELINES = ["Ready now", "1–3 months", "3–6 months", "6+ months", "Just exploring"] as const;
export const PRE_APPROVAL_OPTIONS = ["Yes", "In progress", "Not yet"] as const;

export const buyerSchema = z.object({
  name,
  email,
  phone: phoneOptional,
  timeline: z.enum(BUYER_TIMELINES, { message: "Please choose a timeline." }),
  budget: optionalText(100),
  areas: optionalText(300),
  preApproved: z.enum(PRE_APPROVAL_OPTIONS).optional().catch(undefined),
  message: optionalText(2000),
  marketingConsent: checkbox,
  ...attribution,
});

export const eligibilitySchema = z.object({
  name,
  email,
  phone: phoneOptional,
  annualIncome: money("annual household income", { min: 1_000, max: 50_000_000 }),
  applicants: z.enum(["1", "2"]).transform((v) => Number(v) as 1 | 2),
  employmentType: z.enum(EMPLOYMENT_TYPES.map((e) => e.value) as [string, ...string[]], {
    message: "Please choose an employment type.",
  }),
  downPayment: money("down payment", { max: 50_000_000 }),
  monthlyDebts: money("monthly debt payments", { max: 1_000_000 }),
  creditScore: z.enum(CREDIT_SCORE_RANGES.map((c) => c.value) as [string, ...string[]], {
    message: "Please choose a credit score range.",
  }),
  desiredPrice: money("desired purchase price", { required: false, max: 100_000_000 }).transform((v) =>
    Number.isFinite(v) && v > 0 ? v : undefined,
  ),
  firstTimeBuyer: z.enum(["yes", "no"], { message: "Please let us know." }).transform((v) => v === "yes"),
  ownsProperty: z.enum(["yes", "no"], { message: "Please let us know." }).transform((v) => v === "yes"),
  marketingConsent: checkbox,
  ...attribution,
});

export type FieldErrors = Record<string, string>;

/** Flatten zod issues to `{ field: firstMessage }` for form display. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
