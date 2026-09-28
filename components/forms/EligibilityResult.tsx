import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Info, Phone } from "lucide-react";
import { financeConfig } from "@/config/finance";
import type { EligibilityResult } from "@/lib/eligibility/types";
import { searchToQuery } from "@/lib/search/params";
import { formatCurrency, formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export type ResultContact = {
  name: string;
  firstName: string;
  phone: string;
  phoneHref: string;
  photo: { src: string; alt: string };
};

const TIER_COPY: Record<EligibilityResult["tier"], { label: string; tone: string }> = {
  strong: { label: "Strong position", tone: "bg-accent-soft text-accent-strong" },
  moderate: { label: "Good starting point", tone: "bg-sand text-ink" },
  limited: { label: "Let's build a plan", tone: "bg-danger-soft text-danger" },
};

export function EligibilityResultView({
  result,
  firstName,
  notice,
  contact,
}: {
  result: EligibilityResult;
  firstName?: string;
  notice?: string;
  contact: ResultContact;
}) {
  const tier = TIER_COPY[result.tier];
  const hasRange = result.highPrice > 0;
  const browseHref = `/properties${searchToQuery({ maxPrice: result.highPrice || undefined, transaction: "sale", sort: "newest", page: 1 })}`;

  return (
    <div className="animate-fade-in space-y-8" aria-live="polite">
      {notice ? (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft p-4 text-sm text-danger">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {notice}
        </p>
      ) : null}

      <div>
        <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", tier.tone)}>{tier.label}</span>
        <h2 className="mt-4 text-lg font-medium text-muted">{firstName ? `${firstName}, your` : "Your"} Estimated Home Buying Range</h2>
        {hasRange ? (
          <p className="mt-1 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {formatPrice(result.lowPrice)} <span className="font-display font-normal text-muted italic">to</span> {formatPrice(result.highPrice)}
          </p>
        ) : (
          <p className="mt-1 text-3xl font-bold tracking-tight">We couldn&apos;t estimate a range yet</p>
        )}
        <p className="mt-3 flex items-start gap-2 text-sm text-muted">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          This is an estimate and not a mortgage pre-approval. The lower figure reflects a comfortable budget; the upper figure is the
          typical maximum lenders allow.
        </p>
      </div>

      {hasRange ? (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Est. mortgage" value={formatCurrency(result.estimatedMortgage)} />
          <Stat label="Est. monthly payment" value={`${formatCurrency(result.estimatedMonthlyPayment)}`} hint={`at ${result.contractRate}%`} />
          <Stat label="Down payment" value={`${result.downPaymentPercent}%`} />
          <Stat label="Qualifying rate" value={`${result.qualifyingRate.toFixed(2)}%`} hint="stress test" />
        </dl>
      ) : null}

      {result.desiredPriceCheck ? (
        <div className="rounded-2xl border border-line p-5 text-sm">
          <p className="font-semibold">Your target: {formatPrice(result.desiredPriceCheck.price)}</p>
          <p className="mt-1 text-ink-soft">
            {result.desiredPriceCheck.withinRange
              ? "Good news — your target price falls within your estimated range."
              : "Your target is above your estimated range. A mortgage specialist may find ways to close the gap."}{" "}
            {result.desiredPriceCheck.hasEnoughDown
              ? ""
              : `A home at this price needs a minimum down payment of ${formatCurrency(result.desiredPriceCheck.minimumDownPayment)}.`}
          </p>
        </div>
      ) : null}

      {result.notes.length ? (
        <div>
          <h3 className="text-sm font-semibold">Things to keep in mind</h3>
          <ul className="mt-3 space-y-2.5 text-sm text-ink-soft">
            {result.notes.map((note) => (
              <li key={note} className="flex gap-2.5">
                <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col gap-5 rounded-[var(--radius-card)] bg-ink p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <Image src={contact.photo.src} alt={contact.photo.alt} width={72} height={72} className="size-16 rounded-full object-cover" />
        <div className="flex-1">
          <p className="text-lg font-semibold">Get a personalized consultation</p>
          <p className="mt-1 text-sm text-white/70">
            {contact.firstName} will review your numbers, connect you with trusted mortgage specialists and help you shop with confidence.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Link href="/contact?reason=buying" className="btn-light">
            Speak with {contact.firstName} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <a href={contact.phoneHref} className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white">
            <Phone className="size-3.5" aria-hidden="true" /> {contact.phone}
          </a>
        </div>
      </div>

      {hasRange ? (
        <Link href={browseHref} className="btn-secondary w-full sm:w-auto">
          Browse homes up to {formatPrice(result.highPrice)}
        </Link>
      ) : null}

      <p className="text-xs leading-relaxed text-muted">
        Assumptions: {result.amortizationYears}-year amortization, qualifying at {result.qualifyingRate.toFixed(2)}% (the greater of the
        contract rate + {financeConfig.stressTestBuffer}% or {financeConfig.stressTestFloor}%), property taxes of about{" "}
        {(financeConfig.annualPropertyTaxRate * 100).toFixed(1)}% of the purchase price per year and{" "}
        {formatCurrency(financeConfig.monthlyHeating)}/month for heating. Default
        insurance premiums apply when putting down less than 20%
        {result.insurancePremium > 0 ? ` (estimated ${formatCurrency(result.insurancePremium)}, added to the mortgage)` : ""}. Actual
        approval depends on your full credit profile, income verification, the property and lender policies. Not financial advice.
      </p>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-paper p-4">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-lg font-bold tracking-tight">
        {value}
        {hint ? <span className="ml-1 text-xs font-normal text-muted">{hint}</span> : null}
      </dd>
    </div>
  );
}
