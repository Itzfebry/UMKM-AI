"use client";

import "lenis/dist/lenis.css";
import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "./gsap";

/** Smooth scroll (Lenis) yang disinkronkan dengan GSAP ScrollTrigger. Hanya aktif di halaman landing. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    // Posisi pemicu berubah saat gambar selesai dimuat atau FAQ dibuka/ditutup.
    window.addEventListener("load", refresh);
    document.addEventListener("toggle", refresh, true);

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Offset -72 menyisakan ruang untuk header yang menempel di atas.
      lenis = new Lenis({ anchors: { offset: -72 } });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    return () => {
      window.removeEventListener("load", refresh);
      document.removeEventListener("toggle", refresh, true);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
