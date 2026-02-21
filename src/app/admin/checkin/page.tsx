"use client";

import { CheckinDashboard } from "@/components/admin/CheckinDashboard";

export default function CheckInPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Check-In</h2>
        <p className="text-sm text-gray-500 mt-1">
          Real-time event day check-in management
        </p>
      </div>

      <CheckinDashboard />
    </div>
  );
}
