import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { realtor, realtorPhoneHref, realtorStats } from "@/config/realtor";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { SocialLinks } from "./SocialLinks";

/** Homepage "Meet your realtor" contact section. */
export function RealtorProfile() {
  const stats = realtorStats();
  return (
    <section aria-labelledby="realtor-heading" className="container-page">
      <div className="grid overflow-hidden rounded-[var(--radius-panel)] bg-surface ring-1 ring-line/70 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative aspect-[4/3] bg-sand sm:aspect-[16/10] lg:aspect-auto lg:min-h-[520px]">
          <Image src={realtor.photo.src} alt={realtor.photo.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover object-top" />
        </div>
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
          <p className="eyebrow">Meet your REALTOR®</p>
          <h2 id="realtor-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {realtor.name}
          </h2>
          <p className="mt-1 text-muted">
            {realtor.title} · {realtor.brokerage.name}
          </p>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft text-pretty">{realtor.shortBio}</p>

          {stats.length ? (
            <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-line py-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs text-muted">{stat.label}</dt>
                  <dd className="mt-1 text-2xl font-bold tracking-tight">{stat.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="mt-8 border-t border-line" />
          )}

          <ul className="mt-6 space-y-2 text-sm">
            <li>
              <TrackedLink href={realtorPhoneHref()} event="realtor_phone_clicked" location="home_profile" className="inline-flex items-center gap-2.5 font-medium hover:text-accent">
                <Phone className="size-4 text-muted" aria-hidden="true" /> {realtor.phone}
              </TrackedLink>
            </li>
            <li>
              <TrackedLink href={`mailto:${realtor.email}`} event="realtor_email_clicked" location="home_profile" className="inline-flex items-center gap-2.5 font-medium hover:text-accent">
                <Mail className="size-4 text-muted" aria-hidden="true" /> {realtor.email}
              </TrackedLink>
            </li>
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/contact" className="btn-primary">
              Contact {realtor.firstName} <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/about" className="btn-secondary">
              About {realtor.firstName}
            </Link>
            <SocialLinks social={realtor.social} className="sm:ml-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}
