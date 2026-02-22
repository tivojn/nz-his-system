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
  if (data.status !== undefined) updateData.status = data.status;
  if (data.severity !== undefined) updateData.severity = data.severity;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.reaction !== undefined) updateData.reaction = data.reaction;
  if (data.verifiedBy !== undefined) updateData.verifiedBy = data.verifiedBy;

  const allergy = await prisma.allergy.update({
    where: { id },
    data: updateData,
    include: {
      patient: {
        select: { id: true, firstName: true, lastName: true, nhiNumber: true },
      },
    },
  });

  await createAuditLog({
    action: "UPDATE",
    entity: "Allergy",
    entityId: id,
    details: { updatedFields: Object.keys(updateData), ...updateData },
  });

  return NextResponse.json(allergy);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.allergy.delete({ where: { id } });

  await createAuditLog({
    action: "DELETE",
    entity: "Allergy",
    entityId: id,
    severity: "warning",
  });

  return NextResponse.json({ success: true });
}
