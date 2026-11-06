"use server";

import { hash } from "@node-rs/argon2";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { and, count, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { signIn, signOut, auth } from "@/auth";
import { db } from "@/server/db";
import { auditEvents, loginAttempts, users } from "@/server/db/schema";
import { appUrl, sendEmail } from "@/server/lib/email";
import { consumeToken, findTokenRowByToken, issueToken, resetIdentifier, verifyIdentifier } from "./tokens";

export type FormState = { error?: string; ok?: boolean; info?: string } | undefined;

const registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(80),
  email: z.string().trim().toLowerCase().email("Email tidak valid."),
  password: z.string().min(8, "Kata sandi minimal 8 karakter.").max(72),
});

const LOGIN_WINDOW_MINUTES = 15;
const MAX_FAILURES = 5;

async function clientIp() {
  const store = await headers();
  return store.get("x-forwarded-for")?.split(",")[0]?.trim() ?? store.get("x-real-ip") ?? null;
}

async function recentFailures(email: string) {
  const since = new Date(Date.now() - LOGIN_WINDOW_MINUTES * 60_000);
  const [row] = await db
    .select({ total: count() })
    .from(loginAttempts)
    .where(and(eq(loginAttempts.email, email), eq(loginAttempts.success, false), gte(loginAttempts.createdAt, since)));
  return Number(row?.total ?? 0);
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, password } = parsed.data;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.email}) = ${email}`)
    .limit(1);
  if (existing) return { error: "Email sudah terdaftar. Coba masuk." };

  await db.insert(users).values({ name, email, passwordHash: await hash(password) });

  // Verifikasi email bersifat imbauan: akun tetap bisa dipakai walau email belum dikonfirmasi.
  const token = await issueToken(verifyIdentifier(email), 60 * 24);
  await sendEmail({
    to: email,
    subject: "Verifikasi email UMKM-AI",
    text: `Halo ${name}, konfirmasi email Anda lewat tautan ini (berlaku 24 jam):\n${appUrl(`/verifikasi?token=${token}`)}`,
  });

  await signIn("credentials", { email, password, redirectTo: "/onboarding" });
  redirect("/onboarding");
}

/** Login memakai signIn credentials; error dikembalikan sebagai pesan form. */
export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const ip = await clientIp();

  if (email && (await recentFailures(email)) >= MAX_FAILURES) {
    return { error: `Terlalu banyak percobaan gagal. Coba lagi setelah ${LOGIN_WINDOW_MINUTES} menit.` };
  }

  try {
    await signIn("credentials", {
      email,
      password: String(formData.get("password") ?? ""),
      redirectTo: "/beranda",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      await db.insert(loginAttempts).values({ email, ip, success: false });
      await db.insert(auditEvents).values({ type: "login", metadata: { email, ip, success: false, reason: error.type } });
      return { error: "Email atau kata sandi salah." };
    }
    throw error; // redirect Next.js juga dilempar sebagai error
  }
}

export async function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

export async function googleSignIn() {
  // Tanpa kredensial, tombol Google tidak ditampilkan; jaga-jaga bila URL dipanggil langsung.
  if (!(await googleConfigured())) redirect("/masuk");
  await signIn("google", { redirectTo: "/beranda" });
}

export async function logout() {
  await signOut({ redirectTo: "/masuk" });
  revalidatePath("/", "layout");
}

/** Selalu menjawab sama agar keberadaan akun tidak bisa ditebak. */
export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) return { error: "Email tidak valid." };

  const [user] = await db.select({ id: users.id, name: users.name }).from(users).where(sql`lower(${users.email}) = ${email}`).limit(1);
  if (user) {
    const token = await issueToken(resetIdentifier(email), 60);
    await sendEmail({
      to: email,
      subject: "Reset kata sandi UMKM-AI",
      text: `Buka tautan ini untuk membuat kata sandi baru (berlaku 1 jam):\n${appUrl(`/reset-sandi?token=${token}`)}\n\nAbaikan email ini bila Anda tidak meminta reset.`,
    });
    await db.insert(auditEvents).values({ actorId: user.id, type: "security", metadata: { action: "password_reset_requested" } });
  }

  return { ok: true, info: "Bila email terdaftar, tautan reset sudah dikirim. Periksa juga folder spam." };
}

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Kata sandi minimal 8 karakter." };

  const row = await findTokenRowByToken(token, "reset:");
  if (!row) return { error: "Tautan reset tidak valid atau sudah kedaluwarsa." };
  const email = row.identifier.replace("reset:", "");

  const [user] = await db.select({ id: users.id }).from(users).where(sql`lower(${users.email}) = ${email}`).limit(1);
  if (!user) return { error: "Akun tidak ditemukan." };

  if (!(await consumeToken(resetIdentifier(email), token))) return { error: "Tautan reset sudah dipakai." };
  await db.update(users).set({ passwordHash: await hash(password) }).where(eq(users.id, user.id));
  await db.insert(auditEvents).values({ actorId: user.id, type: "security", metadata: { action: "password_reset_done" } });
  return { ok: true, info: "Kata sandi diganti. Silakan masuk dengan kata sandi baru." };
}

/** Dipakai halaman /verifikasi. */
export async function verifyEmailToken(token: string) {
  const row = await findTokenRowByToken(token, "verify:");
  if (!row) return false;
  const email = row.identifier.replace("verify:", "");
  const [user] = await db.select({ id: users.id }).from(users).where(sql`lower(${users.email}) = ${email}`).limit(1);
  if (!user) return false;
  if (!(await consumeToken(verifyIdentifier(email), token))) return false;
  await db.update(users).set({ emailVerified: new Date() }).where(eq(users.id, user.id));
  await db.insert(auditEvents).values({ actorId: user.id, type: "security", metadata: { action: "email_verified" } });
  return true;
}

export async function resendVerificationEmail(_prev: FormState, _formData: FormData): Promise<FormState> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return { error: "Masuk dulu untuk meminta email verifikasi." };

  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);
  if (!user) return { error: "Akun tidak ditemukan." };
  if (user.emailVerified) return { ok: true, info: "Email Anda sudah terverifikasi." };

  const token = await issueToken(verifyIdentifier(user.email), 60 * 24);
  const result = await sendEmail({
    to: user.email,
    subject: "Verifikasi email UMKM-AI",
    text: `Halo ${user.name ?? "pengguna"}, konfirmasi email Anda lewat tautan ini (berlaku 24 jam):\n${appUrl(`/verifikasi?token=${token}`)}`,
  });
  return result.sent
    ? { ok: true, info: "Email verifikasi dikirim ulang." }
    : { ok: true, info: `Email belum terkirim otomatis. ${result.detail} Tautan: /verifikasi?token=${token}` };
}