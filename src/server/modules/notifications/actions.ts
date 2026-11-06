"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { notificationPrefs, notifications } from "@/server/db/schema";
import { requireUser } from "@/server/lib/access";

export type PrefsState = { error?: string; ok?: boolean; info?: string } | undefined;

export async function markNotificationRead(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));
  revalidatePath("/notifikasi");
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));
  revalidatePath("/notifikasi");
}

/** FR-NOTIF-01/02: pengguna mengatur kanal; WhatsApp butuh persetujuan eksplisit. */
export async function updateNotificationPrefs(_prev: PrefsState, formData: FormData): Promise<PrefsState> {
  const user = await requireUser();
  const emailEnabled = formData.get("emailEnabled") === "on";
  const whatsappOptIn = formData.get("whatsappOptIn") === "on";
  const whatsappNumber = String(formData.get("whatsappNumber") ?? "").trim() || null;

  if (whatsappOptIn && !whatsappNumber) {
    return { error: "Isi nomor WhatsApp bila menyetujui kanal WhatsApp." };
  }
  if (whatsappNumber && !/^[+0-9\s-]{8,20}$/.test(whatsappNumber)) {
    return { error: "Nomor WhatsApp tidak valid." };
  }

  await db
    .insert(notificationPrefs)
    .values({ userId: user.id, emailEnabled, whatsappOptIn, whatsappNumber })
    .onConflictDoUpdate({
      target: notificationPrefs.userId,
      set: { emailEnabled, whatsappOptIn, whatsappNumber, updatedAt: new Date() },
    });

  revalidatePath("/pengaturan");
  return {
    ok: true,
    info: whatsappOptIn
      ? "Preferensi disimpan. Kanal WhatsApp belum aktif pada versi ini; nomor hanya disimpan untuk persiapan."
      : "Preferensi notifikasi disimpan.",
  };
}