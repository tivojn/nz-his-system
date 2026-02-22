import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const priority = req.nextUrl.searchParams.get("priority");
  const search = req.nextUrl.searchParams.get("search");

  const where: Record<string, unknown> = {};

  if (status) where.status = status;
  if (priority) where.priority = priority;

  if (search) {
    const q = search.trim();
    where.OR = [
      { orderNumber: { contains: q } },
      { patient: { firstName: { contains: q } } },
      { patient: { lastName: { contains: q } } },
    ];
  }

  const labOrders = await prisma.labOrder.findMany({
    where,
    include: {
      patient: {
        select: { id: true, firstName: true, lastName: true, nhiNumber: true },
      },
      orderedBy: {
        select: { id: true, name: true },
      },
    },
    orderBy: { orderedAt: "desc" },
  });

  return NextResponse.json(labOrders);
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  // Auto-generate order number: LAB-YYYY-NNN
  const year = new Date().getFullYear();
  const prefix = `LAB-${year}-`;

  const lastOrder = await prisma.labOrder.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
  });

  let nextNum = 1;
  if (lastOrder) {
    const lastNum = parseInt(lastOrder.orderNumber.replace(prefix, ""), 10);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }

  const orderNumber = `${prefix}${String(nextNum).padStart(3, "0")}`;

  const labOrder = await prisma.labOrder.create({
    data: {
      patientId: data.patientId,
      orderedById: data.orderedById,
      orderNumber,
      testName: data.testName,
      testCode: data.testCode,
      priority: data.priority || "routine",
      specimen: data.specimen || null,
      clinicalNotes: data.clinicalNotes || null,
      status: "ordered",
    },
    include: {
      patient: {
        select: { id: true, firstName: true, lastName: true, nhiNumber: true },
      },
      orderedBy: {
        select: { id: true, name: true },
      },
    },
  });

  await createAuditLog({
    action: "CREATE",
    entity: "LabOrder",
    entityId: labOrder.id,
    userId: data.orderedById,
    details: {
      orderNumber,
      testName: data.testName,
      patientId: data.patientId,
      priority: data.priority,
    },
  });

  return NextResponse.json(labOrder, { status: 201 });
}
