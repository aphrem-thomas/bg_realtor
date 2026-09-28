import type { Metadata } from "next";
import { complianceConfig } from "@/config/compliance";
import { realtor } from "@/config/realtor";
import { siteConfig } from "@/config/site";
import { LegalPage } from "@/components/ui/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms governing the use of ${siteConfig.name}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="September 2026">
      <section>
        <h2>Listing content</h2>
        <p>{complianceConfig.listingDisclaimer} Listing content is provided through REALTOR.ca DDF® for personal, non-commercial use by consumers to identify properties they may be interested in purchasing or leasing, and may not be used for any other purpose.</p>
      </section>
      <section>
        <h2>Affordability estimates</h2>
        <p>The affordability tool provides general estimates only. It is not a mortgage pre-approval, a commitment to lend, or financial advice. Consult a licensed mortgage professional before making financial decisions.</p>
      </section>
      <section>
        <h2>Trademarks</h2>
        <p>{complianceConfig.trademarkNotice}</p>
      </section>
      <section>
        <h2>Brokerage</h2>
        <p>
          {realtor.name} is a {realtor.title} with {realtor.brokerage.name}, {realtor.brokerage.address}. Not intended to solicit buyers or sellers currently under contract with another brokerage.
        </p>
      </section>
    </LegalPage>
  );
}
