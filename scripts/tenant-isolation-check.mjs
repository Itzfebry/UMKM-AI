// Uji isolasi data antar bisnis: akun baru tidak boleh melihat data Warung Uji.
// Pakai: node --env-file=.env.local scripts/tenant-isolation-check.mjs [base-url]
import { randomUUID } from "node:crypto";
import { hash } from "@node-rs/argon2";
import postgres from "postgres";

const base = (process.argv[2] ?? "http://localhost:3010").replace(/\/$/, "");
const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL, { prepare: false, max: 2 });

const marker = `uji-isolasi-${Date.now()}`;
const email = `${marker}@example.com`;
const password = "rahasia123";

const [a] = await sql`select id, name from umkm_ai.businesses order by created_at limit 1`;
const [secretRow] = await sql`
  select note from umkm_ai.transactions where business_id = ${a.id} and note is not null limit 1`;
const secretNote = secretRow?.note ?? "Penjualan pagi";

// Akun B + bisnis B (data sendiri) supaya pengujian bukan sekadar "kosong".
await sql`
  insert into umkm_ai.users (name, email, password_hash) values ('Penguji Isolasi', ${email}, ${await hash(password)})`;
const [{ id: userId }] = await sql`select id from umkm_ai.users where email = ${email}`;
const [{ id: businessB }] = await sql`
  insert into umkm_ai.businesses (name, created_by) values (${`Usaha ${marker}`}, ${userId}) returning id`;
await sql`insert into umkm_ai.memberships (business_id, user_id, role) values (${businessB}, ${userId}, 'owner')`;
await sql`insert into umkm_ai.opening_balances (business_id, amount, as_of) values (${businessB}, 100000, '2026-11-01')`;
await sql`
  insert into umkm_ai.transactions (business_id, type, amount, transaction_date, note, created_by)
  values (${businessB}, 'operational_income', 11111, '2026-11-02', ${`milik-${marker}`}, ${userId})`;

const jar = new Map();
const store = (response) => {
  for (const cookie of response.headers.getSetCookie?.() ?? []) {
    const [pair] = cookie.split(";");
    const index = pair.indexOf("=");
    jar.set(pair.slice(0, index), pair.slice(index + 1));
  }
};
const cookieHeader = () => [...jar].map(([k, v]) => `${k}=${v}`).join("; ");

const csrfResponse = await fetch(`${base}/api/auth/csrf`);
store(csrfResponse);
const { csrfToken } = await csrfResponse.json();
const login = await fetch(`${base}/api/auth/callback/credentials`, {
  method: "POST",
  redirect: "manual",
  headers: { "content-type": "application/x-www-form-urlencoded", cookie: cookieHeader() },
  body: new URLSearchParams({ csrfToken, email, password, callbackUrl: `${base}/beranda` }),
});
store(login);
const authenticated = [...jar.keys()].some((k) => k.includes("session-token"));
console.log("login akun B:", login.status, "| sesi:", authenticated);

const get = async (path) => {
  const response = await fetch(base + path, { headers: { cookie: cookieHeader() }, redirect: "manual" });
  return { status: response.status, body: await response.text() };
};

const checks = [];
const pages = ["/beranda", "/transaksi", "/utang-piutang", "/laporan"];
for (const path of pages) {
  const { status, body } = await get(path);
  checks.push({ path, status, leaks: body.includes(secretNote), own: path === "/transaksi" ? body.includes(marker) : true });
}

const csv = await get("/laporan/ekspor?format=csv&preset=month");
checks.push({ path: "ekspor csv", status: csv.status, leaks: csv.body.includes(secretNote), own: csv.body.includes("11111") });

// Percobaan akses data bisnis lain lewat pencarian: echo parameter di kotak cari bukan kebocoran,
// jadi yang dihitung adalah baris yang benar-benar dirender.
const countRows = (body) => (body.match(/aria-label="Hapus transaksi"/g) ?? []).length;
const foreignSearch = await get(`/transaksi?q=${encodeURIComponent(secretNote)}`);
checks.push({
  path: "cari catatan bisnis lain",
  status: foreignSearch.status,
  leaks: countRows(foreignSearch.body) > 0,
  own: true,
});
const ownSearch = await get(`/transaksi?q=${encodeURIComponent(marker)}`);
checks.push({
  path: "cari catatan sendiri",
  status: ownSearch.status,
  leaks: false,
  own: countRows(ownSearch.body) > 0,
});

let failed = 0;
for (const check of checks) {
  const ok = check.status === 200 && !check.leaks && check.own;
  if (!ok) failed += 1;
  console.log(
    `${ok ? "AMAN " : "GAGAL"} ${check.path} (status ${check.status}, data bisnis lain: ${check.leaks ? "terlihat" : "tidak"}, data sendiri: ${check.own ? "ada" : "tidak"})`,
  );
}

// Bersihkan akun uji. Audit login menahan penghapusan user, jadi baris audit uji dihapus dulu.
await sql`delete from umkm_ai.audit_events where actor_id = ${userId}`;
await sql`delete from umkm_ai.login_attempts where email = ${email}`;
await sql`delete from umkm_ai.businesses where id = ${businessB}`;
await sql`delete from umkm_ai.users where id = ${userId}`;
await sql.end();

console.log(failed === 0 ? "HASIL: isolasi antar bisnis aman." : `HASIL: ${failed} pemeriksaan gagal.`);
process.exit(failed === 0 ? 0 : 1);
