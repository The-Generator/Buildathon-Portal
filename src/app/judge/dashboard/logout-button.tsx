"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function JudgeLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/judge/login", { method: "DELETE" });
    router.push("/judge");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      Sign out
    </Button>
  );
}
