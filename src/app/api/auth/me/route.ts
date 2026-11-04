import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookie, verifySession } from "@/lib/auth";

export async function GET() {
  const session = await verifySession((await cookies()).get(sessionCookie)?.value);
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  return NextResponse.json({ id: session.id, username: session.username, name: session.name });
}
