import Link from "next/link";
import { ArrowRight, Calculator, Clock, ShieldCheck } from "lucide-react";

/** Lead-generation section promoting the affordability check. */
export function EligibilityCTA() {
  return (
    <section aria-labelledby="eligibility-heading" className="container-page">
      <div className="relative overflow-hidden rounded-[var(--radius-panel)] bg-accent px-6 py-12 text-white sm:px-12 sm:py-16 lg:px-16">
        <div aria-hidden="true" className="absolute -top-24 -right-24 size-80 rounded-full bg-white/5" />
        <div aria-hidden="true" className="absolute -right-10 -bottom-32 size-96 rounded-full bg-white/5" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-white/70 uppercase">Affordability check</p>
            <h2 id="eligibility-heading" className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              How much home can you <span className="font-display font-normal italic">afford?</span>
            </h2>
            <p className="mt-4 max-w-xl text-lg text-white/80">
              Get a personalized estimate based on your financial information — in about two minutes, with no credit check.
            </p>
            <Link href="/eligibility" className="btn-light mt-8 min-h-12 px-7 text-base">
              Check My Eligibility <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ul className="space-y-3">
            {[
              { icon: Clock, title: "Takes 2 minutes", body: "A few quick questions about income, savings and debts." },
              { icon: Calculator, title: "Real Canadian rules", body: "Uses the mortgage stress test and standard lending ratios." },
              { icon: ShieldCheck, title: "No credit check", body: "An estimate only — it won't affect your credit score." },
            ].map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4 rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
                <Icon className="mt-0.5 size-5 shrink-0 text-white/80" aria-hidden="true" />
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-white/70">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
