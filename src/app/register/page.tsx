import { createAdminClient } from "@/lib/supabase/admin";
import { RegistrationWizard } from "./registration-wizard";
import { EVENT_CONFIG } from "@/lib/constants";

export const metadata = {
  title: `Register | ${EVENT_CONFIG.shortName}`,
  description: `Register for the ${EVENT_CONFIG.name}`,
};

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from("participants")
    .select("*", { count: "exact", head: true })
    .neq("participant_type", "spectator");

  if (error) {
    console.error("Failed to fetch participant count:", error);
  }

  const participantCount = count ?? 0;
  const participantCapacityFull = participantCount >= EVENT_CONFIG.capacity;

  return <RegistrationWizard participantCapacityFull={participantCapacityFull} />;
}
