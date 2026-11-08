import { and, count, eq, gte } from "drizzle-orm";
import { db } from "@/server/db";
import { loginAttempts } from "@/server/db/schema";

export const LOGIN_WINDOW_MINUTES = 15;
export const MAX_FAILURES = 5;

/** Kegagalan login pada jendela waktu terakhir; dipakai login pengguna dan login panel admin. */
export async function recentFailures(email: string) {
  const since = new Date(Date.now() - LOGIN_WINDOW_MINUTES * 60_000);
  const [row] = await db
    .select({ total: count() })
    .from(loginAttempts)
    .where(and(eq(loginAttempts.email, email), eq(loginAttempts.success, false), gte(loginAttempts.createdAt, since)));
  return Number(row?.total ?? 0);
}
