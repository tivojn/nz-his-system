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
    const { status, responseNotes } = body;

    // Check if referral exists
    const existing = await prisma.referral.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Referral not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (status !== undefined) {
      updateData.status = status;

      // Set acceptedDate when status transitions to accepted
      if (status === "accepted" && !existing.acceptedDate) {
        updateData.acceptedDate = new Date();
      }

      // Set completedDate when status transitions to completed
      if (status === "completed" && !existing.completedDate) {
        updateData.completedDate = new Date();
      }
    }

    if (responseNotes !== undefined) {
      updateData.responseNotes = responseNotes;
    }

    const updatedReferral = await prisma.referral.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            nhiNumber: true,
          },
        },
        referredBy: {
          select: {
            id: true,
            name: true,
            department: true,
          },
        },
      },
    });

    await createAuditLog({
      action: "UPDATE",
      entity: "Referral",
      entityId: id,
      severity: "info",
      details: { ...updateData, referralNumber: existing.referralNumber },
    });

    return NextResponse.json(updatedReferral);
  } catch (error) {
    console.error("Error updating referral:", error);
    return NextResponse.json(
      { error: "Failed to update referral" },
      { status: 500 }
    );
  }
}
