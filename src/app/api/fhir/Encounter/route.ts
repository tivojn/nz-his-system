import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const encounters = await prisma.encounter.findMany({ include: { patient: true } });

  const bundle = {
    resourceType: "Bundle",
    type: "searchset",
    total: encounters.length,
    entry: encounters.map((e) => ({
      resource: {
        resourceType: "Encounter",
        id: e.id,
        status: e.status === "in-progress" ? "in-progress" : e.status === "finished" ? "finished" : "planned",
        class: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: e.type === "outpatient" ? "AMB" : "IMP",
          display: e.type === "outpatient" ? "ambulatory" : "inpatient encounter",
        },
        subject: {
          reference: `Patient/${e.patientId}`,
          display: `${e.patient.firstName} ${e.patient.lastName}`,
        },
        period: {
          start: e.admitDate.toISOString(),
          ...(e.dischargeDate ? { end: e.dischargeDate.toISOString() } : {}),
        },
        ...(e.diagnosis
          ? {
              diagnosis: [{
                condition: { display: e.diagnosis },
                use: { coding: [{ system: "http://snomed.info/sct", code: e.diagnosisCode }] },
              }],
            }
          : {}),
        serviceProvider: { display: e.department },
      },
    })),
  };

  return NextResponse.json(bundle, {
    headers: { "Content-Type": "application/fhir+json" },
  });
}
