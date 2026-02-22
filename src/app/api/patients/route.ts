import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") || "";
  const status = req.nextUrl.searchParams.get("status") || "";
  const ethnicity = req.nextUrl.searchParams.get("ethnicity") || "";

  const where: any = {};
  if (search) {
    where.OR = [
      { nhiNumber: { contains: search } },
      { firstName: { contains: search } },
      { lastName: { contains: search } },
    ];
  }
  if (status) where.status = status;
  if (ethnicity) where.ethnicity = ethnicity;

  const patients = await prisma.patient.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      encounters: { orderBy: { admitDate: "desc" }, take: 1 },
      _count: { select: { appointments: true, notes: true } },
    },
  });

  return NextResponse.json(patients);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const patient = await prisma.patient.create({ data });

  await createAuditLog({
    action: "CREATE",
    entity: "Patient",
    entityId: patient.id,
    severity: "info",
    details: { nhiNumber: patient.nhiNumber, name: `${patient.firstName} ${patient.lastName}` },
  });

  return NextResponse.json(patient, { status: 201 });
}
