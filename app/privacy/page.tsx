import type { Metadata } from "next";
import { realtor } from "@/config/realtor";
import { siteConfig } from "@/config/site";
import { LegalPage } from "@/components/ui/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses and protects your personal information.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 2026">
      <section>
        <h2>Information we collect</h2>
        <p>When you submit a form on this website we collect the information you provide, such as your name, email address, phone number, message and — for the affordability tool — the financial details you enter. We also record the page you submitted from and basic campaign information (e.g. UTM tags).</p>
      </section>
      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To respond to your inquiry and provide real estate services you request.</li>
          <li>To calculate and share your affordability estimate.</li>
          <li>To send listings and market updates, only if you opted in. You can unsubscribe at any time.</li>
        </ul>
      </section>
      <section>
        <h2>Sharing</h2>
        <p>Your information is shared only with {realtor.name} and {realtor.brokerage.name}, and with service providers who help operate this website (hosting, email delivery, customer relationship management) under confidentiality obligations. We do not sell your personal information.</p>
      </section>
      <section>
        <h2>Saved homes and analytics</h2>
        <p>Homes you save are stored only in your browser. We may use privacy-respecting analytics to understand how the site is used. Listing views are reported in aggregate to The Canadian Real Estate Association (CREA) as required for REALTOR.ca DDF® listing content.</p>
      </section>
      <section>
        <h2>Your choices</h2>
        <p>You may request access to, correction of, or deletion of your personal information by contacting {realtor.email}.</p>
      </section>
    </LegalPage>
  );
}
