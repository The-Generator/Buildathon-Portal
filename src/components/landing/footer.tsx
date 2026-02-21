import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Branding */}
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight text-[#006241]">
              Generator
            </Link>
            <p className="mt-1 text-sm text-gray-500">
              Babson College Build-a-thon 2026
            </p>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link
              href="/register"
              className="transition-colors hover:text-[#006241]"
            >
              Register
            </Link>
            <a
              href="mailto:generator@babson.edu"
              className="transition-colors hover:text-[#006241]"
            >
              Contact
            </a>
            <a
              href="#about"
              className="transition-colors hover:text-[#006241]"
            >
              About
            </a>
          </nav>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          &copy; 2026 Generator at Babson College. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
