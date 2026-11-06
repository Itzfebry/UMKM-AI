import { z } from "zod";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid.");
const amount = z.coerce
  .number()
  .int("Nominal harus bilangan bulat rupiah.")
  .positive("Nominal harus lebih dari 0.")
  .max(1_000_000_000_000);

export const debtSchema = z.object({
  kind: z.enum(["payable", "receivable"]),
  counterparty: z.string().trim().min(2, "Nama pihak minimal 2 karakter.").max(120),
  amount,
  transactionDate: date,
  dueDate: date.optional().or(z.literal("")),
  note: z.string().trim().max(500).optional(),
});

export const debtPaymentSchema = z.object({
  debtId: z.string().uuid("Utang/piutang tidak valid."),
  amount,
  paidAt: date,
  note: z.string().trim().max(500).optional(),
});