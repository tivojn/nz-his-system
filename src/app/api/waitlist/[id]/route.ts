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
    const { priority, status, notes, targetDate, procedure } = body;

    // Check if entry exists
    const existing = await prisma.waitlistEntry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Waitlist entry not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (targetDate !== undefined) updateData.targetDate = new Date(targetDate);
    if (procedure !== undefined) updateData.procedure = procedure;

    const updatedEntry = await prisma.waitlistEntry.update({
      where: { id },
      data: updateData,
      include: {
        patient: true,
      },
    });

    await createAuditLog({
      action: "UPDATE",
      entity: "WaitlistEntry",
      entityId: id,
      severity: "info",
      details: { ...updateData },
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("Error updating waitlist entry:", error);
    return NextResponse.json(
      { error: "Failed to update waitlist entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if entry exists
    const existing = await prisma.waitlistEntry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Waitlist entry not found" },
        { status: 404 }
      );
    }

    const updatedEntry = await prisma.waitlistEntry.update({
      where: { id },
      data: { status: "cancelled" },
      include: {
        patient: true,
      },
    });

    await createAuditLog({
      action: "DELETE",
      entity: "WaitlistEntry",
      entityId: id,
      severity: "info",
      details: { softDelete: true },
    });

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("Error deleting waitlist entry:", error);
    return NextResponse.json(
      { error: "Failed to delete waitlist entry" },
      { status: 500 }
    );
  }
}
