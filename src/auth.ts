/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
  ],
  pages: {
    signIn: "/unete",
  },
  callbacks: {
    async jwt({ token, user }) {
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
