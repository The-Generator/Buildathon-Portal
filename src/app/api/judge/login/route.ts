import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createJudgeToken,
  isValidJudgePassword,
  JUDGE_COOKIE_NAME,
  JUDGE_TOKEN_TTL_S,
} from "@/lib/judge-auth";

const TRACK_VALUES = [
  "athletic_performance",
  "accessibility_solutions",
  "entrepreneurial_ai",
] as const;

const schema = z.object({
  judge_name: z.string().min(2, "Please enter your name"),
  track: z.enum(TRACK_VALUES),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (!isValidJudgePassword(parsed.data.password)) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const token = await createJudgeToken({
      judge_name: parsed.data.judge_name.trim(),
      track: parsed.data.track,
    });

    const res = NextResponse.json({ success: true });
    res.cookies.set(JUDGE_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: JUDGE_TOKEN_TTL_S,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(JUDGE_COOKIE_NAME);
  return res;
}
