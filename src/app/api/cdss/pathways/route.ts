import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const pathways = await prisma.clinicalPathway.findMany({
    orderBy: { category: "asc" },
  });

  // Parse JSON steps for each pathway
  const parsed = pathways.map((p) => ({
    ...p,
    steps: JSON.parse(p.steps),
  }));

  return NextResponse.json(parsed);
}
