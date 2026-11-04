import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() { return NextResponse.json(await prisma.inventoryItem.findMany({ include: { catalog: true }, orderBy: { addedAt: "desc" } })); }
export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.id !== "string" || !body.id) return NextResponse.json({ error: "Inventory item is required." }, { status: 400 });
  const { id, location, details, fileKey, fileName } = body;
  if (fileKey != null && (typeof fileKey !== "string" || !fileKey.startsWith("inventory/"))) return NextResponse.json({ error: "Invalid file key." }, { status: 400 });
  try { const item = await prisma.inventoryItem.update({ where: { id }, data: { location: location ?? null, details: details ?? null, fileKey: fileKey ?? null, fileName: fileName ?? null } }); return NextResponse.json(item); }
  catch { return NextResponse.json({ error: "Inventory item not found." }, { status: 404 }); }
}
