import { NextResponse } from "next/server";

function backendBaseUrlFromEnv() {
  const raw =
    process.env.AUTH_BACKEND_URL ??
    (process.env.NODE_ENV !== "production" ? "http://localhost:3001" : undefined);

  return raw?.replace(/\/+$/, "");
}

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function GET() {
  const backendBaseUrl = backendBaseUrlFromEnv();
  if (!backendBaseUrl) {
    return NextResponse.json({ ok: true, warmed: false, reason: "not_configured" });
  }

  try {
    const res = await fetchWithTimeout(
      `${backendBaseUrl}/auth/warmup`,
      { method: "GET", cache: "no-store" },
      10_000,
    );

    return NextResponse.json({ ok: true, warmed: true, status: res.status });
  } catch (err) {
    // Best-effort warmup only; avoid surfacing errors to the user.
    let name: string | undefined;
    if (err instanceof Error) {
      name = err.name;
    } else if (typeof err === "object" && err && "name" in err) {
      const candidate = (err as { name?: unknown }).name;
      if (typeof candidate === "string") name = candidate;
    }

    return NextResponse.json({ ok: true, warmed: false, error: name ?? "warmup_failed" });
  }
}
