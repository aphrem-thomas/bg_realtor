import { NextResponse, type NextRequest } from "next/server";
import { getLeadRepository } from "@/lib/leads/repository";
import { LEAD_SOURCES, LEAD_STATUSES, type LeadSource, type LeadStatus } from "@/lib/leads/types";
import { isAdminRequest } from "@/lib/security/admin-auth";

/**
 * GET /api/admin/leads?status=NEW&source=ELIGIBILITY_CHECK&limit=50&offset=0
 * Authorization: Bearer <ADMIN_API_TOKEN>
 *
 * Foundation for a future admin dashboard / CRM export.
 */
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const params = request.nextUrl.searchParams;
  const status = params.get("status");
  const source = params.get("source");

  try {
    const repository = await getLeadRepository();
    const leads = await repository.list({
      status: LEAD_STATUSES.includes(status as LeadStatus) ? (status as LeadStatus) : undefined,
      source: LEAD_SOURCES.includes(source as LeadSource) ? (source as LeadSource) : undefined,
      propertyId: params.get("propertyId") ?? undefined,
      limit: Number(params.get("limit")) || undefined,
      offset: Number(params.get("offset")) || undefined,
    });
    return NextResponse.json({ leads }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/admin/leads] failed", error);
    return NextResponse.json({ error: "Lead storage unavailable" }, { status: 503 });
  }
}
