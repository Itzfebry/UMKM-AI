import { and, asc, count, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { categories, transactions } from "@/server/db/schema";
import type { TransactionType } from "@/server/modules/ledger/types";
import type { Period } from "./period";

export type ReportSlice = {
  income: number;
  expense: number;
  /** Selisih arus kas periode, bukan laba. */
  net: number;
  count: number;
  byCategory: { name: string; type: TransactionType; total: number; count: number }[];
};

function within(businessId: string, period: Period) {
  return and(
    eq(transactions.businessId, businessId),
    isNull(transactions.deletedAt),
    gte(transactions.transactionDate, period.from),
    lte(transactions.transactionDate, period.to),
  );
}

export async function getReportSlice(businessId: string, period: Period): Promise<ReportSlice> {
  const [totals, byCategory, [countRow]] = await Promise.all([
    db
      .select({
        type: transactions.type,
        total: sql<number>`sum(${transactions.amount})::bigint`,
      })
      .from(transactions)
      .where(within(businessId, period))
      .groupBy(transactions.type),
    db
      .select({
        name: sql<string>`coalesce(${categories.name}, 'Tanpa kategori')`,
        type: transactions.type,
        total: sql<number>`sum(${transactions.amount})::bigint`,
        count: count(),
      })
      .from(transactions)
      .leftJoin(categories, eq(categories.id, transactions.categoryId))
      .where(within(businessId, period))
      .groupBy(categories.name, transactions.type)
      .orderBy(sql`sum(${transactions.amount}) desc`),
    db.select({ total: count() }).from(transactions).where(within(businessId, period)),
  ]);

  const sumOf = (type: TransactionType) => Number(totals.find((t) => t.type === type)?.total ?? 0);
  const income = sumOf("operational_income");
  const expense = sumOf("operational_expense");

  return {
    income,
    expense,
    net: income - expense,
    count: Number(countRow?.total ?? 0),
    byCategory: byCategory.map((r) => ({ ...r, total: Number(r.total), count: Number(r.count) })),
  };
}

/** Perubahan nominal + persen; persen null bila pembanding 0 (FR-REPORT-05). */
export function delta(current: number, previous: number) {
  return { nominal: current - previous, percent: previous === 0 ? null : ((current - previous) / previous) * 100 };
}

/** Baris transaksi untuk ekspor detail. shortcut: dibatasi 2000 baris per ekspor. */
export async function getReportTransactions(businessId: string, period: Period) {
  return db
    .select({
      transactionDate: transactions.transactionDate,
      type: transactions.type,
      categoryName: sql<string>`coalesce(${categories.name}, 'Tanpa kategori')`,
      note: transactions.note,
      paymentMethod: transactions.paymentMethod,
      amount: transactions.amount,
      createdAt: transactions.createdAt,
    })
    .from(transactions)
    .leftJoin(categories, eq(categories.id, transactions.categoryId))
    .where(within(businessId, period))
    .orderBy(asc(transactions.transactionDate), asc(transactions.createdAt))
    .limit(2000);
}