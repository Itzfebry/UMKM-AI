// Ekspor seluruh tabel schema umkm_ai ke backups/<waktu>/*.ndjson (restore-able dengan jsonb).
// Pakai: node --env-file=.env.local scripts/backup-export.mjs
import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const sql = postgres(process.env.DIRECT_URL || process.env.DATABASE_URL, { prepare: false, max: 2 });
const SCHEMA = "umkm_ai";
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const dir = path.join("backups", stamp);

fs.mkdirSync(dir, { recursive: true });

const tables = await sql`
  select table_name from information_schema.tables
  where table_schema = ${SCHEMA} and table_type = 'BASE TABLE' order by table_name`;

const manifest = { schema: SCHEMA, createdAt: new Date().toISOString(), tables: {} };

for (const { table_name: table } of tables) {
  if (table === "__drizzle_migrations") continue;
  const rows = await sql.unsafe(`select * from "${SCHEMA}"."${table}"`);
  const file = path.join(dir, `${table}.ndjson`);
  fs.writeFileSync(file, rows.map((row) => JSON.stringify(row)).join("\n") + (rows.length ? "\n" : ""));
  manifest.tables[table] = rows.length;
  console.log(`${table.padEnd(24)} ${String(rows.length).padStart(6)} baris`);
}

fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, 2));
const total = Object.values(manifest.tables).reduce((sum, n) => sum + n, 0);
console.log(`\nBackup: ${dir} (${total} baris total). Simpan di luar repo; folder backups/ di-ignore git.`);
await sql.end();