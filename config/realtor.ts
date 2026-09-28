import "server-only";

/**
 * Realtor profile — the single source of truth for everything personal on the
 * site (name, photo, bio, contact details, testimonials, service areas).
 *
 * Edit the values below to rebrand the site. Name, email and phone can also be
 * overridden with REALTOR_NAME / REALTOR_EMAIL / REALTOR_PHONE environment
 * variables, which is handy when the same codebase serves several agents.
 *
 * This module is server-only so that env overrides are applied consistently.
 * Client components receive the values they need as props.
 */

export type SocialLink = {
  platform: "instagram" | "facebook" | "linkedin" | "youtube" | "x" | "tiktok";
  url: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  context: string;
  rating?: 1 | 2 | 3 | 4 | 5;
};

export type RealtorProfile = {
  name: string;
  firstName: string;
  title: string;
  email: string;
  phone: string;
  /** E.164 formatted phone for tel: links. Derived from `phone` when omitted. */
  phoneHref?: string;
  photo: { src: string; alt: string };
  /**
   * Brokerage details. Provincial regulators (e.g. RECO in Ontario) generally
   * require the brokerage name to appear in advertising — confirm the exact
   * rules for your province.
   */
  brokerage: { name: string; address: string; phone: string; url?: string };
  /** CREA / board member ID, used to match the realtor's own listings if desired. */
  memberKey?: string;
  /** Personal website, if any. */
  website?: string;
  /** Optional stats — sections that use them are hidden when unset. Only use verifiable numbers. */
  yearsExperience?: number;
  homesSold?: string;
  shortBio: string;
  biography: string[];
  specialties: string[];
  areasServed: string[];
  languages: string[];
  designations: string[];
  officeHours?: string;
  social: SocialLink[];
  testimonials: Testimonial[];
};

// Sources: REALTOR.ca member profile (ID 2057033) and bijugeorge.teamrealty.ca.
// Fields left empty were not published there — fill them in only with
// accurate information (e.g. real client testimonials, with permission).
const defaults: RealtorProfile = {
  name: "Biju George",
  firstName: "Biju",
  title: "Broker",
  email: "bgeorge@royallepage.ca",
  phone: "(613) 761-3219",
  photo: {
    // Profile photo from REALTOR.ca. Replace with a local high-resolution file in /public when available.
    src: "https://cdn.realtor.ca/individuals/TS636881517600000000/highres/1332247.jpg",
    alt: "Portrait of Biju George, Broker with Royal LePage Team Realty",
  },
  brokerage: {
    name: "Royal LePage Team Realty, Brokerage",
    address: "1723 Carling Avenue, Suite 1, Ottawa, ON K2A 1C8",
    phone: "(613) 725-1171",
    url: "https://www.teamrealty.ca/",
  },
  // REALTOR.ca individual ID is 2057033 — confirm the matching DDF MemberKey via the
  // Member endpoint before using it (e.g. to feature Biju's own listings).
  memberKey: undefined,
  website: "https://bijugeorge.teamrealty.ca/",
  yearsExperience: undefined,
  homesSold: undefined,
  shortBio:
    "A Broker with Royal LePage Team Realty helping buyers and sellers across Ottawa and the surrounding area — with you at every step of the journey.",
  biography: [
    "Biju George is a Broker with Royal LePage Team Realty, specializing in buying and selling homes in Ottawa and the surrounding communities. He works alongside his clients at every stage, from the first conversation to closing day.",
    "Originally from India, Biju earned a degree in Electrical Engineering before immigrating to Canada, where he spent more than 15 years developing technology at a large biomedical company. That analytical, detail-oriented background carries into how he guides clients through pricing, offers and negotiations.",
    "Biju is also a long-standing community builder in Ottawa. He has served as President of the India Canada Association and the Malayalee Association of Ottawa, founded the annual India Unity Picnic, was a founding director of the Festival of India, and has helped raise funds for international disaster relief efforts.",
  ],
  specialties: ["Buying a home", "Selling a home", "Ottawa & surrounding areas"],
  areasServed: ["Ottawa", "Kanata", "Barrhaven", "Riverside South", "Orléans"],
  languages: [],
  designations: [],
  officeHours: undefined,
  social: [],
  testimonials: [],
};

export const realtor: RealtorProfile = {
  ...defaults,
  name: process.env.REALTOR_NAME || defaults.name,
  email: process.env.REALTOR_EMAIL || defaults.email,
  phone: process.env.REALTOR_PHONE || defaults.phone,
};

export function realtorPhoneHref(profile: RealtorProfile = realtor): string {
  if (profile.phoneHref) return profile.phoneHref;
  const digits = profile.phone.replace(/\D/g, "");
  return `tel:+${digits.length === 10 ? `1${digits}` : digits}`;
}

/** Subset of the profile that is safe and useful to pass to client components. */
export type RealtorContact = {
  name: string;
  firstName: string;
  email: string;
  phone: string;
  phoneHref: string;
  photo: { src: string; alt: string };
};

export function realtorContact(): RealtorContact {
  return {
    name: realtor.name,
    firstName: realtor.firstName,
    email: realtor.email,
    phone: realtor.phone,
    phoneHref: realtorPhoneHref(),
    photo: realtor.photo,
  };
}

/** Stats that are actually configured (for profile / about sections). */
export function realtorStats(profile: RealtorProfile = realtor): { label: string; value: string }[] {
  const stats: { label: string; value: string }[] = [];
  if (profile.yearsExperience) stats.push({ label: "Experience", value: `${profile.yearsExperience}+ yrs` });
  if (profile.homesSold) stats.push({ label: "Homes sold", value: profile.homesSold });
  if (profile.languages.length) stats.push({ label: "Languages", value: profile.languages.join(" & ") });
  return stats;
}
