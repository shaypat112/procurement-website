type Session = { id: string; username: string; name: string; exp: number };
export const sessionCookie = "procurement_session";
export const stateCookie = "procurement_oauth_state";

function encode(data: Uint8Array) { return Buffer.from(data).toString("base64url"); }
function decode(value: string) { return Buffer.from(value, "base64url"); }
async function signature(value: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must contain at least 32 characters.");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return encode(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))));
}

export async function signSession(user: { id: string; username: string; name: string }) {
  const payload = encode(new TextEncoder().encode(JSON.stringify({ ...user, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })));
  return `${payload}.${await signature(payload)}`;
}

export async function verifySession(token?: string): Promise<Session | null> {
  if (!token) return null;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  try {
    const expected = await signature(payload);
    const a = decode(mac), b = decode(expected);
    if (a.length !== b.length) return null;
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
    if (mismatch !== 0) return null;
    const session = JSON.parse(new TextDecoder().decode(decode(payload))) as Session;
    return session.exp > Date.now() && typeof session.id === "string" ? session : null;
  } catch { return null; }
}
