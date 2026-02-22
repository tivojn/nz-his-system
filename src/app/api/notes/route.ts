import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const note = await prisma.clinicalNote.create({
    data,
    include: { author: { select: { name: true, role: true } } },
  });

  await createAuditLog({
    action: "CREATE",
    entity: "ClinicalNote",
    entityId: note.id,
    userId: data.authorId,
    severity: "info",
    details: { patientId: data.patientId, noteType: data.type },
  });

  return NextResponse.json(note, { status: 201 });
}
