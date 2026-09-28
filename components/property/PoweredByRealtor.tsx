"use client";

import { complianceConfig } from "@/config/compliance";
import { track } from "@/lib/analytics/client";

/**
 * "Powered by: REALTOR.ca" badge — required by DDF® rules on all DDF® listing
 * content, linking to the original listing on REALTOR.ca.
 * Markup follows CREA's published snippet.
 */
export function PoweredByRealtor({ listingUrl, listingKey }: { listingUrl: string | null; listingKey: string }) {
  const badge = complianceConfig.poweredByBadge;
  if (!badge.enabled) return null;
  return (
    <a
      href={listingUrl ?? badge.fallbackHref}
      target="_blank"
      rel="noopener"
      className="inline-block"
      aria-label={`${badge.alt} (view this listing on REALTOR.ca, opens in a new tab)`}
      onClick={() => track("realtor_ca_link_clicked", { listing_key: listingKey })}
    >
      {/* External SVG badge supplied by CREA; plain <img> keeps it byte-identical. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={badge.imageSrc} alt={badge.alt} width={badge.width} loading="lazy" style={{ height: "auto" }} />
    </a>
  );
}
