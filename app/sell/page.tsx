import type { Metadata } from "next";
import Image from "next/image";
import { Camera, LineChart, Megaphone, Handshake } from "lucide-react";
import { realtor } from "@/config/realtor";
import { SellerForm } from "@/components/forms/SellerForm";
import { Testimonials } from "@/components/realtor/Testimonials";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "What's your home worth? Free home evaluation",
  description: `Thinking of selling? Get a free, personalized home evaluation from ${realtor.name} — local pricing expertise and a marketing plan built for your home.`,
  alternates: { canonical: "/sell" },
};

const STEPS = [
  { icon: LineChart, title: "Pricing strategy", body: "A data-backed price using recent sales, active competition and buyer demand in your neighbourhood." },
  { icon: Camera, title: "Presentation", body: "Professional photography, staging advice and a floor plan so your home shines online." },
  { icon: Megaphone, title: "Marketing", body: "MLS® exposure, targeted social campaigns and outreach to active buyers and agents." },
  { icon: Handshake, title: "Negotiation", body: "Expert handling of offers and conditions to get you the best price and terms." },
];

export default function SellPage() {
  return (
    <>
      <div className="container-page pt-8 sm:pt-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <header className="lg:pt-6">
            <p className="eyebrow">For sellers</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              What&apos;s your home <span className="font-display font-normal italic">worth?</span>
            </h1>
            <p className="mt-4 text-lg text-muted text-pretty">
              Online estimates can be off by tens of thousands. Submit your information and {realtor.firstName} will provide a
              personalized assessment based on your home&apos;s features, recent comparable sales and current demand.
            </p>
            <div className="relative mt-8 hidden aspect-[4/3] overflow-hidden rounded-[var(--radius-panel)] lg:block">
              <Image
                src="https://images.unsplash.com/photo-1570129477492-45c003edd2be"
                alt="Well-kept family home with a front lawn"
                fill
                sizes="45vw"
                className="object-cover"
              />
            </div>
          </header>
          <section aria-label="Home evaluation form" className="card p-6 sm:p-10">
            <h2 className="text-xl font-semibold tracking-tight">Request your free home evaluation</h2>
            <p className="mt-1 mb-6 text-sm text-muted">No obligation. Typically delivered within one business day.</p>
            <SellerForm realtorName={realtor.name} />
          </section>
        </div>
      </div>

      <section aria-labelledby="sell-process" className="container-page mt-24">
        <SectionHeading eyebrow="How we sell" title={<span id="sell-process">A proven plan to sell for more</span>} />
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="card p-7">
              <div className="flex items-center justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <span className="font-display text-3xl text-muted/60 italic">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {realtor.testimonials.length ? (
      <section aria-labelledby="sell-testimonials" className="container-page mt-24">
        <SectionHeading align="center" eyebrow="Seller stories" title={<span id="sell-testimonials">Sellers who made the move</span>} />
        <div className="mt-10">
          <Testimonials testimonials={realtor.testimonials} />
        </div>
      </section>
      ) : null}
    </>
  );
}
