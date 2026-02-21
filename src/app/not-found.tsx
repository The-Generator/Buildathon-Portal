import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <div className="text-6xl font-bold text-gray-200">404</div>
        <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
        <p className="text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 px-6 py-3 rounded-lg bg-[#006241] text-white font-medium hover:bg-[#004d33] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
