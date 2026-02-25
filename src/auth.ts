/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

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

function isAbortError(err: unknown) {
  const anyErr = err as any;
  return (
    anyErr?.name === "AbortError" ||
    anyErr?.code === "ABORT_ERR" ||
    String(anyErr?.message ?? "").toLowerCase().includes("aborted")
  );
}

const BACKEND_AUTH_TIMEOUT_MS = 35_000;
// Google exchange can be slower due to cold starts on free hosting.
const BACKEND_GOOGLE_EXCHANGE_TIMEOUT_MS = 55_000;
// Microsoft exchange can be slower due to cold starts on free hosting.
const BACKEND_MICROSOFT_EXCHANGE_TIMEOUT_MS = 55_000;

const BACKEND_OAUTH_EXCHANGE_RETRY_TIMEOUT_MS = 55_000;

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

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
    ...(() => {
      const clientId = process.env.MICROSOFT_CLIENT_ID;
      const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
      // For personal accounts (hotmail/outlook), your app registration must allow "personal Microsoft accounts".
      const tenantId = process.env.MICROSOFT_TENANT_ID ?? "common";
      if (!clientId || !clientSecret) return [];
      return [
        AzureADProvider({
          clientId,
          clientSecret,
          tenantId,
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
      if (!account?.provider) return true;

      if (account.provider !== "google" && account.provider !== "azure-ad") {
        return true;
      }

      if (!backendBaseUrl) {
        console.error("[auth] AUTH_BACKEND_URL not configured for OAuth sign-in");
        return account.provider === "google"
          ? "/unete?error=GoogleBackendNotConfigured"
          : "/unete?error=MicrosoftBackendNotConfigured";
      }

      const idToken = (account as any)?.id_token;
      if (typeof idToken !== "string" || idToken.length === 0) {
        return account.provider === "google"
          ? "/unete?error=GoogleNoIdToken"
          : "/unete?error=MicrosoftNoIdToken";
      }

      const endpoint =
        account.provider === "google" ? "/auth/google" : "/auth/microsoft";
      const timeoutMs =
        account.provider === "google"
          ? BACKEND_GOOGLE_EXCHANGE_TIMEOUT_MS
          : BACKEND_MICROSOFT_EXCHANGE_TIMEOUT_MS;

      try {
        const makeRequest = (timeout: number) =>
          fetchWithTimeout(
            `${backendBaseUrl}${endpoint}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken }),
              cache: "no-store",
            },
            timeout,
          );

        const bestEffortWarmup = async () => {
          try {
            await fetchWithTimeout(
              `${backendBaseUrl}/auth/warmup`,
              { method: "GET", cache: "no-store" },
              10_000,
            );
          } catch {
            // ignore
          }
        };

        let response: Response;
        try {
          response = await makeRequest(timeoutMs);
        } catch (err) {
          // If the backend is waking up (cold start), the first attempt can time out.
          // A quick retry often succeeds once the instance is warm.
          if (isAbortError(err)) {
            console.warn(
              "[auth] Backend oauth exchange timed out; retrying once",
              account.provider,
            );
            await bestEffortWarmup();
            await sleep(750);
            response = await makeRequest(BACKEND_OAUTH_EXCHANGE_RETRY_TIMEOUT_MS);
          } else {
            throw err;
          }
        }

        if (!response.ok) {
          console.error("[auth] Backend oauth exchange failed", account.provider, response.status);
          return account.provider === "google"
            ? "/unete?error=GoogleExchangeFailed"
            : "/unete?error=MicrosoftExchangeFailed";
        }

        const json = (await response.json()) as BackendLoginResponse;
        if (!json?.token || !json?.user) {
          console.error("[auth] Backend oauth exchange returned invalid payload", account.provider);
          return account.provider === "google"
            ? "/unete?error=GoogleExchangeInvalid"
            : "/unete?error=MicrosoftExchangeInvalid";
        }

        (user as any).id = String(json.user.id);
        (user as any).name = json.user.name;
        (user as any).email = json.user.email;
        (user as any).role = json.user.role;
        (user as any).accessToken = json.token;

        return true;
      } catch (err) {
        console.error("[auth] Backend oauth exchange request failed", account.provider, err);
        return account.provider === "google"
          ? "/unete?error=GoogleExchangeError"
          : "/unete?error=MicrosoftExchangeError";
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
