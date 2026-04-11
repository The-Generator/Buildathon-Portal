import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { TrackId } from "@/types";

const TOKEN_TTL_S = 24 * 60 * 60; // 24 hours
const COOKIE_NAME = "judge_token";

interface JudgePayload {
  judge_name: string;
  track: TrackId;
}

function getSecret() {
  const password = process.env.JUDGE_PASSWORD;
  if (!password) throw new Error("JUDGE_PASSWORD env var is not set");
  return new TextEncoder().encode(password);
}

/**
 * Create a signed JWT token for an authenticated judge.
 */
export async function createJudgeToken(payload: JudgePayload): Promise<string> {
  return await new SignJWT({ ...payload, role: "judge" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_S}s`)
    .sign(getSecret());
}

/**
 * Read the judge cookie and verify it. Returns the judge payload or null.
 */
export async function getJudgeFromCookie(): Promise<JudgePayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.judge_name !== "string" || typeof payload.track !== "string") {
      return null;
    }
    return {
      judge_name: payload.judge_name,
      track: payload.track as TrackId,
    };
  } catch {
    return null;
  }
}

/**
 * Verify the password matches the env var (constant-time comparison-ish).
 */
export function isValidJudgePassword(input: string): boolean {
  const expected = process.env.JUDGE_PASSWORD;
  if (!expected) return false;
  if (input.length !== expected.length) return false;
  let match = 0;
  for (let i = 0; i < input.length; i++) {
    match |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return match === 0;
}

export const JUDGE_COOKIE_NAME = COOKIE_NAME;
export const JUDGE_TOKEN_TTL_S = TOKEN_TTL_S;
