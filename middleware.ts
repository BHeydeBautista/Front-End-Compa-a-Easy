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

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    // Avoid relying on NEXTAUTH_URL inside Edge/Middleware to infer secure cookies.
    // In some hosting setups env injection differs between Node and Edge, which can
    // cause middleware to look for `next-auth.session-token` while NextAuth sets
    // `__Secure-next-auth.session-token`.
    secureCookie: isSecureRequest,
  });

  const logoutToLogin = () =>
    NextResponse.redirect(new URL("/api/auth/logout?next=/unete", req.url));

  if (!token) return logoutToLogin();

  const accessToken = (token as any)?.accessToken;
  if (typeof accessToken !== "string" || accessToken.length === 0) return logoutToLogin();

  const expMs = tryGetJwtExpMs(accessToken);
  if (expMs !== null && Date.now() >= expMs) return logoutToLogin();

  return NextResponse.next();
}

export const config = {
  matcher: ["/usuario/:path*", "/dashboard/:path*"],
};
