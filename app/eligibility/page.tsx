import type { Metadata } from "next";
import { Clock, ShieldCheck, TrendingUp } from "lucide-react";
import { realtorContact } from "@/config/realtor";
import { EligibilityForm } from "@/components/forms/EligibilityForm";

export const metadata: Metadata = {
  title: "How much home can you afford?",
  description:
    "Estimate your home buying range in two minutes using Canadian mortgage rules. Free, no credit check — an estimate, not a pre-approval.",
  alternates: { canonical: "/eligibility" },
};

export default function EligibilityPage() {
  const contact = realtorContact();
  return (
    <div className="container-page pt-8 sm:pt-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <header className="lg:pt-6">
          <p className="eyebrow">Affordability check</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            How much home can you <span className="font-display font-normal italic">afford?</span>
          </h1>
          <p className="mt-4 text-lg text-muted text-pretty">
            Answer a few questions to see your Estimated Home Buying Range — based on the federal stress test and standard lending
            ratios used by Canadian lenders.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              { icon: Clock, text: "Takes about two minutes" },
              { icon: ShieldCheck, text: "No credit check, no obligation" },
              { icon: TrendingUp, text: "Instant results with next steps" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 font-medium">
                <span className="grid size-9 place-items-center rounded-full bg-accent-soft text-accent">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
          <p className="mt-8 rounded-2xl bg-sand/70 p-4 text-sm text-ink-soft">
            <strong className="font-semibold text-ink">Please note:</strong> this is an estimate and not a mortgage pre-approval or
            financial advice. A lender will confirm your actual borrowing amount.
          </p>
        </header>

        <section aria-label="Eligibility form" className="card p-6 sm:p-10">
          <EligibilityForm contact={contact} />
        </section>
      </div>
    </div>
  );
}
