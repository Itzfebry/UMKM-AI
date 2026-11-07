"use client";

import { HandCoins, ReceiptText, Sparkles } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "./gsap";

const chip =
  "absolute z-10 hidden items-center gap-2.5 rounded-xl border border-deep/10 bg-white px-3.5 py-2.5 shadow-xl shadow-deep/15 lg:flex";

/**
 * Lapisan parallax di sekitar mockup hero: latar bergerak lebih lambat, kartu melayang lebih cepat,
 * dan mockup miring ke depan saat di-scroll. Semua lapisan dekoratif (aria-hidden).
 * Mati otomatis bila pengguna memilih reduced motion.
 */
export function HeroParallax({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      root.querySelectorAll<HTMLElement>("[data-depth]").forEach((layer) => {
        const depth = parseFloat(layer.dataset.depth ?? "0");
        gsap.to(layer, {
          y: depth * -120,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      const tilt = root.querySelector<HTMLElement>("[data-tilt]");
      if (tilt) {
        gsap.fromTo(
          tilt,
          { rotateX: 14, scale: 0.96, transformPerspective: 1400, transformOrigin: "50% 100%" },
          {
            rotateX: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: root, start: "top 90%", end: "top 35%", scrub: true },
          },
        );
      }
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={rootRef} className="relative">
      {/* Latar: dua lingkaran blur dengan kecepatan berbeda */}
      <div
        aria-hidden
        data-depth="0.35"
        className="pointer-events-none absolute -left-10 top-10 size-64 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        data-depth="-0.25"
        className="pointer-events-none absolute -right-10 top-40 size-72 rounded-full bg-accent/40 blur-3xl"
      />

      <div data-tilt className="relative">
        {children}
      </div>

      {/* Kartu melayang (data contoh) */}
      <div aria-hidden data-depth="1.3" className={`${chip} -left-4 top-28 xl:-left-10`}>
        <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="size-4" aria-hidden />
        </span>
        <div className="text-left">
          <p className="text-caption font-semibold text-deep">Insight AI</p>
          <p className="text-small text-ink">Pengeluaran bahan baku naik</p>
        </div>
      </div>

      <div aria-hidden data-depth="0.6" className={`${chip} -right-4 top-1/2 xl:-right-10`}>
        <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <HandCoins className="size-4" aria-hidden />
        </span>
        <div className="text-left">
          <p className="text-caption font-semibold text-deep">Piutang</p>
          <p className="text-small text-ink">2 lewat jatuh tempo</p>
        </div>
      </div>

      <div aria-hidden data-depth="1.7" className={`${chip} -left-2 bottom-28 xl:-left-6`}>
        <span className="grid size-8 place-items-center rounded-lg bg-accent/40 text-deep">
          <ReceiptText className="size-4" aria-hidden />
        </span>
        <div className="text-left">
          <p className="text-caption font-semibold text-deep">Transaksi bulan ini</p>
          <p className="tabular text-small text-ink">128 tercatat</p>
        </div>
      </div>
    </div>
  );
}
