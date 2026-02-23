export function GeneratorBanner() {
  return (
    <div className="relative w-full overflow-hidden bg-neutral-950">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />

      <div className="mx-auto flex max-w-7xl items-center justify-center px-5 py-3 sm:py-4">
        {/* Logo mark + wordmark */}
        <div className="flex items-center gap-3">
          {/* Stylized "G" mark */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 sm:h-10 sm:w-10">
            <span className="font-display text-lg font-extrabold text-emerald-400 sm:text-xl">
              G
            </span>
          </div>

          {/* Wordmark */}
          <div className="flex items-baseline gap-2">
            <span className="font-display text-sm font-bold tracking-wide text-white/90 uppercase sm:text-base">
              Babson Generator
            </span>
            <span className="hidden h-4 w-px bg-white/20 sm:block" />
            <span className="hidden font-body text-xs font-medium text-white/40 sm:block">
              Innovation Lab
            </span>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />
    </div>
  );
}
