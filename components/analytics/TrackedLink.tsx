"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { track } from "@/lib/analytics/client";

type ContactEvent = "realtor_phone_clicked" | "realtor_email_clicked";

/** Plain <a> (tel:, mailto:, external) that reports a click event. */
export function TrackedLink({
  event,
  location,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { event: ContactEvent; location: string; children: ReactNode }) {
  return (
    <a
      {...props}
      onClick={(e) => {
        track(event, { location });
        props.onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
