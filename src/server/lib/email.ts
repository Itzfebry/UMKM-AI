import { db } from "@/server/db";
import { notificationPrefs, notifications } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export type EmailResult = { sent: boolean; detail: string };

/**
 * Pengiriman email memakai Resend lewat HTTP bila RESEND_API_KEY diisi. Tanpa kunci,
 * email dicatat di log server supaya alur (undangan, verifikasi, reset) tetap bisa diuji.
 */
export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "UMKM-AI <onboarding@resend.dev>";
  if (!apiKey) {
    console.log(`[email] (tanpa RESEND_API_KEY) ke=${to} subjek=${subject}\n${text}`);
    return { sent: false, detail: "RESEND_API_KEY belum diisi; email hanya dicatat di log server." };
  }
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from, to, subject, text }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) return { sent: false, detail: `Resend menolak (${response.status}): ${(await response.text()).slice(0, 120)}` };
    return { sent: true, detail: "terkirim" };
  } catch (error) {
    return { sent: false, detail: error instanceof Error ? error.message : "pengiriman gagal" };
  }
}

/** Notifikasi dalam aplikasi; dedupeKey mencegah kiriman ulang (FR-NOTIF-05). */
export async function createNotification(input: {
  userId: string;
  businessId?: string | null;
  type: string;
  title: string;
  body?: string;
  dedupeKey?: string;
}) {
  await db
    .insert(notifications)
    .values({
      userId: input.userId,
      businessId: input.businessId ?? null,
      type: input.type,
      title: input.title,
      body: input.body,
      dedupeKey: input.dedupeKey,
    })
    .onConflictDoNothing();
}

/** Kirim email hanya bila pengguna belum mematikan kanal email (FR-NOTIF-01). */
export async function sendUserEmail(userId: string, message: { to: string; subject: string; text: string }) {
  const [pref] = await db.select({ emailEnabled: notificationPrefs.emailEnabled }).from(notificationPrefs).where(eq(notificationPrefs.userId, userId)).limit(1);
  if (pref && !pref.emailEnabled) return { sent: false, detail: "Pengguna mematikan kanal email." } satisfies EmailResult;
  return sendEmail(message);
}

export function appUrl(path: string) {
  const base = process.env.AUTH_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}