import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, email, password } = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.AUTH_BACKEND_URL ??
      (process.env.NODE_ENV !== "production"
        ? "http://localhost:3001"
        : undefined);
    if (!baseUrl) {
      return NextResponse.json(
        { message: "AUTH_BACKEND_URL is not configured" },
        { status: 500 }
      );
    }

    const res = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
      cache: "no-store",
    });

    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
