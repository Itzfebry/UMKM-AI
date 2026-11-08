"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Latar halaman masuk: tiga cahaya lembut yang melayang + cincin cahaya berputar.
 * Semua dekoratif (`aria-hidden`) dan berhenti total saat pengguna minta gerak minimal.
 * GSAP dimuat lewat gsap.context supaya tween dibersihkan saat pindah halaman.
 */
export function AuthAurora() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scope = ref.current;
    if (!scope) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const context = gsap.context(() => {
      if (reduce) return;

      // Cahaya melayang: napas pelan, bukan orbit cepat, agar tetap tenang.
      gsap.utils.toArray<HTMLElement>("[data-orb]").forEach((orb, index) => {
        gsap.to(orb, {
          xPercent: index % 2 === 0 ? 12 : -10,
          yPercent: index === 1 ? -14 : 9,
          scale: 1.12,
          duration: 9 + index * 3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: index * 0.6,
        });
      });

      // Cincin tipis berputar lambat sebagai aksen mewah.
      gsap.to("[data-orbit]", { rotation: 360, duration: 60, ease: "none", repeat: -1 });

      // Parallax halus mengikuti kursor; lapisan bergerak beda kedalaman.
      const layers = gsap.utils.toArray<HTMLElement>("[data-depth]");
      const setters = layers.map((layer) => ({
        x: gsap.quickTo(layer, "x", { duration: 0.9, ease: "power3.out" }),
        y: gsap.quickTo(layer, "y", { duration: 0.9, ease: "power3.out" }),
        depth: Number(layer.dataset.depth ?? 1),
      }));

      const onMove = (event: PointerEvent) => {
        const dx = (event.clientX / window.innerWidth - 0.5) * 2;
        const dy = (event.clientY / window.innerHeight - 0.5) * 2;
        setters.forEach(({ x, y, depth }) => {
          x(dx * 18 * depth);
          y(dy * 18 * depth);
        });
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    }, scope);

    return () => context.revert();
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div data-depth="1" className="absolute inset-0">
        <div
          data-orb
          className="absolute -left-24 top-[-10%] size-[38rem] rounded-full bg-gold/25 blur-[130px]"
        />
        <div
          data-orb
          className="absolute bottom-[-20%] right-[-10%] size-[42rem] rounded-full bg-primary-matte/30 blur-[140px]"
        />
        <div
          data-orb
          className="absolute left-1/2 top-1/3 size-[34rem] -translate-x-1/2 rounded-full bg-accent/20 blur-[130px]"
        />
      </div>

      <div data-depth="2" className="absolute inset-0 grid place-items-center">
        <div
          data-orbit
          className="size-[46rem] rounded-full border border-white/10 opacity-70 sm:size-[58rem]"
        />
      </div>

      {/* Butir halus menutup gradien agar terasa seperti kertas, bukan bidang digital. */}
      <div className="section-grain absolute inset-0 opacity-60" />
    </div>
  );
}