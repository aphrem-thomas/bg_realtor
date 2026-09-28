import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Globe, MapPin, Phone } from "lucide-react";
import { realtor, realtorPhoneHref, realtorStats } from "@/config/realtor";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { SocialLinks } from "@/components/realtor/SocialLinks";
import { Testimonials } from "@/components/realtor/Testimonials";
import { JsonLd } from "@/components/ui/JsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { realEstateAgentJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: `About ${realtor.name}`,
  description: realtor.shortBio,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={realEstateAgentJsonLd()} />
      <div className="container-page pt-8 sm:pt-12">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-panel)] bg-sand lg:sticky lg:top-24">
            <Image src={realtor.photo.src} alt={realtor.photo.alt} fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover object-top" />
          </div>

          <div>
            <p className="eyebrow">About</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{realtor.name}</h1>
            <p className="mt-2 text-lg text-muted">
              {realtor.title} · {realtor.brokerage.name}
            </p>

            {realtorStats().length ? (
              <dl className="mt-8 grid grid-cols-3 gap-3">
                {realtorStats().map(({ label, value }) => (
                  <div key={label} className="rounded-2xl bg-surface p-4 ring-1 ring-line/70">
                    <dt className="text-xs text-muted">{label}</dt>
                    <dd className="mt-1 text-lg font-bold tracking-tight sm:text-2xl">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <div className="mt-10 space-y-5 text-lg leading-relaxed text-ink-soft">
              {realtor.biography.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <InfoBlock icon={<MapPin className="size-5" />} title="Areas served" items={realtor.areasServed} />
              <InfoBlock icon={<Award className="size-5" />} title="Specialties" items={realtor.specialties} />
              <InfoBlock icon={<Globe className="size-5" />} title="Languages" items={realtor.languages} />
              <InfoBlock icon={<Award className="size-5" />} title="Designations" items={realtor.designations} />
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/contact" className="btn-primary">
                Contact {realtor.firstName} <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <TrackedLink href={realtorPhoneHref()} event="realtor_phone_clicked" location="about_page" className="btn-secondary">
                <Phone className="size-4" aria-hidden="true" /> {realtor.phone}
              </TrackedLink>
              {realtor.website ? (
                <a href={realtor.website} target="_blank" rel="noopener" className="btn-ghost">
                  <Globe className="size-4" aria-hidden="true" /> Personal website
                </a>
              ) : null}
              <SocialLinks social={realtor.social} />
            </div>
          </div>
        </div>
      </div>

      {realtor.testimonials.length ? (
      <section aria-labelledby="about-testimonials" className="container-page mt-24">
        <SectionHeading align="center" eyebrow="Testimonials" title={<span id="about-testimonials">Trusted by clients across the region</span>} />
        <div className="mt-10">
          <Testimonials testimonials={realtor.testimonials} />
        </div>
      </section>
      ) : null}
    </>
  );
}

function InfoBlock({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="card p-6">
      <h2 className="flex items-center gap-2 font-semibold">
        <span className="text-accent" aria-hidden="true">
          {icon}
        </span>
        {title}
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item} className="rounded-full bg-paper px-3 py-1 text-sm text-ink-soft">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
