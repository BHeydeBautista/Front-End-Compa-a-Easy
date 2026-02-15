import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const EXPIRED_DATE = "Thu, 01 Jan 1970 00:00:00 GMT";

function appendDeleteCookie(
  res: NextResponse,
  name: string,
  options: {
    path: string;
    domain?: string;
    secure?: boolean;
  },
) {
  const parts: string[] = [`${name}=`];
  parts.push(`Path=${options.path}`);
  parts.push(`Expires=${EXPIRED_DATE}`);
  parts.push("Max-Age=0");
  parts.push("HttpOnly");
  parts.push("SameSite=Lax");
  if (options.secure) parts.push("Secure");
  if (options.domain) parts.push(`Domain=${options.domain}`);
  res.headers.append("Set-Cookie", parts.join("; "));
}

function isIpHost(hostname: string) {
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) return true;
  if (hostname.includes(":")) return true;
  return false;
}

function clearNextAuthCookies(req: NextRequest, res: NextResponse) {
  const isSecureRequest =
    req.nextUrl.protocol === "https:" ||
    req.headers.get("x-forwarded-proto") === "https";

  const hostname = req.nextUrl.hostname;
  const domains = new Set<string | undefined>([undefined]);

  if (hostname === "localhost") {
    domains.add("localhost");
  } else if (hostname && !isIpHost(hostname)) {
    domains.add(hostname);
    domains.add(`.${hostname}`);

    const parts = hostname.split(".").filter(Boolean);
    if (parts.length > 2) {
      const parent = parts.slice(-2).join(".");
      domains.add(parent);
      domains.add(`.${parent}`);
    }
  }

  const paths = [
    "/",
    "/api",
    "/api/auth",
    "/api/auth/",
    "/dashboard",
    "/dashboard/admin",
    "/usuario",
  ];

  const namesToClear = new Set<string>([
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "__Host-next-auth.session-token",
    "next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
    "next-auth.callback-url",
    "__Secure-next-auth.callback-url",
    "next-auth.pkce.code_verifier",
    "next-auth.state",
    "next-auth.nonce",
    "next-auth.error",
  ]);

  // Chunked cookies for large JWTs.
  for (let i = 0; i < 50; i += 1) {
    namesToClear.add(`next-auth.session-token.${i}`);
    namesToClear.add(`__Secure-next-auth.session-token.${i}`);
    namesToClear.add(`__Host-next-auth.session-token.${i}`);
  }

  // Also clear any next-auth cookie we see.
  for (const { name } of req.cookies.getAll()) {
    if (
      name === "next-auth.session-token" ||
      name === "__Secure-next-auth.session-token" ||
      name === "__Host-next-auth.session-token" ||
      name === "next-auth.csrf-token" ||
      name === "__Host-next-auth.csrf-token" ||
      name === "next-auth.callback-url" ||
      name === "__Secure-next-auth.callback-url" ||
      name.startsWith("next-auth.") ||
      name.startsWith("__Secure-next-auth.") ||
      name.startsWith("__Host-next-auth.")
    ) {
      namesToClear.add(name);
    }
  }

  for (const name of namesToClear) {
    for (const domain of domains) {
      for (const path of paths) {
        // __Host- cookies are always host-only and must be Path=/
        if (name.startsWith("__Host-") && (domain !== undefined || path !== "/")) continue;
        appendDeleteCookie(res, name, { domain, path, secure: isSecureRequest });
      }
    }
  }
}

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  clearNextAuthCookies(req, res);
  return res;
}
