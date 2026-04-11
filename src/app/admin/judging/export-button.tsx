"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function JudgingExportButton() {
  return (
    <a href="/api/admin/judging/export" download>
      <Button variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
    </a>
  );
}
