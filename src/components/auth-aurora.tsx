"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Latar halaman masuk: gradien berlapis, kisi perspektif, cahaya warna yang melayang, dan
 * bingkai persegi berputar. Semua dekoratif (`aria-hidden`) dan berhenti total saat pengguna
 * minta gerak minimal. GSAP dibungkus gsap.context agar tween dibersihkan saat pindah halaman.
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
          xPercent: index % 2 === 0 ? 14 : -12,
          yPercent: index === 1 ? -16 : 10,
          scale: 1.15,
          duration: 9 + index * 3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: index * 0.6,
        });
      });

      // Bingkai berputar lambat (dua arah) sebagai aksen mewah, sejajar tema kartu persegi.
      gsap.to("[data-orbit]", { rotation: 360, duration: 80, ease: "none", repeat: -1 });
      gsap.to("[data-orbit-alt]", { rotation: -360, duration: 55, ease: "none", repeat: -1 });

      // Persegi kecil mengapung.
      gsap.utils.toArray<HTMLElement>("[data-shape]").forEach((shape, index) => {
        gsap.to(shape, {
          y: index % 2 === 0 ? -26 : 22,
          rotation: `+=${index % 2 === 0 ? 12 : -10}`,
          duration: 7 + index,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: index * 0.4,
        });
      });

      // kisi perspektif bergeser sangat halus agar latar bawah tidak diam.
      const grid = scope.querySelector<HTMLElement>("[data-grid]");
      if (grid) {
        gsap.to(grid, { backgroundPositionY: "80px", duration: 6, ease: "none", repeat: -1 });
      }

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
      {/* Gradien dasar berlapis: hangat di kiri atas, sejuk di kanan bawah. */}
      <div
        data-depth="0.4"
        className="absolute inset-0 bg-[radial-gradient(120%_120%_at_15%_0%,#10333c_0%,#071318_46%,#04080a_100%)]"
      />

      <div data-depth="1" className="absolute inset-0">
        <div data-orb className="absolute -left-24 top-[-10%] size-[38rem] rounded-full bg-gold/25 blur-[130px]" />
        <div data-orb className="absolute bottom-[-20%] right-[-10%] size-[42rem] rounded-full bg-primary-matte/30 blur-[140px]" />
        <div data-orb className="absolute left-1/2 top-1/3 size-[34rem] -translate-x-1/2 rounded-full bg-accent/20 blur-[130px]" />
        <div data-orb className="absolute -bottom-24 left-[-8%] size-[30rem] rounded-full bg-cobalt/30 blur-[130px]" />
      </div>

      {/* Kisi perspektif di dasar layar: memberi lantai dan ruang, bukan bidang datar. */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden [perspective:420px]">
        <div
          data-grid
          className="absolute inset-x-[-20%] bottom-0 top-0 origin-bottom [transform:rotateX(74deg)] bg-[linear-gradient(rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_top,black,transparent_72%)]"
        />
      </div>

      {/* Bingkai persegi besar di tengah, berputar dua arah. */}
      <div data-depth="2" className="absolute inset-0 grid place-items-center">
        <span data-orbit className="size-[46rem] border border-white/10 opacity-70 sm:size-[58rem]" />
        <span
          data-orbit-alt
          className="absolute size-[32rem] rotate-45 border border-gold/15 opacity-70 sm:size-[40rem]"
        />
      </div>

      {/* Persegi kecil yang mengapung. */}
      <div data-depth="2.4" className="absolute inset-0">
        <span data-shape className="absolute left-[12%] top-[20%] size-20 rotate-12 border border-gold/30" />
        <span data-shape className="absolute right-[16%] top-[26%] size-14 -rotate-6 border border-accent/30" />
        <span data-shape className="absolute bottom-[22%] left-[22%] size-24 rotate-3 border border-white/15" />
        <span data-shape className="absolute bottom-[30%] right-[12%] size-16 rotate-45 border border-primary-matte/30" />
      </div>

      {/* Butir halus menutup gradien agar terasa seperti kertas, bukan bidang digital. */}
      <div className="section-grain absolute inset-0 opacity-60" />
    </div>
  );
}