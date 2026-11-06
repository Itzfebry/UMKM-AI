// Memberi akses admin platform ke satu akun: `pnpm admin:grant email@contoh.com`
import postgres from "postgres";

const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!email) {
  console.error("Pakai: pnpm admin:grant email@contoh.com");
  process.exit(1);
}

const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL, { prepare: false, max: 1 });
const [user] = await sql`select id, email, name from umkm_ai.users where lower(email) = ${email} limit 1`;

if (!user) {
  console.error(`Akun dengan email ${email} tidak ditemukan. Daftar dulu lewat aplikasi.`);
  await sql.end();
  process.exit(1);
}

await sql`
  insert into umkm_ai.platform_admins (user_id) values (${user.id})
  on conflict (user_id) do nothing`;

const [row] = await sql`select mfa_enabled from umkm_ai.platform_admins where user_id = ${user.id}`;
console.log(`${user.email} sekarang admin platform. MFA aktif: ${row?.mfa_enabled ?? false}.`);
console.log("MFA wajib: buka /pengaturan untuk mendaftarkan authenticator sebelum dipakai produksi.");
await sql.end();