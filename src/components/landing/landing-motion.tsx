"use client";

import "lenis/dist/lenis.css";
import Lenis from "lenis";
import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTION } from "@/lib/motion";

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
        /* Slideshow latar hero: gambar berganti pelan dengan silang-ganti, bukan potongan cepat.
           Tiap grup (latar dan jendela foto) bergiliran sendiri supaya tidak saling menimpa. */
        for (const group of gsap.utils.toArray<HTMLElement>("[data-hero-group]")) {
          const slides = gsap.utils.toArray<HTMLElement>("[data-hero-slide]", group);
          if (slides.length < 2) continue;
          gsap.set(slides, { autoAlpha: 0 });
          gsap.set(slides[0], { autoAlpha: 1 });
          const showcase = gsap.timeline({ repeat: -1, defaults: { ease: "power2.inOut" } });
          slides.forEach((slide, i) => {
            const next = slides[(i + 1) % slides.length];
            // Perubahan pertama baru terjadi setelah gambar pertama tampil cukup lama.
            const at = (i + 1) * MOTION.slideHold;
            showcase.to(slide, { autoAlpha: 0, duration: MOTION.slideFade }, at);
            showcase.to(next, { autoAlpha: 1, duration: MOTION.slideFade }, at);
          });
        }

        const motionItems = gsap.utils.toArray<HTMLElement>("[data-motion]");
        if (motionItems.length === 0) return;

        gsap.set(motionItems, { autoAlpha: 0, y: MOTION.distance });
        ScrollTrigger.batch(motionItems, {
          start: MOTION.start,
          once: true,
          interval: MOTION.batchInterval,
          batchMax: MOTION.batchMax,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: MOTION.duration, ease: MOTION.easeIn, stagger: MOTION.stagger, overwrite: true }),
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

        // Teks berjalan: kata demi kata menyala dari 30% ke 100% mengikuti gulir.
        for (const block of gsap.utils.toArray<HTMLElement>("[data-run-opacity]")) {
          const words = gsap.utils.toArray<HTMLElement>("[data-run-opacity-word]", block);
          if (words.length === 0) continue;
          gsap.fromTo(
            words,
            { opacity: 0.3 },
            {
              opacity: 1,
              ease: "none",
              stagger: 0.5,
              scrollTrigger: { trigger: block, start: "top 80%", end: "bottom 65%", scrub: 0.4 },
            },
          );
        }

        // Judul bermask: tiap baris naik dari balik garis, sekali saja.
        for (const block of gsap.utils.toArray<HTMLElement>("[data-mask]")) {
          const lines = gsap.utils.toArray<HTMLElement>("[data-mask-line]", block);
          if (lines.length === 0) continue;
          gsap.set(lines, { yPercent: 110 });
          gsap.to(lines, {
            yPercent: 0,
            duration: 1.05,
            ease: "expo.out",
            stagger: 0.12,
            scrollTrigger: { trigger: block, start: "top 88%", once: true },
          });
        }

        // Panel muncul dengan klip dari bawah, terikat gulir (efek "megah" per bagian).
        for (const panel of gsap.utils.toArray<HTMLElement>("[data-clip]")) {
          gsap.fromTo(
            panel,
            { clipPath: "inset(14% 6% 0% 6% round 14px)", y: MOTION.distance * 1.5 },
            {
              clipPath: "inset(0% 0% 0% 0% round 14px)",
              y: 0,
              ease: "none",
              scrollTrigger: { trigger: panel, start: "top bottom", end: "top 55%", scrub: 0.6 },
            },
          );
        }

        // Judul fitur masuk dari ukuran besar + buram ke normal + tajam mengikuti gulir.
        for (const el of gsap.utils.toArray<HTMLElement>("[data-zoom-blur]")) {
          gsap.fromTo(
            el,
            { scale: 1.5, opacity: 0.25, filter: "blur(14px)" },
            {
              scale: 1,
              opacity: 1,
              filter: "blur(0px)",
              ease: "none",
              scrollTrigger: { trigger: el, start: "top 88%", end: "top 50%", scrub: 0.5 },
            },
          );
        }

        // Pita warna "masalah": terungkap dari bawah lewat clip-path saat digulir, jadi blok merah
        // tumbuh masuk — bukan sekadar fade. Teksnya tetap dianimasikan kata-per-kata (data-run-opacity).
        const band = scope.querySelector<HTMLElement>("#masalah");
        if (band) {
          gsap.fromTo(
            band,
            { clipPath: "inset(14% 0% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "none",
              scrollTrigger: { trigger: band, start: "top bottom", end: "top 60%", scrub: 0.6 },
            },
          );
        }

        // Insight AI "mengalir" masuk satu per satu seperti sedang dihasilkan mesin.
        for (const list of gsap.utils.toArray<HTMLElement>("[data-insight-list]")) {
          const items = gsap.utils.toArray<HTMLElement>("[data-insight-item]", list);
          if (items.length === 0) continue;
          gsap.from(items, {
            autoAlpha: 0,
            y: 16,
            filter: "blur(6px)",
            stagger: 0.15,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: { trigger: list, start: "top 75%", toggleActions: "restart none none reset" },
          });
        }

        // Centang daftar "batas AI" digambar garisnya sekali saat daftar masuk layar.
        for (const list of gsap.utils.toArray<HTMLElement>("[data-check-list]")) {
          const paths = gsap.utils.toArray<SVGPathElement>("[data-check] path", list);
          if (paths.length === 0) continue;
          for (const path of paths) {
            const len = path.getTotalLength();
            path.style.strokeDasharray = `${len}`;
            path.style.strokeDashoffset = `${len}`;
          }
          gsap.to(paths, {
            strokeDashoffset: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.12,
            scrollTrigger: { trigger: list, start: "top 80%", toggleActions: "restart none none reset" },
          });
        }

        // Kartu harga masuk dengan putaran 3D (kiri/kanan bergantian) + blur → tajam.
        const priceCards = gsap.utils.toArray<HTMLElement>("[data-price-card]");
        if (priceCards.length > 0) {
          gsap.from(priceCards, {
            rotateY: (i: number) => (i % 2 === 0 ? -24 : 24),
            yPercent: 14,
            autoAlpha: 0,
            filter: "blur(8px)",
            transformOrigin: "center",
            stagger: 0.18,
            duration: 1,
            ease: "power3.out",
            clearProps: "filter",
            scrollTrigger: { trigger: priceCards[0].parentElement, start: "top 78%", once: true },
          });
        }

        // Kartu jenis usaha: tirai gambar terbuka (clip-path) + gambar mengecil dari zoom,
        // teks menyusul naik. Tiap kartu bergiliran.
        const jenisCards = gsap.utils.toArray<HTMLElement>("[data-jenis-card]");
        if (jenisCards.length > 0) {
          const jenisTl = gsap.timeline({
            scrollTrigger: {
              trigger: jenisCards[0].parentElement,
              start: "top 85%",
              end: "bottom 55%",
              scrub: 0.6,
            },
          });
          jenisCards.forEach((card, i) => {
            const media = card.querySelector<HTMLElement>("[data-jenis-media]");
            const img = card.querySelector<HTMLElement>("[data-jenis-parallax]");
            const text = gsap.utils.toArray<HTMLElement>("[data-jenis-text]", card);
            const at = i * 0.15;
            jenisTl.from(card, { y: 44, autoAlpha: 0, duration: 0.7, ease: "power3.out" }, at);
            if (media) {
              jenisTl.fromTo(
                media,
                { clipPath: "inset(100% 0% 0% 0%)" },
                { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power3.inOut" },
                at + 0.1,
              );
            }
            if (img) {
              jenisTl.from(img, { scale: 1.28, duration: 1.15, ease: "power3.out" }, at + 0.1);
            }
            if (text.length > 0) {
              jenisTl.from(text, { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.5, ease: "power2.out" }, at + 0.45);
            }
          });
        }

        // Gambar jenis usaha bergeser sedikit di dalam bingkainya (parallax).
        for (const img of gsap.utils.toArray<HTMLElement>("[data-jenis-parallax]")) {
          const media = img.closest("[data-jenis-media]");
          if (!media) continue;
          gsap.fromTo(
            img,
            { yPercent: -8 },
            {
              yPercent: 8,
              ease: "none",
              scrollTrigger: { trigger: media, start: "top bottom", end: "bottom top", scrub: 0.6 },
            },
          );
        }

        // Garis aksen tiap bagian memanjang saat bagiannya masuk layar.
        for (const rule of gsap.utils.toArray<HTMLElement>("[data-rule]")) {
          gsap.fromTo(
            rule,
            { scaleX: 0 },
            {
              scaleX: 1,
              transformOrigin: "left center",
              ease: "none",
              scrollTrigger: { trigger: rule, start: "top 92%", end: "top 60%", scrub: 0.5 },
            },
          );
        }

        // Angka besar tiap bagian bergerak pelan seperti tanda air.
        for (const numeral of gsap.utils.toArray<HTMLElement>("[data-numeral]")) {
          gsap.fromTo(
            numeral,
            { yPercent: 12 },
            {
              yPercent: -12,
              ease: "none",
              scrollTrigger: { trigger: numeral, start: "top bottom", end: "bottom top", scrub: 0.8 },
            },
          );
        }

        // Kartu "muncul" (pop-up) dan kartu lapisan membesar mengikuti gulir, supaya bagian
        // terasa bertumpuk seperti situs interaktif — bukan sekadar muncul sekali.
        for (const el of gsap.utils.toArray<HTMLElement>("[data-popup]")) {
          gsap.fromTo(
            el,
            { scale: MOTION.popupScale, y: MOTION.distance * 2 },
            { scale: 1, y: 0, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top 45%", scrub: 0.6 } },
          );
        }

        // Garis kemajuan gulir di puncak halaman (dekorasi, tidak menyampaikan informasi).
        const progress = scope.querySelector<HTMLElement>("[data-progress]");
        if (progress) {
          gsap.fromTo(progress, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
        }
      });

      // Parallax hanya di desktop; pergeseran kecil + scrub supaya tidak mengganggu membaca.
      media.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const targets = gsap.utils.toArray<HTMLElement>("[data-parallax]");
        for (const target of targets) {
          gsap.fromTo(
            target,
            { y: MOTION.distance },
            {
              y: -MOTION.distance * 2,
              ease: "none",
              scrollTrigger: { trigger: target, start: "top bottom", end: "bottom top", scrub: 0.6 },
            },
          );
        }

        // Elemen foreground naik lebih cepat dari bagiannya — memberi kesan menonjol keluar.
        for (const fg of gsap.utils.toArray<HTMLElement>("[data-foreground]")) {
          gsap.fromTo(
            fg,
            { y: MOTION.distance * 3 },
            {
              y: -MOTION.distance * 2,
              ease: "none",
              scrollTrigger: { trigger: fg, start: "top bottom", end: "bottom top", scrub: 0.7 },
            },
          );
        }

        // Kartu Pro "melayang" pelan terus-menerus agar menonjol.
        const featuredPrice = scope.querySelector<HTMLElement>('[data-price-featured="true"]');
        if (featuredPrice) {
          gsap.to(featuredPrice, { y: -8, duration: 4.5, ease: "sine.inOut", yoyo: true, repeat: -1 });
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

  return (
    <div ref={root}>
      {/* Garis kemajuan gulir: aksen pengisi di puncak halaman. */}
      <div
        aria-hidden
        data-progress
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-gold via-primary to-deep"
      />
      {children}
    </div>
  );
}
