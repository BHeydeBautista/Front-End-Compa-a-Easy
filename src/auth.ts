/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const backendBaseUrl = (
  process.env.AUTH_BACKEND_URL ??
  (process.env.NODE_ENV !== "production" ? "http://localhost:3001" : undefined)
)?.replace(/\/+$/, "");

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

const BACKEND_AUTH_TIMEOUT_MS = 35_000;
// Google exchange can be slower due to cold starts on free hosting.
const BACKEND_GOOGLE_EXCHANGE_TIMEOUT_MS = 90_000;

type BackendLoginResponse = {
  token: string;
  user: {
    id: number | string;
    name: string;
    email: string;
    role?: string;
  };
};

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!backendBaseUrl) {
          console.error("[auth] AUTH_BACKEND_URL not configured");
          throw new Error("AUTH_BACKEND_URL_NOT_CONFIGURED");
        }

        const email = String(credentials?.email ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        let response: Response;
        try {
          response = await fetchWithTimeout(
            `${backendBaseUrl}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
              cache: "no-store",
            },
            BACKEND_AUTH_TIMEOUT_MS,
          );
        } catch (err) {
          console.error("[auth] Backend login request failed", err);
          throw new Error("AUTH_BACKEND_UNREACHABLE");
        }

        if (!response.ok) {
          // Best-effort error mapping for better UX.
          if (response.status === 401 || response.status === 400) {
            const raw = await response.text();
            try {
              const parsed = raw ? (JSON.parse(raw) as any) : null;
              const msg = String(parsed?.message ?? parsed?.error ?? "");
              if (msg.toLowerCase().includes("email not verified")) {
                throw new Error("EmailNotVerified");
              }
            } catch {
              if (raw.toLowerCase().includes("email not verified")) {
                throw new Error("EmailNotVerified");
              }
            }
          }

          return null;
        }

        const json = (await response.json()) as BackendLoginResponse;
        if (!json?.token || !json?.user) return null;

        return {
          id: String(json.user.id),
          name: json.user.name,
          email: json.user.email,
          role: json.user.role,
          accessToken: json.token,
        } as any;
      },
    }),
    ...(() => {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      if (!clientId || !clientSecret) return [];
      return [
        GoogleProvider({
          clientId,
          clientSecret,
        }),
      ];
    })(),
  ],
  pages: {
    signIn: "/unete",
    error: "/unete",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      if (!backendBaseUrl) {
        console.error("[auth] AUTH_BACKEND_URL not configured for google sign-in");
        return "/unete?error=GoogleBackendNotConfigured";
      }

      const idToken = (account as any)?.id_token;
      if (typeof idToken !== "string" || idToken.length === 0) {
        return "/unete?error=GoogleNoIdToken";
      }

      try {
        const response = await fetchWithTimeout(
          `${backendBaseUrl}/auth/google`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
            cache: "no-store",
          },
          BACKEND_GOOGLE_EXCHANGE_TIMEOUT_MS,
        );

        if (!response.ok) {
          console.error("[auth] Backend google exchange failed", response.status);
          return "/unete?error=GoogleExchangeFailed";
        }

        const json = (await response.json()) as BackendLoginResponse;
        if (!json?.token || !json?.user) {
          console.error("[auth] Backend google exchange returned invalid payload");
          return "/unete?error=GoogleExchangeInvalid";
        }

        (user as any).id = String(json.user.id);
        (user as any).name = json.user.name;
        (user as any).email = json.user.email;
        (user as any).role = json.user.role;
        (user as any).accessToken = json.token;

        return true;
      } catch (err) {
        console.error("[auth] Backend google exchange request failed", err);
        return "/unete?error=GoogleExchangeError";
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.user = {
          id: (user as any).id,
          name: (user as any).name,
          email: (user as any).email,
          role: (user as any).role,
        };
        token.accessToken = (user as any).accessToken;
      }

      return token;
    },
    async session({ session, token }) {
      (session as any).user = (token as any).user ?? session.user;
      (session as any).accessToken = (token as any).accessToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
