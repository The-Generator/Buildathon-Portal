import { headers } from "next/headers";

// In-memory token store. Tokens do not survive server restarts.
// Acceptable for a 2-day event admin tool.
const validTokens = new Set<string>();

export function addToken(token: string) {
  validTokens.add(token);
}

export function removeToken(token: string) {
  validTokens.delete(token);
}

export async function verifyAdmin() {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  if (!validTokens.has(token)) {
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
