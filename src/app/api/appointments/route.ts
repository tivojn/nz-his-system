import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const department = searchParams.get("department");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (department) {
      where.department = department;
    }

    if (from || to) {
      where.dateTime = {};
      if (from) {
        where.dateTime.gte = new Date(from);
      }
      if (to) {
        where.dateTime.lte = new Date(to);
      }
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

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { dateTime: "asc" },
      include: {
        patient: { select: { firstName: true, lastName: true, nhiNumber: true } },
        provider: { select: { name: true } },
      },
    });
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const appointment = await prisma.appointment.create({ data });

  await createAuditLog({
    action: "CREATE",
    entity: "Appointment",
    entityId: appointment.id,
    severity: "info",
    details: { patientId: data.patientId, type: data.type, dateTime: data.dateTime },
  });

  return NextResponse.json(appointment, { status: 201 });
}
