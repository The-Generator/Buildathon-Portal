import { CheckinForm } from "@/components/checkin/CheckinForm";

export const metadata = {
  title: "Check In | Generator Build-a-thon 2026",
};

export default function CheckinPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md mx-auto">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#006241] text-white font-bold text-xl mb-4">
            G
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Generator Build-a-thon 2026
          </h1>
          <p className="text-gray-500 mt-1">Babson College</p>
        </div>

        {/* Check In Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
            Check In
          </h2>
          <CheckinForm />
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          Having trouble? Find an organizer for help.
        </p>
      </div>
    </div>
  );
}
