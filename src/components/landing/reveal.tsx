"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "./gsap";

/**
 * Memunculkan konten (fade + geser) saat masuk layar. Keadaan awal (opacity 0) diset lewat JS,
 * bukan inline style: bila chunk klien gagal dimuat, konten tetap terbaca — dulu halaman tampak
 * kosong karena opacity 0 tertulis di HTML. Langsung tampil bila pengguna memilih reduced motion.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.set(el, { opacity: 0, y: 24 });
    const tween = gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });

    // Jaring pengaman: elemen yang sudah di layar tetapi belum dipicu (layout bergeser, gambar
    // telat dimuat) ditampilkan langsung agar tidak tertinggal transparan.
    const safety = window.setTimeout(() => {
      if (el.getBoundingClientRect().top < window.innerHeight && Number(getComputedStyle(el).opacity) < 0.05) {
        gsap.set(el, { opacity: 1, y: 0 });
      }
    }, 1500);

    return () => {
      window.clearTimeout(safety);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}