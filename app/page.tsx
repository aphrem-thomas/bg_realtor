import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { realtor } from "@/config/realtor";
import { siteConfig } from "@/config/site";
import { BuySellCTA } from "@/components/home/BuySellCTA";
import { EligibilityCTA } from "@/components/home/EligibilityCTA";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { Hero } from "@/components/home/Hero";
import { WhyUs } from "@/components/home/WhyUs";
import { RealtorProfile } from "@/components/realtor/RealtorProfile";
import { Testimonials } from "@/components/realtor/Testimonials";
import { JsonLd } from "@/components/ui/JsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PropertyGridSkeleton } from "@/components/ui/Skeleton";
import { realEstateAgentJsonLd, websiteJsonLd } from "@/lib/seo/structured-data";

// Featured listings are refreshed at most every 5 minutes.
export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <JsonLd data={[websiteJsonLd(), realEstateAgentJsonLd()]} />
      <Hero />

      <section aria-labelledby="featured-heading" className="container-page mt-24 sm:mt-28">
        <SectionHeading
          eyebrow="Featured properties"
          title={<span id="featured-heading">Latest homes in your area</span>}
          description="Hand-picked from the newest listings on the market, updated throughout the day."
          action={
            <Link href="/properties" className="btn-secondary">
              View all properties <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          }
        />
        <div className="mt-10">
          <Suspense fallback={<PropertyGridSkeleton count={siteConfig.featuredCount} />}>
            <FeaturedProperties />
          </Suspense>
        </div>
      </section>

      <div className="mt-24 space-y-24 sm:mt-32 sm:space-y-32">
        <WhyUs />
        <BuySellCTA />
        <EligibilityCTA />
        {realtor.testimonials.length ? (
        <section aria-labelledby="testimonials-heading" className="container-page">
          <SectionHeading
            eyebrow="Client stories"
            align="center"
            title={<span id="testimonials-heading">What clients say about working with {realtor.firstName}</span>}
          />
          <div className="mt-12">
            <Testimonials testimonials={realtor.testimonials} />
          </div>
        </section>
        ) : null}
        <RealtorProfile />
      </div>
    </>
  );
}
