import { and, asc, count, desc, eq, gte, ilike, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { categories, openingBalances, transactions } from "@/server/db/schema";
import { CASH_EFFECT, type TransactionType } from "./types";

const JAKARTA = "Asia/Jakarta";

/** Tanggal (yyyy-mm-dd) di zona Asia/Jakarta, bukan zona server. */
export function jakartaDate(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: JAKARTA }).format(d);
}

function monthRange(offset = 0) {
  const today = jakartaDate();
  const [y, m] = today.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1 + offset, 1));
  const end = new Date(Date.UTC(y, m + offset, 0));
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
}

export type TransactionFilters = {
  search?: string;
  type?: TransactionType;
  categoryId?: string;
  uncategorized?: boolean;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  includeDeleted?: boolean;
};

export async function listTransactions(businessId: string, filters: TransactionFilters = {}) {
  const pageSize = Math.min(filters.pageSize ?? 20, 100);
  const page = Math.max(filters.page ?? 1, 1);
  const where = [
    eq(transactions.businessId, businessId),
    filters.includeDeleted ? undefined : isNull(transactions.deletedAt),
    filters.type ? eq(transactions.type, filters.type) : undefined,
    filters.categoryId ? eq(transactions.categoryId, filters.categoryId) : undefined,
    filters.uncategorized ? isNull(transactions.categoryId) : undefined,
    filters.from ? gte(transactions.transactionDate, filters.from) : undefined,
    filters.to ? lte(transactions.transactionDate, filters.to) : undefined,
    filters.search
      ? or(ilike(transactions.note, `%${filters.search}%`), ilike(categories.name, `%${filters.search}%`))
      : undefined,
  ].filter(Boolean);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        transactionDate: transactions.transactionDate,
        note: transactions.note,
        paymentMethod: transactions.paymentMethod,
        categoryId: transactions.categoryId,
        deletedAt: transactions.deletedAt,
        deletedReason: transactions.deletedReason,
        categoryName: categories.name,
      })
      .from(transactions)
      .leftJoin(categories, eq(categories.id, transactions.categoryId))
      .where(and(...where))
      .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ total: count() })
      .from(transactions)
      .leftJoin(categories, eq(categories.id, transactions.categoryId))
      .where(and(...where)),
  ]);

  return { rows, total, page, pageSize };
}

export async function getCategories(businessId: string) {
  return db
    .select({ id: categories.id, name: categories.name, type: categories.type })
    .from(categories)
    .where(and(eq(categories.businessId, businessId), isNull(categories.archivedAt)))
    .orderBy(asc(categories.name));
}

/** Tren pendapatan vs pengeluaran beberapa bulan terakhir (grafik beranda). */
export async function getMonthlyTrend(businessId: string, months = 6) {
  const start = monthRange(-(months - 1));
  const rows = await db
    .select({
      month: sql<string>`to_char(${transactions.transactionDate}, 'YYYY-MM')`,
      type: transactions.type,
      total: sql<number>`sum(${transactions.amount})::bigint`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.businessId, businessId),
        isNull(transactions.deletedAt),
        gte(transactions.transactionDate, start.from),
        sql`${transactions.type} in ('operational_income','operational_expense')`,
      ),
    )
    .groupBy(sql`to_char(${transactions.transactionDate}, 'YYYY-MM')`, transactions.type);

  const label = new Intl.DateTimeFormat("id-ID", { month: "short", year: "2-digit", timeZone: "UTC" });
  return Array.from({ length: months }, (_, index) => {
    const range = monthRange(-(months - 1 - index));
    const key = range.from.slice(0, 7);
    const income = rows.find((r) => r.month === key && r.type === "operational_income");
    const expense = rows.find((r) => r.month === key && r.type === "operational_expense");
    return {
      key,
      label: label.format(new Date(`${key}-01T00:00:00Z`)),
      income: Number(income?.total ?? 0),
      expense: Number(expense?.total ?? 0),
    };
  });
}

export async function getDashboard(businessId: string) {
  const current = monthRange(0);
  const previous = monthRange(-1);

  const [opening] = await db
    .select({ amount: openingBalances.amount, asOf: openingBalances.asOf })
    .from(openingBalances)
    .where(eq(openingBalances.businessId, businessId))
    .limit(1);

  // async/await, bukan `.then()` pada query builder: `.then()` mengeksekusi query,
  // dan memasukkannya ke Promise.all bisa mengeksekusi dua kali → deadlock di pool max:1.
  const periodSum = async (range: { from: string; to: string }, types: TransactionType[]) => {
    const rows = await db
      .select({ total: sql<number>`coalesce(sum(${transactions.amount}), 0)::bigint` })
      .from(transactions)
      .where(
        and(
          eq(transactions.businessId, businessId),
          isNull(transactions.deletedAt),
          gte(transactions.transactionDate, range.from),
          lte(transactions.transactionDate, range.to),
          sql`${transactions.type}::text = any(${sql.raw(`array['${types.join("','")}']`)})`,
        ),
      );
    return Number(rows[0]?.total ?? 0);
  };

  const cashExpr = sql<number>`coalesce(sum(case when ${transactions.type} in ('operational_income','capital_in','loan_in') then ${transactions.amount} else -${transactions.amount} end), 0)::bigint`;

  // Dieksekusi berurutan: pool kecil (max 1) + Promise.all besar membuat query saling
// menunggu koneksi dan request menggantung. 8 query × ~80 ms masih di bawah target p95.
  const [cashRow] = await db
    .select({ total: cashExpr })
    .from(transactions)
    .where(and(eq(transactions.businessId, businessId), isNull(transactions.deletedAt)));
  const income = await periodSum(current, ["operational_income"]);
  const expense = await periodSum(current, ["operational_expense"]);
  const prevIncome = await periodSum(previous, ["operational_income"]);
  const prevExpense = await periodSum(previous, ["operational_expense"]);
  const byCategory = await db
    .select({
      name: sql<string>`coalesce(${categories.name}, 'Tanpa kategori')`,
      type: transactions.type,
      total: sql<number>`sum(${transactions.amount})::bigint`,
    })
    .from(transactions)
    .leftJoin(categories, eq(categories.id, transactions.categoryId))
    .where(
      and(
        eq(transactions.businessId, businessId),
        isNull(transactions.deletedAt),
        gte(transactions.transactionDate, current.from),
        lte(transactions.transactionDate, current.to),
        sql`${transactions.type} in ('operational_income','operational_expense')`,
      ),
    )
    .groupBy(categories.name, transactions.type)
    .orderBy(desc(sql`sum(${transactions.amount})`));
  const recent = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      amount: transactions.amount,
      transactionDate: transactions.transactionDate,
      note: transactions.note,
      categoryName: categories.name,
    })
    .from(transactions)
    .leftJoin(categories, eq(categories.id, transactions.categoryId))
    .where(and(eq(transactions.businessId, businessId), isNull(transactions.deletedAt)))
    .orderBy(desc(transactions.createdAt))
    .limit(5);
  const [{ total: txCount }] = await db
    .select({ total: count() })
    .from(transactions)
    .where(and(eq(transactions.businessId, businessId), isNull(transactions.deletedAt)));

  const cash = Number(opening?.amount ?? 0) + Number(cashRow?.total ?? 0);

  return {
    opening: opening ?? null,
    cash,
    income,
    expense,
    prevIncome,
    prevExpense,
    byCategory: byCategory.map((r) => ({ ...r, total: Number(r.total) })),
    recent,
    txCount: Number(txCount),
    period: current,
    cashEffect: CASH_EFFECT,
  };
}