import type { ReactNode } from "react";

/** Angka gaya Indonesia dipakai di seluruh panel. */
export const count = new Intl.NumberFormat("id-ID");

export const th = "sticky top-0 z-10 border-b border-deep/15 bg-white/95 px-2 py-2 text-left text-caption font-semibold uppercase tracking-wide text-deep/75 backdrop-blur";
export const td = "border-b border-deep/8 px-2 py-2 align-top text-deep";
export const tbody = "[&>tr:nth-child(odd)]:bg-surface/50 [&>tr:hover]:bg-accent/10";

export function Chip({
  tone = "neutral",
  dot = false,
  onDark = false,
  children,
}: {
  tone?: "ok" | "warn" | "info" | "neutral";
  dot?: boolean;
  onDark?: boolean;
  children: ReactNode;
}) {
  const light = {
    ok: "bg-accent/25 text-deep ring-accent/45",
    warn: "bg-primary/10 text-primary ring-primary/35",
    info: "bg-deep/10 text-deep ring-deep/25",
    neutral: "bg-white text-deep/80 ring-deep/15",
  } as const;
  // Di atas pita gelap, teks berwarna gelap kehilangan kontras: pakai teks putih dengan latar tipis.
  const dark = {
    ok: "bg-accent/25 text-white ring-accent/55",
    warn: "bg-white/10 text-white ring-primary/70",
    info: "bg-white/10 text-white ring-white/25",
    neutral: "bg-white/10 text-white/90 ring-white/20",
  } as const;
  const dots = { ok: "bg-accent", warn: "bg-primary", info: "bg-white/80", neutral: "bg-deep/40" } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-caption font-semibold ring-1 ${
        (onDark ? dark : light)[tone]
      }`}
    >
      {dot ? <span className={`size-1.5 rounded-full ${dots[tone]}`} aria-hidden /> : null}
      {children}
    </span>
  );
}

/** Kartu angka utama: garis aksen atas, ikon berwarna, dan nilai besar. */
export function Tile({
  label,
  value,
  hint,
  icon,
  tone = "deep",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  tone?: "deep" | "accent" | "primary" | "warn";
}) {
  // Warna tetap di keluarga token (deep/accent/primary), hanya kekuatannya berbeda.
  const tones = {
    deep: { bar: "from-deep to-deep/30", chip: "bg-deep/10 text-deep", border: "border-deep/10", hint: "text-deep/70" },
    accent: { bar: "from-accent to-accent/30", chip: "bg-accent/20 text-deep", border: "border-deep/10", hint: "text-deep/70" },
    primary: { bar: "from-primary to-primary/25", chip: "bg-primary/10 text-primary", border: "border-deep/10", hint: "text-deep/70" },
    warn: { bar: "from-primary to-primary/25", chip: "bg-primary/10 text-primary", border: "border-primary/35", hint: "text-primary" },
  } as const;
  const style = tones[tone];

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${style.border}`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${style.bar}`} aria-hidden />
      <div className="flex items-start justify-between gap-2">
        <p className="text-caption font-semibold uppercase tracking-wide text-deep/75">{label}</p>
        {icon ? <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${style.chip}`} aria-hidden>{icon}</span> : null}
      </div>
      <p className="mt-2 text-h2 tabular text-ink">{value}</p>
      {hint ? <p className={`mt-1 text-caption ${style.hint}`}>{hint}</p> : null}
    </div>
  );
}

/** Kartu kaca untuk pita gelap di kepala halaman. */
export function GlassTile({ label, value, hint, tone = "accent" }: { label: string; value: string; hint?: string; tone?: "accent" | "deep" | "primary" }) {
  const tones = { accent: "border-l-accent", deep: "border-l-white/50", primary: "border-l-primary" } as const;
  return (
    <div className={`rounded-xl border border-white/15 border-l-4 bg-white/10 p-3 backdrop-blur ${tones[tone]}`}>
      <p className="text-caption font-semibold uppercase tracking-wide text-accent">{label}</p>
      <p className="mt-1 text-h3 tabular text-white">{value}</p>
      {hint ? <p className="mt-0.5 text-caption font-medium text-white/85">{hint}</p> : null}
    </div>
  );
}

export function SectionHeader({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      {icon ? (
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-deep to-deep/70 text-white shadow-sm" aria-hidden>
          {icon}
        </span>
      ) : null}
      <div>
        <h2 className="text-h2 text-deep">{title}</h2>
        {subtitle ? <p className="mt-1 text-small text-deep/80">{subtitle}</p> : null}
      </div>
    </div>
  );
}

/** Kartu isi dengan garis aksen dan judul konsisten. */
export function PanelCard({ title, note, className = "", children }: { title: string; note?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section className={`relative overflow-hidden rounded-2xl border border-deep/10 bg-white p-4 shadow-sm sm:p-5 ${className}`}>
      <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-deep/70 to-accent/60" aria-hidden />
      <h3 className="pl-2 text-h3 text-deep">{title}</h3>
      {note ? <p className="mt-1 pl-2 text-caption text-deep/70">{note}</p> : null}
      <div className="pl-2">{children}</div>
    </section>
  );
}

export function TableWrap({ caption, wide = false, children }: { caption: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className="mt-3 max-h-[32rem] overflow-auto rounded-xl border border-deep/10">
      <table className={`w-full ${wide ? "min-w-[720px]" : "min-w-[520px]"} border-collapse text-small`}>
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}
