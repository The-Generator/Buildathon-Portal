"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <div className="text-5xl text-gray-300">!</div>
        <h1 className="text-2xl font-bold text-gray-900">
          Something went wrong
        </h1>
        <p className="text-gray-600">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-block mt-4 px-6 py-3 rounded-lg bg-[#006241] text-white font-medium hover:bg-[#004d33] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
