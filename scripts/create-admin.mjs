import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Import dinamis setelah dotenv.loaded
const { db } = await import("../src/server/db");
const { users, platformAdmins } = await import("../src/server/db/schema");
const { eq } = await import("drizzle-orm");
const { hash } = await import("@node-rs/argon2");
const { generateTotpSecret, otpauthUrl } = await import("../src/server/lib/totp");

async function main() {
  const email = process.argv[2] ?? "admin@umkm-ai.local";
  const password = process.argv[3] ?? "Admin123!";
  const name = process.argv[4] ?? "Admin UMKM";

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  let userId;
  if (existing) {
    console.log("Akun sudah ada, update password");
    await db.update(users).set({ passwordHash: await hash(password), name }).where(eq(users.id, existing.id));
    userId = existing.id;
  } else {
    const [user] = await db
      .insert(users)
      .values({ email, name, passwordHash: await hash(password), emailVerified: new Date() })
      .returning({ id: users.id });
    userId = user.id;
    console.log("Akun admin dibuat");
  }

  const secret = generateTotpSecret();
  await db
    .insert(platformAdmins)
    .values({ userId, mfaSecret: secret, mfaEnabled: false })
    .onConflictDoUpdate({ target: platformAdmins.userId, set: { mfaSecret: secret, mfaEnabled: false } });

  const url = otpauthUrl(secret, email);

  console.log("\n=== AKUN ADMIN BERHASIL DIBUAT ===");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`\n=== PENDAFTARAN MFA ===\n`);
  console.log(`Secret: ${secret}`);
  console.log(`otpauth URL: ${url}`);
  console.log(`\nPindai URL di atas dengan authenticator (Google Authenticator, Authy, dll)`);
  console.log(`Lalu masuk ke /panel/masuk dan aktifkan MFA di panel Keamanan`);
  console.log(`\n⚠️  Simpan password dan secret dengan aman!`);
}

main().catch(console.error);
