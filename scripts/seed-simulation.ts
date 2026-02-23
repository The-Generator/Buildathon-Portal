/**
 * Seed simulation data for end-to-end testing.
 *
 * Creates: 50 solos, 10 full teams (5 members each), 8 partial teams (2-4),
 *          15 spectators, 10 walk-ins.
 *
 * Idempotent: deletes existing seed data (matched by email pattern) before inserting.
 *
 * Usage: npx tsx --env-file=.env.local scripts/seed-simulation.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run with: npx tsx --env-file=.env.local scripts/seed-simulation.ts"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Seed-data email domain (used for idempotent cleanup) ──────────────
const SEED_DOMAIN = "seed.buildathon.local";
const email = (slug: string) => `${slug}@${SEED_DOMAIN}`;

// ── Valid enum values (mirrors src/lib/constants.ts) ──────────────────
const SCHOOLS = [
  "Babson",
  "Olin",
  "Wellesley",
  "MIT",
  "Harvard",
  "Northeastern",
  "Brandeis",
] as const;
const YEARS = [
  "Freshman",
  "Sophomore",
  "Junior",
  "Senior",
  "Graduate Student",
] as const;
const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
  "UI/UX Designer",
  "Data Scientist / ML Engineer",
  "Project Manager",
  "Business / Strategy",
  "Pitch / Presenting",
  "Domain Expert (Health, Neuro, Wellness)",
] as const;
const SKILLS = [
  "React / Next.js",
  "Python",
  "Machine Learning",
  "UI/UX Design (Figma)",
  "Data Analysis",
  "Public Speaking / Pitching",
  "Business Strategy",
  "Marketing / Growth",
] as const;
const EXPERIENCE = [
  "Beginner (I've used ChatGPT or similar tools)",
  "Intermediate (I've used AI tools for projects)",
  "Advanced (I've built or modified AI models)",
  "Expert (I've developed custom AI solutions)",
] as const;

const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const pickN = <T>(arr: readonly T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};
const phone = () =>
  `555${String(Math.floor(Math.random() * 10_000_000)).padStart(7, "0")}`;

function makeParticipant(
  slug: string,
  name: string,
  type: "participant" | "spectator" | "walk_in",
  teamId: string | null
) {
  return {
    full_name: name,
    email: email(slug),
    phone: phone(),
    school: pick(SCHOOLS),
    year: pick(YEARS),
    primary_role: type === "spectator" ? "Business / Strategy" : pick(ROLES),
    specific_skills: type === "spectator" ? [] : pickN(SKILLS, 2),
    experience_level: pick(EXPERIENCE),
    participant_type: type,
    ai_tools: [],
    is_self_registered: type !== "walk_in",
    team_id: teamId,
    checked_in: false,
  };
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  console.log("Cleaning up previous seed data...");

  // Delete in dependency order: registration_groups -> participants -> teams
  const { data: existingParticipants, error: existingParticipantsError } = await supabase
    .from("participants")
    .select("id")
    .like("email", `%@${SEED_DOMAIN}`);
  if (existingParticipantsError) {
    throw new Error(`Fetch seed participants: ${existingParticipantsError.message}`);
  }

  const { data: seedTeams, error: seedTeamsError } = await supabase
    .from("teams")
    .select("id")
    .like("name", "Seed Team%");
  if (seedTeamsError) {
    throw new Error(`Fetch seed teams: ${seedTeamsError.message}`);
  }

  const ids = existingParticipants?.map((p: { id: string }) => p.id) ?? [];
  const teamIds = seedTeams?.map((t: { id: string }) => t.id) ?? [];

  if (ids.length > 0) {
    const { error } = await supabase
      .from("registration_groups")
      .delete()
      .in("registrant_id", ids);
    if (error) throw new Error(`Delete seed registration groups by registrant: ${error.message}`);
  }

  if (teamIds.length > 0) {
    const { error } = await supabase
      .from("registration_groups")
      .delete()
      .in("team_id", teamIds);
    if (error) throw new Error(`Delete seed registration groups by team: ${error.message}`);
  }

  if (ids.length > 0) {
    const { error: unlinkError } = await supabase
      .from("participants")
      .update({ team_id: null })
      .in("id", ids);
    if (unlinkError) throw new Error(`Unlink seed participants from teams: ${unlinkError.message}`);

    const { error } = await supabase.from("participants").delete().in("id", ids);
    if (error) throw new Error(`Delete seed participants: ${error.message}`);
  }

  if (teamIds.length > 0) {
    const { error } = await supabase.from("teams").delete().in("id", teamIds);
    if (error) throw new Error(`Delete seed teams: ${error.message}`);
  }

  console.log("Seeding teams...");

  // ── Full teams (10 teams x 5 members = 50 participants) ────────────
  const fullTeams: { id: string; name: string; invite_code: string }[] = [];
  for (let t = 1; t <= 10; t++) {
    const { data: team, error } = await supabase
      .from("teams")
      .insert({
        name: `Seed Team Full-${t}`,
        invite_code: `SEEDF${String(t).padStart(3, "0")}`,
        formation_type: "pre_formed",
        is_complete: true,
        is_locked: false,
        aggregate_roles: pickN(ROLES, 3),
        aggregate_skills: pickN(SKILLS, 4),
      })
      .select()
      .single();
    if (error) throw new Error(`Full team ${t}: ${error.message}`);
    fullTeams.push(team);
  }

  // ── Partial teams (8 teams, 2-4 members each) ──────────────────────
  const partialTeams: {
    id: string;
    name: string;
    invite_code: string;
    size: number;
  }[] = [];
  for (let t = 1; t <= 8; t++) {
    const size = 2 + (t % 3); // cycles 3, 4, 2
    const { data: team, error } = await supabase
      .from("teams")
      .insert({
        name: `Seed Team Partial-${t}`,
        invite_code: `SEEDP${String(t).padStart(3, "0")}`,
        formation_type: "pre_formed",
        is_complete: false,
        is_locked: false,
        aggregate_roles: pickN(ROLES, 2),
        aggregate_skills: pickN(SKILLS, 3),
      })
      .select()
      .single();
    if (error) throw new Error(`Partial team ${t}: ${error.message}`);
    partialTeams.push({ ...team, size });
  }

  console.log("Seeding participants...");

  // ── Full team members ──────────────────────────────────────────────
  const fullTeamRegistrants: { id: string; teamId: string; groupSize: number }[] = [];
  for (const team of fullTeams) {
    const idx = fullTeams.indexOf(team) + 1;
    for (let m = 1; m <= 5; m++) {
      const slug = `full-${idx}-member-${m}`;
      const { data: p, error } = await supabase
        .from("participants")
        .insert(
          makeParticipant(
            slug,
            `Full ${idx} Member ${m}`,
            "participant",
            team.id
          )
        )
        .select("id")
        .single();
      if (error) throw new Error(`Full member ${slug}: ${error.message}`);
      if (m === 1) {
        fullTeamRegistrants.push({ id: p.id, teamId: team.id, groupSize: 5 });
      }
    }
  }

  // Registration groups for full teams
  for (const reg of fullTeamRegistrants) {
    const { error } = await supabase.from("registration_groups").insert({
      registrant_id: reg.id,
      group_size: reg.groupSize,
      team_id: reg.teamId,
      tagged_team_skills: pickN(SKILLS, 3),
    });
    if (error) throw new Error(`Full-team registration group insert failed: ${error.message}`);
  }

  // ── Partial team members ───────────────────────────────────────────
  const partialRegistrants: { id: string; teamId: string; groupSize: number }[] = [];
  for (const team of partialTeams) {
    const idx = partialTeams.indexOf(team) + 1;
    for (let m = 1; m <= team.size; m++) {
      const slug = `partial-${idx}-member-${m}`;
      const { data: p, error } = await supabase
        .from("participants")
        .insert(
          makeParticipant(
            slug,
            `Partial ${idx} Member ${m}`,
            "participant",
            team.id
          )
        )
        .select("id")
        .single();
      if (error) throw new Error(`Partial member ${slug}: ${error.message}`);
      if (m === 1) {
        partialRegistrants.push({
          id: p.id,
          teamId: team.id,
          groupSize: team.size,
        });
      }
    }
  }

  // Registration groups for partial teams
  for (const reg of partialRegistrants) {
    const membersRequested = 5 - reg.groupSize;
    const { error } = await supabase.from("registration_groups").insert({
      registrant_id: reg.id,
      group_size: reg.groupSize,
      team_id: reg.teamId,
      tagged_team_skills: pickN(SKILLS, 3),
      members_requested: membersRequested > 0 ? membersRequested : null,
    });
    if (error) throw new Error(`Partial-team registration group insert failed: ${error.message}`);
  }

  // ── Solo participants (50) ─────────────────────────────────────────
  const soloRegistrants: { id: string }[] = [];
  for (let i = 1; i <= 50; i++) {
    const slug = `solo-${i}`;
    const { data: p, error } = await supabase
      .from("participants")
      .insert(makeParticipant(slug, `Solo Participant ${i}`, "participant", null))
      .select("id")
      .single();
    if (error) throw new Error(`Solo ${slug}: ${error.message}`);
    soloRegistrants.push(p);
  }

  // Registration groups for solos
  for (const reg of soloRegistrants) {
    const { error } = await supabase.from("registration_groups").insert({
      registrant_id: reg.id,
      group_size: 1,
      tagged_team_skills: pickN(SKILLS, 2),
    });
    if (error) throw new Error(`Solo registration group insert failed: ${error.message}`);
  }

  // ── Spectators (15) ────────────────────────────────────────────────
  for (let i = 1; i <= 15; i++) {
    const slug = `spectator-${i}`;
    const { error } = await supabase
      .from("participants")
      .insert(makeParticipant(slug, `Spectator ${i}`, "spectator", null));
    if (error) throw new Error(`Spectator ${slug}: ${error.message}`);
  }

  // ── Walk-ins (10) ──────────────────────────────────────────────────
  for (let i = 1; i <= 10; i++) {
    const slug = `walkin-${i}`;
    const { error } = await supabase
      .from("participants")
      .insert(makeParticipant(slug, `Walk-in ${i}`, "walk_in", null));
    if (error) throw new Error(`Walk-in ${slug}: ${error.message}`);
  }

  // ── Summary ────────────────────────────────────────────────────────
  const { count: totalParticipants } = await supabase
    .from("participants")
    .select("*", { count: "exact", head: true })
    .like("email", `%@${SEED_DOMAIN}`);

  const { count: totalTeams } = await supabase
    .from("teams")
    .select("*", { count: "exact", head: true })
    .like("name", "Seed Team%");

  const { count: totalGroups } = await supabase
    .from("registration_groups")
    .select("*", { count: "exact", head: true });

  console.log("\nSeed complete:");
  console.log(`  Participants: ${totalParticipants}`);
  console.log(`  Teams:        ${totalTeams}`);
  console.log(`  Reg groups:   ${totalGroups}`);
  console.log(
    "\nBreakdown: 50 full-team members, ~24 partial-team members, 50 solos, 15 spectators, 10 walk-ins"
  );
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
