"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import {
  debtAuditLogs,
  debts,
  idempotencyKeys,
  transactionAuditLogs,
  transactions,
} from "@/server/db/schema";
import { requireRole, requireWritableBusiness } from "@/server/lib/access";
import { debtPaymentSchema, debtSchema } from "./schema";
import { PAYMENT_TYPE } from "./types";

export type DebtActionState = { error?: string; ok?: boolean } | undefined;

const PATHS = ["/beranda", "/transaksi", "/utang-piutang"] as const;
const refresh = () => PATHS.forEach((p) => revalidatePath(p));

/** Klaim kunci idempotensi; false berarti permintaan ini duplikat dan dilewati. */
async function claimKey(businessId: string, scope: string, formData: FormData) {
  const key = String(formData.get("idempotencyKey") ?? "").slice(0, 100) || crypto.randomUUID();
  const [claim] = await db
    .insert(idempotencyKeys)
    .values({ key, businessId, scope })
    .onConflictDoNothing()
    .returning({ key: idempotencyKeys.key });
  return { key, claim: Boolean(claim) };
}

export async function createDebt(_prev: DebtActionState, formData: FormData): Promise<DebtActionState> {
  const { user, business } = await requireWritableBusiness();
  const parsed = debtSchema.safeParse({
    kind: formData.get("kind"),
    counterparty: formData.get("counterparty"),
    amount: formData.get("amount"),
    transactionDate: formData.get("transactionDate"),
    dueDate: formData.get("dueDate") || "",
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const { key, claim } = await claimKey(business.id, "debt.create", formData);
  if (!claim) return { ok: true };

  try {
    await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(debts)
        .values({
          businessId: business.id,
          kind: data.kind,
          counterparty: data.counterparty,
          amount: data.amount,
          transactionDate: data.transactionDate,
          dueDate: data.dueDate || null,
          note: data.note,
          createdBy: user.id,
        })
        .returning({ id: debts.id });
      await tx.insert(debtAuditLogs).values({
        businessId: business.id,
        debtId: row.id,
        action: "create",
        after: data,
        actorId: user.id,
      });
      await tx.update(idempotencyKeys).set({ response: { id: row.id } }).where(eq(idempotencyKeys.key, key));
    });
  } catch (error) {
    await db.delete(idempotencyKeys).where(eq(idempotencyKeys.key, key));
    return { error: error instanceof Error ? error.message : "Gagal menyimpan utang/piutang." };
  }

  refresh();
  return { ok: true };
}

export async function recordDebtPayment(_prev: DebtActionState, formData: FormData): Promise<DebtActionState> {
  const { user, business } = await requireWritableBusiness();
  const parsed = debtPaymentSchema.safeParse({
    debtId: formData.get("debtId"),
    amount: formData.get("amount"),
    paidAt: formData.get("paidAt"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const { key, claim } = await claimKey(business.id, "debt.payment", formData);
  if (!claim) return { ok: true };

  try {
    await db.transaction(async (tx) => {
      const [debt] = await tx
        .select()
        .from(debts)
        .where(and(eq(debts.id, data.debtId), eq(debts.businessId, business.id), isNull(debts.deletedAt)))
        .for("update");
      if (!debt) throw new Error("Utang/piutang tidak ditemukan.");

      const [paidRow] = await tx
        .select({ paid: sql<number>`coalesce(sum(${transactions.amount}), 0)::bigint` })
        .from(transactions)
        .where(and(eq(transactions.debtId, debt.id), isNull(transactions.deletedAt)));
      const remaining = Number(debt.amount) - Number(paidRow?.paid ?? 0);
      if (data.amount > remaining) {
        // FR-ARAP-06: tidak ada alur overpay; koreksi lewat hapus transaksi pembayaran.
        throw new Error(`Pembayaran melebihi sisa Rp${remaining.toLocaleString("id-ID")}.`);
      }

      const [txRow] = await tx
        .insert(transactions)
        .values({
          businessId: business.id,
          debtId: debt.id,
          type: PAYMENT_TYPE[debt.kind],
          amount: data.amount,
          transactionDate: data.paidAt,
          note: data.note || `${debt.kind === "payable" ? "Bayar utang" : "Terima piutang"}: ${debt.counterparty}`,
          createdBy: user.id,
        })
        .returning({ id: transactions.id });
      await tx.insert(transactionAuditLogs).values({
        businessId: business.id,
        transactionId: txRow.id,
        action: "create",
        after: { ...data },
        actorId: user.id,
      });
      await tx.insert(debtAuditLogs).values({
        businessId: business.id,
        debtId: debt.id,
        action: "update",
        before: { paid: Number(paidRow?.paid ?? 0) },
        after: { paid: Number(paidRow?.paid ?? 0) + data.amount, transactionId: txRow.id },
        actorId: user.id,
      });
      await tx.update(idempotencyKeys).set({ response: { id: txRow.id } }).where(eq(idempotencyKeys.key, key));
    });
  } catch (error) {
    await db.delete(idempotencyKeys).where(eq(idempotencyKeys.key, key));
    return { error: error instanceof Error ? error.message : "Gagal mencatat pembayaran." };
  }

  refresh();
  return { ok: true };
}

export async function restoreDebt(_prev: DebtActionState, formData: FormData): Promise<DebtActionState> {
  const { user, business } = await requireWritableBusiness();
  await requireRole(business.id, user.id, ["owner", "admin"]);

  const id = String(formData.get("id") ?? "");
  const [before] = await db
    .select()
    .from(debts)
    .where(and(eq(debts.id, id), eq(debts.businessId, business.id)))
    .limit(1);
  if (!before?.deletedAt) return { error: "Catatan tidak ditemukan atau belum dihapus." };

  await db.transaction(async (tx) => {
    await tx
      .update(debts)
      .set({ deletedAt: null, deletedReason: null, updatedAt: new Date() })
      .where(eq(debts.id, id));
    await tx.insert(debtAuditLogs).values({
      businessId: business.id,
      debtId: id,
      action: "restore",
      before,
      actorId: user.id,
    });
  });

  refresh();
  return { ok: true };
}

export async function softDeleteDebt(_prev: DebtActionState, formData: FormData): Promise<DebtActionState> {
  const { user, business } = await requireWritableBusiness();
  await requireRole(business.id, user.id, ["owner", "admin"]);

  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 3) return { error: "Alasan penghapusan wajib diisi." };

  const [before] = await db
    .select()
    .from(debts)
    .where(and(eq(debts.id, id), eq(debts.businessId, business.id), isNull(debts.deletedAt)))
    .limit(1);
  if (!before) return { error: "Utang/piutang tidak ditemukan." };

  // Pembayaran yang sudah tercatat tetap di ledger: uangnya benar-benar berpindah.
  await db.transaction(async (tx) => {
    await tx
      .update(debts)
      .set({ deletedAt: new Date(), deletedReason: reason, updatedAt: new Date() })
      .where(eq(debts.id, id));
    await tx.insert(debtAuditLogs).values({
      businessId: business.id,
      debtId: id,
      action: "delete",
      before,
      reason,
      actorId: user.id,
    });
  });

  refresh();
  return { ok: true };
}