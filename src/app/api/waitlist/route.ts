import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const entries = await prisma.waitlistEntry.findMany({
    orderBy: [{ priority: "asc" }, { referralDate: "asc" }],
    include: {
      patient: { select: { firstName: true, lastName: true, nhiNumber: true } },
    },
  });
  return NextResponse.json(entries);
}
