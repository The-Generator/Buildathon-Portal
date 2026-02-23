"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Prizes", href: "#prizes" },
  { label: "Sponsors", href: "#sponsors" },
  { label: "Schedule", href: "#schedule" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0a0f0d]/95 backdrop-blur-md shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="font-display text-xl font-bold tracking-tight text-white"
          >
            Generator
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-body text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => setSidebarOpen(true)}
              className="font-body text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              More
            </button>
            <Link
              href="/register"
              className="shimmer-border rounded-full bg-[#00e87b] px-6 py-2.5 text-sm font-bold text-[#0a0f0d] transition-all hover:bg-[#00ff88] hover:shadow-lg hover:shadow-[#00e87b]/25"
            >
              Register Now
            </Link>
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/10 bg-[#0a0f0d]/98 px-6 py-4 backdrop-blur-md md:hidden">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-body text-sm font-medium text-white/70 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setSidebarOpen(true);
                }}
                className="text-left font-body text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                More
              </button>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-block rounded-full bg-[#00e87b] px-6 py-2.5 text-center text-sm font-bold text-[#0a0f0d] transition-all hover:bg-[#00ff88]"
              >
                Register Now
              </Link>
            </nav>
          </div>
        )}
      </header>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
