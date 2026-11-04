import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.fileName !== "string" || !body.fileName.trim()) return NextResponse.json({ error: "File name is required." }, { status: 400 });
  const { fileName, contentType } = body; const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket || !process.env.AWS_REGION) return NextResponse.json({ error: "S3 is not configured. Add AWS_REGION and AWS_S3_BUCKET." }, { status: 503 });
  const safeName = String(fileName || "file").replace(/[^a-zA-Z0-9._-]/g, "_"); const key = `inventory/${crypto.randomUUID()}-${safeName}`;
  const client = new S3Client({ region: process.env.AWS_REGION });
  const uploadUrl = await getSignedUrl(client, new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType || "application/octet-stream" }), { expiresIn: 300 });
  return NextResponse.json({ uploadUrl, key });
}
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  if (!key || !key.startsWith("inventory/")) return NextResponse.json({ error: "Invalid file key." }, { status: 400 });
  const item = await prisma.inventoryItem.findFirst({ where: { fileKey: key }, select: { id: true } });
  if (!item) return NextResponse.json({ error: "File not found." }, { status: 404 });
  if (!process.env.AWS_S3_BUCKET || !process.env.AWS_REGION) return NextResponse.json({ error: "S3 is not configured." }, { status: 503 });
  const url = await getSignedUrl(new S3Client({ region: process.env.AWS_REGION }), new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }), { expiresIn: 300 });
  return NextResponse.json({ downloadUrl: url });
}
