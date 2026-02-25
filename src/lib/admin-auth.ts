import { headers } from "next/headers";

// In-memory token store. Tokens do not survive server restarts.
// Acceptable for a 2-day event admin tool.
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const validTokens = new Map<string, number>();

export function addToken(token: string, ttlMs: number = TOKEN_TTL_MS) {
  validTokens.set(token, Date.now() + ttlMs);
}

export function removeToken(token: string) {
  validTokens.delete(token);
}

export function isTokenValid(token: string): boolean {
  const expiresAt = validTokens.get(token);
  if (!expiresAt) {
    return false;
  }

  if (Date.now() > expiresAt) {
    validTokens.delete(token);
    return false;
  }

  return true;
}

export async function verifyAdmin() {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  if (!isTokenValid(token)) {
    return null;
  }

  // Return a synthetic admin record so existing audit log writes
  // (which use admin.id, admin.name) continue to work.
  return {
    id: "shared-admin",
    email: "admin",
    name: "Admin",
    role: "super_admin" as const,
    created_at: new Date().toISOString(),
  };
}
