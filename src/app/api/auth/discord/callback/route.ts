import { NextRequest, NextResponse } from "next/server";
import { sessionCookie, signSession, stateCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const appUrl = process.env.APP_URL;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!appUrl || !clientId || !clientSecret) return NextResponse.json({ error: "Discord sign-in is not configured." }, { status: 503 });
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  if (!state || !code || state !== request.cookies.get(stateCookie)?.value) return NextResponse.redirect(new URL("/login?error=invalid_state", appUrl));
  const redirectUri = new URL("/api/auth/discord/callback", appUrl).toString();
  const tokenResponse = await fetch("https://discord.com/api/v10/oauth2/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}` }, body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirectUri }), cache: "no-store" });
  if (!tokenResponse.ok) return NextResponse.redirect(new URL("/login?error=token_exchange", appUrl));
  const token = await tokenResponse.json() as { access_token?: string };
  if (!token.access_token) return NextResponse.redirect(new URL("/login?error=token_exchange", appUrl));
  const userResponse = await fetch("https://discord.com/api/v10/users/@me", { headers: { Authorization: `Bearer ${token.access_token}` }, cache: "no-store" });
  if (!userResponse.ok) return NextResponse.redirect(new URL("/login?error=user_profile", appUrl));
  const user = await userResponse.json() as { id: string; username: string; global_name?: string | null };
  const session = await signSession({ id: user.id, username: user.username, name: user.global_name || user.username });
  const response = NextResponse.redirect(new URL("/", appUrl));
  response.cookies.set(sessionCookie, session, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 7 * 24 * 60 * 60 });
  response.cookies.delete(stateCookie);
  return response;
}
