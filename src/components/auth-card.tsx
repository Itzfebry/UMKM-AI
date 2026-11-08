"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

/**
 * Kartu halaman masuk: sudut tegas (tanpa lengkung) + efek 3D mengikuti kursor.
 * Kedalaman dibuat dua lapis — bingkai cincin emas melayang di belakang, isi form
 * dimajukan (`translateZ`) di depan. Berhenti saat pengguna minta gerak minimal.
 */
export function AuthCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      const rotateX = gsap.quickTo(el, "rotationX", { duration: 0.7, ease: "power3.out" });
      const rotateY = gsap.quickTo(el, "rotationY", { duration: 0.7, ease: "power3.out" });

      const onMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const nx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const ny = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        rotateY(gsap.utils.clamp(-1, 1, nx) * 9);
        rotateX(gsap.utils.clamp(-1, 1, -ny) * 9);
      };
      const reset = () => {
        rotateX(0);
        rotateY(0);
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", reset);
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerleave", reset);
      };
    }, el);

    return () => context.revert();
  }, []);

  return (
    <div className="w-full max-w-md [perspective:1400px]">
      <div
        ref={ref}
        data-intro
        className="price-glow relative isolate w-full border border-white/15 bg-white/[0.97] p-6 shadow-[14px_14px_0_0_rgba(224,162,27,0.22),0_50px_120px_-30px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-8"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Sudut tajam: penanda bingkai tegas di tiap pojok. */}
        <span aria-hidden className="pointer-events-none absolute -left-px -top-px size-4 border-l-2 border-t-2 border-gold" />
        <span aria-hidden className="pointer-events-none absolute -right-px -top-px size-4 border-r-2 border-t-2 border-gold" />
        <span aria-hidden className="pointer-events-none absolute -bottom-px -left-px size-4 border-b-2 border-l-2 border-gold" />
        <span aria-hidden className="pointer-events-none absolute -bottom-px -right-px size-4 border-b-2 border-r-2 border-gold" />

        {/* Cahaya lembut di sudut, sedikit di belakang isi form. */}
        <span
          aria-hidden
          className="pointer-events-none absolute -z-10 -right-8 -top-10 size-32 rounded-full bg-gold/25 blur-2xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -z-10 -bottom-12 -left-10 size-36 rounded-full bg-primary/15 blur-2xl"
        />

        <div style={{ transform: "translateZ(34px)" }}>{children}</div>
      </div>
    </div>
  );
}