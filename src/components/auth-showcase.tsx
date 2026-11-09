"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  "/images/umkm/warung.webp",
  "/images/umkm/pasar.webp",
  "/images/umkm/kopi.webp",
  "/images/umkm/tekstil.webp",
  "/images/umkm/jajanan.webp",
  "/images/umkm/anyaman.webp",
];

const QUOTES = [
  { text: "Usaha kecil yang tertata tumbuh jadi kekuatan ekonomi.", by: "Catatan UMKM-AI" },
  { text: "Kas rapi, tidur nyenyak. Angka jelas, keputusan berani.", by: "Prinsip UMKM-AI" },
  { text: "Yang besar dimulai dari yang kecil yang dicatat dengan teliti.", by: "Catatan UMKM-AI" },
  { text: "Bukan soal seberapa ramai, tapi seberapa jelas uangnya mengalir.", by: "Prinsip UMKM-AI" },
  { text: "Setiap rupiah yang tercatat adalah satu langkah lebih pasti.", by: "Catatan UMKM-AI" },
];

/** Panel kiri halaman masuk: slideshow foto UMKM (desaturasi) + kutipan bergantian. */
export function AuthShowcase() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const quote = QUOTES[i % QUOTES.length];

  return (
    <div className="relative hidden overflow-hidden bg-canvas lg:block">
      {SLIDES.map((src, idx) => (
        <Image
          key={src}
          src={src}
          alt=""
          aria-hidden
          fill
          priority={idx === 0}
          sizes="50vw"
          className={`object-cover grayscale transition-opacity duration-1000 ${idx === i ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/50 to-canvas/20" />

      <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
        <span className="text-caption font-semibold uppercase tracking-[0.3em] text-white/60">UMKM-AI · Manajemen kas</span>

        <blockquote key={i} className="landing-rise max-w-md">
          <p className="text-h1 text-white">&ldquo;{quote.text}&rdquo;</p>
          <cite className="mt-3 block text-small not-italic text-white/60">— {quote.by}</cite>
        </blockquote>

        <div className="flex gap-1.5" aria-hidden>
          {SLIDES.map((src, idx) => (
            <span key={src} className={`h-0.5 w-6 rounded-full transition-colors ${idx === i ? "bg-primary" : "bg-white/25"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
