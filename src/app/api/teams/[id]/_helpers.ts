import { createAdminClient } from "@/lib/supabase/admin";

export async function dissolveEmptyTeam(
  supabase: ReturnType<typeof createAdminClient>,
  teamId: string,
  adminEmail: string
): Promise<{ success: boolean; error?: string }> {
  // Fetch team for audit log
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("name, is_locked")
    .eq("id", teamId)
    .single();

  if (teamError || !team) {
    return { success: false, error: "Team not found" };
  }

  if (team.is_locked) {
    return { success: false, error: "Cannot dissolve a locked team" };
  }

  // Write audit entry before deletion
  await supabase.from("admin_actions").insert({
    admin_email: adminEmail,
    action_type: "dissolved_team",
    team_id: teamId,
    details: {
      team_name: team.name,
      member_count: 0,
      reason: "last_member_removed",
    },
  });

  // Reset any remaining participants (defensive)
  await supabase
    .from("participants")
    .update({ team_id: null })
    .eq("team_id", teamId);

  // Nullify FK references
  await supabase
    .from("admin_actions")
    .update({ team_id: null })
    .eq("team_id", teamId);

  await supabase
    .from("team_audit_log")
    .delete()
    .eq("team_id", teamId);

  await supabase
    .from("registration_groups")
    .update({ team_id: null })
    .eq("team_id", teamId);

  // Delete the team
  const { error: deleteError } = await supabase
    .from("teams")
    .delete()
    .eq("id", teamId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  return { success: true };
}
