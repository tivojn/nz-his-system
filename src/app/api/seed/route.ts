import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/lib/seed-data";

export async function GET() {
  const count = await prisma.user.count();
  if (count > 0) {
    return NextResponse.json({ status: "already seeded", users: count });
  }

  try {
    const counts = await seedDatabase(prisma);
    return NextResponse.json({ status: "seeded", counts });
  } catch (e) {
    return NextResponse.json({ status: "seed failed", error: String(e) }, { status: 500 });
  }
}

export async function POST() {
  try {
    const counts = await seedDatabase(prisma);
    return NextResponse.json({ status: "re-seeded", counts });
  } catch (e) {
    return NextResponse.json({ status: "seed failed", error: String(e) }, { status: 500 });
  }
}
