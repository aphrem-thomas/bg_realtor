import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { realtor, realtorPhoneHref } from "@/config/realtor";
import { TrackedLink } from "@/components/analytics/TrackedLink";

/** Compact realtor contact card (property sidebar, contact page). */
export function RealtorCard({ location, heading = "Your local REALTOR®" }: { location: string; heading?: string }) {
  return (
    <div className="flex items-center gap-4">
      <Image
        src={realtor.photo.src}
        alt={realtor.photo.alt}
        width={112}
        height={112}
        quality={75}
        className="size-14 shrink-0 rounded-full object-cover ring-2 ring-white"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted">{heading}</p>
        <p className="truncate font-semibold">{realtor.name}</p>
        <p className="truncate text-xs text-muted">{realtor.brokerage.name}</p>
      </div>
      <div className="flex gap-1.5">
        <TrackedLink
          href={realtorPhoneHref()}
          event="realtor_phone_clicked"
          location={location}
          aria-label={`Call ${realtor.name}`}
          className="grid size-10 place-items-center rounded-full border border-line hover:bg-ink hover:text-white"
        >
          <Phone className="size-4" aria-hidden="true" />
        </TrackedLink>
        <TrackedLink
          href={`mailto:${realtor.email}`}
          event="realtor_email_clicked"
          location={location}
          aria-label={`Email ${realtor.name}`}
          className="grid size-10 place-items-center rounded-full border border-line hover:bg-ink hover:text-white"
        >
          <Mail className="size-4" aria-hidden="true" />
        </TrackedLink>
      </div>
    </div>
  );
}
