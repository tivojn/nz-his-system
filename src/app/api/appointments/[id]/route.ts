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
    const { status, dateTime, duration, notes, type, department, providerId } = body;

    // Check if appointment exists
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (dateTime !== undefined) updateData.dateTime = new Date(dateTime);
    if (duration !== undefined) updateData.duration = duration;
    if (notes !== undefined) updateData.notes = notes;
    if (type !== undefined) updateData.type = type;
    if (department !== undefined) updateData.department = department;
    if (providerId !== undefined) updateData.providerId = providerId;

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: true,
        provider: true,
      },
    });

    await createAuditLog({
      action: "UPDATE",
      entity: "Appointment",
      entityId: id,
      severity: "info",
      details: { ...updateData },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
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

    // Check if appointment exists
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status: "cancelled" },
      include: {
        patient: true,
        provider: true,
      },
    });

    await createAuditLog({
      action: "DELETE",
      entity: "Appointment",
      entityId: id,
      severity: "info",
      details: { softDelete: true },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
