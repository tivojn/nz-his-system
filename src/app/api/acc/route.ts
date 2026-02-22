import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") || "";

  const where: Record<string, string> = {};
  if (status && status !== "all") {
    where.status = status;
  }

  const claims = await prisma.aCCClaim.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      patient: { select: { firstName: true, lastName: true, nhiNumber: true } },
      events: { orderBy: { eventDate: "asc" } },
    },
  });

  return NextResponse.json(claims);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { patientId, injuryDate, injuryDescription, injuryCode, claimType } = data;

  // Generate claim number
  const count = await prisma.aCCClaim.count();
  const claimNumber = `ACC-${new Date().getFullYear()}-${String(count + 1).padStart(5, "0")}`;

  const claim = await prisma.aCCClaim.create({
    data: {
      patientId,
      claimNumber,
      injuryDate: new Date(injuryDate),
      injuryDescription,
      injuryCode: injuryCode || null,
      claimType,
      status: "lodged",
      totalCost: 0,
      events: {
        create: {
          type: "lodged",
          description: `Claim lodged for ${injuryDescription}`,
          cost: 0,
          eventDate: new Date(),
        },
      },
    },
    include: {
      patient: { select: { firstName: true, lastName: true, nhiNumber: true } },
      events: true,
    },
  });

  return NextResponse.json(claim, { status: 201 });
}
