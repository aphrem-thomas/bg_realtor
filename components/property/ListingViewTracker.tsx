"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/client";

/**
 * Fires the `property_viewed` analytics event and reports the view to CREA's
 * listing analytics (via our own API route, so the DDF destination id and
 * visitor id handling stay server-side).
 */
export function ListingViewTracker({ listingKey, price, city }: { listingKey: string; price: number | null; city: string | null }) {
  useEffect(() => {
    track("property_viewed", { listing_key: listingKey, price, city });
    const body = JSON.stringify({ listingKey });
    if (!navigator.sendBeacon?.("/api/listing-view", new Blob([body], { type: "application/json" }))) {
      fetch("/api/listing-view", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  }, [listingKey, price, city]);
  return null;
}
