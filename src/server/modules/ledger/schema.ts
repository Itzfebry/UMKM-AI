import { z } from "zod";
import { CASH_EFFECT, type TransactionType } from "./types";

export const transactionSchema = z.object({
  type: z.enum([
    "operational_income",
    "operational_expense",
    "capital_in",
    "owner_draw",
    "loan_in",
    "loan_repayment",
  ]),
  amount: z.coerce
    .number()
    .int("Nominal harus bilangan bulat rupiah.")
    .positive("Nominal harus lebih dari 0.")
    .max(1_000_000_000_000),
  categoryId: z.string().uuid("Kategori tidak valid.").optional().or(z.literal("")),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid."),
  note: z.string().trim().max(500).optional(),
  paymentMethod: z.string().trim().max(40).optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

/** Efek kas: +1 menambah, -1 mengurangi. Modal & pinjaman masuk bukan pendapatan. */
export function cashEffect(type: TransactionType, amount: number) {
  return CASH_EFFECT[type] * amount;
}