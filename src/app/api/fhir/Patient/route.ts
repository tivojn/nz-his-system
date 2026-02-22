import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const patients = await prisma.patient.findMany();
  
  const bundle = {
    resourceType: "Bundle",
    type: "searchset",
    total: patients.length,
    entry: patients.map((p) => ({
      resource: {
        resourceType: "Patient",
        id: p.id,
        identifier: [
          {
            use: "official",
            system: "https://standards.digital.health.nz/ns/nhi-id",
            value: p.nhiNumber,
          },
        ],
        name: [{ use: "official", family: p.lastName, given: [p.firstName] }],
        gender: p.gender === "male" ? "male" : p.gender === "female" ? "female" : "other",
        birthDate: p.dateOfBirth.toISOString().split("T")[0],
        telecom: [
          ...(p.phone ? [{ system: "phone", value: p.phone }] : []),
          ...(p.email ? [{ system: "email", value: p.email }] : []),
        ],
        address: p.address
          ? [{ line: [p.address], city: p.city, state: p.region, country: "NZ" }]
          : [],
        extension: [
          {
            url: "http://hl7.org.nz/fhir/StructureDefinition/nz-ethnicity",
            valueCodeableConcept: { text: p.ethnicity },
          },
          ...(p.iwi
            ? [{
                url: "http://hl7.org.nz/fhir/StructureDefinition/nz-iwi",
                valueCodeableConcept: { text: p.iwi },
              }]
            : []),
        ],
      },
    })),
  };

  return NextResponse.json(bundle, {
    headers: { "Content-Type": "application/fhir+json" },
  });
}
