import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const PANELS = [
  {
    id: "buy",
    eyebrow: "For buyers",
    title: "Looking to Buy?",
    body: "Get a personalized home search, early access to new listings and expert advice on pricing, offers and inspections.",
    cta: { href: "/buy", label: "Start your home search" },
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0",
    alt: "Bright, modern living room with large windows",
  },
  {
    id: "sell",
    eyebrow: "For sellers",
    title: "Thinking of Selling?",
    body: "Find out what your home is worth today and how the right pricing, staging and marketing can maximize your sale.",
    cta: { href: "/sell", label: "Get your home's value" },
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
    alt: "Elegant kitchen with an island and pendant lights",
  },
];

export function BuySellCTA() {
  return (
    <section aria-label="Buying and selling" className="container-page grid gap-6 lg:grid-cols-2">
      {PANELS.map((panel) => (
        <article key={panel.id} className="group relative isolate flex min-h-[420px] flex-col justify-end overflow-hidden rounded-[var(--radius-panel)] p-7 text-white sm:p-10">
          <Image
            src={panel.image}
            alt={panel.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="-z-10 object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/5" aria-hidden="true" />
          <p className="text-xs font-semibold tracking-[0.14em] text-white/75 uppercase">{panel.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{panel.title}</h2>
          <p className="mt-3 max-w-md text-white/80">{panel.body}</p>
          <Link href={panel.cta.href} className="btn-light mt-6 self-start">
            {panel.cta.label} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </article>
      ))}
    </section>
  );
}
