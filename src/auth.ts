import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const backendBaseUrl = process.env.AUTH_BACKEND_URL;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

type BackendLoginResponse = {
  user?: {
    id?: string | number;
    name?: string;
    email?: string;
    image?: string;
    role?: string;
    rol?: string;
  };
  token?: string;
  accessToken?: string;
  refreshToken?: string;
};

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
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
        const user = json.user;
        const accessToken = json.accessToken ?? json.token;

        if (!user) return null;

        return {
          id: String(user.id ?? user.email ?? email),
          name: user.name ?? user.email ?? email,
          email: user.email ?? email,
          role: user.role ?? user.rol,
          accessToken,
          refreshToken: json.refreshToken,
        };
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
          image: (user as any).image,
          role: (user as any).role,
        };
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).user = (token as any).user ?? session.user;
      (session as any).accessToken = (token as any).accessToken;
      (session as any).refreshToken = (token as any).refreshToken;
      return session;
    },
  },
};
