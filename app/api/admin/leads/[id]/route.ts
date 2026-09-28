import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getLeadRepository } from "@/lib/leads/repository";
import { LEAD_STATUSES } from "@/lib/leads/types";
import { isAdminRequest } from "@/lib/security/admin-auth";

const idSchema = z.uuid();
const patchSchema = z.object({ status: z.enum(LEAD_STATUSES) });

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const lead = await (await getLeadRepository()).getById(id);
    return lead ? NextResponse.json({ lead }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    console.error("[api/admin/leads/:id] failed", error);
    return NextResponse.json({ error: "Lead storage unavailable" }, { status: 503 });
  }
}

/** PATCH { "status": "CONTACTED" } — update a lead's pipeline status. */
export async function PATCH(request: NextRequest, { params }: Context) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = patchSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: `status must be one of ${LEAD_STATUSES.join(", ")}` }, { status: 400 });

  try {
    const lead = await (await getLeadRepository()).updateStatus(id, body.data.status);
    return lead ? NextResponse.json({ lead }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    console.error("[api/admin/leads/:id] update failed", error);
    return NextResponse.json({ error: "Lead storage unavailable" }, { status: 503 });
  }
}
