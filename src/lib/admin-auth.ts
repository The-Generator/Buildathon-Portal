import { headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const TOKEN_TTL_S = 24 * 60 * 60; // 24 hours

/**
 * Derive the signing key from ADMIN_PASSWORD.
 * Uses the password itself as the HMAC secret so no extra env var is needed.
 */
function getSecret() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD env var is not set");
  return new TextEncoder().encode(password);
}

/**
 * Create a signed JWT token for an authenticated admin.
 */
export async function createToken(): Promise<string> {
  const token = await new SignJWT({ role: "super_admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_S}s`)
    .sign(getSecret());

  return token;
}

/**
 * Verify a JWT token. Returns true if valid and not expired.
 */
export async function isTokenValid(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

/**
 * Verify the admin from the Authorization header.
 * Returns a synthetic admin record or null if unauthorized.
 */
export async function verifyAdmin() {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  if (!(await isTokenValid(token))) {
    return null;
  }

  return {
    id: "shared-admin",
    email: "admin",
    name: "Admin",
    role: "super_admin" as const,
    created_at: new Date().toISOString(),
  };
}
