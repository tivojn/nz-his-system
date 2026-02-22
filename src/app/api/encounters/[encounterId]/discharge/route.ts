import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ encounterId: string }> }
) {
  const { encounterId } = await params;
  const data = await req.json();

  const encounter = await prisma.encounter.update({
    where: { id: encounterId },
    data: {
      status: "finished",
      dischargeDate: new Date(),
      diagnosis: data.diagnosis || undefined,
      diagnosisCode: data.diagnosisCode || undefined,
    },
  });

  // Discontinue medications not marked for continuation
  if (data.discontinueMedications?.length) {
    await prisma.medication.updateMany({
      where: { id: { in: data.discontinueMedications } },
      data: { status: "discontinued", endDate: new Date() },
    });
  }

  await createAuditLog({
    action: "DISCHARGE",
    entity: "Encounter",
    entityId: encounterId,
    userId: data.dischargedBy,
    severity: "warning",
    details: {
      patientId: encounter.patientId,
      diagnosis: data.diagnosis,
    },
  });

  return NextResponse.json(encounter);
}
