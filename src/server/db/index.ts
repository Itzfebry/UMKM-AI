import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Supabase pooler (6543) memakai pgbouncer: prepared statements harus dimatikan.
// Pool di-cache di globalThis: dev HMR membuat modul baru tiap edit, dan pool lama
// tidak ditutup sampai connection limit pooler habis (request menggantung menit-menitan).
const globalForDb = globalThis as unknown as { pg?: ReturnType<typeof postgres> };

const client =
  globalForDb.pg ??
  // Koneksi memakai DIRECT_URL (mode session, port 5432) bila tersedia: pooler mode
  // transaksi (6543) merotasi backend di belakang socket yang sedang dipakai, dan
  // query yang dikirim pada socket itu tidak pernah dijawab → request Next menggantung
  // dan slot pool tidak pernah dilepas. Socket juga dipensiunkan sendiri (idle_timeout).
  postgres(process.env.DIRECT_URL || process.env.DATABASE_URL!, {
    prepare: false,
    max: 5,
    connect_timeout: 10,
    keep_alive: 30,
    idle_timeout: 20,
    max_lifetime: 600,
    connection: { statement_timeout: 20_000, idle_in_transaction_session_timeout: 20_000 },
  });

if (process.env.NODE_ENV !== "production") globalForDb.pg = client;

export const db = drizzle(client, { schema });
export { schema };