/**
 * Exports all Bryant registrants to a CSV.
 *
 * Usage:
 *   npx tsx scripts/export-bryant-registrants.ts [output-path]
 *
 * Defaults output to ~/Downloads/bryant-registrants.csv.
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

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

const COLUMNS = [
  "full_name",
  "email",
  "phone",
  "school",
  "year",
  "primary_role",
  "experience_level",
  "participant_type",
  "specific_skills",
  "dietary_restrictions",
  "tshirt_size",
  "created_at",
] as const;

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return csvEscape(value.join("; "));
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function main() {
  const outputPath =
    process.argv[2] ?? path.join(os.homedir(), "Downloads", "bryant-registrants.csv");

  const { data, error } = await supabase
    .from("participants")
    .select(COLUMNS.join(","))
    .eq("school", "Bryant")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Query failed:", error.message);
    process.exit(1);
  }

  const rows = (data ?? []) as unknown as Array<Record<string, unknown>>;
  const header = COLUMNS.join(",");
  const body = rows
    .map((r) => COLUMNS.map((c) => csvEscape(r[c])).join(","))
    .join("\n");
  const csv = `${header}\n${body}\n`;

  fs.writeFileSync(outputPath, csv);
  console.log(`Wrote ${rows.length} Bryant registrants → ${outputPath}`);
}

main();
