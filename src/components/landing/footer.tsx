import Link from "next/link";

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
          <nav className="font-body flex items-center gap-6 text-sm font-medium text-white/50">
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
