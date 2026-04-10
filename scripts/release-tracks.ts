/**
 * Flip the event_config.track_released flag to true (or false with --lock).
 *
 * Usage:
 *   npx tsx scripts/release-tracks.ts          # release tracks (default)
 *   npx tsx scripts/release-tracks.ts --lock   # re-lock tracks
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

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
const lock = process.argv.includes("--lock");

async function main() {
  const { data: existing, error: readError } = await supabase
    .from("event_config")
    .select("id, track_released")
    .single();

  if (readError) {
    console.error("Read failed:", readError.message);
    process.exit(1);
  }

  console.log(`Current state: track_released = ${existing.track_released}`);

  const next = !lock;
  if (existing.track_released === next) {
    console.log(`Already ${next ? "released" : "locked"}, nothing to do.`);
    return;
  }

  const { error: updateError } = await supabase
    .from("event_config")
    .update({ track_released: next, updated_at: new Date().toISOString() })
    .eq("id", existing.id);

  if (updateError) {
    console.error("Update failed:", updateError.message);
    process.exit(1);
  }

  console.log(`Tracks are now ${next ? "RELEASED (public)" : "LOCKED (hidden)"}`);
}

main();
