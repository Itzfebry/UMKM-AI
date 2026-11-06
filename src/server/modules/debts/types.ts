import type { TransactionType } from "@/server/modules/ledger/types";

export type DebtKind = "payable" | "receivable";
export type DebtStatus = "unpaid" | "partial" | "paid";

export const KIND_LABEL: Record<DebtKind, string> = { payable: "Utang", receivable: "Piutang" };
export const STATUS_LABEL: Record<DebtStatus, string> = {
  unpaid: "Belum dibayar",
  partial: "Dibayar sebagian",
  paid: "Lunas",
};

/** Pembayaran utang = uang keluar, pembayaran piutang = uang masuk. */
export const PAYMENT_TYPE: Record<DebtKind, TransactionType> = {
  payable: "operational_expense",
  receivable: "operational_income",
};