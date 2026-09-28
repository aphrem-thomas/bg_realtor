import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { complianceConfig } from "@/config/compliance";
import { realtor, realtorPhoneHref } from "@/config/realtor";
import { legalNav, mainNav, siteConfig } from "@/config/site";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { SocialLinks } from "@/components/realtor/SocialLinks";
import { Logo } from "./Logo";

const exploreLinks = [
  { href: "/properties", label: "All properties" },
  { href: "/properties?type=house", label: "Houses" },
  { href: "/properties?type=condo", label: "Condos" },
  { href: "/properties?transaction=lease", label: "Rentals" },
  { href: "/saved", label: "Saved homes" },
];

const toolLinks = [
  { href: "/eligibility", label: "Affordability check" },
  { href: "/sell", label: "What's my home worth?" },
  { href: "/buy", label: "Buyer consultation" },
  { href: "/contact", label: "Book a call" },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 bg-ink text-white/80">
      <div className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-sm">
            <Logo inverted />
            <p className="mt-5 text-sm leading-relaxed text-white/65">{realtor.shortBio}</p>
            <ul className="mt-6 space-y-3 text-sm">
              <li>
                <TrackedLink href={realtorPhoneHref()} event="realtor_phone_clicked" location="footer" className="inline-flex items-center gap-2.5 hover:text-white">
                  <Phone className="size-4 text-white/50" aria-hidden="true" /> {realtor.phone}
                </TrackedLink>
              </li>
              <li>
                <TrackedLink href={`mailto:${realtor.email}`} event="realtor_email_clicked" location="footer" className="inline-flex items-center gap-2.5 hover:text-white">
                  <Mail className="size-4 text-white/50" aria-hidden="true" /> {realtor.email}
                </TrackedLink>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-white/50" aria-hidden="true" />
                <span>
                  {realtor.brokerage.name}
                  <br />
                  {realtor.brokerage.address}
                </span>
              </li>
            </ul>
            <SocialLinks social={realtor.social} className="mt-6" inverted />
          </div>

          <FooterColumn title="Navigate" links={mainNav} />
          <FooterColumn title="Explore" links={exploreLinks} />
          <FooterColumn title="Tools" links={toolLinks} />
        </div>

        <div className="mt-14 space-y-4 border-t border-white/10 pt-8 text-xs leading-relaxed text-white/50">
          <p>{complianceConfig.trademarkNotice}</p>
          <p>{complianceConfig.listingDisclaimer} The affordability tool provides estimates only and is not a mortgage pre-approval or financial advice.</p>
          <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {siteConfig.name}. {realtor.name}, {realtor.title}, {realtor.brokerage.name}.
            </p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {legalNav.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
