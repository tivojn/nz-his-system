import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const action = params.get("action") || "";
  const userId = params.get("userId") || "";
  const severity = params.get("severity") || "";
  const entity = params.get("entity") || "";
  const dateRange = params.get("dateRange") || "";
  const page = parseInt(params.get("page") || "1", 10);
  const limit = parseInt(params.get("limit") || "20", 10);

  const where: Record<string, unknown> = {};

  if (action) where.action = action;
  if (userId) where.userId = userId;
  if (severity) where.severity = severity;
  if (entity) where.entity = entity;

  if (dateRange) {
    const now = new Date();
    let from: Date | null = null;
    if (dateRange === "today") {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateRange === "24h") {
      from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (dateRange === "7d") {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === "30d") {
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    if (from) {
      where.createdAt = { gte: from };
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { name: true, role: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, page, limit });
}
