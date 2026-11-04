import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
export async function GET() { return NextResponse.json(await prisma.catalogItem.findMany({ orderBy: { name: "asc" } })); }
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.name !== "string" || !body.name.trim()) return NextResponse.json({ error: "Item name is required." }, { status: 400 });
  if (body.unitCost && (!Number.isFinite(Number(body.unitCost)) || Number(body.unitCost) < 0)) return NextResponse.json({ error: "Unit cost must be a nonnegative number." }, { status: 400 });
  try { const item = await prisma.catalogItem.create({ data: { name: body.name.trim(), sku: body.sku?.trim() || null, category: body.category?.trim() || null, description: body.description?.trim() || null, supplier: body.supplier?.trim() || null, unitCost: body.unitCost ? Number(body.unitCost) : null, url: body.url?.trim() || null } }); return NextResponse.json(item, { status: 201 }); }
  catch (error) { if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "That SKU is already in the catalog." }, { status: 409 }); return NextResponse.json({ error: "Could not save the catalog item." }, { status: 500 }); }
}
