import { and, desc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { debtAuditLogs, debts, transactionAuditLogs, transactions, users } from "@/server/db/schema";

/** Riwayat perubahan transaksi (FR-MEM-04) — anggota melihat catatan yang bisa mereka akses. */
export async function listTransactionAudit(businessId: string, limit = 50) {
  return db
    .select({
      id: transactionAuditLogs.id,
      action: transactionAuditLogs.action,
      createdAt: transactionAuditLogs.createdAt,
      reason: transactionAuditLogs.reason,
      before: transactionAuditLogs.before,
      after: transactionAuditLogs.after,
      actor: users.email,
      note: transactions.note,
      amount: transactions.amount,
      transactionDate: transactions.transactionDate,
      type: transactions.type,
    })
    .from(transactionAuditLogs)
    .leftJoin(transactions, eq(transactions.id, transactionAuditLogs.transactionId))
    .leftJoin(users, eq(users.id, transactionAuditLogs.actorId))
    .where(eq(transactionAuditLogs.businessId, businessId))
    .orderBy(desc(transactionAuditLogs.createdAt))
    .limit(limit);
}

export async function listDebtAudit(businessId: string, limit = 30) {
  return db
    .select({
      id: debtAuditLogs.id,
      action: debtAuditLogs.action,
      createdAt: debtAuditLogs.createdAt,
      reason: debtAuditLogs.reason,
      before: debtAuditLogs.before,
      after: debtAuditLogs.after,
      actor: users.email,
      counterparty: debts.counterparty,
      amount: debts.amount,
    })
    .from(debtAuditLogs)
    .leftJoin(debts, eq(debts.id, debtAuditLogs.debtId))
    .leftJoin(users, eq(users.id, debtAuditLogs.actorId))
    .where(and(eq(debtAuditLogs.businessId, businessId)))
    .orderBy(desc(debtAuditLogs.createdAt))
    .limit(limit);
}