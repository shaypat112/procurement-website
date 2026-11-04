import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import nextEnv from "@next/env";
import { PrismaClient } from "@prisma/client";

nextEnv.loadEnvConfig(process.cwd());
const prisma = new PrismaClient();
const base = process.env.VERIFY_BASE_URL || "http://localhost:3002";
const name = `Workflow verification ${randomUUID()}`;
const sku = `VERIFY-${randomUUID()}`;
let catalogId;
let fileKey;

const payload = Buffer.from(JSON.stringify({ id: "verification-user", username: "verification", name: "Workflow verifier", exp: Date.now() + 60_000 })).toString("base64url");
const signature = createHmac("sha256", process.env.AUTH_SECRET).update(payload).digest("base64url");
const cookie = `procurement_session=${payload}.${signature}`;

async function api(path, method = "GET", body) {
  const response = await fetch(`${base}${path}`, { method, headers: { Cookie: cookie, ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json();
  return { status: response.status, data };
}

try {
  let result = await api("/api/catalog", "POST", { name, sku, supplier: "Verification", unitCost: "0" });
  assert.equal(result.status, 201, JSON.stringify(result.data));
  catalogId = result.data.id;
  result = await api("/api/catalog", "POST", { name: name.toUpperCase(), sku: sku.toLowerCase() });
  assert.equal(result.status, 409, "Duplicate catalog item was accepted");
  result = await api("/api/orders", "POST", { catalogId, quantity: 1, subsystem: "Drive" });
  assert.equal(result.status, 201, JSON.stringify(result.data));
  const firstOrderId = result.data.id;
  result = await api("/api/orders", "POST", { catalogId, quantity: 2, subsystem: "Electrical" });
  assert.equal(result.data.duplicate, true, "Existing order warning was missing");
  assert.deepEqual(result.data.existing[0].requesters, ["Workflow verifier"]);
  result = await api("/api/orders", "POST", { catalogId, quantity: 2, subsystem: "Electrical", confirmDuplicate: true });
  assert.equal(result.data.stacked, true);
  assert.equal(result.data.quantity, 3);
  assert.equal(result.data.requests.length, 2);
  result = await api(`/api/orders/${firstOrderId}`, "PATCH", { status: "ORDERED" });
  assert.equal(result.status, 200, JSON.stringify(result.data));
  result = await api("/api/orders", "POST", { catalogId, quantity: 1, confirmDuplicate: true });
  assert.equal(result.status, 201, "New request incorrectly stacked onto ordered item");
  assert.notEqual(result.data.id, firstOrderId);
  result = await api(`/api/orders/${firstOrderId}`, "PATCH", { status: "DELIVERED" });
  assert.equal(result.status, 200, JSON.stringify(result.data));
  result = await api("/api/inventory");
  const stock = result.data.find(item => item.catalogId === catalogId);
  assert.equal(stock.quantity, 3, "Delivery did not add quantity to inventory");
  result = await api("/api/audits", "POST", { catalogId, quantity: 5, notes: "Physical count" });
  assert.equal(result.status, 201, JSON.stringify(result.data));
  result = await api("/api/inventory", "PATCH", { id: stock.id, details: "STEP file details", location: "Zone shelf" });
  assert.equal(result.status, 200, JSON.stringify(result.data));
  result = await api("/api/inventory");
  assert.equal(result.data.find(item => item.catalogId === catalogId).quantity, 5);
  assert.equal(result.data.find(item => item.catalogId === catalogId).details, "STEP file details");
  result = await api("/api/uploads/presign", "POST", { fileName: "test.step", contentType: "application/octet-stream" });
  assert.equal(result.status, 200, JSON.stringify(result.data));
  fileKey = result.data.key;
  const upload = await fetch(new URL(result.data.uploadUrl, base), { method: "PUT", headers: { Cookie: cookie }, body: "STEP verification content" });
  assert.equal(upload.status, 200, "Local file upload failed");
  result = await api("/api/inventory", "PATCH", { id: stock.id, details: "STEP file details", location: "Zone shelf", fileKey, fileName: "test.step" });
  assert.equal(result.status, 200);
  result = await api(`/api/uploads/presign?key=${encodeURIComponent(fileKey)}`);
  assert.equal(result.status, 200);
  const download = await fetch(new URL(result.data.downloadUrl, base), { headers: { Cookie: cookie } });
  assert.equal(await download.text(), "STEP verification content");
  console.log("Workflow verified: catalog, duplicate warning, stacking, new order after purchase, delivery, reinventory, item details, and file upload/download.");
} finally {
  if (catalogId) {
    await prisma.inventoryAudit.deleteMany({ where: { catalogId } });
    await prisma.inventoryItem.deleteMany({ where: { catalogId } });
    await prisma.orderRequest.deleteMany({ where: { order: { catalogId } } });
    await prisma.procurementOrder.deleteMany({ where: { catalogId } });
    await prisma.catalogItem.delete({ where: { id: catalogId } });
  }
  if (fileKey) await unlink(join(process.cwd(), ".data", "inventory", fileKey.slice("inventory/".length))).catch(() => {});
  await prisma.$disconnect();
}
