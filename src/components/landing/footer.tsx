import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0f0d]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Branding */}
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight text-white">
              Generator
            </Link>
            <p className="mt-1 text-sm text-white/40">
              Babson College Build-a-thon 2026
            </p>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm font-medium text-white/50">
            <Link
              href="/register"
              className="transition-colors hover:text-[#00e87b]"
            >
              Register
            </Link>
            <a
              href="mailto:generator@babson.edu"
              className="transition-colors hover:text-[#00e87b]"
            >
              Contact
            </a>
            <a
              href="#about"
              className="transition-colors hover:text-[#00e87b]"
            >
              About
            </a>
          </nav>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 text-center text-xs text-white/30">
          &copy; 2026 Generator at Babson College. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
