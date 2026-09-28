import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, Home, KeyRound, Search } from "lucide-react";
import { realtor } from "@/config/realtor";
import { BuyerForm } from "@/components/forms/BuyerForm";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Buying a home",
  description: `Buy your next home with ${realtor.name}. Book a free buyer consultation, check what you can afford and search every active listing.`,
  alternates: { canonical: "/buy" },
};

const STEPS = [
  { icon: Calculator, title: "Know your budget", body: "Check your affordability and connect with a mortgage specialist for pre-approval.", href: "/eligibility", cta: "Check affordability" },
  { icon: Search, title: "Find the one", body: "Get new listings that match your criteria — often before they're widely seen.", href: "/properties", cta: "Search homes" },
  { icon: Home, title: "Make a winning offer", body: "Pricing analysis and a negotiation strategy tailored to each property." },
  { icon: KeyRound, title: "Close with confidence", body: "Inspections, conditions, lawyers and closing day — all coordinated for you." },
];

export default function BuyPage() {
  return (
    <>
      <div className="container-page pt-8 sm:pt-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <header className="lg:pt-6">
            <p className="eyebrow">For buyers</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Looking to <span className="font-display font-normal italic">buy?</span>
            </h1>
            <p className="mt-4 text-lg text-muted text-pretty">
              Whether it&apos;s your first home or your next one, a free buyer consultation with {realtor.firstName} gives you a clear
              plan: what to look for, what you can afford and how to win in today&apos;s market.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/properties" className="btn-secondary">
                Browse listings <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/eligibility" className="btn-ghost">
                Check my eligibility
              </Link>
            </div>
          </header>
          <section aria-label="Buyer consultation form" className="card p-6 sm:p-10">
            <h2 className="text-xl font-semibold tracking-tight">Book a free buyer consultation</h2>
            <p className="mt-1 mb-6 text-sm text-muted">30 minutes, by phone, video or in person. No obligation.</p>
            <BuyerForm realtorName={realtor.name} />
          </section>
        </div>
      </div>

      <section aria-labelledby="buy-steps" className="container-page mt-24">
        <SectionHeading eyebrow="How it works" title={<span id="buy-steps">From first search to front door</span>} />
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, body, href, cta }) => (
            <li key={title} className="card flex flex-col p-7">
              <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-lg font-semibold">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{body}</p>
              {href ? (
                <Link href={href} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
                  {cta} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
