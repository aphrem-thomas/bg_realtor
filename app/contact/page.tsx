import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { realtor, realtorPhoneHref } from "@/config/realtor";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { ContactForm } from "@/components/forms/ContactForm";
import { RealtorCard } from "@/components/realtor/RealtorCard";
import { SocialLinks } from "@/components/realtor/SocialLinks";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${realtor.name}, ${realtor.title}. Questions about buying, selling or a specific property — we're here to help.`,
  alternates: { canonical: "/contact" },
};

type Props = { searchParams: Promise<{ reason?: string | string[] }> };

export default async function ContactPage({ searchParams }: Props) {
  const { reason } = await searchParams;

  return (
    <div className="container-page pt-8 sm:pt-12">
      <header className="max-w-2xl">
        <p className="eyebrow">Contact</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Let&apos;s talk about your <span className="font-display font-normal italic">next move</span>
        </h1>
        <p className="mt-4 text-lg text-muted">
          Send a message, call or email — whichever is easiest. {realtor.firstName} personally replies to every inquiry.
        </p>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <section aria-label="Contact form" className="card p-6 sm:p-10">
          <ContactForm realtorName={realtor.name} defaultReason={typeof reason === "string" ? reason : undefined} />
        </section>

        <aside className="space-y-4">
          <div className="card p-6">
            <RealtorCard location="contact_page" heading={realtor.title} />
            <ul className="mt-6 space-y-4 border-t border-line pt-6 text-sm">
              <li>
                <TrackedLink href={realtorPhoneHref()} event="realtor_phone_clicked" location="contact_page" className="flex items-center gap-3 font-medium hover:text-accent">
                  <Phone className="size-4 text-muted" aria-hidden="true" /> {realtor.phone}
                </TrackedLink>
              </li>
              <li>
                <TrackedLink href={`mailto:${realtor.email}`} event="realtor_email_clicked" location="contact_page" className="flex items-center gap-3 font-medium hover:text-accent">
                  <Mail className="size-4 text-muted" aria-hidden="true" /> {realtor.email}
                </TrackedLink>
              </li>
              {realtor.officeHours ? (
                <li className="flex items-center gap-3 text-ink-soft">
                  <Clock className="size-4 text-muted" aria-hidden="true" /> {realtor.officeHours}
                </li>
              ) : null}
              <li className="flex items-start gap-3 text-ink-soft">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
                <span>
                  {realtor.brokerage.name}
                  <br />
                  {realtor.brokerage.address}
                  <br />
                  Office: {realtor.brokerage.phone}
                </span>
              </li>
            </ul>
            <SocialLinks social={realtor.social} className="mt-6" />
          </div>
          <div className="rounded-[var(--radius-card)] bg-accent p-6 text-white">
            <p className="font-semibold">Serving</p>
            <p className="mt-1 text-sm text-white/80">{realtor.areasServed.join(" · ")}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
