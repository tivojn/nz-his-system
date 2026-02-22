import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  const appointments = await prisma.appointment.findMany({
    orderBy: { dateTime: "asc" },
    include: {
      patient: { select: { firstName: true, lastName: true, nhiNumber: true } },
      provider: { select: { name: true } },
    },
  });
  return NextResponse.json(appointments);
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
