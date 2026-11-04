import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { sessionCookie, verifySession } from "@/lib/auth";
export async function GET() { return NextResponse.json(await prisma.procurementOrder.findMany({ include: { catalog: true, requests: true }, orderBy: { orderedAt: "desc" } })); }
export async function POST(req: Request) {
  const session = await verifySession((await cookies()).get(sessionCookie)?.value);
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  const { catalogId, subsystem, quantity = 1, notes, confirmDuplicate = false } = body;
  if (typeof catalogId !== "string" || !catalogId) return NextResponse.json({ error: "Choose an item." }, { status: 400 });
  const count = Number(quantity);
  if (!Number.isSafeInteger(count) || count < 1) return NextResponse.json({ error: "Quantity must be a positive whole number." }, { status: 400 });
  if (!await prisma.catalogItem.findUnique({ where: { id: catalogId }, select: { id: true } })) return NextResponse.json({ error: "Catalog item not found." }, { status: 404 });
  const active = await prisma.procurementOrder.findMany({ where: { catalogId, status: { in: ["PENDING", "ORDERED"] } }, include: { catalog: true, requests: true }, orderBy: { orderedAt: "asc" } });
  if (active.length && !confirmDuplicate) return NextResponse.json({ duplicate: true, existing: active.map(o => ({ id: o.id, status: o.status, placedBy: o.placedBy, requesters: [...new Set(o.requests.map(r => r.requesterName))], subsystem: o.subsystem, quantity: o.quantity, orderedAt: o.orderedAt, item: o.catalog.name })) });
  if (confirmDuplicate) {
    const stack = active.find(o => o.status === "PENDING" && (o.subsystem || "") === (subsystem || ""));
    if (stack) {
      const updated = await prisma.$transaction(async tx => {
        const order = await tx.procurementOrder.update({ where: { id: stack.id }, data: { quantity: { increment: count }, notes: [stack.notes, notes].filter(Boolean).join("\n") || null }, include: { catalog: true, requests: true } });
        await tx.orderRequest.create({ data: { orderId: stack.id, requesterId: session.id, requesterName: session.name, quantity: count, subsystem: subsystem || null } });
        return order;
      });
      return NextResponse.json({ ...updated, stacked: true });
    }
  }
  const order = await prisma.procurementOrder.create({ data: { catalogId, placedBy: session.name, requesterId: session.id, subsystem: subsystem || null, quantity: count, notes: notes || null, requests: { create: { requesterId: session.id, requesterName: session.name, quantity: count, subsystem: subsystem || null } } }, include: { catalog: true, requests: true } });
  return NextResponse.json(order, { status: 201 });
}
