"use client";

import { useSyncExternalStore } from "react";
import { CheckinDashboard } from "@/components/admin/CheckinDashboard";
import { CheckinEmailSender } from "@/components/admin/CheckinEmailSender";

function subscribeNoop() {
  return () => {};
}

function getAdminToken() {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_token="))
      ?.split("=")[1] ?? null
  );
}

function getServerSnapshot() {
  return null;
}

export default function CheckInPage() {
  const adminToken = useSyncExternalStore(subscribeNoop, getAdminToken, getServerSnapshot);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Check-In</h2>
        <p className="text-sm text-gray-500 mt-1">
          Real-time event day check-in management
        </p>
      </div>

      {adminToken && (
        <div className="mb-6">
          <CheckinEmailSender adminToken={adminToken} />
        </div>
      )}

      <CheckinDashboard />
    </div>
  );
}
