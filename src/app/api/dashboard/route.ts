import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [
    totalPatients,
    activeEncounters,
    todayAppointments,
    waitlistCount,
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
  ]);

  // Generate sparkline-style data points for KPI trends
  const sparklines = {
    patients: Array.from({ length: 7 }, () => totalPatients + Math.floor(Math.random() * 20 - 10)),
    admissions: Array.from({ length: 7 }, () => activeEncounters + Math.floor(Math.random() * 8 - 4)),
    appointments: Array.from({ length: 7 }, () => todayAppointments + Math.floor(Math.random() * 6 - 3)),
    waitlist: Array.from({ length: 7 }, () => waitlistCount + Math.floor(Math.random() * 10 - 5)),
  };

  // Trend percentages (simulated week-over-week change)
  const trends = {
    patients: +(Math.random() * 6 - 2).toFixed(1),
    admissions: +(Math.random() * 10 - 3).toFixed(1),
    appointments: +(Math.random() * 8 - 4).toFixed(1),
    waitlist: +(Math.random() * 12 - 8).toFixed(1),
  };

  return NextResponse.json({
    stats: {
      totalPatients,
      activeEncounters,
      todayAppointments,
      waitlistCount,
      trends,
      sparklines,
    },
  });
}
