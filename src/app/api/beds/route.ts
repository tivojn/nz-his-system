import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const beds = await prisma.bed.findMany({
    orderBy: [{ ward: "asc" }, { bedNumber: "asc" }],
    include: {
      patient: { select: { firstName: true, lastName: true, nhiNumber: true } },
    },
  });

  // Group by ward
  const wards: Record<string, typeof beds> = {};
  for (const bed of beds) {
    if (!wards[bed.ward]) wards[bed.ward] = [];
    wards[bed.ward].push(bed);
  }

  return NextResponse.json(wards);
}
