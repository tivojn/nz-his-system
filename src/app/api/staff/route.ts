import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const role = searchParams.get("role");
    const department = searchParams.get("department");
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (role) where.role = role;
    if (department) where.department = department;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { hpiNumber: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        hpiNumber: true,
        speciality: true,
        phone: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, role, department, speciality, phone } = body;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (role !== undefined) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (speciality !== undefined) updateData.speciality = speciality;
    if (phone !== undefined) updateData.phone = phone;

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        hpiNumber: true,
        speciality: true,
        phone: true,
        createdAt: true,
      },
    });

    await createAuditLog({
      action: "UPDATE",
      entity: "User",
      entityId: id,
      severity: "info",
      details: { name: existing.name, ...updateData },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating staff:", error);
    return NextResponse.json(
      { error: "Failed to update staff" },
      { status: 500 }
    );
  }
}
