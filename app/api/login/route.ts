import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  safeEqual,
} from "@/lib/auth";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

function clearAttempts(ip: string) {
  attempts.delete(ip);
}

export async function POST(request: NextRequest) {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) {
    console.error("SITE_PASSWORD is not set; refusing all logins.");
    return NextResponse.json({ error: "Login is not configured" }, { status: 500 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(WINDOW_MS / 1000) } }
    );
  }

  let password: unknown;
  try {
    ({ password } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (typeof password !== "string" || !safeEqual(password, expected)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  clearAttempts(ip);

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: await createSessionToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}
