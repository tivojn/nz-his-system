import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await req.json();

  const updateData: Record<string, unknown> = {};

  // Status transitions with timestamp tracking
  if (data.status) {
    updateData.status = data.status;
    if (data.status === "collected") {
      updateData.collectedAt = new Date();
    }
    if (data.status === "completed") {
      updateData.completedAt = new Date();
    }
  }

  // Result fields
  if (data.resultValue !== undefined) updateData.resultValue = data.resultValue;
  if (data.resultUnit !== undefined) updateData.resultUnit = data.resultUnit;
  if (data.referenceRange !== undefined) updateData.referenceRange = data.referenceRange;
  if (data.interpretation !== undefined) updateData.interpretation = data.interpretation;
  if (data.resultNotes !== undefined) updateData.resultNotes = data.resultNotes;

  const labOrder = await prisma.labOrder.update({
    where: { id },
    data: updateData,
    include: {
      patient: {
        select: { id: true, firstName: true, lastName: true, nhiNumber: true },
      },
      orderedBy: {
        select: { id: true, name: true },
      },
    },
  });

  await createAuditLog({
    action: "UPDATE",
    entity: "LabOrder",
    entityId: id,
    details: {
      orderNumber: labOrder.orderNumber,
      newStatus: data.status,
      interpretation: data.interpretation,
    },
    severity: data.interpretation === "critical" ? "critical" : "info",
  });

  return NextResponse.json(labOrder);
}
