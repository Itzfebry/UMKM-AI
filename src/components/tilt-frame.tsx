"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

/**
 * Bingkai bersudut tiga dimensi: mengikuti penunjuk dengan rotasi kecil dan kembali datar
 * saat kursor pergi. Dipakai untuk memperlihatkan "produk" sebagai objek, bukan gambar datar.
 *
 * Batasan yang disengaja: hanya `transform`, hanya penunjuk presisi (`pointer: fine`), dan
 * dimatikan saat `prefers-reduced-motion` — di layar sentuh bingkai tampil datar.
 */
export function TiltFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rotateX = gsap.quickTo(el, "rotationX", { duration: 0.45, ease: "power2.out" });
    const rotateY = gsap.quickTo(el, "rotationY", { duration: 0.45, ease: "power2.out" });

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      rotateY(px * 9);
      rotateX(py * -7);
    };
    const reset = () => {
      rotateX(0);
      rotateY(0);
    };

    const zone = el.parentElement ?? el;
    zone.addEventListener("pointermove", onMove);
    zone.addEventListener("pointerleave", reset);

    return () => {
      zone.removeEventListener("pointermove", onMove);
      zone.removeEventListener("pointerleave", reset);
      gsap.killTweensOf(el);
    };
  }, []);

  return (
    <div className={`[perspective:1400px] ${className}`}>
      <div ref={ref} className="relative [transform-style:preserve-3d] will-change-transform">
        {children}
      </div>
    </div>
  );
}