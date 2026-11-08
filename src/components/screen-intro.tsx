"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { MOTION } from "@/lib/motion";

/**
 * Kemunculan ringan saat halaman masuk dibuka (tanpa ScrollTrigger karena halaman pendek).
 * Keadaan tersembunyi hanya dipasang saat JS berjalan, jadi konten tetap terbaca bila skrip gagal.
 */
export function ScreenIntro({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scope = ref.current;
    if (!scope) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-intro]");
      if (items.length === 0) return;
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: MOTION.distance },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: MOTION.easeIn, stagger: MOTION.stagger },
      );
    }, scope);

    return () => context.revert();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
