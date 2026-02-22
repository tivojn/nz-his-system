import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      encounters: { orderBy: { admitDate: "desc" } },
      notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { name: true, role: true } } } },
      appointments: { orderBy: { dateTime: "desc" }, include: { provider: { select: { name: true } } } },
      waitlistEntries: { orderBy: { createdAt: "desc" } },
      observations: { orderBy: { effectiveDate: "desc" } },
    },
  });
  if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(patient);
}
