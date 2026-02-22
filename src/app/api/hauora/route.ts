import { NextResponse } from "next/server";
import { generateHauoraEquityData } from "@/lib/mock-data";

export async function GET() {
  const data = generateHauoraEquityData();
  return NextResponse.json(data);
}
