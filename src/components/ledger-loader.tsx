/**
 * Animasi pemuatan khas UMKM-AI: batang grafik yang menari dengan koin kecil mengorbit,
 * dipakai di seluruh halaman aplikasi (loading.tsx) supaya transisi terasa konsisten.
 */
export function LedgerLoader({ label = "Menyiapkan data" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4" role="status" aria-live="polite">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 rounded-2xl bg-white shadow-sm ring-1 ring-deep/10" aria-hidden />
        <span className="relative flex h-8 items-end gap-1" aria-hidden>
          {[0, 1, 2, 3].map((index) => (
            <span
              key={index}
              className="ledger-bar w-1.5 rounded-full bg-deep"
              style={{ height: `${[18, 30, 24, 34][index]}px`, animationDelay: `${index * 0.12}s` }}
            />
          ))}
        </span>
        <span className="ledger-orbit absolute inset-0" aria-hidden>
          <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 rounded-full bg-primary shadow-sm" />
        </span>
      </div>
      <p className="text-small font-semibold text-deep/80">{label}</p>
      <span className="sr-only">Memuat halaman</span>
    </div>
  );
}

export function LedgerSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="ledger-shimmer h-24 rounded-xl border border-deep/10 bg-white/70" />
        ))}
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-deep/10 bg-white/70 p-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="ledger-shimmer h-4 w-1/3 rounded-full" />
            <span className="ledger-shimmer h-4 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
