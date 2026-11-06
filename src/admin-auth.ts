import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verify } from "@node-rs/argon2";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db";
import { accounts, auditEvents, loginAttempts, platformAdmins, sessions, users, verificationTokens } from "@/server/db/schema";
import { verifyTotp } from "@/server/lib/totp";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  code: z.string().optional(),
});

const SESSION_COOKIE = "umkm-ai.admin-session-token";
const secureCookies = { httpOnly: true, sameSite: "lax" as const, path: "/", secure: process.env.NODE_ENV === "production" };

/**
 * Sesi admin platform terpisah dari sesi pengguna biasa: cookie berbeda nama, jalur
 * berbeda (`/api/auth-admin`), dan hanya akun di `platform_admins` yang bisa masuk.
 * MFA wajib begitu admin mendaftarkan authenticator (FR 8.1).
 */
export const adminAuth = NextAuth({
  basePath: "/api/auth-admin",
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  pages: { signIn: "/panel/masuk" },
  cookies: {
    sessionToken: { name: SESSION_COOKIE, options: secureCookies },
    csrfToken: { name: "umkm-ai.admin-csrf-token", options: secureCookies },
    callbackUrl: { name: "umkm-ai.admin-callback-url", options: secureCookies },
  },
  providers: [
    Credentials({
      credentials: { email: {}, password: {}, code: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password, code } = parsed.data;

        const [row] = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            passwordHash: users.passwordHash,
            mfaEnabled: platformAdmins.mfaEnabled,
            mfaSecret: platformAdmins.mfaSecret,
          })
          .from(users)
          .innerJoin(platformAdmins, eq(platformAdmins.userId, users.id))
          .where(sql`lower(${users.email}) = ${email.toLowerCase()}`)
          .limit(1);

        if (!row?.passwordHash) return null;
        if (!(await verify(row.passwordHash, password))) return null;
        if (row.mfaEnabled) {
          if (!row.mfaSecret || !code || !verifyTotp(row.mfaSecret, code)) return null;
        }
        return { id: row.id, email: row.email, name: row.name };
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      try {
        await db.insert(loginAttempts).values({ email: user.email ?? null, success: true });
        await db.insert(auditEvents).values({
          actorId: user.id ?? null,
          type: "login",
          metadata: { email: user.email ?? null, success: true, scope: "platform_admin" },
        });
      } catch (error) {
        console.error("[audit] gagal mencatat login admin", error);
      }
    },
  },
});

export const { handlers: adminHandlers, signIn: adminSignIn, signOut: adminSignOut, auth: adminSession } = adminAuth;

/** Sesi admin + verifikasi ulang bahwa akun masih terdaftar sebagai admin platform. */
export async function requireAdminSession() {
  const session = await adminSession();
  if (!session?.user?.id) return null;
  const [row] = await db.select({ userId: platformAdmins.userId }).from(platformAdmins).where(eq(platformAdmins.userId, session.user.id)).limit(1);
  if (!row) return null;
  return session.user as { id: string; email?: string | null; name?: string | null };
}