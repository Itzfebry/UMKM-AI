import { and, asc, count, desc, eq, gte, ilike, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { debts, transactions } from "@/server/db/schema";
import { jakartaDate } from "@/server/modules/ledger/queries";
import type { DebtKind, DebtStatus } from "./types";

/** Total pembayaran valid = transaksi dengan debt_id yang belum dihapus. */
const paidExpr = sql<number>`coalesce((select sum(p.amount) from ${transactions} p where p.debt_id = ${debts.id} and p.deleted_at is null), 0)::bigint`;
const statusExpr = sql<DebtStatus>`case when ${paidExpr} >= ${debts.amount} then 'paid' when ${paidExpr} > 0 then 'partial' else 'unpaid' end`;

export type DebtFilters = {
  kind?: DebtKind;
  status?: DebtStatus;
  search?: string;
  dueFrom?: string;
  dueTo?: string;
  page?: number;
  pageSize?: number;
  includeDeleted?: boolean;
};

export async function listDebts(businessId: string, filters: DebtFilters = {}) {
  const pageSize = Math.min(filters.pageSize ?? 20, 100);
  const page = Math.max(filters.page ?? 1, 1);
  const where = [
    eq(debts.businessId, businessId),
    filters.includeDeleted ? undefined : isNull(debts.deletedAt),
    filters.kind ? eq(debts.kind, filters.kind) : undefined,
    filters.status ? sql`${statusExpr} = ${filters.status}` : undefined,
    filters.search ? ilike(debts.counterparty, `%${filters.search}%`) : undefined,
    filters.dueFrom ? gte(debts.dueDate, filters.dueFrom) : undefined,
    filters.dueTo ? lte(debts.dueDate, filters.dueTo) : undefined,
  ].filter(Boolean);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: debts.id,
        kind: debts.kind,
        counterparty: debts.counterparty,
        amount: debts.amount,
        transactionDate: debts.transactionDate,
        dueDate: debts.dueDate,
        note: debts.note,
        deletedAt: debts.deletedAt,
        deletedReason: debts.deletedReason,
        paid: paidExpr,
        remaining: sql<number>`(${debts.amount} - ${paidExpr})::bigint`,
        status: statusExpr,
      })
      .from(debts)
      .where(and(...where))
      .orderBy(asc(debts.dueDate), desc(debts.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(debts).where(and(...where)),
  ]);

  return {
    rows: rows.map((r) => ({ ...r, paid: Number(r.paid), remaining: Number(r.remaining) })),
    total,
    page,
    pageSize,
  };
}

/** Ringkasan sisa utang/piutang untuk dashboard + kartu halaman. */
export async function getDebtSummary(businessId: string) {
  const [byKind, [{ overdue }]] = await Promise.all([
    db
      .select({ kind: debts.kind, outstanding: sql<number>`sum(${debts.amount} - ${paidExpr})::bigint` })
      .from(debts)
      .where(and(eq(debts.businessId, businessId), isNull(debts.deletedAt)))
      .groupBy(debts.kind),
    db
      .select({ overdue: count() })
      .from(debts)
      .where(
        and(
          eq(debts.businessId, businessId),
          isNull(debts.deletedAt),
          sql`${debts.dueDate} < ${jakartaDate()}::date`,
          sql`${paidExpr} < ${debts.amount}`,
        ),
      ),
  ]);

  const summary: Record<DebtKind, number> = { payable: 0, receivable: 0 };
  for (const row of byKind) summary[row.kind] = Number(row.outstanding);
  return { ...summary, overdue: Number(overdue) };
}