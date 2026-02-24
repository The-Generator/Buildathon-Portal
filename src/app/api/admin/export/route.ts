import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/admin-auth";

function escapeCSVField(field: string | null | undefined): string {
  if (field === null || field === undefined) return "";
  const str = String(field);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  try {
    // Verify admin auth
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Fetch all participants
    const { data: participants, error: participantsError } = await supabase
      .from("participants")
      .select("*")
      .order("created_at", { ascending: true });

    if (participantsError) {
      return NextResponse.json(
        { error: "Failed to fetch participants" },
        { status: 500 }
      );
    }

    // Fetch all teams for name lookup
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id, name");

    if (teamsError) {
      return NextResponse.json(
        { error: "Failed to fetch teams" },
        { status: 500 }
      );
    }

    const teamMap = new Map(
      (teams ?? []).map((t) => [t.id, t.name])
    );

    // Generate CSV
    const csvHeaders = [
      "Name",
      "Email",
      "Phone",
      "School",
      "Year",
      "T-Shirt Size",
      "Primary Role",
      "Experience Level",
      "Team Name",
      "Checked In",
      "Checked In At",
    ];

    const csvRows = (participants ?? []).map((p) => [
      escapeCSVField(p.full_name),
      escapeCSVField(p.email),
      escapeCSVField(p.phone),
      escapeCSVField(p.school === "Other" ? p.school_other || "Other" : p.school),
      escapeCSVField(p.year),
      escapeCSVField(p.tshirt_size),
      escapeCSVField(p.primary_role),
      escapeCSVField(p.experience_level),
      escapeCSVField(p.team_id ? teamMap.get(p.team_id) ?? "Unknown" : "Unassigned"),
      escapeCSVField(p.checked_in ? "Yes" : "No"),
      escapeCSVField(p.checked_in_at),
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="buildathon-participants.csv"',
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
