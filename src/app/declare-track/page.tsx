import { DeclareTrackForm } from "./declare-track-form";
import { EVENT_CONFIG } from "@/lib/constants";

export const metadata = {
  title: `Declare Your Track | ${EVENT_CONFIG.shortName}`,
};

export const dynamic = "force-dynamic";

export default function DeclareTrackPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Declare Your Team&apos;s Track
          </h1>
          <p className="mt-3 text-gray-600">
            Pick which competition track your team is competing in. Any team
            member can do this — it applies to your whole team.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <DeclareTrackForm />
        </div>
      </div>
    </div>
  );
}
