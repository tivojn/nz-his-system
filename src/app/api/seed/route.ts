import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const count = await prisma.user.count();
  if (count > 0) {
    return NextResponse.json({ status: "already seeded", users: count });
  }

  // Auto-seed on first access
  const { execSync } = require("child_process");
  try {
    execSync("npx tsx prisma/seed.ts", { cwd: process.cwd() });
    return NextResponse.json({ status: "seeded" });
  } catch {
    return NextResponse.json({ status: "seed failed - run manually" }, { status: 500 });
  }
}
