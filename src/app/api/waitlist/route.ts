import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const department = searchParams.get("department");
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (department) {
      where.department = department;
    }

    if (search) {
      where.patient = {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { nhiNumber: { contains: search } },
        ],
      };
    }

    const entries = await prisma.waitlistEntry.findMany({
      where,
      orderBy: [{ priority: "asc" }, { referralDate: "asc" }],
      include: {
        patient: { select: { firstName: true, lastName: true, nhiNumber: true } },
      },
    });
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching waitlist entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch waitlist entries" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const entry = await prisma.waitlistEntry.create({ data });

    await createAuditLog({
      action: "CREATE",
      entity: "WaitlistEntry",
      entityId: entry.id,
      severity: "info",
      details: {
        patientId: data.patientId,
        department: data.department,
        priority: data.priority,
        procedure: data.procedure,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Error creating waitlist entry:", error);
    return NextResponse.json(
      { error: "Failed to create waitlist entry" },
      { status: 500 }
    );
  }
}
