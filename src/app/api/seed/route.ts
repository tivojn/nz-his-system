import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const count = await prisma.user.count();
  if (count > 0) {
    return NextResponse.json({ status: "already seeded", users: count });
  }

  // Auto-seed on first access
  const { execSync } = require("child_process");
  try {
    execSync("npx tsx prisma/seed.ts", { cwd: process.cwd() });
    const newCount = await prisma.user.count();
    return NextResponse.json({ status: "seeded", users: newCount });
  } catch {
    return NextResponse.json({ status: "seed failed - run manually" }, { status: 500 });
  }
}

export async function POST() {
  // Force re-seed (clears and re-creates all data)
  const { execSync } = require("child_process");
  try {
    execSync("npx tsx prisma/seed.ts", { cwd: process.cwd() });
    const counts = {
      users: await prisma.user.count(),
      patients: await prisma.patient.count(),
      encounters: await prisma.encounter.count(),
      medications: await prisma.medication.count(),
      clinicalAlerts: await prisma.clinicalAlert.count(),
      clinicalPathways: await prisma.clinicalPathway.count(),
      drugInteractions: await prisma.drugInteraction.count(),
      vitalSignSets: await prisma.vitalSignSet.count(),
      accClaims: await prisma.aCCClaim.count(),
      beds: await prisma.bed.count(),
      auditLogs: await prisma.auditLog.count(),
    };
    return NextResponse.json({ status: "re-seeded", counts });
  } catch (e) {
    return NextResponse.json({ status: "seed failed", error: String(e) }, { status: 500 });
  }
}
