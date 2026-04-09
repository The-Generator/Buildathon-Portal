/**
 * One-off script to fix .edi email typos → .edu in the participants table.
 *
 * Usage:
 *   DRY_RUN=1 npx tsx scripts/fix-edi-emails.ts   # preview changes
 *   npx tsx scripts/fix-edi-emails.ts               # apply changes
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const isDryRun = process.env.DRY_RUN === "1";

async function main() {
  console.log(isDryRun ? "=== DRY RUN ===" : "=== APPLYING FIXES ===");

  const { data: participants, error } = await supabase
    .from("participants")
    .select("id, full_name, email")
    .ilike("email", "%.edi");

  if (error) {
    console.error("Query failed:", error.message);
    process.exit(1);
  }

  if (!participants || participants.length === 0) {
    console.log("No .edi emails found. Nothing to fix.");
    return;
  }

  console.log(`Found ${participants.length} participant(s) with .edi emails:\n`);

  for (const p of participants) {
    const fixedEmail = p.email.replace(/\.edi$/i, ".edu");
    console.log(`  ${p.full_name}: ${p.email} → ${fixedEmail}`);

    if (!isDryRun) {
      const { error: updateError } = await supabase
        .from("participants")
        .update({ email: fixedEmail })
        .eq("id", p.id);

      if (updateError) {
        console.error(`    FAILED: ${updateError.message}`);
      } else {
        console.log(`    Updated.`);
      }
    }
  }

  console.log(
    isDryRun
      ? `\nDry run complete. Run without DRY_RUN=1 to apply.`
      : `\nDone. Fixed ${participants.length} email(s).`
  );
}

main();
