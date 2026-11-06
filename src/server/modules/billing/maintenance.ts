import { and, eq, inArray, isNull, lt, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { auditEvents, businesses, invoices, paymentProofs, subscriptions, transactions } from "@/server/db/schema";
import { ensureDailyInsight } from "@/server/modules/ai/insight";
import { createNotification, sendUserEmail } from "@/server/lib/email";
import { businessOwnerAndAdmins } from "./queries";

const DAY = 86_400_000;
const GRACE_DAYS = 7;
const REMINDER_DAYS = 3;

export type SweepResult = {
  expiredInvoices: number;
  manualReview: number;
  proEnded: number
  reminders: number;
  auditPurged: number;
  insightsCreated: number;
};

/**
 * Tugas terjadwal (tanpa worker terpisah): dipanggil dari /api/cron/notifications.
 * Semua langkah idempoten supaya aman dijalankan berulang.
 */
export async function runScheduledMaintenance(): Promise<SweepResult> {
  const now = new Date();
  const result: SweepResult = { expiredInvoices: 0, manualReview: 0, proEnded: 0, reminders: 0, auditPurged: 0, insightsCreated: 0 };

  // 1. Invoice kedaluwarsa. Bila bukti sudah diunggah, masuk pemeriksaan manual (FR-SUB-12).
  const stale = await db
    .update(invoices)
    .set({ status: "expired" })
    .where(and(eq(invoices.status, "pending"), lt(invoices.expiresAt, now)))
    .returning({ id: invoices.id, businessId: invoices.businessId, number: invoices.number });
  result.expiredInvoices = stale.length;

  for (const invoice of stale) {
    const [proof] = await db
      .select({ id: paymentProofs.id })
      .from(paymentProofs)
      .where(eq(paymentProofs.invoiceId, invoice.id))
      .limit(1);
    if (proof) {
      await db.update(invoices).set({ status: "manual_review" }).where(eq(invoices.id, invoice.id));
      result.manualReview += 1;
    }
  }

  // 2. Masa tenggang habis → kembali ke Free (FR-SUB-18). Data tidak dihapus.
  const ended = await db
    .update(subscriptions)
    .set({ plan: "free", status: "free", graceUntil: null, updatedAt: now })
    .where(
      and(
        sql`${subscriptions.plan} = 'pro'`,
        lt(subscriptions.currentPeriodEnd, new Date(now.getTime() - GRACE_DAYS * DAY)),
      ),
    )
    .returning({ businessId: subscriptions.businessId });
  result.proEnded = ended.length;

  for (const row of ended) {
    for (const member of await businessOwnerAndAdmins(row.businessId)) {
      await createNotification({
        userId: member.userId,
        businessId: row.businessId,
        type: "subscription_ended",
        title: "Paket Pro berakhir, akun kembali ke Free",
        body: "Data historis tetap bisa dibaca. Buat invoice baru untuk memperpanjang.",
        dedupeKey: `subscription_ended:${row.businessId}:${now.toISOString().slice(0, 10)}`,
      });
    }
  }

  // 3. Pengingat Pro tiga hari sebelum berakhir, sekali per periode (FR-NOTIF-03/04).
  const soon = await db
    .select({
      businessId: subscriptions.businessId,
      periodEnd: subscriptions.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
    })
    .from(subscriptions)
    .where(
      and(
        sql`${subscriptions.plan} = 'pro'`,
        eq(subscriptions.cancelAtPeriodEnd, false),
        lt(subscriptions.currentPeriodEnd, new Date(now.getTime() + REMINDER_DAYS * DAY)),
        sql`${subscriptions.currentPeriodEnd} > now()`,
      ),
    );

  for (const row of soon) {
    const periodKey = row.periodEnd?.toISOString().slice(0, 10) ?? "tanpa-tanggal";
    // Dedup lewat kunci per periode; status diperiksa ulang tepat sebelum kirim (FR-NOTIF-04).
    const [stillPro] = await db
      .select({ plan: subscriptions.plan, status: subscriptions.status })
      .from(subscriptions)
      .where(eq(subscriptions.businessId, row.businessId))
      .limit(1);
    if (stillPro?.plan !== "pro") continue;

    for (const member of await businessOwnerAndAdmins(row.businessId)) {
      await createNotification({
        userId: member.userId,
        businessId: row.businessId,
        type: "subscription_expiring",
        title: `Paket Pro berakhir ${periodKey}`,
        body: "Buat invoice perpanjangan sebelum tanggal itu agar fitur Pro tidak terputus.",
        dedupeKey: `subscription_expiring:${row.businessId}:${periodKey}`,
      });
      if (member.role === "owner") {
        await sendUserEmail(member.userId, {
          to: member.email,
          subject: `Paket Pro berakhir ${periodKey}`,
          text: `Paket Pro untuk usaha Anda berakhir ${periodKey}. Buat invoice perpanjangan di halaman Langganan sebelum tanggal itu agar fitur Pro tidak terputus.`,
        });
      }
    }
    result.reminders += 1;
  }

  // 4. Analisis otomatis harian (tanpa perintah pengguna): satu insight per usaha per hari.
  //    Kuota AI dan jumlah transaksi diperiksa di dalam ensureDailyInsight.
  const active = await db
    .selectDistinct({ id: businesses.id, name: businesses.name })
    .from(businesses)
    .innerJoin(transactions, and(eq(transactions.businessId, businesses.id), isNull(transactions.deletedAt)))
    .limit(20);
  for (const business of active) {
    try {
      if ((await ensureDailyInsight(business)) === "dibuat") result.insightsCreated += 1;
    } catch (error) {
      // Satu usaha gagal tidak boleh menghentikan sisanya.
      console.error("[cron] insight otomatis gagal", business.id, error);
    }
  }

  // 5. Retensi audit keamanan 90 hari (8.2).
  const purged = await db
    .delete(auditEvents)
    .where(lt(auditEvents.createdAt, new Date(now.getTime() - 90 * DAY)))
    .returning({ id: auditEvents.id });
  result.auditPurged = purged.length;

  await db.insert(auditEvents).values({
    type: "security",
    metadata: { action: "scheduled_maintenance", ...result, at: now.toISOString() },
  });

  return result;
}

/** Dipakai halaman admin untuk menampilkan invoice yang perlu ditengok. */
export async function countInvoicesNeedingAttention() {
  const rows = await db
    .select({ id: invoices.id })
    .from(invoices)
    .where(inArray(invoices.status, ["pending", "manual_review"]));
  return rows.length;
}