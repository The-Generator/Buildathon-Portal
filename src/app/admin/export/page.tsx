"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { Download, Users } from "lucide-react";
import type { Participant } from "@/types";

export default function ExportPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      const supabase = createClient();

      const { data: pData } = await supabase
        .from("participants")
        .select("*")
        .order("created_at", { ascending: true });

      const { data: tData } = await supabase
        .from("teams")
        .select("id, name");

      const teamMap = new Map(
        (tData ?? []).map((t) => [t.id, t.name])
      );

      setParticipants(pData ?? []);
      setTeams(teamMap);
      setLoading(false);
    };

    fetchPreview();
  }, []);

  const handleDownload = async () => {
    setDownloading(true);

    try {
      const token = document.cookie
        .split("; ")
        .find((c) => c.startsWith("admin_token="))
        ?.split("=")[1];

      if (!token) {
        alert("You must be logged in to export data.");
        setDownloading(false);
        return;
      }

      const response = await fetch("/api/admin/export", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.error || "Export failed.");
        setDownloading(false);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "buildathon-participants.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. Please try again.");
    }

    setDownloading(false);
  };

  const previewData = participants.slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-gray-400">Loading export data...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Export</h2>
          <p className="text-sm text-gray-500 mt-1">
            Download participant data as CSV
          </p>
        </div>
        <Button onClick={handleDownload} disabled={downloading}>
          <Download className="h-4 w-4 mr-2" />
          {downloading ? "Downloading..." : "Download CSV"}
        </Button>
      </div>

      <div className="mb-6">
        <StatCard
          label="Total Participants"
          value={participants.length}
          icon={<Users className="h-5 w-5" />}
          trend="Will be included in export"
          className="max-w-xs"
        />
      </div>

      {/* Preview table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-700">
            Preview (first 10 rows)
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  School
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Team
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Checked In
                </th>
              </tr>
            </thead>
            <tbody>
              {previewData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-gray-400"
                  >
                    No participants to export.
                  </td>
                </tr>
              ) : (
                previewData.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {p.full_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {p.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {p.school === "Other"
                        ? p.school_other || "Other"
                        : p.school}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {p.primary_role}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {p.team_id
                        ? teams.get(p.team_id) ?? "Unknown"
                        : "Unassigned"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {p.checked_in ? "Yes" : "No"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {participants.length > 10 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              ... and {participants.length - 10} more rows in the full export.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
