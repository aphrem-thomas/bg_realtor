import { expect, it } from "vitest";
import { propertyInquirySchema, sellerSchema, eligibilitySchema } from "@/lib/leads/schemas";
it("inquiry without checkboxes", () => {
  const r = propertyInquirySchema.safeParse({ name: "Test Buyer", email: "a@b.co", phone: "", message: "hi there", listingKey: "123", preferredContact: "email" });
  expect(r.success ? r.data : r.error.issues).toMatchObject({ requestViewing: false, marketingConsent: false, phone: null });
});
it("seller empty counts", () => {
  const r = sellerSchema.safeParse({ name: "Test", email: "a@b.co", phone: "613-555-0100", propertyAddress: "1 Main St", propertyType: "Townhouse", bedrooms: "", bathrooms: "3", timeline: "" });
  expect(r.success ? r.data : r.error.issues).toMatchObject({ bedrooms: undefined, bathrooms: 3, timeline: undefined });
});
it("eligibility money parsing", () => {
  const r = eligibilitySchema.safeParse({ name: "Test", email: "a@b.co", phone: "", annualIncome: "$120,000", applicants: "2", employmentType: "salaried", downPayment: "60000", monthlyDebts: "0", creditScore: "good", desiredPrice: "", firstTimeBuyer: "yes", ownsProperty: "no" });
  expect(r.success ? r.data : r.error.issues).toMatchObject({ annualIncome: 120000, monthlyDebts: 0, desiredPrice: undefined, applicants: 2, firstTimeBuyer: true });
});
