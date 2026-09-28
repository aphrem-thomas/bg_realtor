import { NextResponse, type NextRequest } from "next/server";
import { friendlyDdfMessage } from "@/lib/ddf/errors";
import { getListingsByKeys, searchListings } from "@/lib/ddf/listings";
import { parseListingSearch } from "@/lib/search/params";

/**
 * Public, read-only listing API used by client components (e.g. Saved homes)
 * and available to future clients (mobile app, map view). The browser only
 * ever talks to this route; DDF credentials stay on the server.
 *
 *   GET /api/properties?location=Ottawa&beds=3&page=2
 *   GET /api/properties?keys=123,456
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  try {
    const keysParam = params.get("keys");
    if (keysParam !== null) {
      const keys = keysParam.split(",").map((k) => k.trim()).filter(Boolean).slice(0, 50);
      const listings = await getListingsByKeys(keys);
      return NextResponse.json({ listings }, { headers: { "Cache-Control": "private, max-age=60" } });
    }

    const result = await searchListings(parseListingSearch(params));
    return NextResponse.json(result, { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } });
  } catch (error) {
    console.error("[api/properties] failed", error);
    return NextResponse.json({ error: friendlyDdfMessage(error).title }, { status: 503 });
  }
}
