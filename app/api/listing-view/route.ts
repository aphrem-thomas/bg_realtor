import { randomUUID } from "node:crypto";
import { after, NextResponse, type NextRequest } from "next/server";
import { siteConfig } from "@/config/site";
import { creaAnalyticsEnabled, logCreaListingEvent } from "@/lib/ddf/crea-analytics";
import { isValidListingKey } from "@/lib/utils/slug";

const VISITOR_COOKIE = "vid";

/** Receives listing-view beacons from the browser and forwards them to CREA analytics. */
export async function POST(request: NextRequest) {
  let listingKey: unknown;
  try {
    ({ listingKey } = await request.json());
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (typeof listingKey !== "string" || !isValidListingKey(listingKey)) return new NextResponse(null, { status: 400 });

  const response = new NextResponse(null, { status: 204 });
  if (!creaAnalyticsEnabled()) return response;

  // Anonymous, per-device identifier required by CREA's analytics service.
  let visitorId = request.cookies.get(VISITOR_COOKIE)?.value;
  if (!visitorId || !/^[0-9a-f-]{36}$/.test(visitorId)) {
    visitorId = randomUUID();
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const referer = request.headers.get("referer");
  const referralUrl = referer?.startsWith(siteConfig.url) ? referer : siteConfig.url;
  after(() => logCreaListingEvent({ listingKey, eventType: "view", visitorId, ip, referralUrl }));

  return response;
}
