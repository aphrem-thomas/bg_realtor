import Link from "next/link";
import { Heart, Phone } from "lucide-react";
import { realtor, realtorContact } from "@/config/realtor";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { NavLinks } from "./NavLinks";

export function Header() {
  const contact = realtorContact();
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-paper/85 backdrop-blur-md supports-[backdrop-filter]:bg-paper/70">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center justify-between gap-6 lg:h-20">
        <Logo />
        <nav aria-label="Main" className="hidden lg:block">
          <NavLinks />
        </nav>
        <div className="flex items-center gap-2">
          <TrackedLink
            href={contact.phoneHref}
            event="realtor_phone_clicked"
            location="header"
            className="btn-ghost hidden xl:inline-flex"
          >
            <Phone className="size-4" aria-hidden="true" />
            {realtor.phone}
          </TrackedLink>
          <Link href="/saved" className="btn-ghost hidden px-3 lg:inline-flex" aria-label="Saved homes">
            <Heart className="size-5" aria-hidden="true" />
          </Link>
          <Link href="/eligibility" className="btn-primary hidden sm:inline-flex">
            Get Started
          </Link>
          <MobileNav contact={contact} />
        </div>
      </div>
    </header>
  );
}
