import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function getBackendBaseUrl() {
  return (
    process.env.AUTH_BACKEND_URL ??
    (process.env.NODE_ENV !== "production" ? "http://localhost:3001" : undefined)
  );
}

function clearNextAuthCookies(res: NextResponse) {
  const cookieNames = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
    "next-auth.callback-url",
    "__Secure-next-auth.callback-url",
  ];

  const secure = process.env.NODE_ENV === "production";

  const base = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    maxAge: 0,
    expires: new Date(0),
  };

  for (const name of cookieNames) {
    const isHostCookie = name.startsWith("__Host-");
    res.cookies.set(name, "", { ...base, secure: isHostCookie ? true : secure, path: "/" });
    if (!isHostCookie) {
      res.cookies.set(name, "", { ...base, secure, path: "/api/auth" });
    }
  }
}

function redirectToSignin(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/unete", req.url));
  clearNextAuthCookies(res);
  return res;
}

export default async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return redirectToSignin(req);
  }

  const isDev = process.env.NODE_ENV !== "production";
  const shouldDevReset =
    isDev && (process.env.AUTH_RESET_SESSIONS ?? "1") !== "0";

  if (!shouldDevReset) {
    return NextResponse.next();
  }

  const backendBaseUrl = getBackendBaseUrl();
  if (!backendBaseUrl) {
    return NextResponse.next();
  }

  const tokenUser = (token as unknown as { user?: { id?: string | number } }).user;
  const accessToken = (token as unknown as { accessToken?: string }).accessToken;
  const userId = Number(tokenUser?.id ?? token.sub);

  if (!accessToken || !Number.isFinite(userId)) {
    return redirectToSignin(req);
  }

  try {
    const res = await fetch(`${backendBaseUrl}/users/${userId}/courses/dashboard`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      // User deleted / token stale => reset session in dev.
      return redirectToSignin(req);
    }
  } catch {
    // If backend isn't reachable in dev, don't hard-block navigation.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/usuario/:path*", "/dashboard/:path*"],
};
