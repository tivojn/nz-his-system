import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const patientId = req.nextUrl.searchParams.get("patientId");

  const where: Record<string, unknown> = {};
  if (patientId) where.patientId = patientId;

  const medications = await prisma.medication.findMany({
    where,
    include: {
      patient: { select: { id: true, firstName: true, lastName: true, nhiNumber: true } },
      prescriber: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(medications);
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const medication = await prisma.medication.create({
    data: {
      patientId: data.patientId,
      prescriberId: data.prescriberId,
      name: data.name,
      genericName: data.genericName || null,
      dose: data.dose,
      unit: data.unit,
      route: data.route,
      frequency: data.frequency,
      instructions: data.instructions || null,
      status: "ordered",
    },
    include: {
      patient: { select: { id: true, firstName: true, lastName: true } },
      prescriber: { select: { id: true, name: true } },
    },
  });

  await createAuditLog({
    action: "PRESCRIBE",
    entity: "Medication",
    entityId: medication.id,
    userId: data.prescriberId,
    details: { medicationName: data.name, patientId: data.patientId },
  });

  return NextResponse.json(medication, { status: 201 });
}
