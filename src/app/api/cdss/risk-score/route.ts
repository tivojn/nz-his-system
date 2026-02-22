import { NextRequest, NextResponse } from "next/server";
import { calculateNEWS2, calculateFallsRisk } from "@/lib/cdss";

export async function POST(req: NextRequest) {
  const { type, params } = await req.json();

  if (type === "news2") {
    const result = calculateNEWS2(params);
    return NextResponse.json(result);
  }

  if (type === "falls") {
    const result = calculateFallsRisk(params);
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Invalid type. Use 'news2' or 'falls'." }, { status: 400 });
}
