"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import gsap from "gsap";

const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Tombol logout dengan modal konfirmasi beranimasi GSAP. */
export function LogoutButton({ action, className = "" }: { action: () => Promise<void>; className?: string }) {
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const skip = reduceMotion();
    const ctx = gsap.context(() => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: skip ? 0 : 0.2, ease: "power2.out" });
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: skip ? 0 : 12, scale: skip ? 1 : 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: skip ? 0 : 0.3, ease: "power3.out" },
      );
    });
    confirmRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      ctx.revert();
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    const skip = reduceMotion();
    const tl = gsap.timeline({ onComplete: () => setOpen(false) });
    tl.to(panelRef.current, { opacity: 0, y: skip ? 0 : 8, scale: skip ? 1 : 0.98, duration: skip ? 0 : 0.16, ease: "power2.in" }, 0);
    tl.to(overlayRef.current, { opacity: 0, duration: skip ? 0 : 0.16 }, 0);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Keluar"
        aria-haspopup="dialog"
        className={className}
      >
        <LogOut className="size-5" aria-hidden />
        <span className="sr-only">Keluar</span>
      </button>

      {open ? (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="w-full max-w-sm rounded-2xl border border-deep/10 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="logout-title" className="text-h3 text-deep">
              Keluar dari akun?
            </h2>
            <p className="mt-1 text-small text-deep/80">
              Anda akan mengakhiri sesi ini. Bisa masuk lagi kapan saja.
            </p>
            <form action={action} className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                className="inline-flex min-h-11 items-center rounded-lg border border-deep/25 bg-white px-4 text-body font-semibold text-deep transition hover:border-deep/50"
              >
                Batal
              </button>
              <button
                ref={confirmRef}
                type="submit"
                className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-body font-semibold text-white transition hover:opacity-90"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
