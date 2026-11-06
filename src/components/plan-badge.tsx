import Link from "next/link";
import { Crown, Sparkles } from "lucide-react";

const dateFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

/**
 * Lencana paket langganan di samping nama usaha. Pro: pil gelap bergradasi dengan aksen
 * emas dan zona tanggal yang dipisah (kesan premium). Free: tombol menuju halaman langganan.
 */
export function PlanBadge({
  plan,
  periodEnd,
  compact = false,
}: {
  plan: "free" | "pro";
  periodEnd?: Date | null;
  compact?: boolean;
}) {
  if (plan === "pro") {
    return (
      <span
        className="inline-flex h-6 items-center overflow-hidden rounded-full bg-gradient-to-r from-[#0E3B45] via-[#2F7185] to-[#0E3B45] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_1px_3px_rgba(15,59,69,0.25)] ring-1 ring-amber-200/40"
        title={periodEnd ? `Paket Pro aktif sampai ${dateFmt.format(periodEnd)}` : "Paket Pro aktif"}
      >
        <span className="flex h-full items-center gap-1 pl-2 pr-2 text-[11px] font-bold uppercase tracking-[0.08em]">
          <Crown className="size-3.5 shrink-0 text-amber-300" aria-hidden />
          Pro
        </span>
        {!compact && periodEnd ? (
          <span className="flex h-full items-center border-l border-white/20 bg-white/10 px-2 text-[10.5px] font-medium text-white/75">
            s/d {dateFmt.format(periodEnd)}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <Link
      href="/langganan"
      className="group inline-flex h-6 items-center overflow-hidden rounded-full border border-deep/25 bg-white text-deep transition hover:border-primary/50"
      title="Paket Free — buka halaman langganan untuk upgrade"
    >
      <span className="flex h-full items-center gap-1 pl-2 pr-2 text-[11px] font-bold uppercase tracking-[0.08em] group-hover:text-primary">
        <Sparkles className="size-3.5 shrink-0 text-deep/50 transition group-hover:text-primary" aria-hidden />
        Free
      </span>
      {!compact ? (
        <span className="flex h-full items-center border-l border-deep/15 bg-primary/5 px-2 text-[10.5px] font-semibold text-primary/90">
          upgrade
        </span>
      ) : null}
    </Link>
  );
}
