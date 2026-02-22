import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [
    totalPatients,
    activeEncounters,
    todayAppointments,
    waitlistCount,
    patients,
    encounters,
    waitlist,
    appointments,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.encounter.count({ where: { status: "in-progress" } }),
    prisma.appointment.count({
      where: {
        dateTime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.waitlistEntry.count({ where: { status: "waiting" } }),
    prisma.patient.groupBy({ by: ["ethnicity"], _count: true }),
    prisma.encounter.groupBy({ by: ["department"], _count: true, where: { status: "in-progress" } }),
    prisma.waitlistEntry.groupBy({ by: ["priority"], _count: true, where: { status: "waiting" } }),
    prisma.appointment.groupBy({ by: ["status"], _count: true }),
  ]);

  return NextResponse.json({
    stats: { totalPatients, activeEncounters, todayAppointments, waitlistCount },
    ethnicityBreakdown: patients.map((p) => ({ name: p.ethnicity, value: p._count })),
    departmentCensus: encounters.map((e) => ({ name: e.department || "Unknown", value: e._count })),
    waitlistByPriority: waitlist.map((w) => ({ name: w.priority, value: w._count })),
    appointmentsByStatus: appointments.map((a) => ({ name: a.status, value: a._count })),
  });
}
