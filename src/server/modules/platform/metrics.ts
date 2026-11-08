import fs from "node:fs";
import path from "node:path";
import { sql, type SQL } from "drizzle-orm";
import { db } from "@/server/db";
import { PLAN_LABEL, PLAN_LIMITS, effectivePlan, type Plan } from "@/server/modules/billing/plan";

const SCHEMA = "umkm_ai";

async function rows<T>(query: SQL): Promise<T[]> {
  return (await db.execute(query)) as unknown as T[];
}

async function one<T>(query: SQL): Promise<T | undefined> {
  return (await rows<T>(query))[0];
}

/** Ringkasan platform: hitungan inti yang dipakai kartu KPI. */
export type PlatformSummary = {
  businesses: number;
  users: number;
  owners: number;
  staff: number;
  memberships: number;
  transactions: number;
  transactionsDeleted: number;
  transactionsThisMonth: number;
  auditEvents: number;
  audit24h: number;
  logins24h: number;
  failedLogins24h: number;
  insightsToday: number;
  invoicesPending: number;
  proofs: number;
  activeSessions: number;
  oauthUsers: number;
  dbSizeBytes: number;
};

export async function getPlatformSummary(): Promise<PlatformSummary> {
  const found = await one<PlatformSummary>(sql`
    select
      (select count(*) from umkm_ai.businesses)::int as "businesses",
      (select count(*) from umkm_ai.users)::int as "users",
      (select count(*) from umkm_ai.memberships where role = 'owner')::int as "owners",
      (select count(*) from umkm_ai.memberships where role = 'staff')::int as "staff",
      (select count(*) from umkm_ai.memberships)::int as "memberships",
      (select count(*) from umkm_ai.transactions where deleted_at is null)::int as "transactions",
      (select count(*) from umkm_ai.transactions where deleted_at is not null)::int as "transactionsDeleted",
      (select count(*) from umkm_ai.transactions
        where deleted_at is null
          and transaction_date >= date_trunc('month', (now() at time zone 'Asia/Jakarta'))::date)::int as "transactionsThisMonth",
      (select count(*) from umkm_ai.audit_events)::int as "auditEvents",
      (select count(*) from umkm_ai.audit_events where created_at >= now() - interval '24 hours')::int as "audit24h",
      (select count(*) from umkm_ai.login_attempts where created_at >= now() - interval '24 hours')::int as "logins24h",
      (select count(*) from umkm_ai.login_attempts where success = false and created_at >= now() - interval '24 hours')::int as "failedLogins24h",
      (select count(*) from umkm_ai.ai_insights
        where day_key = to_char((now() at time zone 'Asia/Jakarta'), 'YYYY-MM-DD'))::int as "insightsToday",
      (select count(*) from umkm_ai.invoices where status in ('pending', 'manual_review'))::int as "invoicesPending",
      (select count(*) from umkm_ai.payment_proofs)::int as "proofs",
      (select count(*) from umkm_ai.sessions where expires > now())::int as "activeSessions",
      (select count(*) from umkm_ai.users where password_hash is null)::int as "oauthUsers",
      pg_database_size(current_database())::bigint as "dbSizeBytes"
  `);
  // bigint dari postgres datang sebagai string.
  return found ? { ...found, dbSizeBytes: Number(found.dbSizeBytes) } : ({} as PlatformSummary);
}

export type AiDay = { day: string; total: number; ok: number; failed: number; tokensIn: number; tokensOut: number; avgMs: number };

/** Aktivitas AI per hari (zona Jakarta), termasuk hari tanpa panggilan. */
export async function getAiDaily(days = 30): Promise<AiDay[]> {
  const span = sql.raw(String(Math.max(1, days) - 1));
  const data = await rows<AiDay>(sql`
    select to_char(d.day, 'YYYY-MM-DD') as "day",
      count(a.id)::int as "total",
      count(a.id) filter (where a.metadata->>'status' = 'sukses')::int as "ok",
      count(a.id) filter (where a.metadata->>'status' = 'gagal')::int as "failed",
      coalesce(sum((a.metadata->'usage'->>'prompt')::int), 0)::int as "tokensIn",
      coalesce(sum((a.metadata->'usage'->>'completion')::int), 0)::int as "tokensOut",
      coalesce(round(avg((a.metadata->>'durationMs')::numeric)), 0)::int as "avgMs"
    from generate_series((now() at time zone 'Asia/Jakarta')::date - ${span}, (now() at time zone 'Asia/Jakarta')::date, interval '1 day') as d(day)
    left join umkm_ai.audit_events a
      on a.type = 'ai' and (a.created_at at time zone 'Asia/Jakarta')::date = d.day
    group by d.day
    order by d.day
  `);
  return data.map((point) => ({ ...point, tokensIn: Number(point.tokensIn), tokensOut: Number(point.tokensOut) }));
}

/** Rincian panggilan AI per jenis (analisis otomatis, tombol beranda, tanya jawab). */
export async function getAiByKind(): Promise<{ kind: string; total: number; ok: number; avgMs: number }[]> {
  return rows(sql`
    select coalesce(m.metadata->>'kind', 'analisis') as "kind",
      count(*)::int as "total",
      count(*) filter (where m.metadata->>'status' = 'sukses')::int as "ok",
      coalesce(round(avg((m.metadata->>'durationMs')::numeric)), 0)::int as "avgMs"
    from umkm_ai.audit_events m
    where m.type = 'ai'
    group by 1
    order by 2 desc
  `);
}

export type AiModelUsage = { model: string; total: number; ok: number; tokensIn: number; tokensOut: number };

/** Pemakaian per model: berapa panggilan, berapa yang gagal, berapa token. */
export async function getAiByModel(): Promise<AiModelUsage[]> {
  return rows(sql`
    select coalesce(metadata->>'model', '-') as "model",
      count(*)::int as "total",
      count(*) filter (where metadata->>'status' = 'sukses')::int as "ok",
      coalesce(sum((metadata->'usage'->>'prompt')::int), 0)::int as "tokensIn",
      coalesce(sum((metadata->'usage'->>'completion')::int), 0)::int as "tokensOut"
    from umkm_ai.audit_events
    where type = 'ai'
    group by 1
    order by 2 desc
  `);
}

export type BusinessRow = {
  id: string;
  name: string;
  createdAt: string;
  ownerEmail: string | null;
  members: number;
  transactions: number;
  transactionsThisMonth: number;
  openDebts: number;
  aiRequests: number;
  plan: Plan;
  planStatus: string;
  planLabel: string;
  effectivePlan: Plan;
  aiQuota: number;
  txQuota: number;
  periodEnd: string | null;
  lastInsight: string | null;
  lastActivity: string | null;
  brandingFiles: number;
};

/** Satu baris per usaha: pemilik, anggota, aktivitas, kuota, dan status backup. */
export async function listBusinessOverview(period: string, limit = 25): Promise<BusinessRow[]> {
  const data = await rows<Omit<BusinessRow, "planLabel" | "effectivePlan" | "aiQuota" | "txQuota">>(sql`
    select b.id,
      b.name,
      b.created_at::text as "createdAt",
      (select u.email from umkm_ai.memberships m join umkm_ai.users u on u.id = m.user_id
        where m.business_id = b.id and m.role = 'owner' order by m.created_at limit 1) as "ownerEmail",
      (select count(*) from umkm_ai.memberships m where m.business_id = b.id)::int as "members",
      (select count(*) from umkm_ai.transactions t where t.business_id = b.id and t.deleted_at is null)::int as "transactions",
      (select count(*) from umkm_ai.transactions t
        where t.business_id = b.id and t.deleted_at is null
          and t.transaction_date >= date_trunc('month', (now() at time zone 'Asia/Jakarta'))::date)::int as "transactionsThisMonth",
      (select count(*) from umkm_ai.debts d where d.business_id = b.id and d.deleted_at is null)::int as "openDebts",
      coalesce(ai.requests, 0)::int as "aiRequests",
      coalesce(s.plan, 'free')::text as "plan",
      coalesce(s.status, 'free')::text as "planStatus",
      s.current_period_end::text as "periodEnd",
      (select max(i.day_key) from umkm_ai.ai_insights i where i.business_id = b.id) as "lastInsight",
      greatest(
        (select max(a.created_at) from umkm_ai.audit_events a where a.business_id = b.id),
        (select max(t.updated_at) from umkm_ai.transactions t where t.business_id = b.id)
      )::text as "lastActivity",
      (select count(*) from umkm_ai.ai_usage au where au.business_id = b.id)::int as "aiPeriods",
      ((b.logo_path is not null)::int + (b.balance_image_path is not null)::int)::int as "brandingFiles"
    from umkm_ai.businesses b
    left join umkm_ai.ai_usage ai on ai.business_id = b.id and ai.period = ${period}
    left join umkm_ai.subscriptions s on s.business_id = b.id
    order by coalesce(ai.requests, 0) desc, b.name
    limit ${limit}
  `);

  return data.map((item) => {
    const plan = item.plan;
    const effective = effectivePlan({ plan, status: item.planStatus, currentPeriodEnd: item.periodEnd ? new Date(item.periodEnd) : null });
    return {
      ...item,
      planLabel: PLAN_LABEL[plan],
      effectivePlan: effective,
      aiQuota: PLAN_LIMITS[effective].aiRequestsPerMonth,
      txQuota: PLAN_LIMITS[effective].transactionsPerMonth,
    };
  });
}

export type TableStat = { table: string; tableRows: number; bytes: number; rls: boolean; size: string };

export type DatabaseStats = {
  name: string;
  version: string;
  size: string;
  tables: TableStat[];
  totalRows: number;
  migrationsApplied: number;
  migrationFiles: number;
  lastMigration: string | null;
  rlsEnabled: number;
  rlsTotal: number;
  connection: string;
  schema: string;
};

/**
 * Keadaan database: jumlah baris & ukuran per tabel, RLS, migrasi, ukuran total.
 * Koneksi dilaporkan tanpa kredensial (hanya modenya).
 */
export async function getDatabaseStats(): Promise<DatabaseStats> {
  const info = await one<{ name: string; version: string; size: string }>(sql`
    select current_database() as "name", current_setting('server_version') as "version", pg_size_pretty(pg_database_size(current_database())) as "size"
  `);

  const sizes = await rows<{ table: string; bytes: string; rls: boolean }>(sql`
    select c.relname as "table", pg_total_relation_size(c.oid)::bigint as "bytes", c.relrowsecurity as "rls"
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = ${SCHEMA} and c.relkind = 'r'
    order by c.relname
  `);

  // Hitungan tepat per tabel (reltuples terlalu basi untuk ukuran MVP): satu UNION dari daftar tabel
  // yang dibaca dari information_schema, jadi nama tabel sendiri tidak pernah datang dari input pengguna.
  const tableNames = await rows<{ table_name: string }>(sql`
    select table_name from information_schema.tables where table_schema = ${SCHEMA} and table_type = 'BASE TABLE' order by table_name
  `);
  const union = tableNames
    .map((item) => `select '${item.table_name}' as "table", count(*)::int as "tableRows" from umkm_ai."${item.table_name}"`)
    .join(" union all ");
  const counts = union ? await rows<{ table: string; tableRows: number }>(sql.raw(union)) : [];
  const counted = new Map(counts.map((item) => [item.table, item.tableRows]));

  const [migration] = await rows<{ applied: number; last: string | null }>(sql`
    select count(*)::int as "applied", to_timestamp(max(created_at) / 1000)::text as "last" from umkm_ai.__drizzle_migrations
  `).catch(() => [{ applied: 0, last: null }]);

  const tables = sizes.map((item) => {
    const tableRows = counted.get(item.table) ?? 0;
    return {
      table: item.table,
      tableRows,
      bytes: Number(item.bytes),
      size: `${(Number(item.bytes) / 1024).toFixed(0)} KB`,
      rls: item.rls,
    };
  });

  let migrationFiles = 0;
  try {
    migrationFiles = fs.readdirSync(path.join(process.cwd(), "drizzle")).filter((file) => file.endsWith(".sql")).length;
  } catch {
    migrationFiles = 0;
  }

  return {
    name: info?.name ?? "-",
    version: info?.version ?? "-",
    size: info?.size ?? "-",
    tables,
    totalRows: tables.reduce((sum, item) => sum + item.tableRows, 0),
    migrationsApplied: migration?.applied ?? 0,
    migrationFiles,
    lastMigration: migration?.last ?? null,
    rlsEnabled: tables.filter((item) => item.rls).length,
    rlsTotal: tables.length,
    connection: process.env.DIRECT_URL ? "DIRECT_URL (session mode)" : "DATABASE_URL",
    schema: SCHEMA,
  };
}

export type BackupEntry = { dir: string; createdAt: string; tables: number; rows: number };

export type BackupStatus = { folder: string; latest: BackupEntry | null; entries: BackupEntry[]; error: string | null };

/** Salinan mandiri dari `pnpm backup:export`: manifest terbaru di folder backups/. */
export function getBackupStatus(limit = 5): BackupStatus {
  const folder = path.join(process.cwd(), "backups");
  try {
    const entries = fs
      .readdirSync(folder, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => {
        const manifestPath = path.join(folder, entry.name, "manifest.json");
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as { createdAt?: string; tables?: Record<string, number> };
        const tableRows = Object.values(manifest.tables ?? {});
        return {
          dir: entry.name,
          createdAt: manifest.createdAt ?? entry.name,
          tables: tableRows.length,
          rows: tableRows.reduce((sum, value) => sum + Number(value ?? 0), 0),
        };
      })
      .sort((a, b) => b.dir.localeCompare(a.dir));
    return { folder, latest: entries[0] ?? null, entries: entries.slice(0, limit), error: null };
  } catch (error) {
    return { folder, latest: null, entries: [], error: error instanceof Error ? error.message : "Tidak bisa membaca folder backups/" };
  }
}

export type SecurityAdmin = { email: string; name: string | null; mfaEnabled: boolean; since: string };

export type FailedLogins = { email: string | null; attempts: number; last: string };

/** Keamanan: admin platform + MFA, percobaan login gagal, peristiwa keamanan, kesehatan konfigurasi. */
export async function getSecurityOverview() {
  const [admins, failed, events, recentLogins] = await Promise.all([
    rows<SecurityAdmin>(sql`
      select u.email, u.name, pa.mfa_enabled as "mfaEnabled", pa.created_at::text as "since"
      from umkm_ai.platform_admins pa join umkm_ai.users u on u.id = pa.user_id
      order by u.email
    `),
    rows<FailedLogins>(sql`
      select email, count(*)::int as "attempts", max(created_at)::text as "last"
      from umkm_ai.login_attempts
      where success = false and created_at >= now() - interval '7 days'
      group by email order by 2 desc limit 8
    `),
    rows<{ action: string; at: string; actor: string | null }>(sql`
      select coalesce(metadata->>'action', '-') as "action", created_at::text as "at", (select email from umkm_ai.users u where u.id = a.actor_id) as "actor"
      from umkm_ai.audit_events a where type = 'security' order by created_at desc limit 8
    `),
    rows<{ at: string; email: string | null; success: boolean; scope: string }>(sql`
      select created_at::text as "at", metadata->>'email' as "email", coalesce((metadata->>'success')::boolean, false) as "success",
        coalesce(metadata->>'scope', 'pengguna') as "scope"
      from umkm_ai.audit_events where type = 'login' order by created_at desc limit 8
    `),
  ]);

  const config: { label: string; ready: boolean; hint: string }[] = [
    { label: "AUTH_SECRET", ready: Boolean(process.env.AUTH_SECRET), hint: "menandatangani cookie sesi" },
    { label: "AI_API_KEY", ready: Boolean(process.env.AI_API_KEY), hint: "analisis & tanya jawab AI" },
    { label: "SUPABASE_SERVICE_ROLE_KEY", ready: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY), hint: "unggah berkas branding" },
    { label: "CRON_SECRET", ready: Boolean(process.env.CRON_SECRET), hint: "tugas terjadwal /api/cron/notifications" },
    { label: "GOOGLE_CLIENT_ID + SECRET", ready: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET), hint: "opsional, masuk dengan Google" },
  ];

  return { admins, failed, events, recentLogins, config };
}

/** Tarif opsional untuk menaksir biaya token; kosong berarti biaya tidak ditampilkan. */
export function getAiCostRates() {
  const read = (value?: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };
  const input = read(process.env.AI_COST_INPUT_PER_MTOK);
  const output = read(process.env.AI_COST_OUTPUT_PER_MTOK);
  return input && output ? { input, output } : null;
}
