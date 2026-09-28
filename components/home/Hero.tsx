import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { realtor } from "@/config/realtor";
import { siteConfig } from "@/config/site";
import { PropertySearch } from "@/components/search/PropertySearch";

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="container-page pt-6 sm:pt-10">
      <div className="max-w-3xl">
        <p className="eyebrow">{realtor.areasServed.slice(0, 3).join(" · ")} & beyond</p>
        <h1 id="hero-heading" className="mt-4 text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
          Find a place you&apos;ll love to <span className="font-display font-normal italic">call home.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted text-pretty">
          Search every active listing in the region, get a clear picture of what you can afford, and work with{" "}
          {realtor.name} — a local REALTOR® who handles the details so you can focus on the move.
        </p>
      </div>

      <div className="relative mt-8 sm:mt-10">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-panel)] bg-sand sm:aspect-[16/9] lg:aspect-[21/9]">
          <Image
            src={siteConfig.heroImage.src}
            alt={siteConfig.heroImage.alt}
            fill
            priority
            quality={85}
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-transparent" aria-hidden="true" />
          <div className="absolute top-5 left-5 flex flex-wrap gap-3 sm:top-8 sm:left-auto sm:right-8">
            <Link href="/properties" className="btn-light shadow-lg">
              Explore Properties <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/contact" className="btn border border-white/40 bg-ink/30 text-white backdrop-blur hover:bg-ink/50">
              <MessageCircle className="size-4" aria-hidden="true" /> Talk to a Realtor
            </Link>
          </div>
        </div>
        <div className="relative z-10 -mt-10 px-2 sm:-mt-14 sm:px-6 lg:-mt-16 lg:px-10">
          <PropertySearch areas={realtor.areasServed} />
        </div>
      </div>
    </section>
  );
}
