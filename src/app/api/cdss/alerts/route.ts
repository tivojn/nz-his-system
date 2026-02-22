import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  const alerts = await prisma.clinicalAlert.findMany({
    include: { patient: { select: { id: true, firstName: true, lastName: true, nhiNumber: true } } },
    orderBy: [
      { severity: "asc" }, // critical < warning < info alphabetically works
      { createdAt: "desc" },
    ],
  });

  // Re-sort so critical comes first
  const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3));

  return NextResponse.json(alerts);
}

export async function PATCH(req: NextRequest) {
  const { id, status, acknowledgedBy } = await req.json();

  const data: Record<string, unknown> = { status };
  if (status === "acknowledged") {
    data.acknowledgedBy = acknowledgedBy || "Unknown";
    data.acknowledgedAt = new Date();
  }
  if (status === "resolved") {
    data.resolvedAt = new Date();
  }

  const alert = await prisma.clinicalAlert.update({
    where: { id },
    data,
  });

  await createAuditLog({
    action: status === "acknowledged" ? "ACKNOWLEDGE_ALERT" : "RESOLVE_ALERT",
    entity: "ClinicalAlert",
    entityId: id,
    userId: acknowledgedBy,
    severity: "info",
  });

  return NextResponse.json(alert);
}
