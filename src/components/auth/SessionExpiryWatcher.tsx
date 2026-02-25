"use client";

import { useEffect, useMemo, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

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

async function clearSessionCookies() {
  try {
    await signOut({ redirect: false });
  } catch {
    // ignore
  }

  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      keepalive: true,
    });
  } catch {
    // ignore
  }
}

export function SessionExpiryWatcher() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const logoutInFlightRef = useRef(false);

  const accessToken = useMemo(() => {
    const raw = (session as unknown as { accessToken?: unknown } | null)?.accessToken;
    return typeof raw === "string" && raw.length > 0 ? raw : null;
  }, [session]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!accessToken) return;

    const expMs = tryGetJwtExpMs(accessToken);
    if (expMs === null) return;

    const doLogout = async () => {
      if (logoutInFlightRef.current) return;
      logoutInFlightRef.current = true;

      await clearSessionCookies();

      const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/usuario");
      if (isProtected) {
        router.replace("/unete");
        return;
      }

      router.refresh();
    };

    const now = Date.now();
    if (now >= expMs) {
      void doLogout();
      return;
    }

    const timeoutMs = Math.max(0, expMs - now + 250);
    const id = window.setTimeout(() => {
      void doLogout();
    }, timeoutMs);

    return () => {
      window.clearTimeout(id);
    };
  }, [accessToken, pathname, router, status]);

  return null;
}
