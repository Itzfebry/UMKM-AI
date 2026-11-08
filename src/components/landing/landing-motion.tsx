"use client";

import "lenis/dist/lenis.css";
import Lenis from "lenis";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Gerak landing page: reveal saat masuk layar, parallax halus pada mock dashboard, dan smooth
 * scroll Lenis yang disinkronkan dengan ScrollTrigger.
 *
 * Catatan pola (mengikuti skill gsap-core / gsap-scrolltrigger / gsap-react):
 * - semua efek dibuat di dalam `gsap.context()` dengan scope root, lalu direvert saat unmount;
 * - `gsap.matchMedia()` dipakai untuk prefers-reduced-motion (animasi dilewati sepenuhnya);
 * - keadaan awal (autoAlpha 0) baru diset lewat JS, jadi bila chunk klien gagal dimuat konten
 *   tetap terbaca — dulu halaman tampak kosong;
 * - hanya properti transform/opacity yang dianimasikan, ScrollTrigger.batch() untuk stagger.
 */
export function LandingMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scope = root.current;
    if (!scope) return;

    gsap.registerPlugin(ScrollTrigger);

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;
    let revealInView: (() => void) | null = null;

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      // Reveal hanya dibuat untuk pengguna yang tidak memilih reduced motion; bila preferensinya
      // berubah, matchMedia merevert dan konten kembali terlihat penuh.
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const motionItems = gsap.utils.toArray<HTMLElement>("[data-motion]");
        if (motionItems.length === 0) return;

        gsap.set(motionItems, { autoAlpha: 0, y: 24 });
        ScrollTrigger.batch(motionItems, {
          start: "top 88%",
          once: true,
          interval: 0.12,
          batchMax: 6,
          onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08, overwrite: true }),
        });

        // Jaring pengaman: apa pun yang sudah di layar tetapi belum dipicu tetap ditampilkan.
        revealInView = () => {
          for (const item of motionItems) {
            if (item.getBoundingClientRect().top < window.innerHeight && Number(getComputedStyle(item).opacity) < 0.05) {
              gsap.set(item, { autoAlpha: 1, y: 0 });
            }
          }
        };
        ScrollTrigger.addEventListener("refresh", revealInView);
      });

      // Parallax hanya di desktop; pergeseran kecil + scrub supaya tidak mengganggu membaca.
      media.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const targets = gsap.utils.toArray<HTMLElement>("[data-parallax]");
        for (const target of targets) {
          gsap.fromTo(
            target,
            { y: 24 },
            {
              y: -48,
              ease: "none",
              scrollTrigger: { trigger: target, start: "top bottom", end: "bottom top", scrub: 0.6 },
            },
          );
        }
      });
    }, scope);

    // Smooth scroll dijalankan hanya bila pengguna tidak meminta gerak dikurangi.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      lenis = new Lenis({ anchors: { offset: -72 } });
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    // Posisi pemicu bergeser setelah gambar/font selesai dimuat: segarkan sekali lagi. Tab yang
    // dibuka di latar belakang baru punya kesempatan menghitung saat pertama kali ditampilkan.
    const refresh = () => ScrollTrigger.refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") ScrollTrigger.refresh();
    };
    window.addEventListener("load", refresh);
    document.addEventListener("visibilitychange", onVisible);
    const lateRefresh = window.setTimeout(refresh, 800);

    return () => {
      window.clearTimeout(lateRefresh);
      window.removeEventListener("load", refresh);
      document.removeEventListener("visibilitychange", onVisible);
      if (revealInView) ScrollTrigger.removeEventListener("refresh", revealInView);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      media.revert();
      context.revert();
    };
  }, []);

  return <div ref={root}>{children}</div>;
}
