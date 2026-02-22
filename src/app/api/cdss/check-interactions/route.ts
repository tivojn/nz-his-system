import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkDrugInteractions } from "@/lib/cdss";

export async function POST(req: NextRequest) {
  const { drugA, drugB } = await req.json();

  const allInteractions = await prisma.drugInteraction.findMany();

  const matches = checkDrugInteractions(drugA, drugB, allInteractions);

  return NextResponse.json(matches);
}
