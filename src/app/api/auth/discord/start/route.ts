import { NextResponse } from "next/server";
import { stateCookie } from "@/lib/auth";

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const appUrl = process.env.APP_URL;
  if (!clientId || !appUrl || !process.env.DISCORD_CLIENT_SECRET || !process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) return NextResponse.redirect(new URL("/login?error=configuration", appUrl || "http://localhost:3000"));
  const state = crypto.randomUUID();
  const redirectUri = new URL("/api/auth/discord/callback", appUrl).toString();
  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "identify");
  url.searchParams.set("state", state);
  const response = NextResponse.redirect(url);
  response.cookies.set(stateCookie, state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
  return response;
}
