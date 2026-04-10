/**
 * Check (and optionally clean up) spectators incorrectly assigned to teams.
 *
 * Usage:
 *   npx tsx scripts/check-spectators-on-teams.ts          # dry run / report
 *   npx tsx scripts/check-spectators-on-teams.ts --apply  # unassign them
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load .env.local
const envPath = path.resolve(__dirname, "../.env.local");
for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const apply = process.argv.includes("--apply");

async function main() {
  const { data: spectators, error } = await supabase
    .from("participants")
    .select("id, full_name, email, school, team_id")
    .eq("participant_type", "spectator")
    .not("team_id", "is", null);

  if (error) {
    console.error("Query failed:", error.message);
    process.exit(1);
  }

  const found = spectators ?? [];
  console.log(`Found ${found.length} spectators currently assigned to teams.`);

  if (found.length === 0) return;

  for (const s of found) {
    console.log(`  - ${s.full_name} (${s.email}, ${s.school}) -> team ${s.team_id}`);
  }

  if (!apply) {
    console.log("\nDry run. Re-run with --apply to unassign them.");
    return;
  }

  const ids = found.map((s) => s.id);
  const { error: updateError } = await supabase
    .from("participants")
    .update({ team_id: null })
    .in("id", ids);

  if (updateError) {
    console.error("Update failed:", updateError.message);
    process.exit(1);
  }

  console.log(`\nUnassigned ${ids.length} spectators from teams.`);
}

main();
