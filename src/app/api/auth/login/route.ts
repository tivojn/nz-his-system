import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const demoUsers = [
  { id: "1", email: "admin@nzhis.co.nz", name: "Dr. Sarah Mitchell", role: "Admin", department: "Administration" },
  { id: "2", email: "doctor@nzhis.co.nz", name: "Dr. James Henare", role: "Doctor", department: "General Medicine" },
  { id: "3", email: "nurse@nzhis.co.nz", name: "Aroha Williams", role: "Nurse", department: "Emergency" },
  { id: "4", email: "reception@nzhis.co.nz", name: "Mele Taufa", role: "Receptionist", department: "Front Desk" },
];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;

  if (password !== "demo123") {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const user = demoUsers.find((u) => u.email === email);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  // Set a simple session cookie with user data
  const sessionData = JSON.stringify(user);
  const encoded = Buffer.from(sessionData).toString("base64");

  const cookieStore = await cookies();
  cookieStore.set("nzhis-session", encoded, {
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return NextResponse.json({ ok: true, user });
}
