import { getDashboard } from "@/server/modules/ledger/queries";
import { getDebtSummary } from "@/server/modules/debts/queries";
import { getReportSlice } from "@/server/modules/reports/queries";
import { monthRange } from "@/server/modules/reports/period";

export type MonthSummary = {
  label: string;
  from: string;
  to: string;
  income: number;
  expense: number;
  net: number;
  transactions: number;
  topCategories: { name: string; type: string; total: number }[];
};

/**
 * Ringkasan yang dikirim ke AI (FR-AI-03/04): angka agregat saja, bukan seluruh baris
 * transaksi. Backend yang menghitung semua nilai; AI tidak menghitung apa pun.
 */
export async function buildBusinessSummary(businessId: string, businessName: string, monthsBack = 3) {
  const ranges = Array.from({ length: monthsBack }, (_, i) => monthRange(-i)).reverse();

  const [slices, debt, dashboard] = await Promise.all([
    Promise.all(ranges.map((range) => getReportSlice(businessId, range))),
    getDebtSummary(businessId),
    getDashboard(businessId),
  ]);

  const months: MonthSummary[] = ranges.map((range, index) => {
    const slice = slices[index];
    return {
      label: range.from.slice(0, 7),
      from: range.from,
      to: range.to,
      income: slice.income,
      expense: slice.expense,
      net: slice.net,
      transactions: slice.count,
      topCategories: slice.byCategory.slice(0, 5).map((c) => ({ name: c.name, type: c.type, total: c.total })),
    };
  });

  return {
    businessName,
    months,
    cash: dashboard.cash,
    openingBalance: dashboard.opening?.amount ?? 0,
    openingAsOf: dashboard.opening?.asOf ?? null,
    totalTransactions: months.reduce((sum, m) => sum + m.transactions, 0),
    recentTransactions: dashboard.recent.map((t) => ({
      date: t.transactionDate,
      type: t.type,
      category: t.categoryName,
      amount: t.amount,
      note: t.note,
    })),
    receivables: { outstanding: debt.receivable, overdueCount: debt.overdue },
    payables: { outstanding: debt.payable },
  };
}

export type BusinessSummary = Awaited<ReturnType<typeof buildBusinessSummary>>;