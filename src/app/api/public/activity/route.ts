import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const today = new Date();
  const endDate = today.toISOString().slice(0, 10);
  const start = new Date(`${endDate}T00:00:00.000Z`);
  start.setUTCDate(start.getUTCDate() - 83);

  try {
    const [requests, legacyOrders] = await Promise.all([
      prisma.orderRequest.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true } }),
      prisma.procurementOrder.findMany({
        where: { orderedAt: { gte: start }, requests: { none: {} } },
        select: { orderedAt: true },
      }),
    ]);
    const data = Array.from({ length: 84 }, () => 0);
    for (const createdAt of [...requests.map((request: { createdAt: Date }) => request.createdAt), ...legacyOrders.map((order: { orderedAt: Date }) => order.orderedAt)]) {
      const index = Math.floor((createdAt.getTime() - start.getTime()) / 86_400_000);
      if (index >= 0 && index < data.length) data[index] += 1;
    }
    return NextResponse.json({ data, endDate }, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch {
    return NextResponse.json({ error: "Activity is temporarily unavailable." }, { status: 503 });
  }
}
