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
    const { status, patientId } = body;

    // Check if bed exists
    const existingBed = await prisma.bed.findUnique({ where: { id } });
    if (!existingBed) {
      return NextResponse.json({ error: "Bed not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    // Assigning a patient
    if (patientId !== undefined && patientId !== null) {
      // Check if patient is already in another bed
      const occupied = await prisma.bed.findFirst({
        where: { patientId, NOT: { id } },
      });
      if (occupied) {
        return NextResponse.json(
          { error: "Patient is already assigned to another bed" },
          { status: 409 }
        );
      }
      updateData.patientId = patientId;
      updateData.status = "occupied";
    }

    // Unassigning a patient (patientId explicitly null)
    if (patientId === null) {
      updateData.patientId = null;
      if (!status) {
        updateData.status = "cleaning";
      }
    }

    // Explicit status override
    if (status) {
      updateData.status = status;
    }

    const updatedBed = await prisma.bed.update({
      where: { id },
      data: updateData,
      include: {
        patient: true,
      },
    });

    await createAuditLog({
      action: "UPDATE",
      entity: "Bed",
      entityId: id,
      severity: "info",
      details: { ...updateData },
    });

    return NextResponse.json(updatedBed);
  } catch (error) {
    console.error("Error updating bed:", error);
    return NextResponse.json(
      { error: "Failed to update bed" },
      { status: 500 }
    );
  }
}
