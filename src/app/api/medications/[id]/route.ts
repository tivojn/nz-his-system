import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await req.json();

  const medication = await prisma.medication.update({
    where: { id },
    data: {
      status: data.status,
      ...(data.status === "discontinued" ? { endDate: new Date() } : {}),
    },
  });

  await createAuditLog({
    action: "UPDATE",
    entity: "Medication",
    entityId: id,
    details: { newStatus: data.status },
  });

  return NextResponse.json(medication);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const medication = await prisma.medication.update({
    where: { id },
    data: { status: "discontinued", endDate: new Date() },
  });

  await createAuditLog({
    action: "DELETE",
    entity: "Medication",
    entityId: id,
    severity: "warning",
  });

  return NextResponse.json(medication);
}
