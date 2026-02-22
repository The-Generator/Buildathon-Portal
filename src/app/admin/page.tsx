import { createAdminClient } from "@/lib/supabase/admin";
import { StatsOverview } from "@/components/admin/StatsOverview";
import { TrackReleaseToggle } from "@/components/admin/TrackReleaseToggle";

export const dynamic = "force-dynamic";

const CAPACITY = 500;

async function getStats() {
  const supabase = createAdminClient();

  // Fetch all participants
  const { data: participants, error: pError } = await supabase
    .from("participants")
    .select("school, school_other, checked_in, team_id");

  if (pError) {
    console.error("Failed to fetch participants:", pError);
    return null;
  }

  // Fetch all teams
  const { data: teams, error: tError } = await supabase
    .from("teams")
    .select("id, formation_type, is_complete");

  if (tError) {
    console.error("Failed to fetch teams:", tError);
    return null;
  }

  const allParticipants = participants ?? [];
  const allTeams = teams ?? [];

  // School breakdown
  const schoolBreakdown: Record<string, number> = {};
  for (const p of allParticipants) {
    const school =
      p.school === "Other" ? (p.school_other || "Other") : p.school;
    schoolBreakdown[school] = (schoolBreakdown[school] || 0) + 1;
  }

  // Formation type breakdown - based on team formation_type
  const formationBreakdown: Record<string, number> = {
    pre_formed: 0,
    algorithm_matched: 0,
    admin_assigned: 0,
  };
  for (const t of allTeams) {
    formationBreakdown[t.formation_type] =
      (formationBreakdown[t.formation_type] || 0) + 1;
  }

  const completeTeams = allTeams.filter((t) => t.is_complete).length;
  const incompleteTeams = allTeams.filter((t) => !t.is_complete).length;
  const totalCheckedIn = allParticipants.filter((p) => p.checked_in).length;

  return {
    totalParticipants: allParticipants.length,
    schoolBreakdown,
    formationBreakdown,
    totalTeams: allTeams.length,
    completeTeams,
    incompleteTeams,
    totalCheckedIn,
    capacity: CAPACITY,
  };
}

export default async function AdminOverviewPage() {
  const stats = await getStats();

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="text-sm text-gray-500 mt-1">
          Babson Generator Build-a-thon 2026 at a glance
        </p>
      </div>
      <StatsOverview stats={stats} />
      <div className="mt-6">
        <TrackReleaseToggle />
      </div>
    </div>
  );
}
