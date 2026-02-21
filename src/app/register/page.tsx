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
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Failed to fetch participant count:", error);
  }

  const participantCount = count ?? 0;

  if (participantCount >= EVENT_CONFIG.capacity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="text-5xl">&#128532;</div>
          <h1 className="text-3xl font-bold text-gray-900">
            Registration is Full
          </h1>
          <p className="text-gray-600">
            We have reached our capacity of {EVENT_CONFIG.capacity} participants
            for {EVENT_CONFIG.name}. Please check back later in case spots open
            up.
          </p>
          <a
            href="/"
            className="inline-block mt-4 px-6 py-3 rounded-lg bg-[#006241] text-white font-medium hover:bg-[#004d33] transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return <RegistrationWizard />;
}
