import { and, eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { aiUsage, businesses, subscriptions } from "@/server/db/schema";
import { jakartaDate } from "@/server/modules/ledger/queries";

export type Plan = "free" | "pro";

export const PRICE_PRO = 49_000;
/** Masa aktif Free dihitung dari bisnis dibuat (onboarding selesai). */
export const FREE_TRIAL_DAYS = 7;
/** Kuota AI Free: total selama masa Free, bukan per bulan. */
export const FREE_AI_TOTAL = 5;

export const PLAN_LIMITS: Record<Plan, { aiRequests: number; aiPeriod: "lifetime" | "month"; members: number }> = {
  free: { aiRequests: FREE_AI_TOTAL, aiPeriod: "lifetime", members: 1 },
  pro: { aiRequests: 200, aiPeriod: "month", members: 5 },
};

export const PLAN_LABEL: Record<Plan, string> = { free: "Free", pro: "Pro" };

const DAY = 86_400_000;
const GRACE_DAYS = 7;

function monthBounds(offset = 0) {
  const [y, m] = jakartaDate().split("-").map(Number);
  return {
    from: new Date(Date.UTC(y, m - 1 + offset, 1)).toISOString().slice(0, 10),
    to: new Date(Date.UTC(y, m + offset, 0)).toISOString().slice(0, 10),
  };
}

export function currentPeriod() {
  return jakartaDate().slice(0, 7);
}

/** Kuota bulanan Pro direset pada awal bulan berikutnya (FR-PLAN-01). */
export function periodResetLabel() {
  const [year, month] = jakartaDate().split("-").map(Number);
  const next = new Date(Date.UTC(month === 12 ? year + 1 : year, month === 12 ? 0 : month, 1));
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "UTC" }).format(next);
}

/** Paket efektif dari baris langganan: Pro mengikat selama statusnya masih berlaku. */
export function effectivePlan(input: { plan: Plan; status: string; currentPeriodEnd: Date | null }): Plan {
  const binding = input.plan === "pro" && (input.status === "active" || input.status === "cancel_at_period_end" || input.status === "grace_period");
  const periodEnd = input.currentPeriodEnd?.getTime() ?? 0;
  return binding && periodEnd + GRACE_DAYS * DAY > Date.now() ? "pro" : "free";
}

/**
 * Paket efektif + status masa aktif Free. Free berlaku 7 hari sejak bisnis dibuat;
 * sesudahnya akun jadi read-only. Pro mengikat selama statusnya berlaku, plus masa
 * tenggang 7 hari (FR-SUB-16), lalu kembali ke Free.
 */
export async function getPlanState(businessId: string) {
  const [[sub], [biz], [aiTotal], [aiPeriod]] = await Promise.all([
    db.select().from(subscriptions).where(eq(subscriptions.businessId, businessId)).limit(1),
    db.select({ createdAt: businesses.createdAt }).from(businesses).where(eq(businesses.id, businessId)).limit(1),
    db
      .select({ total: sql<number>`coalesce(sum(${aiUsage.requests}), 0)::int` })
      .from(aiUsage)
      .where(eq(aiUsage.businessId, businessId)),
    db
      .select({ total: sql<number>`coalesce(sum(${aiUsage.requests}), 0)::int` })
      .from(aiUsage)
      .where(and(eq(aiUsage.businessId, businessId), eq(aiUsage.period, currentPeriod()))),
  ]);

  const plan: Plan = sub ? effectivePlan({ plan: sub.plan, status: sub.status, currentPeriodEnd: sub.currentPeriodEnd }) : "free";
  const limits = PLAN_LIMITS[plan];

  const createdAt = biz?.createdAt ?? new Date();
  const trialEndsAt = new Date(createdAt.getTime() + FREE_TRIAL_DAYS * DAY);
  const trialExpired = Date.now() >= trialEndsAt.getTime();
  const readOnly = plan === "free" && trialExpired;

  return {
    plan,
    status: sub?.status ?? "free",
    currentPeriodEnd: sub?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
    limits,
    readOnly,
    trialEndsAt,
    trialExpired,
    trialDaysLeft: Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / DAY)),
    usage: {
      aiRequests: Number((limits.aiPeriod === "lifetime" ? aiTotal : aiPeriod)?.total ?? 0),
      period: monthBounds(),
    },
  };
}

export type PlanState = Awaited<ReturnType<typeof getPlanState>>;

/** Masa aktif Free habis = read-only: semua tulis ditolak, baca + ekspor tetap jalan. */
export function assertWritable(state: PlanState) {
  if (state.readOnly) {
    throw new Error(
      `Masa aktif paket Free (${FREE_TRIAL_DAYS} hari) sudah habis. Akun beralih ke mode baca saja; ekspor tetap bisa, upgrade ke Pro untuk kembali mencatat.`,
    );
  }
}

export function assertAiQuota(state: PlanState) {
  if (state.readOnly) {
    throw new Error("Masa aktif paket Free sudah habis. Upgrade ke Pro untuk memakai analis AI lagi.");
  }
  if (state.usage.aiRequests >= state.limits.aiRequests) {
    throw new Error(
      state.limits.aiPeriod === "lifetime"
        ? `Kuota AI paket Free habis (${state.limits.aiRequests} kali percobaan). Upgrade ke Pro untuk melanjutkan analisis.`
        : "Kuota AI paket Pro habis untuk bulan ini. Fitur keuangan tetap berjalan.",
    );
  }
}
