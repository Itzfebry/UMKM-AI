import type { ReactNode } from "react";

/** Angka gaya Indonesia dipakai di seluruh panel. */
export const count = new Intl.NumberFormat("id-ID");

export const th = "sticky top-0 z-10 border-b border-deep/15 bg-white/95 px-3 py-2.5 text-left text-caption font-semibold uppercase tracking-wide text-deep/90 backdrop-blur";
export const td = "border-b border-deep/8 px-3 py-3 align-top text-deep";
export const tbody = "[&>tr:nth-child(odd)]:bg-surface/50 [&>tr:hover]:bg-accent/10";

/**
 * Warna judul per bagian panel. Fungsinya penanda posisi: begitu judul kartu berwarna ungu,
 * pembaca tahu ia sedang di bagian Penggunaan AI. Semua warna desaturasi dan lolos kontras
 * >=4.5:1 di latar terang (docs/DESIGN.md).
 */
export type PanelTone = "deep" | "primary" | "plum" | "moss" | "ochre" | "steel" | "cobalt";

const TONES: Record<PanelTone, { text: string; chip: string; bar: string; rule: string }> = {
  deep: { text: "text-deep", chip: "bg-deep/10 text-deep", bar: "bg-deep", rule: "bg-deep/45" },
  primary: { text: "text-primary", chip: "bg-primary/10 text-primary", bar: "bg-primary", rule: "bg-primary/45" },
  plum: { text: "text-plum", chip: "bg-plum/10 text-plum", bar: "bg-plum", rule: "bg-plum/45" },
  moss: { text: "text-moss", chip: "bg-moss/10 text-moss", bar: "bg-moss", rule: "bg-moss/45" },
  ochre: { text: "text-ochre", chip: "bg-ochre/10 text-ochre", bar: "bg-ochre", rule: "bg-ochre/45" },
  steel: { text: "text-steel", chip: "bg-steel/10 text-steel", bar: "bg-steel", rule: "bg-steel/45" },
  cobalt: { text: "text-cobalt", chip: "bg-cobalt/10 text-cobalt", bar: "bg-cobalt", rule: "bg-cobalt/45" },
};

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
    neutral: "bg-white text-deep/90 ring-deep/15",
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
    deep: { bar: "bg-deep", chip: "bg-deep/10 text-deep", border: "border-deep/10", hint: "text-deep/90" },
    accent: { bar: "bg-accent", chip: "bg-accent/20 text-deep", border: "border-deep/10", hint: "text-deep/90" },
    primary: { bar: "bg-primary", chip: "bg-primary/10 text-primary", border: "border-deep/10", hint: "text-deep/90" },
    warn: { bar: "bg-primary", chip: "bg-primary/10 text-primary", border: "border-primary/35", hint: "text-primary" },
  } as const;
  const style = tones[tone];

  return (
    <div className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${style.border}`}>
      <span className={`absolute inset-x-0 top-0 h-1 ${style.bar}`} aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-caption font-semibold uppercase tracking-wide text-deep/90">{label}</p>
        {icon ? (
          <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${style.chip}`} aria-hidden>
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-2.5 text-h2 tabular break-words text-ink">{value}</p>
      {hint ? <p className={`mt-1.5 text-caption leading-relaxed ${style.hint}`}>{hint}</p> : null}
    </div>
  );
}

/** Kartu kaca untuk pita gelap di kepala halaman. */
export function GlassTile({ label, value, hint, tone = "accent" }: { label: string; value: string; hint?: string; tone?: "accent" | "deep" | "primary" }) {
  const dots = { accent: "bg-accent", deep: "bg-white/70", primary: "bg-primary-matte" } as const;
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur">
      <p className="flex items-center gap-2 text-caption font-semibold uppercase tracking-wide text-accent">
        <span className={`size-2 shrink-0 rounded-full ${dots[tone]}`} aria-hidden />
        {label}
      </p>
      <p className="mt-1.5 text-h3 tabular text-white">{value}</p>
      {hint ? <p className="mt-1 text-caption font-medium leading-relaxed text-white/85">{hint}</p> : null}
    </div>
  );
}

/** Judul bagian. Ikon dan garis penanda memakai warna bagiannya (`tone`). */
export function SectionHeader({ title, subtitle, icon, tone = "deep" }: { title: string; subtitle?: string; icon?: ReactNode; tone?: PanelTone }) {
  const style = TONES[tone];
  return (
    <div className="flex items-start gap-4">
      {icon ? (
        <span className={`mt-1 grid size-11 shrink-0 place-items-center rounded-xl ${style.chip}`} aria-hidden>
          {icon}
        </span>
      ) : null}
      <div className="min-w-0">
        <span className={`mb-2.5 block h-1 w-12 rounded-full ${style.rule}`} aria-hidden />
        <h2 className={`text-h2 ${style.text}`}>{title}</h2>
        {subtitle ? <p className="mt-1.5 max-w-4xl text-small leading-relaxed text-deep/90">{subtitle}</p> : null}
      </div>
    </div>
  );
}

/** Kartu isi dengan garis aksen dan judul konsisten. */
export function PanelCard({
  title,
  note,
  icon,
  tone = "deep",
  className = "",
  children,
}: {
  title: string;
  note?: ReactNode;
  icon?: ReactNode;
  tone?: PanelTone;
  className?: string;
  children: ReactNode;
}) {
  const style = TONES[tone];
  return (
    <section className={`relative overflow-hidden rounded-2xl border border-deep/10 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      <span className={`absolute inset-y-0 left-0 w-1 ${style.bar}`} aria-hidden />
      <div className="flex items-start gap-3 pl-1.5">
        {icon ? (
          <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg ${style.chip}`} aria-hidden>
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h3 className={`text-h3 ${style.text}`}>{title}</h3>
          {note ? <p className="mt-1.5 text-caption leading-relaxed text-deep/90">{note}</p> : null}
        </div>
      </div>
      <div className="mt-4 pl-1.5">{children}</div>
    </section>
  );
}

export function TableWrap({ caption, wide = false, children }: { caption: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className="mt-4 max-h-[32rem] overflow-auto rounded-xl border border-deep/10">
      <table className={`w-full ${wide ? "min-w-[720px]" : "min-w-[520px]"} border-collapse text-small`}>
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}
