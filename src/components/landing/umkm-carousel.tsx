"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { gsap } from "./gsap";

type Item = { src: string; alt: string; title: string; desc: string; pos: string };

// Ganti foto dengan menimpa file di public/images/umkm/ dengan nama yang sama.
const ITEMS: Item[] = [
  {
    src: "/images/umkm/warung.webp",
    alt: "Meja saji dan papan menu tulisan tangan di sebuah warung makan",
    title: "Warung makan",
    desc: "Catat penjualan harian dan belanja bahan tanpa ribet.",
    pos: "50% 50%",
  },
  {
    src: "/images/umkm/jajanan.webp",
    alt: "Etalase kaca berisi jajanan dan kue dengan label harga",
    title: "Jajanan dan kue",
    desc: "Catat penjualan per kategori dan pantau pemasukan setiap hari.",
    pos: "50% 50%",
  },
  {
    src: "/images/umkm/pasar.webp",
    alt: "Lapak sayur di pasar tradisional dilihat dari atas, penjual melayani pembeli",
    title: "Pasar dan sayur",
    desc: "Catat belanja dan penjualan, termasuk yang dibayar belakangan sebagai piutang.",
    pos: "50% 50%",
  },
  {
    src: "/images/umkm/kopi.webp",
    alt: "Penjual menyaring kopi dengan saringan kain di warung tradisional",
    title: "Kopi dan minuman",
    desc: "Pantau pengeluaran bahan baku dan bandingkan pendapatan tiap bulan.",
    pos: "52% 50%",
  },
  {
    src: "/images/umkm/anyaman.webp",
    alt: "Tumpukan wadah anyaman berwarna-warni di atas kain",
    title: "Kerajinan anyaman",
    desc: "Catat pesanan yang belum dibayar sebagai piutang dan pantau jatuh temponya.",
    pos: "10% 50%",
  },
  {
    src: "/images/umkm/tekstil.webp",
    alt: "Lapak kain, tas, dan karpet dengan motif beragam",
    title: "Tekstil dan busana",
    desc: "Bandingkan pendapatan antarperiode dan ekspor laporan ke Excel atau PDF.",
    pos: "50% 50%",
  },
];

const N = ITEMS.length;
const STEP = 360 / N;
const CARD_W = 240;
const CARD_H = 320;
const RADIUS = 300;
const mod = (n: number, m: number) => ((n % m) + m) % m;

const arrowBtn =
  "grid size-11 place-items-center rounded-full border border-deep/20 bg-white text-deep shadow-sm transition hover:border-deep/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none";

export function UmkmCarousel() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0); // posisi tak terbatas (boleh negatif); indeks aktif = mod(pos, N)
  const reducedRef = useRef(false);
  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const dragRef = useRef<{ x: number; rot: number } | null>(null);
  const [active, setActive] = useState(0);

  const goTo = useCallback((pos: number) => {
    posRef.current = pos;
    setActive(mod(pos, N));
    const ring = ringRef.current;
    if (!ring) return;
    gsap.to(ring, {
      rotationY: -pos * STEP,
      duration: reducedRef.current ? 0 : 0.9,
      ease: "power3.out",
      overwrite: true,
    });
  }, []);

  // Posisi awal cincin: mundur sejauh radius supaya kartu depan tampil dalam ukuran asli.
  useEffect(() => {
    if (ringRef.current) gsap.set(ringRef.current, { z: -RADIUS, rotationY: 0 });
  }, []);

  // Putar otomatis: berhenti saat di luar layar, di-hover, difokus, di-drag, tab tersembunyi, atau reduced motion.
  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedRef.current) return;
    let visible = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.3 },
    );
    if (rootRef.current) io.observe(rootRef.current);
    const id = window.setInterval(() => {
      const paused = hoverRef.current || focusRef.current || dragRef.current !== null;
      if (visible && !paused && !document.hidden) goTo(posRef.current + 1);
    }, 3800);
    return () => {
      window.clearInterval(id);
      io.disconnect();
    };
  }, [goTo]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const ring = ringRef.current;
    if (!ring) return;
    gsap.killTweensOf(ring);
    dragRef.current = { x: e.clientX, rot: Number(gsap.getProperty(ring, "rotationY")) };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    const ring = ringRef.current;
    if (!d || !ring) return;
    gsap.set(ring, { rotationY: d.rot + (e.clientX - d.x) * 0.35 });
  };
  const endDrag = () => {
    const ring = ringRef.current;
    if (!dragRef.current || !ring) return;
    dragRef.current = null;
    goTo(Math.round(-Number(gsap.getProperty(ring, "rotationY")) / STEP));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") goTo(posRef.current - 1);
    if (e.key === "ArrowRight") goTo(posRef.current + 1);
  };

  return (
    <div ref={rootRef}>
      {/* Tampilan desktop dan tablet: cincin 3D */}
      <div className="hidden md:block">
        <div
          role="group"
          aria-roledescription="carousel"
          aria-label="Contoh jenis usaha UMKM"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onMouseEnter={() => (hoverRef.current = true)}
          onMouseLeave={() => (hoverRef.current = false)}
          onFocus={() => (focusRef.current = true)}
          onBlur={() => (focusRef.current = false)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{ perspective: 1400 }}
          className="relative mx-auto h-[360px] w-full max-w-3xl cursor-grab touch-pan-y select-none rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary active:cursor-grabbing"
        >
          <div
            ref={ringRef}
            className="absolute left-0 top-0 w-full"
            style={{ height: CARD_H, transformStyle: "preserve-3d" }}
          >
            {ITEMS.map((it, i) => {
              const diff = Math.min(mod(i - active, N), mod(active - i, N));
              return (
                <div
                  key={it.title}
                  aria-hidden={i !== active}
                  className="absolute left-1/2 top-0 overflow-hidden rounded-2xl shadow-2xl shadow-black/25 ring-1 ring-white/50 transition-opacity duration-500 motion-reduce:transition-none"
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    marginLeft: -CARD_W / 2,
                    transform: `rotateY(${i * STEP}deg) translateZ(${RADIUS}px)`,
                    backfaceVisibility: "hidden",
                    opacity: diff === 0 ? 1 : diff === 1 ? 0.75 : 0.4,
                  }}
                >
                  <Image
                    src={it.src}
                    alt={it.alt}
                    fill
                    sizes="640px"
                    draggable={false}
                    className="object-cover"
                    style={{ objectPosition: it.pos }}
                  />
                  {/* Lapisan warna seragam agar foto dari sumber berbeda terlihat serasi */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-primary/10" />
                  <p className="absolute inset-x-0 bottom-0 p-4 text-body font-semibold text-white">{it.title}</p>
                </div>
              );
            })}
          </div>
          <div
            aria-hidden
            className="absolute bottom-0 left-1/2 h-6 w-64 -translate-x-1/2 rounded-full bg-deep/25 blur-xl"
          />
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button type="button" aria-label="Sebelumnya" onClick={() => goTo(posRef.current - 1)} className={arrowBtn}>
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <div className="flex gap-2">
            {ITEMS.map((it, i) => (
              <button
                key={it.title}
                type="button"
                aria-label={`Tampilkan ${it.title}`}
                aria-current={i === active}
                onClick={() => goTo(posRef.current + mod(i - active + N / 2, N) - N / 2)}
                className="grid size-6 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className={`block h-2 rounded-full transition-all motion-reduce:transition-none ${i === active ? "w-6 bg-primary" : "w-2 bg-deep/30"}`} />
              </button>
            ))}
          </div>
          <button type="button" aria-label="Berikutnya" onClick={() => goTo(posRef.current + 1)} className={arrowBtn}>
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>

        <div className="mt-6 text-center" aria-live="polite">
          <p className="text-h3 text-ink">{ITEMS[active].title}</p>
          <p className="mx-auto mt-1 max-w-md text-small text-deep/80">{ITEMS[active].desc}</p>
        </div>
      </div>

      {/* Tampilan ponsel: geser horizontal biasa */}
      <ul
        aria-label="Contoh jenis usaha UMKM"
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:hidden"
      >
        {ITEMS.map((it) => (
          <li key={it.title} className="relative aspect-[3/4] w-64 shrink-0 snap-center overflow-hidden rounded-2xl shadow-xl shadow-black/15">
            <Image src={it.src} alt={it.alt} fill sizes="640px" className="object-cover" style={{ objectPosition: it.pos }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-primary/10" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <p className="text-body font-semibold">{it.title}</p>
              <p className="mt-1 text-small text-white/85">{it.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
