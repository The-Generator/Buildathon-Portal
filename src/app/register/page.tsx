import { createAdminClient } from "@/lib/supabase/admin";
import { RegistrationWizard } from "./registration-wizard";
import { EVENT_CONFIG, REGISTRATION_CLOSED } from "@/lib/constants";

export const metadata = {
  title: `Register | ${EVENT_CONFIG.shortName}`,
  description: `Register for the ${EVENT_CONFIG.name}`,
};

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  if (REGISTRATION_CLOSED) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Registration is closed
          </h1>
          <p className="text-gray-600">
            Registration for the {EVENT_CONFIG.name} is now closed. We can&apos;t
            accept any new signups.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            If you&apos;re already registered, check your email for event details.
          </p>
        </div>
      </div>
    );
  }

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
