import { randomBytes } from "node:crypto";
import { and, eq, gt, like } from "drizzle-orm";
import { db } from "@/server/db";
import { verificationTokens } from "@/server/db/schema";

/** Token sekali pakai untuk verifikasi email dan reset kata sandi. */
export async function issueToken(identifier: string, ttlMinutes: number) {
  const token = randomBytes(32).toString("hex");
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier));
  await db.insert(verificationTokens).values({
    identifier,
    token,
    expires: new Date(Date.now() + ttlMinutes * 60_000),
  });
  return token;
}

export async function consumeToken(identifier: string, token: string) {
  const [row] = await db
    .select()
    .from(verificationTokens)
    .where(and(eq(verificationTokens.identifier, identifier), eq(verificationTokens.token, token), gt(verificationTokens.expires, new Date())))
    .limit(1);
  if (!row) return false;
  await db.delete(verificationTokens).where(and(eq(verificationTokens.identifier, identifier), eq(verificationTokens.token, token)));
  return true;
}

export const verifyIdentifier = (email: string) => `verify:${email.toLowerCase()}`;
export const resetIdentifier = (email: string) => `reset:${email.toLowerCase()}`;

/** Dipakai halaman /verifikasi: token tidak dipisah per jenis agar tautan tetap sederhana. */
export async function findTokenRowByToken(token: string, prefix: string) {
  const [row] = await db
    .select()
    .from(verificationTokens)
    .where(and(eq(verificationTokens.token, token), like(verificationTokens.identifier, `${prefix}%`), gt(verificationTokens.expires, new Date())))
    .limit(1);
  return row ?? null;
}