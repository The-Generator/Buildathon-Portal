import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { addToken } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD env var is not set");
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Timing-safe comparison to prevent timing attacks
    const encoder = new TextEncoder();
    const a = encoder.encode(password);
    const b = encoder.encode(adminPassword);

    const isValid =
      a.byteLength === b.byteLength && crypto.timingSafeEqual(a, b);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    const token = crypto.randomUUID();
    addToken(token);

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
