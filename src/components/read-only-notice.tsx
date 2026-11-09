"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";

const KEY = "umkm-ai:readonly-notice";

/**
 * Modal sekali per sesi saat masa aktif Free habis. Dismissible (bukan penghalang),
 * Esc/overlay menutup, fokus pindah ke CTA. Billing & ekspor tetap bisa diakses.
 */
export function ReadOnlyNotice() {
  const [open, setOpen] = useState(false);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY, "1");
    } catch {
      // sessionStorage bisa diblokir; modal tetap tampil sekali per mount.
    }
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    ctaRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="readonly-title"
        aria-describedby="readonly-desc"
        className="relative w-full max-w-md rounded-2xl border border-deep/10 bg-white p-6 shadow-2xl"
      >
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Lock className="size-5" aria-hidden />
        </span>
        <h2 id="readonly-title" className="mt-4 text-h3 text-deep">
          Masa aktif Free sudah habis
        </h2>
        <p id="readonly-desc" className="mt-2 text-small text-deep/80">
          Data Anda tetap aman dan bisa dibaca. Semua pencatatan baru diblokir, tetapi ekspor CSV, Excel, dan PDF tetap bisa.
          Upgrade ke Pro untuk kembali mencatat dan memakai analis AI.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <Link
            ref={ctaRef}
            href="/langganan"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-primary px-4 text-small font-semibold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Upgrade ke Pro
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-deep/25 px-4 text-small font-semibold text-deep hover:bg-deep/5"
          >
            Nanti saja
          </button>
        </div>
        <p className="mt-3 text-caption text-deep/60">Ekspor dan pembayaran tetap bisa dilakukan dalam mode baca saja.</p>
      </div>
    </div>
  );
}