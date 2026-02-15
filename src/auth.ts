/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const backendBaseUrl =
  process.env.AUTH_BACKEND_URL ??
  (process.env.NODE_ENV !== "production" ? "http://localhost:3001" : undefined);

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
        if (!backendBaseUrl) return null;

        const email = String(credentials?.email ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const response = await fetch(`${backendBaseUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          cache: "no-store",
        });

        if (!response.ok) return null;

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
  },
  callbacks: {
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

      if (
        account?.provider === "google" &&
        typeof (account as any).id_token === "string" &&
        (account as any).id_token.length > 0
      ) {
        if (!backendBaseUrl) return token;

        try {
          const response = await fetch(`${backendBaseUrl}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: (account as any).id_token }),
            cache: "no-store",
          });

          if (response.ok) {
            const json = (await response.json()) as BackendLoginResponse;
            if (json?.token && json?.user) {
              token.user = {
                id: String(json.user.id),
                name: json.user.name,
                email: json.user.email,
                role: json.user.role,
              };
              token.accessToken = json.token;
            }
          }
        } catch {
          // ignore: keep the session without backend token
        }
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
