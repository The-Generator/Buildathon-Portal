"use client";

import { useEffect } from "react";
import { X, Scale, Wrench } from "lucide-react";

const sidebarLinks = [
  { label: "Judging Rubric", href: "#judging", icon: Scale },
  { label: "AI Tools & Resources", href: "/resources", icon: Wrench },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-[70] flex h-full w-72 flex-col bg-[#0a0f0d] shadow-2xl shadow-black/40 transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="More navigation"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <span className="font-display text-lg font-semibold text-white">
            More
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-4 py-6">
          {sidebarLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-3 font-body text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {link.label}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}
