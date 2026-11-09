import Link from "next/link";
import { Crown, Sparkles } from "lucide-react";

const dateFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

/**
 * Lencana paket langganan di samping nama usaha. Pro: pil gelap bergradasi dengan aksen
 * emas. Free: pil ringkas menuju halaman langganan.
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
      title="Paket Free — upgrade ke Pro"
      className={`inline-flex h-6 items-center gap-1 rounded-full bg-primary/10 text-[11px] font-semibold text-primary transition hover:bg-primary/15 ${compact ? "px-2" : "px-2.5"}`}
    >
      <Sparkles className="size-3.5 shrink-0" aria-hidden />
      Upgrade
    </Link>
  );
}
