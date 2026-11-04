import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    return NextResponse.json(await prisma.catalogItem.findMany({ orderBy: { name: "asc" } }));
  } catch {
    return NextResponse.json({ error: "Catalog is unavailable. Check the database connection." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  const sku = typeof body?.sku === "string" ? body.sku.trim().replace(/\s+/g, " ").toUpperCase() : "";
  if (!name) return NextResponse.json({ error: "Item name is required." }, { status: 400 });
  if (name.length > 160) return NextResponse.json({ error: "Item name must be 160 characters or less." }, { status: 400 });
  if (body.unitCost !== "" && body.unitCost != null && (!Number.isFinite(Number(body.unitCost)) || Number(body.unitCost) < 0)) return NextResponse.json({ error: "Unit cost must be a nonnegative number." }, { status: 400 });
  try {
    const item = await prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(907154)`;
      const existing = await tx.catalogItem.findFirst({ where: { OR: [
        { name: { equals: name, mode: "insensitive" } },
        ...(sku ? [{ sku: { equals: sku, mode: "insensitive" as const } }] : []),
      ] } });
      if (existing) return null;
      return tx.catalogItem.create({ data: {
        name, sku: sku || null,
        category: body.category?.trim() || null,
        description: body.description?.trim() || null,
        supplier: body.supplier?.trim() || null,
        unitCost: body.unitCost === "" || body.unitCost == null ? null : Number(body.unitCost),
        url: body.url?.trim() || null,
      } });
    });
    return item ? NextResponse.json(item, { status: 201 }) : NextResponse.json({ error: "This item name or part number is already in the catalog. Use the existing item." }, { status: 409 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "That part number is already in the catalog." }, { status: 409 });
    return NextResponse.json({ error: "Could not save the catalog item. Check the database connection." }, { status: 503 });
  }
}
