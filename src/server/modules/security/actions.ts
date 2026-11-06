"use server";

import { verify } from "@node-rs/argon2";
import { eq, lt } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/admin-auth";
import { db } from "@/server/db";
import { auditEvents, businesses, memberships, platformAdmins, users } from "@/server/db/schema";
import { requireBusiness, requireRole } from "@/server/lib/access";
import { createNotification } from "@/server/lib/email";

export type SecurityState = { error?: string; ok?: boolean; info?: string } | undefined;

/** Cek status admin lewat database (tidak butuh sesi panel) untuk menampilkan tautan. */
export async function isPlatformAdmin(userId: string) {
  const [row] = await db.select({ userId: platformAdmins.userId }).from(platformAdmins).where(eq(platformAdmins.userId, userId)).limit(1);
  return Boolean(row);
}

/** Aksi panel memakai sesi admin yang terpisah dari sesi pengguna aplikasi. */
export async function requirePlatformAdmin() {
  const admin = await requireAdminSession();
  if (!admin) throw new Error("Sesi panel platform tidak ditemukan atau akun bukan admin platform.");
  return admin;
}

/** FR-DATA-01..03: hapus permanen setelah autentikasi ulang dan konfirmasi eksplisit. */
export async function deleteBusiness(_prev: SecurityState, formData: FormData): Promise<SecurityState> {
  const { user, business } = await requireBusiness();
  try {
    await requireRole(business.id, user.id, ["owner"]);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Tidak punya izin." };
  }

  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "").trim();
  if (confirmation !== business.name) return { error: "Ketik ulang nama usaha dengan tepat untuk konfirmasi." };

  const [me] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, user.id)).limit(1);
  if (!me?.passwordHash || !(await verify(me.passwordHash, password))) return { error: "Kata sandi salah." };

  const members = await db
    .select({ userId: memberships.userId })
    .from(memberships)
    .where(eq(memberships.businessId, business.id));

  // Anggota diberi tahu sebelum akses dicabut (FR-DATA-02); notifikasi tidak lagi menempel ke bisnis.
  for (const member of members) {
    await createNotification({
      userId: member.userId,
      type: "business_deleted",
      title: `Bisnis ${business.name} dihapus permanen`,
      body: "Akses ke data bisnis ini sudah dicabut oleh pemilik.",
    });
  }

  await db.insert(auditEvents).values({
    actorId: user.id,
    type: "security",
    metadata: { action: "delete_business", businessName: business.name, businessId: business.id, members: members.length },
  });
  await db.delete(businesses).where(eq(businesses.id, business.id));

  redirect("/onboarding");
}

/** Retensi audit keamanan 90 hari (8.2); riwayat transaksi tidak ikut terhapus. */
export async function purgeOldAuditEvents() {
  await requirePlatformAdmin();
  const cutoff = new Date(Date.now() - 90 * 86_400_000);
  const deleted = await db.delete(auditEvents).where(lt(auditEvents.createdAt, cutoff)).returning({ id: auditEvents.id });
  await db.insert(auditEvents).values({
    type: "security",
    metadata: { action: "purge_audit_events", removed: deleted.length, cutoff: cutoff.toISOString() },
  });
  revalidatePath("/panel");
}

/** Menjalankan tugas terjadwal manual dari panel platform (tanpa menunggu cron). */
export async function runMaintenanceNow() {
  await requirePlatformAdmin();
  const { runScheduledMaintenance } = await import("@/server/modules/billing/maintenance");
  const result = await runScheduledMaintenance();
  revalidatePath("/panel");
  revalidatePath("/notifikasi");
  console.log("[cron] tugas manual dijalankan", result);
}