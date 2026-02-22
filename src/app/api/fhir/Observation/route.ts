import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const observations = await prisma.observation.findMany({ include: { patient: true } });

  const bundle = {
    resourceType: "Bundle",
    type: "searchset",
    total: observations.length,
    entry: observations.map((o) => ({
      resource: {
        resourceType: "Observation",
        id: o.id,
        status: o.status,
        category: [{
          coding: [{
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: o.type === "vital-signs" ? "vital-signs" : "laboratory",
          }],
        }],
        code: {
          coding: [{ system: "http://loinc.org", code: o.code, display: o.codeName }],
          text: o.codeName,
        },
        subject: {
          reference: `Patient/${o.patientId}`,
          display: `${o.patient.firstName} ${o.patient.lastName}`,
        },
        effectiveDateTime: o.effectiveDate.toISOString(),
        valueQuantity: {
          value: parseFloat(o.value),
          unit: o.unit,
          system: "http://unitsofmeasure.org",
        },
      },
    })),
  };

  return NextResponse.json(bundle, {
    headers: { "Content-Type": "application/fhir+json" },
  });
}
