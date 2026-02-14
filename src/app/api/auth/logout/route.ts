import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function setDeleteCookie(
  res: NextResponse,
  name: string,
  options: {
    path: string;
    secure: boolean;
    domain?: string;
  },
) {
  res.cookies.set(name, "", {
    path: options.path,
    domain: options.domain,
    httpOnly: true,
    sameSite: "lax",
    secure: options.secure,
    maxAge: 0,
    expires: new Date(0),
  });
}

function clearCookie(
  res: NextResponse,
  name: string,
  options: { secure: boolean; allowApiAuthPath: boolean; domains: Array<string | undefined> },
) {
  for (const domain of options.domains) {
    // Always try to clear on '/'
    setDeleteCookie(res, name, { path: "/", secure: options.secure, domain });

    // Some NextAuth cookies can be scoped under '/api/auth'. Clearing both makes logout more reliable.
    if (options.allowApiAuthPath) {
      setDeleteCookie(res, name, { path: "/api/auth", secure: options.secure, domain });
    }
  }
}

function clearAuthCookies(req: NextRequest, res: NextResponse) {
  const secure =
    process.env.NODE_ENV === "production" || req.nextUrl.protocol === "https:";

  const hostname = req.nextUrl.hostname;
  const domains: Array<string | undefined> = [undefined];
  if (hostname && hostname !== "localhost") {
    domains.push(hostname);
  } else if (hostname === "localhost") {
    // Some setups explicitly set Domain=localhost. Clearing both host-only and domain cookies is safer.
    domains.push("localhost");
  }

  const namesToClear = new Set<string>();

  // Common NextAuth cookies (plus a few that can appear in OAuth flows)
  const commonNames = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
    "next-auth.callback-url",
    "__Secure-next-auth.callback-url",
    "next-auth.pkce.code_verifier",
    "next-auth.state",
    "next-auth.nonce",
    "next-auth.error",
  ];
  for (const n of commonNames) namesToClear.add(n);

  // Chunked session cookie variants (JWTs can exceed size and be split)
  for (let i = 0; i < 10; i += 1) {
    namesToClear.add(`next-auth.session-token.${i}`);
    namesToClear.add(`__Secure-next-auth.session-token.${i}`);
  }

  // Delete any NextAuth-related cookies we find (including chunked variants).
  for (const { name } of req.cookies.getAll()) {
    const isNextAuthCookie =
      name === "next-auth.session-token" ||
      name === "__Secure-next-auth.session-token" ||
      name === "next-auth.csrf-token" ||
      name === "__Host-next-auth.csrf-token" ||
      name === "next-auth.callback-url" ||
      name === "__Secure-next-auth.callback-url" ||
      name.startsWith("next-auth.") ||
      name.startsWith("__Secure-next-auth.") ||
      name.startsWith("__Host-next-auth.");

    if (!isNextAuthCookie) continue;

    namesToClear.add(name);
  }

  for (const name of namesToClear) {
    const isHostCookie = name.startsWith("__Host-");

    // '__Host-' cookies must be path='/' (and are always secure); don't try '/api/auth' path.
    clearCookie(res, name, {
      secure: isHostCookie ? true : secure,
      allowApiAuthPath: !isHostCookie,
      domains: isHostCookie ? [undefined] : domains,
    });
  }
}

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/", req.url));
  clearAuthCookies(req, res);
  return res;
}

export async function POST(req: NextRequest) {
  return GET(req);
}
