"use server";

import { and, count, eq, gt, isNull, lt } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { auditEvents, invoices, paymentProofs, subscriptions } from "@/server/db/schema";
import { requireBusiness, requireRole } from "@/server/lib/access";
import { createNotification } from "@/server/lib/email";
import { storageConfigured, uploadPrivateFile } from "@/server/lib/storage";
import { requirePlatformAdmin } from "@/server/modules/security/actions";
import { businessOwnerAndAdmins } from "./queries";
import { PRICE_PRO } from "./plan";

export type BillingState = { error?: string; ok?: boolean; info?: string } | undefined;

const INVOICE_VALID_DAYS = 3;
const MAX_PROOFS = 3;

/** FR-SUB-01/11: invoice langganan berlaku tiga hari kalender. */
export async function createInvoice(_prev: BillingState, _formData: FormData): Promise<BillingState> {
  const { user, business } = await requireBusiness();
  try {
    await requireRole(business.id, user.id, ["owner", "admin"]);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Tidak punya izin." };
  }

  const [pending] = await db
    .select({ id: invoices.id })
    .from(invoices)
    .where(and(eq(invoices.businessId, business.id), eq(invoices.status, "pending"), gt(invoices.expiresAt, new Date())))
    .limit(1);
  if (pending) return { error: "Masih ada invoice aktif. Gunakan invoice itu atau tunggu sampai kedaluwarsa." };

  const number = `INV-${new Date().toISOString().slice(0, 7).replace("-", "")}-${randomUUID().slice(0, 6).toUpperCase()}`;
  await db.insert(invoices).values({
    businessId: business.id,
    number,
    plan: "pro",
    amount: PRICE_PRO,
    expiresAt: new Date(Date.now() + INVOICE_VALID_DAYS * 86_400_000),
    createdBy: user.id,
  });
  await db.insert(auditEvents).values({
    businessId: business.id,
    actorId: user.id,
    type: "subscription",
    metadata: { action: "create_invoice", number, amount: PRICE_PRO },
  });

  revalidatePath("/langganan");
  return { ok: true, info: `Invoice ${number} dibuat. Bayar Rp${PRICE_PRO.toLocaleString("id-ID")} lalu unggah bukti.` };
}

/** FR-SUB-03/09/10/22: bukti privat, unggah ulang maksimal 3 kali selama invoice berlaku. */
export async function uploadProof(_prev: BillingState, formData: FormData): Promise<BillingState> {
  const { user, business } = await requireBusiness();
  const invoiceId = String(formData.get("invoiceId") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const file = formData.get("file");

  const [invoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.businessId, business.id)))
    .limit(1);
  if (!invoice) return { error: "Invoice tidak ditemukan." };
  if (invoice.status === "paid") return { error: "Bukti yang sudah diverifikasi tidak bisa diganti." };
  if (invoice.expiresAt.getTime() < Date.now()) return { error: "Invoice sudah kedaluwarsa. Buat invoice baru." };
  if (note.length < 10) return { error: "Isi keterangan pembayaran minimal 10 karakter (tanggal, jam, pengirim)." };

  const [used] = await db.select({ total: count() }).from(paymentProofs).where(eq(paymentProofs.invoiceId, invoiceId));
  if (Number(used?.total ?? 0) >= MAX_PROOFS) return { error: "Batas unggah ulang untuk invoice ini sudah tercapai." };

  let objectPath: string | null = null;
  const hasFile = file instanceof File && file.size > 0;
  if (hasFile) {
    if (file.size > 5_000_000) return { error: "Ukuran berkas maksimal 5 MB." };
    if (!storageConfigured()) {
      return { error: "Storage privat belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY, atau kirim bukti tanpa berkas." };
    }
    objectPath = await uploadPrivateFile(
      `subscription/${business.id}/${invoice.id}/${randomUUID()}-${file.name.replace(/[^\w.-]/g, "_").slice(0, 60)}`,
      await file.arrayBuffer(),
      file.type || "application/octet-stream",
    );
  }

  await db.insert(paymentProofs).values({ invoiceId: invoice.id, objectPath, note, uploadedBy: user.id });
  if (invoice.status === "rejected") {
    await db.update(invoices).set({ status: "pending", rejectReason: null }).where(eq(invoices.id, invoice.id));
  }
  await db.insert(auditEvents).values({
    businessId: business.id,
    actorId: user.id,
    type: "subscription",
    metadata: { action: "upload_proof", invoice: invoice.number, withFile: hasFile },
  });

  revalidatePath("/langganan");
  return { ok: true, info: "Bukti diterima. Verifikasi manual maksimal 2 jam pada jam operasional (09.00–17.00 WIB)." };
}

/** FR-SUB-15: pembatalan menghentikan perpanjangan, akses Pro tetap sampai akhir periode. */
export async function cancelSubscription() {
  const { user, business } = await requireBusiness();
  await requireRole(business.id, user.id, ["owner"]);
  await db
    .update(subscriptions)
    .set({ cancelAtPeriodEnd: true, status: "cancel_at_period_end", updatedAt: new Date() })
    .where(eq(subscriptions.businessId, business.id));
  await db.insert(auditEvents).values({
    businessId: business.id,
    actorId: user.id,
    type: "subscription",
    metadata: { action: "cancel_at_period_end" },
  });
  revalidatePath("/langganan");
}

/** FR-SUB-19: verifikasi mengaktifkan langganan secara idempoten. */
export async function verifyInvoice(_prev: BillingState, formData: FormData): Promise<BillingState> {
  const id = String(formData.get("id") ?? "");
  try {
    const admin = await requirePlatformAdmin();
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
    if (!invoice) return { error: "Invoice tidak ditemukan." };
    if (invoice.status === "paid") return { ok: true, info: "Invoice ini sudah dibayar." };

  const now = new Date();
  const [current] = await db.select().from(subscriptions).where(eq(subscriptions.businessId, invoice.businessId)).limit(1);
  const base = current?.currentPeriodEnd && current.currentPeriodEnd > now ? current.currentPeriodEnd : now;
  const periodEnd = new Date(base.getTime() + 30 * 86_400_000);

  await db.transaction(async (tx) => {
    await tx
      .update(invoices)
      .set({ status: "paid", decidedBy: admin.id, decidedAt: now })
      .where(and(eq(invoices.id, invoice.id), eq(invoices.status, "pending")));
    await tx
      .insert(subscriptions)
      .values({ businessId: invoice.businessId, plan: "pro", status: "active", currentPeriodEnd: periodEnd })
      .onConflictDoUpdate({
        target: subscriptions.businessId,
        set: { plan: "pro", status: "active", currentPeriodEnd: periodEnd, cancelAtPeriodEnd: false, graceUntil: null, updatedAt: now },
      });
    await tx.insert(auditEvents).values({
      businessId: invoice.businessId,
      actorId: admin.id,
      type: "payment_verification",
      metadata: { action: "approve", invoice: invoice.number, amount: invoice.amount, periodEnd: periodEnd.toISOString() },
    });
  });

  for (const member of await businessOwnerAndAdmins(invoice.businessId)) {
    await createNotification({
      userId: member.userId,
      businessId: invoice.businessId,
      type: "subscription_active",
      title: "Pembayaran diverifikasi, paket Pro aktif",
      body: `Invoice ${invoice.number} diterima. Aktif sampai ${periodEnd.toISOString().slice(0, 10)}.`,
      dedupeKey: `subscription_active:${invoice.id}`,
    });
  }
  revalidatePath("/panel");
    revalidatePath("/langganan");
    return { ok: true, info: `Invoice ${invoice.number} diverifikasi. Pro aktif sampai ${periodEnd.toISOString().slice(0, 10)}.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Verifikasi gagal." };
  }
}

/** FR-SUB-08: keputusan dicatat lengkap dengan alasan penolakan. */
export async function rejectInvoice(_prev: BillingState, formData: FormData): Promise<BillingState> {
  const id = String(formData.get("id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (reason.length < 5) return { error: "Alasan penolakan wajib diisi (minimal 5 karakter)." };

  try {
    const admin = await requirePlatformAdmin();
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
    if (!invoice) return { error: "Invoice tidak ditemukan." };

    await db
      .update(invoices)
      .set({ status: "rejected", rejectReason: reason, decidedBy: admin.id, decidedAt: new Date() })
      .where(eq(invoices.id, invoice.id));
    await db.insert(auditEvents).values({
      businessId: invoice.businessId,
      actorId: admin.id,
      type: "payment_verification",
      metadata: { action: "reject", invoice: invoice.number, reason },
    });

    for (const member of await businessOwnerAndAdmins(invoice.businessId)) {
      await createNotification({
        userId: member.userId,
        businessId: invoice.businessId,
        type: "subscription_rejected",
        title: `Bukti pembayaran ${invoice.number} ditolak`,
        body: reason,
        dedupeKey: `subscription_rejected:${invoice.id}:${Date.now()}`,
      });
    }
    revalidatePath("/panel");
    revalidatePath("/langganan");
    return { ok: true, info: `Invoice ${invoice.number} ditolak.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Penolakan gagal." };
  }
}

/** FR-SUB-12: invoice kedaluwarsa tanpa keputusan. Bila dana sudah masuk, masuk pemeriksaan manual. */
export async function expireStaleInvoices() {
  await requirePlatformAdmin();
  const stale = await db
    .update(invoices)
    .set({ status: "expired" })
    .where(and(eq(invoices.status, "pending"), lt(invoices.expiresAt, new Date())))
    .returning({ id: invoices.id, number: invoices.number, businessId: invoices.businessId });

  for (const invoice of stale) {
    const [proof] = await db
      .select({ id: paymentProofs.id })
      .from(paymentProofs)
      .where(and(eq(paymentProofs.invoiceId, invoice.id), isNull(paymentProofs.objectPath)))
      .limit(1);
    if (proof) {
      await db.update(invoices).set({ status: "manual_review" }).where(eq(invoices.id, invoice.id));
    }
  }
}