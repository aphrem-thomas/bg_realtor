import "server-only";

import { complianceConfig } from "@/config/compliance";
import { siteConfig } from "@/config/site";
import { ddfEnv } from "@/lib/env";

/**
 * Reports listing events to the CREA Analytics Web Service, as described in
 * the DDF® Web API documentation. Fire-and-forget: failures are logged only.
 *
 * GET https://analytics.crea.ca/LogEvents.svc/LogEvents
 *   ?ListingID={ListingKey}&DestinationID={id}&EventType=view&UUID={visitor-id}-{destinationId}&IP=…&ReferralURL=…
 */
export type CreaEventType = "view";

export function creaAnalyticsEnabled(): boolean {
  return complianceConfig.creaAnalytics.enabled && ddfEnv.mode === "live" && Boolean(ddfEnv.destinationId);
}

export async function logCreaListingEvent(input: {
  listingKey: string;
  eventType: CreaEventType;
  visitorId: string;
  ip?: string | null;
  referralUrl?: string | null;
}): Promise<void> {
  if (!creaAnalyticsEnabled()) return;
  const destinationId = ddfEnv.destinationId!;

  const params = new URLSearchParams({
    ListingID: input.listingKey,
    DestinationID: destinationId,
    EventType: input.eventType,
    UUID: `${input.visitorId}-${destinationId}`,
    LanguageID: "1",
    ReferralURL: input.referralUrl || siteConfig.url,
  });
  if (input.ip) params.set("IP", input.ip);

  try {
    await fetch(`${complianceConfig.creaAnalytics.endpoint}?${params.toString()}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
  } catch (error) {
    console.warn("[crea-analytics] event not recorded", error instanceof Error ? error.message : error);
  }
}
