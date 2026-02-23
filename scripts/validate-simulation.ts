/**
 * Validate data integrity invariants across the database.
 *
 * Checks: participant field validity, team member counts, registration group
 * consistency, foreign key integrity, and no duplicate emails.
 *
 * Exits non-zero on any failure.
 *
 * Usage: npx tsx --env-file=.env.local scripts/validate-simulation.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run with: npx tsx --env-file=.env.local scripts/validate-simulation.ts"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const VALID_PARTICIPANT_TYPES = ["participant", "spectator", "walk_in"];
const VALID_FORMATION_TYPES = [
  "pre_formed",
  "algorithm_matched",
  "admin_assigned",
];
const MAX_TEAM_SIZE = 5;

let failures = 0;

function pass(label: string) {
  console.log(`  PASS  ${label}`);
}

function fail(label: string, detail: string) {
  console.error(`  FAIL  ${label}: ${detail}`);
  failures++;
}

async function main() {
  console.log("Running data integrity checks...\n");

  // ── 1. Fetch all data ──────────────────────────────────────────────
  const { data: participants, error: pErr } = await supabase
    .from("participants")
    .select("*");
  if (pErr) throw new Error(`Fetch participants: ${pErr.message}`);

  const { data: teams, error: tErr } = await supabase
    .from("teams")
    .select("*");
  if (tErr) throw new Error(`Fetch teams: ${tErr.message}`);

  const { data: groups, error: gErr } = await supabase
    .from("registration_groups")
    .select("*");
  if (gErr) throw new Error(`Fetch registration_groups: ${gErr.message}`);

  const teamIds = new Set(teams.map((t: { id: string }) => t.id));
  const participantIds = new Set(
    participants.map((p: { id: string }) => p.id)
  );

  // ── 2. No duplicate emails ─────────────────────────────────────────
  const emails = participants.map((p: { email: string }) => p.email);
  const dupes = emails.filter(
    (e: string, i: number) => emails.indexOf(e) !== i
  );
  if (dupes.length > 0) {
    fail("No duplicate emails", `${dupes.length} duplicates: ${dupes.slice(0, 5).join(", ")}`);
  } else {
    pass("No duplicate emails");
  }

  // ── 3. Valid participant_type ───────────────────────────────────────
  const badTypes = participants.filter(
    (p: { participant_type: string }) =>
      !VALID_PARTICIPANT_TYPES.includes(p.participant_type)
  );
  if (badTypes.length > 0) {
    fail(
      "Valid participant_type",
      `${badTypes.length} invalid: ${badTypes.map((p: { email: string; participant_type: string }) => `${p.email}=${p.participant_type}`).slice(0, 5).join(", ")}`
    );
  } else {
    pass("Valid participant_type");
  }

  // ── 4. Required fields non-null ────────────────────────────────────
  const requiredFields = [
    "full_name",
    "email",
    "phone",
    "school",
    "year",
    "primary_role",
    "experience_level",
  ];
  let missingCount = 0;
  for (const p of participants) {
    for (const field of requiredFields) {
      if (
        !(p as Record<string, unknown>)[field] &&
        (p as Record<string, unknown>)[field] !== false
      ) {
        missingCount++;
        if (missingCount <= 3) {
          fail(
            "Required fields",
            `${(p as { email: string }).email} missing ${field}`
          );
        }
      }
    }
  }
  if (missingCount === 0) {
    pass("Required fields non-null");
  } else if (missingCount > 3) {
    fail("Required fields", `...and ${missingCount - 3} more`);
  }

  // ── 5. Team FK integrity ───────────────────────────────────────────
  const danglingTeamRefs = participants.filter(
    (p: { team_id: string | null }) => p.team_id && !teamIds.has(p.team_id)
  );
  if (danglingTeamRefs.length > 0) {
    fail(
      "Team FK integrity",
      `${danglingTeamRefs.length} participants reference non-existent teams`
    );
  } else {
    pass("Team FK integrity");
  }

  // ── 6. Team member counts <= MAX_TEAM_SIZE ─────────────────────────
  const teamMemberCounts = new Map<string, number>();
  for (const p of participants) {
    const tid = (p as { team_id: string | null }).team_id;
    if (tid) {
      teamMemberCounts.set(tid, (teamMemberCounts.get(tid) || 0) + 1);
    }
  }
  let oversizedTeams = 0;
  for (const [tid, count] of teamMemberCounts) {
    if (count > MAX_TEAM_SIZE) {
      oversizedTeams++;
      if (oversizedTeams <= 3) {
        fail("Team size <= 5", `Team ${tid} has ${count} members`);
      }
    }
  }
  if (oversizedTeams === 0) {
    pass("Team size <= 5");
  }

  // ── 7. Valid formation_type on teams ───────────────────────────────
  const badFormation = teams.filter(
    (t: { formation_type: string }) =>
      !VALID_FORMATION_TYPES.includes(t.formation_type)
  );
  if (badFormation.length > 0) {
    fail(
      "Valid formation_type",
      `${badFormation.length} invalid formation types`
    );
  } else {
    pass("Valid formation_type");
  }

  // ── 8. Registration group FK integrity ─────────────────────────────
  const badGroupRegistrant = groups.filter(
    (g: { registrant_id: string }) => !participantIds.has(g.registrant_id)
  );
  const badGroupTeam = groups.filter(
    (g: { team_id: string | null }) => g.team_id && !teamIds.has(g.team_id)
  );
  if (badGroupRegistrant.length > 0) {
    fail(
      "Registration group registrant FK",
      `${badGroupRegistrant.length} dangling registrant refs`
    );
  } else {
    pass("Registration group registrant FK");
  }
  if (badGroupTeam.length > 0) {
    fail(
      "Registration group team FK",
      `${badGroupTeam.length} dangling team refs`
    );
  } else {
    pass("Registration group team FK");
  }

  // ── 9. Spectators have no team ─────────────────────────────────────
  const spectatorsWithTeam = participants.filter(
    (p: { participant_type: string; team_id: string | null }) =>
      p.participant_type === "spectator" && p.team_id !== null
  );
  if (spectatorsWithTeam.length > 0) {
    fail(
      "Spectators have no team",
      `${spectatorsWithTeam.length} spectators assigned to teams`
    );
  } else {
    pass("Spectators have no team");
  }

  // ── 10. is_complete consistency ────────────────────────────────────
  for (const t of teams) {
    const team = t as { id: string; is_complete: boolean; name: string };
    const count = teamMemberCounts.get(team.id) || 0;
    if (team.is_complete && count < MAX_TEAM_SIZE) {
      fail(
        "is_complete consistency",
        `${team.name} marked complete but has ${count}/${MAX_TEAM_SIZE} members`
      );
    }
  }
  // Only log pass if none failed above
  const completeTeams = teams.filter(
    (t: { id: string; is_complete: boolean }) => t.is_complete
  );
  const badComplete = completeTeams.filter(
    (t: { id: string }) =>
      (teamMemberCounts.get(t.id) || 0) < MAX_TEAM_SIZE
  );
  if (badComplete.length === 0) {
    pass("is_complete consistency");
  }

  // ── 11. Unique invite codes ────────────────────────────────────────
  const codes = teams.map((t: { invite_code: string }) => t.invite_code);
  const dupeCodes = codes.filter(
    (c: string, i: number) => codes.indexOf(c) !== i
  );
  if (dupeCodes.length > 0) {
    fail("Unique invite codes", `${dupeCodes.length} duplicate codes`);
  } else {
    pass("Unique invite codes");
  }

  // ── Summary ────────────────────────────────────────────────────────
  console.log(
    `\nData summary: ${participants.length} participants, ${teams.length} teams, ${groups.length} registration groups`
  );

  if (failures > 0) {
    console.error(`\n${failures} check(s) failed.`);
    process.exit(1);
  } else {
    console.log("\nAll checks passed.");
  }
}

main().catch((err) => {
  console.error("Validation failed:", err);
  process.exit(1);
});
