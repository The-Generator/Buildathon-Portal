import Link from "next/link";
import { DISCORD_URL, WHATSAPP_URL } from "@/lib/constants";

/* Small decorative neural network SVG */
function FooterNeuralSVG() {
  return (
    <svg
      className="absolute right-8 bottom-8 h-24 w-24 opacity-[0.05]"
      viewBox="0 0 100 100"
      fill="none"
    >
      {[
        { x1: 20, y1: 20, x2: 50, y2: 35 },
        { x1: 20, y1: 50, x2: 50, y2: 35 },
        { x1: 20, y1: 80, x2: 50, y2: 65 },
        { x1: 50, y1: 35, x2: 80, y2: 30 },
        { x1: 50, y1: 35, x2: 80, y2: 60 },
        { x1: 50, y1: 65, x2: 80, y2: 60 },
        { x1: 50, y1: 65, x2: 80, y2: 80 },
      ].map((l, i) => (
        <line
          key={i}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="#00e87b" strokeWidth="0.8"
          className="svg-draw"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
      {[
        { cx: 20, cy: 20 }, { cx: 20, cy: 50 }, { cx: 20, cy: 80 },
        { cx: 50, cy: 35 }, { cx: 50, cy: 65 },
        { cx: 80, cy: 30 }, { cx: 80, cy: 60 }, { cx: 80, cy: 80 },
      ].map((n, i) => (
        <circle
          key={i}
          cx={n.cx} cy={n.cy} r="2.5" fill="#00e87b"
          className="svg-node-pulse"
          style={{ animationDelay: `${i * 0.15}s`, transformOrigin: `${n.cx}px ${n.cy}px` }}
        />
      ))}
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-[#0a0f0d] overflow-hidden">
      {/* Subtle morphing blob */}
      <div className="absolute -right-20 -bottom-20 h-40 w-40 blob bg-[#00e87b]/[0.03] blur-3xl" />

      <FooterNeuralSVG />

      <div className="relative mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Branding */}
          <div>
            <Link href="/" className="font-display text-xl font-bold tracking-tight text-white">
              Generator
            </Link>
            <p className="font-body mt-1 text-sm text-white/40">
              Babson College Build-a-thon 2026
            </p>
          </div>

          {/* Links */}
          <nav className="font-body flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-white/50 sm:gap-6">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#5865F2] transition-colors hover:text-[#7983F5]"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
              </svg>
              Discord
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-[#25D366]"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
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

        <div className="font-body mt-8 border-t border-white/5 pt-6 text-center text-xs text-white/30">
          &copy; 2026 Generator at Babson College. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
