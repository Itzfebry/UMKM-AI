import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { verify } from "@node-rs/argon2";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db";
import { accounts, auditEvents, loginAttempts, sessions, users, verificationTokens } from "@/server/db/schema";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  // Credentials provider tidak didukung dengan database session di Auth.js.
  // shortcut: JWT session (PRD membolehkan JWT atau database session), pindah ke database session saat login password diimplementasikan manual.
  session: { strategy: "jwt" },
  pages: { signIn: "/masuk" },
  providers: [
    // Google hanya didaftarkan bila kredensial tersedia; tanpa itu tombolnya tidak ditampilkan
    // di /masuk dan alur OAuth tidak bisa dimulai (dulu muncul error "Missing required parameter: client_id").
    ...(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const [user] = await db
          .select()
          .from(users)
          .where(sql`lower(${users.email}) = ${email.toLowerCase()}`)
          .limit(1);
        if (!user?.passwordHash) return null;
        if (!(await verify(user.passwordHash, password))) return null;
        // Admin platform masuk lewat /panel/masuk (sesi terpisah), bukan di sini.
        return user;
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
    async linkAccount({ user }) {
      // Akun Google langsung dianggap terverifikasi.
      await db.update(users).set({ emailVerified: new Date() }).where(eq(users.id, user.id!));
    },
    /** Audit login berhasil (8.2). Percobaan gagal dicatat di action login. */
    async signIn({ user }) {
      try {
        await db.insert(loginAttempts).values({ email: user.email ?? null, success: true });
        await db.insert(auditEvents).values({
          actorId: user.id ?? null,
          type: "login",
          metadata: { email: user.email ?? null, success: true, method: "credentials" },
        });
      } catch (error) {
        console.error("[audit] gagal mencatat login", error);
      }
    },
  },
});