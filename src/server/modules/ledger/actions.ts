"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import {
  categories,
  idempotencyKeys,
  transactionAuditLogs,
  transactions,
} from "@/server/db/schema";
import { requireBusiness, requireRole } from "@/server/lib/access";
import { assertTransactionQuota, getPlanState } from "@/server/modules/billing/plan";
import { transactionSchema } from "./schema";
import type { TransactionType } from "./types";

export type ActionState = { error?: string; ok?: boolean } | undefined;

function parse(formData: FormData) {
  return transactionSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    categoryId: formData.get("categoryId") ?? "",
    transactionDate: formData.get("transactionDate"),
    note: formData.get("note") || undefined,
    paymentMethod: formData.get("paymentMethod") || undefined,
  });
}

/** Kategori harus milik bisnis ini dan jenisnya cocok dengan jenis transaksi. */
async function assertCategory(businessId: string, categoryId: string | undefined, type: TransactionType) {
  if (!categoryId) return null;
  const [row] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        eq(categories.id, categoryId),
        eq(categories.businessId, businessId),
        eq(categories.type, type),
        isNull(categories.archivedAt),
      ),
    )
    .limit(1);
  if (!row) throw new Error("Kategori tidak ditemukan untuk jenis transaksi ini.");
  return row.id;
}

export async function createTransaction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user, business } = await requireBusiness();
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const key = String(formData.get("idempotencyKey") ?? "").slice(0, 100) || crypto.randomUUID();

  try {
    assertTransactionQuota(await getPlanState(business.id));
    const categoryId = await assertCategory(business.id, data.categoryId || undefined, data.type);

    // Idempotensi: klaim kunci dulu; klik ganda tidak membuat transaksi kedua.
    const [claim] = await db
      .insert(idempotencyKeys)
      .values({ key, businessId: business.id, scope: "transaction.create" })
      .onConflictDoNothing()
      .returning({ key: idempotencyKeys.key });
    if (!claim) return { ok: true };

    await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(transactions)
        .values({
          businessId: business.id,
          type: data.type,
          amount: data.amount,
          categoryId,
          transactionDate: data.transactionDate,
          note: data.note,
          paymentMethod: data.paymentMethod,
          createdBy: user.id,
        })
        .returning({ id: transactions.id });

      await tx.insert(transactionAuditLogs).values({
        businessId: business.id,
        transactionId: row.id,
        action: "create",
        after: { ...data, categoryId },
        actorId: user.id,
      });
      await tx
        .update(idempotencyKeys)
        .set({ response: { id: row.id } })
        .where(eq(idempotencyKeys.key, key));
    });
  } catch (error) {
    await db.delete(idempotencyKeys).where(eq(idempotencyKeys.key, key));
    return { error: error instanceof Error ? error.message : "Gagal menyimpan transaksi." };
  }

  revalidatePath("/beranda");
  revalidatePath("/transaksi");
  return { ok: true };
}

export async function updateTransaction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user, business } = await requireBusiness();
  const id = String(formData.get("id") ?? "");
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const [before] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.businessId, business.id), isNull(transactions.deletedAt)))
    .limit(1);
  if (!before) return { error: "Transaksi tidak ditemukan." };

  try {
    const categoryId = await assertCategory(business.id, data.categoryId || undefined, data.type);
    await db.transaction(async (tx) => {
      await tx
        .update(transactions)
        .set({ ...data, categoryId, updatedBy: user.id, updatedAt: new Date() })
        .where(eq(transactions.id, id));
      await tx.insert(transactionAuditLogs).values({
        businessId: business.id,
        transactionId: id,
        action: "update",
        before,
        after: { ...data, categoryId },
        actorId: user.id,
      });
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal menyimpan perubahan." };
  }

  revalidatePath("/beranda");
  revalidatePath("/transaksi");
  return { ok: true };
}

export async function softDeleteTransaction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user, business } = await requireBusiness();
  await requireRole(business.id, user.id, ["owner", "admin"]);

  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 3) return { error: "Alasan penghapusan wajib diisi." };

  const [before] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.businessId, business.id), isNull(transactions.deletedAt)))
    .limit(1);
  if (!before) return { error: "Transaksi tidak ditemukan." };

  await db.transaction(async (tx) => {
    await tx
      .update(transactions)
      .set({ deletedAt: new Date(), deletedReason: reason, updatedBy: user.id })
      .where(eq(transactions.id, id));
    await tx.insert(transactionAuditLogs).values({
      businessId: business.id,
      transactionId: id,
      action: "delete",
      before,
      reason,
      actorId: user.id,
    });
  });

  revalidatePath("/beranda");
  revalidatePath("/transaksi");
  return { ok: true };
}

export async function restoreTransaction(id: string): Promise<ActionState> {
  const { user, business } = await requireBusiness();
  await requireRole(business.id, user.id, ["owner", "admin"]);

  const [before] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.businessId, business.id)))
    .limit(1);
  if (!before?.deletedAt) return { error: "Transaksi tidak ditemukan atau belum dihapus." };

  await db.transaction(async (tx) => {
    await tx
      .update(transactions)
      .set({ deletedAt: null, deletedReason: null, updatedBy: user.id, updatedAt: new Date() })
      .where(eq(transactions.id, id));
    await tx.insert(transactionAuditLogs).values({
      businessId: business.id,
      transactionId: id,
      action: "restore",
      before,
      actorId: user.id,
    });
  });

  revalidatePath("/beranda");
  revalidatePath("/transaksi");
  return { ok: true };
}