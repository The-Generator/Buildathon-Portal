import { createClient } from "@/lib/supabase/server";
import type { Participant } from "@/types";
import { ParticipantDirectory } from "./ParticipantDirectory";

export const metadata = {
  title: "Meet the Builders | Babson Generator Build-a-thon 2026",
  description:
    "Browse participants who have opted into the public directory for the Babson Generator Build-a-thon 2026.",
};

export default async function ParticipantsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("participants")
    .select(
      "id, full_name, school, school_other, year, primary_role, specific_skills, bio, linkedin_url, portfolio_url"
    )
    .eq("profile_visible", true)
    .neq("participant_type", "spectator")
    .order("full_name", { ascending: true });

  const participants: Pick<
    Participant,
    | "id"
    | "full_name"
    | "school"
    | "school_other"
    | "year"
    | "primary_role"
    | "specific_skills"
    | "bio"
    | "linkedin_url"
    | "portfolio_url"
  >[] = error ? [] : (data ?? []);

  return <ParticipantDirectory participants={participants} />;
}
