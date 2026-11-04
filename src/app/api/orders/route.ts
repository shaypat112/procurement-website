import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { sessionCookie, verifySession } from "@/lib/auth";
export async function GET() {
  try { return NextResponse.json(await prisma.procurementOrder.findMany({ include: { catalog: true, requests: true }, orderBy: { orderedAt: "desc" } })); }
  catch { return NextResponse.json({ error: "Order sheet is unavailable. Check the database connection." }, { status: 503 }); }
}
export async function POST(req: Request) {
  const session = await verifySession((await cookies()).get(sessionCookie)?.value);
  if (!session) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  const { catalogId, subsystem, quantity = 1, notes, confirmDuplicate = false } = body;
  if (typeof catalogId !== "string" || !catalogId) return NextResponse.json({ error: "Choose an item." }, { status: 400 });
  const count = Number(quantity);
  if (!Number.isSafeInteger(count) || count < 1) return NextResponse.json({ error: "Quantity must be a positive whole number." }, { status: 400 });
  try {
    return await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${catalogId}))`;
      const item = await tx.catalogItem.findUnique({ where: { id: catalogId }, select: { id: true } });
      if (!item) return NextResponse.json({ error: "Catalog item not found." }, { status: 404 });
      const active = await tx.procurementOrder.findMany({ where: { catalogId, status: { in: ["PENDING", "ORDERED"] } }, include: { catalog: true, requests: true }, orderBy: { orderedAt: "asc" } });
      if (active.length && !confirmDuplicate) return NextResponse.json({ duplicate: true, existing: active.map(o => ({ id: o.id, status: o.status, placedBy: o.placedBy, requesters: [...new Set(o.requests.map(r => r.requesterName))], subsystem: o.subsystem, quantity: o.quantity, orderedAt: o.orderedAt, item: o.catalog.name })) });
      const stack = active.find(o => o.status === "PENDING");
      if (stack) {
        await tx.orderRequest.create({ data: { orderId: stack.id, requesterId: session.id, requesterName: session.name, quantity: count, subsystem: subsystem || null } });
        const updated = await tx.procurementOrder.update({ where: { id: stack.id }, data: { quantity: { increment: count }, subsystem: stack.subsystem === (subsystem || null) ? stack.subsystem : "Multiple subsystems", notes: [stack.notes, notes].filter(Boolean).join("\n") || null }, include: { catalog: true, requests: true } });
        return NextResponse.json({ ...updated, stacked: true });
      }
      const order = await tx.procurementOrder.create({ data: { catalogId, placedBy: session.name, requesterId: session.id, subsystem: subsystem || null, quantity: count, notes: notes || null, requests: { create: { requesterId: session.id, requesterName: session.name, quantity: count, subsystem: subsystem || null } } }, include: { catalog: true, requests: true } });
      return NextResponse.json(order, { status: 201 });
    });
  } catch {
    return NextResponse.json({ error: "Could not save the order. Check the database connection." }, { status: 503 });
  }
}
