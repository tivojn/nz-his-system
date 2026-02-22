import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const toDepartment = searchParams.get("toDepartment");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (toDepartment) {
      where.toDepartment = toDepartment;
    }

    const referrals = await prisma.referral.findMany({
      where,
      orderBy: { requestedDate: "desc" },
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

    return NextResponse.json(referrals);
  } catch (error) {
    console.error("Error fetching referrals:", error);
    return NextResponse.json(
      { error: "Failed to fetch referrals" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const {
      patientId,
      referredById,
      fromDepartment,
      toDepartment,
      priority,
      reason,
      clinicalSummary,
    } = data;

    if (
      !patientId ||
      !referredById ||
      !fromDepartment ||
      !toDepartment ||
      !priority ||
      !reason ||
      !clinicalSummary
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Auto-generate referralNumber in format REF-YYYY-NNN
    const year = new Date().getFullYear();
    const count = await prisma.referral.count({
      where: {
        referralNumber: { startsWith: `REF-${year}-` },
      },
    });
    const referralNumber = `REF-${year}-${String(count + 1).padStart(3, "0")}`;

    const referral = await prisma.referral.create({
      data: {
        patientId,
        referredById,
        referralNumber,
        fromDepartment,
        toDepartment,
        priority,
        reason,
        clinicalSummary,
      },
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
      action: "CREATE",
      entity: "Referral",
      entityId: referral.id,
      severity: "info",
      details: {
        referralNumber,
        patientId,
        fromDepartment,
        toDepartment,
        priority,
      },
    });

    return NextResponse.json(referral, { status: 201 });
  } catch (error) {
    console.error("Error creating referral:", error);
    return NextResponse.json(
      { error: "Failed to create referral" },
      { status: 500 }
    );
  }
}
