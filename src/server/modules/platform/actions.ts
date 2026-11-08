"use server";

import { verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { AuthError } from "next-auth";
import { adminSignIn, adminSignOut, requireAdminSession } from "@/admin-auth";
import { db } from "@/server/db";
import { auditEvents, loginAttempts, platformAdmins, users } from "@/server/db/schema";
import { LOGIN_WINDOW_MINUTES, MAX_FAILURES, recentFailures } from "@/server/lib/login-throttle";
import { generateTotpSecret, otpauthUrl, verifyTotp } from "@/server/lib/totp";
import { toDataURL } from "qrcode";

export type AdminLoginState = { error?: string } | undefined;
export type AdminState = { error?: string; ok?: boolean; info?: string; otpauth?: string; qr?: string } | undefined;

export async function adminLogin(_prev: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const store = await headers();
  const ip = store.get("x-forwarded-for")?.split(",")[0]?.trim() ?? store.get("x-real-ip") ?? null;

  // Panel tidak punya sesi pengguna sebagai batas kedua, jadi percobaan gagal dibatasi di sini.
  if (email && (await recentFailures(email)) >= MAX_FAILURES) {
    return { error: `Terlalu banyak percobaan gagal. Coba lagi setelah ${LOGIN_WINDOW_MINUTES} menit.` };
  }

  try {
    await adminSignIn("credentials", {
      email,
      password: String(formData.get("password") ?? ""),
      code: String(formData.get("code") ?? ""),
      redirectTo: "/panel",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      await db.insert(loginAttempts).values({ email, ip, success: false });
      await db.insert(auditEvents).values({ type: "login", metadata: { email, ip, success: false, scope: "platform_admin", reason: error.type } });
      return { error: "Email, kata sandi, atau kode MFA salah. Akun juga harus terdaftar sebagai admin platform." };
    }
    throw error; // redirect Next.js juga dilempar sebagai error
  }
}

export async function adminLogout() {
  await adminSignOut({ redirectTo: "/panel/masuk" });
}

/** MFA self-service admin (FR 8.1). Semua aksi memakai sesi panel, bukan sesi pengguna. */
export async function startMfaEnrollment(): Promise<AdminState> {
  const admin = await requireAdminSession();
  if (!admin) return { error: "Sesi panel berakhir. Masuk lagi." };

  const secret = generateTotpSecret();
  await db
    .insert(platformAdmins)
    .values({ userId: admin.id, mfaSecret: secret, mfaEnabled: false })
    .onConflictDoUpdate({ target: platformAdmins.userId, set: { mfaSecret: secret, mfaEnabled: false } });

  revalidatePath("/panel");
  const otpauth = otpauthUrl(secret, admin.email ?? admin.id);
  // QR digambar di server: secret tidak boleh dikirim ke layanan pihak ketiga.
  return { otpauth, qr: await toDataURL(otpauth, { margin: 1, width: 224 }) };
}

export async function enableMfa(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const admin = await requireAdminSession();
  if (!admin) return { error: "Sesi panel berakhir. Masuk lagi." };

  const code = String(formData.get("code") ?? "");
  const [row] = await db.select().from(platformAdmins).where(eq(platformAdmins.userId, admin.id)).limit(1);
  if (!row?.mfaSecret) return { error: "Mulai pendaftaran MFA dulu." };
  if (!verifyTotp(row.mfaSecret, code)) return { error: "Kode MFA tidak cocok." };

  await db.update(platformAdmins).set({ mfaEnabled: true }).where(eq(platformAdmins.userId, admin.id));
  await db.insert(auditEvents).values({ actorId: admin.id, type: "security", metadata: { action: "mfa_enabled", scope: "platform_admin" } });
  revalidatePath("/panel");
  return { ok: true, info: "MFA aktif. Kode diminta setiap kali masuk ke panel." };
}

export async function disableMfa(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const admin = await requireAdminSession();
  if (!admin) return { error: "Sesi panel berakhir. Masuk lagi." };

  const password = String(formData.get("password") ?? "");
  const [me] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, admin.id)).limit(1);
  if (!me?.passwordHash || !(await verify(me.passwordHash, password))) return { error: "Kata sandi salah." };

  await db.update(platformAdmins).set({ mfaEnabled: false, mfaSecret: null }).where(eq(platformAdmins.userId, admin.id));
  await db.insert(auditEvents).values({ actorId: admin.id, type: "security", metadata: { action: "mfa_disabled", scope: "platform_admin" } });
  revalidatePath("/panel");
  return { ok: true, info: "MFA dimatikan. Aktifkan kembali sebelum panel dipakai produksi." };
}