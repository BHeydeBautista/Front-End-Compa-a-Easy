import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

function base64UrlDecodeToString(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return atob(padded);
}

function tryGetJwtExpMs(jwt: string): number | null {
  const parts = jwt.split(".");
  if (parts.length < 2) return null;
  try {
    const json = base64UrlDecodeToString(parts[1] ?? "");
    const payload = JSON.parse(json) as { exp?: unknown };
    const exp = typeof payload.exp === "number" ? payload.exp : Number(payload.exp);
    if (!Number.isFinite(exp) || exp <= 0) return null;
    return exp * 1000;
  } catch {
    return null;
  }
}

export default async function middleware(req: NextRequest) {
  const isSecureRequest =
    req.nextUrl.protocol === "https:" ||
    req.headers.get("x-forwarded-proto") === "https";

  // Try both secure and non-secure cookie variants.
  // Depending on hosting/env (e.g. NEXTAUTH_URL inference), NextAuth might set
  // `next-auth.session-token` while middleware expects `__Secure-next-auth.session-token`.
  const token =
    (await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: isSecureRequest,
    })) ??
    (await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: !isSecureRequest,
    }));

  const logoutToLogin = () =>
    NextResponse.redirect(new URL("/api/auth/logout?next=/unete", req.url));

  if (!token) return logoutToLogin();

  const accessToken = (token as { accessToken?: unknown })?.accessToken;
  if (typeof accessToken !== "string" || accessToken.length === 0) return logoutToLogin();

  const expMs = tryGetJwtExpMs(accessToken);
  if (expMs !== null && Date.now() >= expMs) return logoutToLogin();

  return NextResponse.next();
}

export const config = {
  matcher: ["/usuario/:path*", "/dashboard/:path*"],
};
