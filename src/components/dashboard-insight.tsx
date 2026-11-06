"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, Maximize2, Minimize2, Sparkles } from "lucide-react";
import { generateDashboardInsight, type InsightState } from "@/server/modules/ai/insight";
import type { AiAnswer } from "@/server/modules/ai/actions";
import { SubmitButton } from "@/components/submit-button";
import { ErrorText } from "./ui";

function Body({ insight }: { insight: AiAnswer }) {
  return (
    <div className="mt-2 space-y-2 text-small">
      {insight.temuan?.length ? (
        <ul className="list-disc space-y-1 pl-5 text-ink">
          {insight.temuan.slice(0, 4).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {insight.interpretasi ? <p className="text-ink">{insight.interpretasi}</p> : null}
      {insight.rekomendasi?.length ? (
        <ul className="list-disc space-y-1 pl-5 text-deep/85">
          {insight.rekomendasi.slice(0, 4).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {insight.keterbatasan?.length ? (
        <p className="text-caption text-deep/60">Keterbatasan: {insight.keterbatasan.join(" ")}</p>
      ) : null}
    </div>
  );
}

const iconBtn = "flex size-8 shrink-0 items-center justify-center rounded-lg text-deep/60 transition hover:bg-deep/5 hover:text-deep";
const shell = "flex flex-col overflow-hidden rounded-2xl border border-deep/10 bg-white p-5 shadow-sm";

export function DashboardInsight({
  initial,
}: {
  initial: { insight: AiAnswer; createdAt: string; today: boolean } | null;
}) {
  const [state, action] = useActionState<InsightState, FormData>(generateDashboardInsight, undefined);
  const [collapsed, setCollapsed] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const insight = state?.insight ?? initial?.insight ?? null;
  const createdAt = state?.createdAt ?? initial?.createdAt ?? null;
  const upToDate = state?.ok ? true : Boolean(initial?.today);

  useEffect(() => {
    if (!maximized) return;
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMaximized(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      // Kartu dipasang ulang di posisi semula, jadi fokus dikembalikan lewat id.
      document.getElementById("insight-card")?.focus();
    };
  }, [maximized]);

  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-h3 text-deep">
          <Sparkles className="size-4 text-primary" aria-hidden />
          Insight AI
        </h2>
        <div className="flex items-center gap-1">
          {createdAt && !collapsed ? (
            <span className="mr-1 hidden text-caption text-deep/60 sm:inline">
              {upToDate ? "hari ini" : "terakhir"} {createdAt.slice(0, 10)}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Tampilkan insight" : "Sembunyikan insight"}
            aria-expanded={!collapsed}
            className={iconBtn}
          >
            {collapsed ? <ChevronDown className="size-4" aria-hidden /> : <ChevronUp className="size-4" aria-hidden />}
          </button>
          {collapsed ? null : (
            <button
              type="button"
              onClick={() => setMaximized((v) => !v)}
              aria-label={maximized ? "Perkecil insight" : "Perbesar insight"}
              aria-expanded={maximized}
              className={iconBtn}
            >
              {maximized ? <Minimize2 className="size-4" aria-hidden /> : <Maximize2 className="size-4" aria-hidden />}
            </button>
          )}
        </div>
      </div>

      {collapsed ? null : (
        <>
          <div className="mt-2 min-h-0 flex-1 overflow-y-auto pr-1">
            {insight ? (
              <Body insight={insight} />
            ) : (
              <p className="text-small text-deep/70">
                Belum ada analisis. Analisis otomatis berjalan harian lewat tugas terjadwal; tombol di bawah untuk membuat sekarang. Sistem menghitung
                angkanya, AI hanya menafsirkan.
              </p>
            )}
          </div>

          <form action={action} className="mt-3 shrink-0 border-t border-deep/10 pt-3">
            <ErrorText>{state?.error}</ErrorText>
            <SubmitButton pendingLabel="Menganalisis..." variant="secondary">
              {insight ? "Perbarui insight hari ini" : "Buat insight hari ini"}
            </SubmitButton>
          </form>
          <p className="mt-1 shrink-0 text-caption text-deep/60">
            Analisis otomatis dibuat sekali sehari untuk semua usaha; tombol ini membuat ulang untuk hari ini dan memakai satu kuota AI. Periksa ke catatan
            sumber sebelum bertindak.
          </p>
        </>
      )}
    </>
  );

  // Grid dashboard memakai transform (react-grid-layout), jadi `fixed` di dalam kartu
  // menempel ke sel grid, bukan layar. Portal ke body supaya maximize benar-benar penuh.
  if (maximized) {
    return createPortal(
      <>
        <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-[1px]" onClick={() => setMaximized(false)} aria-hidden />
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Insight AI"
          className={`${shell} fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-1.5rem)] w-[min(56rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 shadow-2xl outline-none`}
        >
          {content}
        </div>
      </>,
      document.body,
    );
  }

  return (
    <div id="insight-card" tabIndex={-1} className={`${shell} outline-none ${collapsed ? "h-auto" : "h-full"}`}>
      {content}
    </div>
  );
}