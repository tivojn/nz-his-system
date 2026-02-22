import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const patientId = req.nextUrl.searchParams.get("patientId");
  const type = req.nextUrl.searchParams.get("type");
  const severity = req.nextUrl.searchParams.get("severity");
  const status = req.nextUrl.searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (patientId) where.patientId = patientId;
  if (type) where.type = type;
  if (severity) where.severity = severity;
  if (status) where.status = status;

  const allergies = await prisma.allergy.findMany({
    where,
    include: {
      patient: {
        select: { id: true, firstName: true, lastName: true, nhiNumber: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(allergies);
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const allergy = await prisma.allergy.create({
    data: {
      patientId: data.patientId,
      allergen: data.allergen,
      type: data.type,
      severity: data.severity,
      reaction: data.reaction || "",
      status: data.status || "active",
      onsetDate: data.onsetDate ? new Date(data.onsetDate) : null,
      verifiedBy: data.verifiedBy || null,
      notes: data.notes || null,
    },
    include: {
      patient: {
        select: { id: true, firstName: true, lastName: true, nhiNumber: true },
      },
    },
  });

  await createAuditLog({
    action: "CREATE",
    entity: "Allergy",
    entityId: allergy.id,
    details: {
      allergen: data.allergen,
      type: data.type,
      severity: data.severity,
      patientId: data.patientId,
    },
  });

  return NextResponse.json(allergy, { status: 201 });
}
