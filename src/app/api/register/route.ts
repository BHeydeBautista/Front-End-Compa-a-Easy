import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(req: Request) {
  const backendBaseUrl = (
    process.env.AUTH_BACKEND_URL ??
    (process.env.NODE_ENV !== "production" ? "http://localhost:3001" : "")
  ).replace(/\/+$/, "");

  if (!backendBaseUrl) {
    return NextResponse.json(
      { error: "Backend not configured" },
      { status: 500 },
    );
  }

  const body = await req.json();

  let response: Response;
  try {
    response = await fetchWithTimeout(
      `${backendBaseUrl}/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      },
      35_000,
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Backend unreachable or timed out" },
      { status: 504 },
    );
  }

  const text = await response.text();
  return new NextResponse(text, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  });
}
