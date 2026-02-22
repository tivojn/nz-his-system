import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "PRESCRIBE"
  | "DISCHARGE"
  | "ACKNOWLEDGE_ALERT"
  | "RESOLVE_ALERT";

export type AuditSeverity = "info" | "warning" | "critical";

interface AuditLogParams {
  userId?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  severity?: AuditSeverity;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export async function createAuditLog(params: AuditLogParams) {
  const { userId, action, entity, entityId, severity = "info", details, ipAddress } = params;

  return prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      severity,
      details: details ? JSON.stringify(details) : null,
      ipAddress,
    },
  });
}

export function getAuditSeverity(action: AuditAction): AuditSeverity {
  switch (action) {
    case "DELETE":
    case "DISCHARGE":
      return "warning";
    case "PRESCRIBE":
      return "info";
    case "LOGIN":
    case "LOGOUT":
      return "info";
    default:
      return "info";
  }
}
