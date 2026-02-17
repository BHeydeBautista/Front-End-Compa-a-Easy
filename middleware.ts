import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

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

  if (!token) {
    const url = new URL("/unete", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/usuario/:path*", "/dashboard/:path*"],
};
