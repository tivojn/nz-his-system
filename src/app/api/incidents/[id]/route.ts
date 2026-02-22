import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, rootCause, outcome, preventiveMeasures } = body;

    const existing = await prisma.incidentReport.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (rootCause !== undefined) updateData.rootCause = rootCause;
    if (outcome !== undefined) updateData.outcome = outcome;
    if (preventiveMeasures !== undefined) updateData.preventiveMeasures = preventiveMeasures;

    const updated = await prisma.incidentReport.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: { firstName: true, lastName: true, nhiNumber: true },
        },
        reportedBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    await createAuditLog({
      action: "UPDATE",
      entity: "IncidentReport",
      entityId: id,
      severity: "info",
      details: { incidentNumber: existing.incidentNumber, ...updateData },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating incident:", error);
    return NextResponse.json(
      { error: "Failed to update incident" },
      { status: 500 }
    );
  }
}
