import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/admin-auth";
import { runMatching } from "@/lib/matching/algorithm";
import { serializeMatchOutput } from "@/lib/matching/types";
import type { MatchInput } from "@/lib/matching/types";
import type { Participant, RegistrationGroup } from "@/types";

export async function POST() {
  try {
    // Verify admin auth
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Fetch all participants whose teams are incomplete and unlocked
    const { data: incompleteTeams, error: teamsError } = await supabase
      .from("teams")
      .select("id")
      .eq("is_complete", false)
      .eq("is_locked", false);

    if (teamsError) {
      return NextResponse.json(
        { error: "Failed to fetch teams" },
        { status: 500 }
      );
    }

    const incompleteTeamIds = (incompleteTeams ?? []).map((t) => t.id);

    // Fetch participants on incomplete/unlocked teams
    let unmatchedParticipants: Participant[] = [];
    if (incompleteTeamIds.length > 0) {
      const { data: participants, error: participantsError } = await supabase
        .from("participants")
        .select("*")
        .in("team_id", incompleteTeamIds);

      if (participantsError) {
        return NextResponse.json(
          { error: "Failed to fetch participants" },
          { status: 500 }
        );
      }

      unmatchedParticipants = (participants ?? []) as Participant[];
    }

    // Also fetch participants with no team assignment
    const { data: noTeamParticipants, error: noTeamError } = await supabase
      .from("participants")
      .select("*")
      .is("team_id", null);

    if (noTeamError) {
      return NextResponse.json(
        { error: "Failed to fetch unassigned participants" },
        { status: 500 }
      );
    }

    unmatchedParticipants = [
      ...unmatchedParticipants,
      ...((noTeamParticipants ?? []) as Participant[]),
    ];

    // Fetch registration groups for context
    const { data: groups, error: groupsError } = await supabase
      .from("registration_groups")
      .select("*");

    if (groupsError) {
      return NextResponse.json(
        { error: "Failed to fetch registration groups" },
        { status: 500 }
      );
    }

    const registrationGroups = (groups ?? []) as RegistrationGroup[];

    // Build a lookup: registrant_id -> registration group
    const groupByRegistrant = new Map<string, RegistrationGroup>();
    for (const g of registrationGroups) {
      groupByRegistrant.set(g.registrant_id, g);
    }

    // Also build a lookup: group_id -> all participant IDs in that group
    // A registration group contains the registrant + their teammates.
    // We need to figure out which participants belong to which group.
    // The registrant created the group; their teammates are linked via team_id or
    // by being registered by the same registrant.
    const groupByParticipant = new Map<string, RegistrationGroup>();

    for (const p of unmatchedParticipants) {
      // Check if this participant IS a registrant with a group
      const asRegistrant = groupByRegistrant.get(p.id);
      if (asRegistrant) {
        groupByParticipant.set(p.id, asRegistrant);
        continue;
      }

      // Check if registered_by matches a registrant who has a group
      if (p.registered_by) {
        const parentGroup = groupByRegistrant.get(p.registered_by);
        if (parentGroup) {
          groupByParticipant.set(p.id, parentGroup);
          continue;
        }
      }
    }

    // Convert to MatchInput format
    const matchInputs: MatchInput[] = unmatchedParticipants.map((p) => {
      const group = groupByParticipant.get(p.id);
      return {
        participantId: p.id,
        fullName: p.full_name,
        primaryRole: p.primary_role,
        specificSkills: p.specific_skills ?? [],
        experienceLevel: p.experience_level,
        school: p.school_other && p.school === "Other" ? p.school_other : p.school,
        aiTools: p.ai_tools ?? [],
        registrationGroupId: group ? group.id : null,
        groupSize: group ? group.group_size : 1,
      };
    });

    // Compute pool stats for the pre-match panel
    const soloCount = matchInputs.filter(
      (m) => m.registrationGroupId === null || m.groupSize <= 1
    ).length;

    const groupSizeCounts = new Map<number, number>();
    const seenGroups = new Set<string>();
    for (const m of matchInputs) {
      if (m.registrationGroupId && m.groupSize > 1 && !seenGroups.has(m.registrationGroupId)) {
        seenGroups.add(m.registrationGroupId);
        groupSizeCounts.set(
          m.groupSize,
          (groupSizeCounts.get(m.groupSize) ?? 0) + 1
        );
      }
    }

    const groupBreakdown = Array.from(groupSizeCounts.entries())
      .map(([size, count]) => ({ size, count }))
      .sort((a, b) => b.size - a.size);

    const total = matchInputs.length;
    const remainder = total % 5;

    const poolStats = {
      total,
      solos: soloCount,
      groups: groupBreakdown,
      divisibleBy5: remainder === 0,
      remainder,
    };

    // Run the matching algorithm
    const matchOutput = runMatching(matchInputs);
    const serialized = serializeMatchOutput(matchOutput);

    return NextResponse.json(
      {
        poolStats,
        matchResult: serialized,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Matching preview error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
