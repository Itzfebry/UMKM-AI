import { and, count, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { aiUsage, subscriptions, transactions } from "@/server/db/schema";
import { jakartaDate } from "@/server/modules/ledger/queries";

export type Plan = "free" | "pro";

export const PRICE_PRO = 49_000;

export const PLAN_LIMITS: Record<Plan, { transactionsPerMonth: number; aiRequestsPerMonth: number; members: number }> = {
  free: { transactionsPerMonth: 100, aiRequestsPerMonth: 10, members: 1 },
  pro: { transactionsPerMonth: Number.POSITIVE_INFINITY, aiRequestsPerMonth: 200, members: 5 },
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

/** Kuota bulanan direset pada awal bulan berikutnya (FR-PLAN-01). */
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
 * Paket efektif. Pro hanya berlaku bila statusnya masih mengikat; sesudah periode
 * berbayar berakhir masih ada masa tenggang 7 hari (FR-SUB-16), lalu kembali ke Free.
 */
export async function getPlanState(businessId: string) {
  const [row] = await db.select().from(subscriptions).where(eq(subscriptions.businessId, businessId)).limit(1);
  const plan: Plan = row ? effectivePlan({ plan: row.plan, status: row.status, currentPeriodEnd: row.currentPeriodEnd }) : "free";

  const [[txUsed], [aiUsed]] = await Promise.all([
    db
      .select({ total: count() })
      .from(transactions)
      .where(
        and(
          eq(transactions.businessId, businessId),
          isNull(transactions.deletedAt),
          gte(transactions.transactionDate, monthBounds().from),
          lte(transactions.transactionDate, monthBounds().to),
        ),
      ),
    db
      .select({ total: sql<number>`coalesce(${aiUsage.requests}, 0)::int` })
      .from(aiUsage)
      .where(and(eq(aiUsage.businessId, businessId), eq(aiUsage.period, currentPeriod()))),
  ]);

  return {
    plan,
    status: row?.status ?? "free",
    currentPeriodEnd: row?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: row?.cancelAtPeriodEnd ?? false,
    limits: PLAN_LIMITS[plan],
    usage: {
      transactions: Number(txUsed?.total ?? 0),
      aiRequests: Number(aiUsed?.total ?? 0),
      period: monthBounds(),
    },
  };
}

export type PlanState = Awaited<ReturnType<typeof getPlanState>>;

/** Batas transaksi Free tidak menghapus data; hanya menolak penambahan (FR-PLAN-03). */
export function assertTransactionQuota(state: PlanState, additional = 1) {
  if (state.usage.transactions + additional > state.limits.transactionsPerMonth) {
    throw new Error(
      `Paket ${PLAN_LABEL[state.plan]} maksimal ${state.limits.transactionsPerMonth} transaksi per bulan. Data lama tetap bisa dibaca; upgrade ke Pro untuk menambah.`,
    );
  }
}

export function assertAiQuota(state: PlanState) {
  if (state.usage.aiRequests >= state.limits.aiRequestsPerMonth) {
    throw new Error(`Kuota AI paket ${PLAN_LABEL[state.plan]} habis untuk bulan ini. Fitur keuangan tetap berjalan.`);
  }
}