import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { sessionCookie, verifySession } from "@/lib/auth";
export async function GET() { return NextResponse.json(await prisma.inventoryAudit.findMany({ include: { catalog: true }, orderBy: { checkedAt: "desc" }, take: 100 })); }
export async function POST(req: Request) {
  const session = await verifySession((await cookies()).get(sessionCookie)?.value);
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  const { catalogId, quantity, notes } = body;
  if (typeof catalogId !== "string" || !catalogId || quantity == null || quantity === "" || !Number.isSafeInteger(Number(quantity)) || Number(quantity) < 0) return NextResponse.json({ error: "Select an item and use a valid count." }, { status: 400 });
  if (!await prisma.catalogItem.findUnique({ where: { id: catalogId }, select: { id: true } })) return NextResponse.json({ error: "Catalog item not found." }, { status: 404 });
  const audit = await prisma.$transaction(async tx => {
    const row = await tx.inventoryAudit.create({ data: { catalogId, quantity: Number(quantity), checkedBy: session.name, notes: notes || null } });
    await tx.inventoryItem.upsert({ where: { catalogId }, create: { catalogId, quantity: Number(quantity), checkedAt: new Date() }, update: { quantity: Number(quantity), checkedAt: new Date() } });
    return row;
  });
  return NextResponse.json(audit, { status: 201 });
}
