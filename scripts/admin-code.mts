import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
// Kode TOTP admin dari secret di DB. Dipakai kalau authenticator tidak tersedia.
const { db } = await import("../src/server/db");
const { users, platformAdmins } = await import("../src/server/db/schema");
const { eq } = await import("drizzle-orm");
const { totpCode } = await import("../src/server/lib/totp");

const email = process.argv[2] ?? "admin@umkm-ai.local";
const [row] = await db
  .select({ secret: platformAdmins.mfaSecret, enabled: platformAdmins.mfaEnabled })
  .from(users)
  .innerJoin(platformAdmins, eq(platformAdmins.userId, users.id))
  .where(eq(users.email, email))
  .limit(1);

if (!row?.secret) {
  console.log(`Tidak ada secret MFA untuk ${email}. Aktifkan dulu di /panel → Keamanan.`);
} else {
  const sisa = 30 - (Math.floor(Date.now() / 1000) % 30);
  console.log(`${email} | MFA ${row.enabled ? "aktif" : "BELUM aktif"} | kode: ${totpCode(row.secret)} (sisa ${sisa}s)`);
}
process.exit(0);
