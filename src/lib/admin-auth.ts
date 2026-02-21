import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function verifyAdmin() {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const supabase = createAdminClient();

  const { data: admin, error } = await supabase
    .from("admins")
    .select("*")
    .eq("email", token)
    .single();

  if (error || !admin) {
    return null;
  }

  return admin;
}
