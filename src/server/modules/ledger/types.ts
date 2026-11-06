import type { transactionTypeEnum } from "@/server/db/schema";

export type TransactionType = (typeof transactionTypeEnum.enumValues)[number];

/** +1 menambah kas, -1 mengurangi. Modal & pinjaman masuk bukan pendapatan operasional. */
export const CASH_EFFECT: Record<TransactionType, 1 | -1> = {
  operational_income: 1,
  operational_expense: -1,
  capital_in: 1,
  owner_draw: -1,
  loan_in: 1,
  loan_repayment: -1,
};

export const TYPE_LABEL: Record<TransactionType, string> = {
  operational_income: "Pendapatan",
  operational_expense: "Pengeluaran",
  capital_in: "Setoran modal",
  owner_draw: "Penarikan pribadi",
  loan_in: "Pinjaman masuk",
  loan_repayment: "Bayar pinjaman",
};