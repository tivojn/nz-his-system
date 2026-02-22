import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const note = await prisma.clinicalNote.create({
    data,
    include: { author: { select: { name: true, role: true } } },
  });
  return NextResponse.json(note, { status: 201 });
}
