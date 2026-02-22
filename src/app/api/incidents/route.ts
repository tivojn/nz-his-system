import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const severity = searchParams.get("severity");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (severity) where.severity = severity;

    const incidents = await prisma.incidentReport.findMany({
      where,
      orderBy: { dateTime: "desc" },
      include: {
        patient: {
          select: { firstName: true, lastName: true, nhiNumber: true },
        },
        reportedBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return NextResponse.json(incidents);
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return NextResponse.json(
      { error: "Failed to fetch incidents" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Auto-generate incident number: INC-YYYY-NNN
    const year = new Date().getFullYear();
    const count = await prisma.incidentReport.count({
      where: {
        incidentNumber: { startsWith: `INC-${year}-` },
      },
    });
    const incidentNumber = `INC-${year}-${String(count + 1).padStart(3, "0")}`;

    const incident = await prisma.incidentReport.create({
      data: {
        incidentNumber,
        patientId: data.patientId || null,
        reportedById: data.reportedById,
        type: data.type,
        severity: data.severity,
        location: data.location,
        dateTime: new Date(data.dateTime),
        description: data.description,
        immediateAction: data.immediateAction || null,
      },
      include: {
        patient: {
          select: { firstName: true, lastName: true, nhiNumber: true },
        },
        reportedBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    await createAuditLog({
      action: "CREATE",
      entity: "IncidentReport",
      entityId: incident.id,
      severity: data.severity === "major" || data.severity === "catastrophic" ? "critical" : "warning",
      details: {
        incidentNumber,
        type: data.type,
        severity: data.severity,
        location: data.location,
      },
    });

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error("Error creating incident:", error);
    return NextResponse.json(
      { error: "Failed to create incident" },
      { status: 500 }
    );
  }
}
