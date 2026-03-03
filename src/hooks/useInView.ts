import { useEffect, useRef, useState, useCallback } from "react";

export function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasEntered, setHasEntered] = useState(false);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting) {
      setHasEntered(true);
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion — skip animation by using a trivial observer
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const observer = new IntersectionObserver(
      (entries) => {
        if (motionQuery.matches || entries[0].isIntersecting) {
          handleIntersection([
            { isIntersecting: true } as IntersectionObserverEntry,
          ]);
          observer.disconnect();
        }
      },
      { threshold: motionQuery.matches ? 0 : threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, handleIntersection]);

  return { ref, hasEntered };
}
