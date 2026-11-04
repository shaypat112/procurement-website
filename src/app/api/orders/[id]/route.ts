import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const { status } = await req.json();
  if (!["ORDERED", "DELIVERED"].includes(status)) return NextResponse.json({ error: "Invalid next status." }, { status: 400 });
  try {
    const updated = await prisma.$transaction(async tx => {
      const initial = await tx.procurementOrder.findUnique({ where: { id } });
      if (!initial) return null;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${initial.catalogId}))`;
      const current = await tx.procurementOrder.findUnique({ where: { id } });
      if (!current) return null;
      if (current.status === status) return current;
      if (current.status !== "PENDING" && status === "ORDERED" || current.status !== "ORDERED" && status === "DELIVERED") throw new Error("INVALID_TRANSITION");
      const changed = await tx.procurementOrder.updateMany({ where: { id, status: current.status }, data: { status, deliveredAt: status === "DELIVERED" ? new Date() : null } });
      if (changed.count !== 1) throw new Error("CONCURRENT_UPDATE");
      const order = await tx.procurementOrder.findUniqueOrThrow({ where: { id }, include: { catalog: true } });
      if (status === "DELIVERED") await tx.inventoryItem.upsert({ where: { catalogId: order.catalogId }, create: { catalogId: order.catalogId, quantity: order.quantity }, update: { quantity: { increment: order.quantity } } });
      return order;
    });
    return updated ? NextResponse.json(updated) : NextResponse.json({ error: "Order not found." }, { status: 404 });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_TRANSITION") return NextResponse.json({ error: "Move orders from Pending to Ordered, then to Delivered." }, { status: 409 });
    if (error instanceof Error && error.message === "CONCURRENT_UPDATE") return NextResponse.json({ error: "This order changed. Refresh and try again." }, { status: 409 });
    return NextResponse.json({ error: "Could not update the order." }, { status: 500 });
  }
}
