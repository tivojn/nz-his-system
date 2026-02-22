import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateNEWS2 } from "@/lib/cdss";

export async function GET(req: NextRequest) {
  const patientId = req.nextUrl.searchParams.get("patientId");

  if (!patientId) {
    return NextResponse.json({ error: "patientId is required" }, { status: 400 });
  }

  const vitals = await prisma.vitalSignSet.findMany({
    where: { patientId },
    orderBy: { recordedAt: "desc" },
  });

  return NextResponse.json(vitals);
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  // Auto-calculate NEWS2 if we have enough data
  let news2Score: number | null = null;
  if (
    data.respiratoryRate != null &&
    data.oxygenSat != null &&
    data.systolicBP != null &&
    data.heartRate != null &&
    data.consciousness &&
    data.temperature != null
  ) {
    const result = calculateNEWS2({
      respiratoryRate: data.respiratoryRate,
      oxygenSat: data.oxygenSat,
      onSupplementalO2: data.onSupplementalO2 || false,
      systolicBP: data.systolicBP,
      heartRate: data.heartRate,
      consciousness: data.consciousness,
      temperature: data.temperature,
    });
    news2Score = result.total;
  }

  const vitalSet = await prisma.vitalSignSet.create({
    data: {
      patientId: data.patientId,
      heartRate: data.heartRate || null,
      systolicBP: data.systolicBP || null,
      diastolicBP: data.diastolicBP || null,
      respiratoryRate: data.respiratoryRate || null,
      temperature: data.temperature || null,
      oxygenSat: data.oxygenSat || null,
      consciousness: data.consciousness || null,
      painScore: data.painScore || null,
      news2Score,
      recordedBy: data.recordedBy || null,
    },
  });

  return NextResponse.json(vitalSet, { status: 201 });
}
