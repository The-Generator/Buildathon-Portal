import { redirect } from "next/navigation";
import { getJudgeFromCookie } from "@/lib/judge-auth";
import { JudgeLoginForm } from "./judge-login-form";
import { EVENT_CONFIG } from "@/lib/constants";

export const metadata = {
  title: `Judge Portal | ${EVENT_CONFIG.shortName}`,
};

export const dynamic = "force-dynamic";

export default async function JudgeLoginPage() {
  const judge = await getJudgeFromCookie();
  if (judge) {
    redirect("/judge/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Judge Portal
          </h1>
          <p className="mt-3 text-gray-600">
            Sign in to score teams during the build-a-thon.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <JudgeLoginForm />
        </div>
      </div>
    </div>
  );
}
