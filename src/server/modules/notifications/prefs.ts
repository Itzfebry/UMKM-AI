import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { notificationPrefs } from "@/server/db/schema";

export type NotificationPrefs = { emailEnabled: boolean; whatsappOptIn: boolean; whatsappNumber: string | null };

export async function getNotificationPrefs(userId: string): Promise<NotificationPrefs> {
  const [row] = await db.select().from(notificationPrefs).where(eq(notificationPrefs.userId, userId)).limit(1);
  return {
    emailEnabled: row?.emailEnabled ?? true,
    whatsappOptIn: row?.whatsappOptIn ?? false,
    whatsappNumber: row?.whatsappNumber ?? null,
  };
}

/** Email transaksional (verifikasi, reset) selalu dikirim; sisanya mengikuti preferensi. */
export async function emailAllowed(userId: string) {
  return (await getNotificationPrefs(userId)).emailEnabled;
}