import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
const localDirectory = join(process.cwd(), ".data", "inventory");
const validKey = (key: string | null): key is string => Boolean(key && /^inventory\/[a-f0-9-]{36}-[a-zA-Z0-9._-]{1,160}$/.test(key));
const bucket = () => process.env.AWS_S3_BUCKET && process.env.AWS_S3_BUCKET !== "your-bucket-name" && process.env.AWS_REGION ? process.env.AWS_S3_BUCKET : null;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.fileName !== "string" || !body.fileName.trim()) return NextResponse.json({ error: "File name is required." }, { status: 400 });
  const { fileName, contentType } = body;
  const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 160); const key = `inventory/${crypto.randomUUID()}-${safeName}`;
  if (!bucket()) return NextResponse.json({ uploadUrl: `/api/uploads/presign?key=${encodeURIComponent(key)}`, key });
  const client = new S3Client({ region: process.env.AWS_REGION });
  const uploadUrl = await getSignedUrl(client, new PutObjectCommand({ Bucket: bucket()!, Key: key, ContentType: contentType || "application/octet-stream" }), { expiresIn: 300 });
  return NextResponse.json({ uploadUrl, key });
}
export async function PUT(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  if (!validKey(key) || bucket()) return NextResponse.json({ error: "Invalid local upload." }, { status: 400 });
  const data = Buffer.from(await req.arrayBuffer());
  if (data.length > 25 * 1024 * 1024) return NextResponse.json({ error: "Files must be 25 MB or smaller." }, { status: 413 });
  await mkdir(localDirectory, { recursive: true });
  await writeFile(join(localDirectory, key.slice("inventory/".length)), data, { flag: "wx" });
  return NextResponse.json({ key });
}
export async function GET(req: Request) {
  const url = new URL(req.url); const key = url.searchParams.get("key");
  if (!validKey(key)) return NextResponse.json({ error: "Invalid file key." }, { status: 400 });
  const item = await prisma.inventoryItem.findFirst({ where: { fileKey: key }, select: { id: true, fileName: true } });
  if (!item) return NextResponse.json({ error: "File not found." }, { status: 404 });
  if (!bucket()) {
    if (url.searchParams.get("download") !== "1") return NextResponse.json({ downloadUrl: `/api/uploads/presign?key=${encodeURIComponent(key)}&download=1` });
    try {
      const data = await readFile(join(localDirectory, key.slice("inventory/".length)));
      return new Response(data, { headers: { "Content-Type": "application/octet-stream", "Content-Disposition": `attachment; filename="${(item.fileName || "attachment").replace(/[^a-zA-Z0-9._-]/g, "_")}"` } });
    } catch { return NextResponse.json({ error: "File is missing from local storage." }, { status: 404 }); }
  }
  const downloadUrl = await getSignedUrl(new S3Client({ region: process.env.AWS_REGION }), new GetObjectCommand({ Bucket: bucket()!, Key: key }), { expiresIn: 300 });
  return NextResponse.json({ downloadUrl });
}
