import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// Skema terpisah supaya tidak bentrok dengan tabel proyek lain di database Supabase yang sama.
export const app = pgSchema("umkm_ai");

export const roleEnum = app.enum("role", ["owner", "admin", "staff"]);

/** Jenis transaksi menentukan arah saldo. Lihat CASH_EFFECT di src/server/modules/ledger/types.ts */
export const transactionTypeEnum = app.enum("transaction_type", [
  "operational_income",
  "operational_expense",
  "capital_in",
  "owner_draw",
  "loan_in",
  "loan_repayment",
]);

export const auditActionEnum = app.enum("audit_action", ["create", "update", "delete", "restore"]);

/** Utang = kewajiban usaha (payable), piutang = tagihan ke pihak lain (receivable). */
export const debtKindEnum = app.enum("debt_kind", ["payable", "receivable"]);

/** Jenis peristiwa audit non-transaksi (retensi 90 hari, lihat docs). */
export const auditEventEnum = app.enum("audit_event", [
  "login",
  "export",
  "import",
  "ai",
  "member",
  "subscription",
  "payment_verification",
  "security",
]);

export const auditEvents = app.table("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }),
  actorId: uuid("actor_id").references(() => users.id),
  type: auditEventEnum("type").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("audit_events_type_idx").on(t.type, t.createdAt)]);

const createdAt = timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

// ---------- auth (Auth.js DrizzleAdapter) ----------
export const users = app.table("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  // Hanya untuk login email+password; user Google boleh null.
  passwordHash: text("password_hash"),
  createdAt,
}, (t) => [uniqueIndex("users_email_uq").on(sql`lower(${t.email})`)]);

export const accounts = app.table("accounts", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (t) => [uniqueIndex("accounts_provider_uq").on(t.provider, t.providerAccountId)]);

export const sessions = app.table("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = app.table("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
}, (t) => [uniqueIndex("verification_tokens_uq").on(t.identifier, t.token)]);

// ---------- bisnis & anggota ----------
export const businesses = app.table("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  /** Path objek gambar logo usaha di bucket privat (opsional). */
  logoPath: text("logo_path"),
  /** Path objek gambar latar kartu saldo di bucket privat (opsional). */
  balanceImagePath: text("balance_image_path"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt,
});

export const memberships = app.table("memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: roleEnum("role").notNull(),
  createdAt,
}, (t) => [
  uniqueIndex("memberships_user_business_uq").on(t.userId, t.businessId),
  index("memberships_business_idx").on(t.businessId),
]);

export const openingBalances = app.table("opening_balances", {
  businessId: uuid("business_id").primaryKey().references(() => businesses.id, { onDelete: "cascade" }),
  amount: bigint("amount", { mode: "number" }).notNull(),
  asOf: date("as_of").notNull(),
  isEstimate: boolean("is_estimate").notNull().default(false),
  createdAt,
});

// ---------- ledger ----------
export const categories = app.table("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: transactionTypeEnum("type").notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt,
}, (t) => [
  uniqueIndex("categories_business_type_name_uq").on(t.businessId, t.type, sql`lower(${t.name})`),
]);

// ---------- utang & piutang ----------
export const debts = app.table("debts", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  kind: debtKindEnum("kind").notNull(),
  /** Nama pihak terkait (pemasok, pelanggan, dll). */
  counterparty: text("counterparty").notNull(),
  /** Rupiah utuh, selalu positif. */
  amount: bigint("amount", { mode: "number" }).notNull(),
  transactionDate: date("transaction_date").notNull(),
  dueDate: date("due_date"),
  note: text("note"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt,
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  deletedReason: text("deleted_reason"),
}, (t) => [
  index("debts_business_due_idx").on(t.businessId, t.dueDate),
  index("debts_business_counterparty_idx").on(t.businessId, t.counterparty),
]);

/** Pembayaran utang/piutang = baris di `transactions` dengan `debt_id` terisi. */
export const transactions = app.table("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categories.id),
  /** Terisi bila transaksi ini adalah pembayaran utang/piutang. */
  debtId: uuid("debt_id").references(() => debts.id),
  type: transactionTypeEnum("type").notNull(),
  /** Rupiah utuh, selalu positif. Arah saldo ditentukan `type`. */
  amount: bigint("amount", { mode: "number" }).notNull(),
  transactionDate: date("transaction_date").notNull(),
  note: text("note"),
  paymentMethod: text("payment_method"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
  createdAt,
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  deletedReason: text("deleted_reason"),
}, (t) => [
  index("transactions_business_date_idx").on(t.businessId, t.transactionDate),
  index("transactions_business_created_idx").on(t.businessId, t.createdAt),
]);

export const transactionAuditLogs = app.table("transaction_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  transactionId: uuid("transaction_id").notNull(),
  action: auditActionEnum("action").notNull(),
  before: jsonb("before"),
  after: jsonb("after"),
  reason: text("reason"),
  actorId: uuid("actor_id").notNull().references(() => users.id),
  createdAt,
}, (t) => [index("tx_audit_tx_idx").on(t.transactionId, t.createdAt)]);

export const debtAuditLogs = app.table("debt_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  debtId: uuid("debt_id").notNull(),
  action: auditActionEnum("action").notNull(),
  before: jsonb("before"),
  after: jsonb("after"),
  reason: text("reason"),
  actorId: uuid("actor_id").notNull().references(() => users.id),
  createdAt,
}, (t) => [index("debt_audit_debt_idx").on(t.debtId, t.createdAt)]);

// ---------- impor CSV ----------
export const importBatches = app.table("import_batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  totalRows: integer("total_rows").notNull(),
  importedRows: integer("imported_rows").notNull(),
  invalidRows: integer("invalid_rows").notNull(),
  duplicateRows: integer("duplicate_rows").notNull(),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt,
}, (t) => [index("import_batches_business_idx").on(t.businessId, t.createdAt)]);

/** Sidik baris yang sudah masuk, supaya baris sama tidak terimpor dua kali (FR-IMPORT-07/08). */
export const importRowKeys = app.table("import_row_keys", {
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  rowHash: text("row_hash").notNull(),
  batchId: uuid("batch_id").notNull(),
  createdAt,
}, (t) => [uniqueIndex("import_row_keys_uq").on(t.businessId, t.rowHash)]);

// ---------- paket, langganan, anggota, notifikasi ----------
export const planEnum = app.enum("plan", ["free", "pro"]);
export const subscriptionStatusEnum = app.enum("subscription_status", [
  "free",
  "active",
  "past_due",
  "grace_period",
  "cancel_at_period_end",
]);
export const invoiceStatusEnum = app.enum("invoice_status", ["pending", "paid", "rejected", "expired", "manual_review"]);

export const subscriptions = app.table("subscriptions", {
  businessId: uuid("business_id").primaryKey().references(() => businesses.id, { onDelete: "cascade" }),
  plan: planEnum("plan").notNull().default("free"),
  status: subscriptionStatusEnum("status").notNull().default("free"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  graceUntil: timestamp("grace_until", { withTimezone: true }),
  createdAt,
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const invoices = app.table("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  number: text("number").notNull(),
  plan: planEnum("plan").notNull().default("pro"),
  amount: bigint("amount", { mode: "number" }).notNull(),
  status: invoiceStatusEnum("status").notNull().default("pending"),
  /** FR-SUB-11: invoice berlaku tiga hari kalender. */
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  decidedBy: uuid("decided_by").references(() => users.id),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  rejectReason: text("reject_reason"),
  createdAt,
}, (t) => [
  uniqueIndex("invoices_number_uq").on(t.number),
  index("invoices_status_idx").on(t.status, t.createdAt),
]);

export const paymentProofs = app.table("payment_proofs", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  /** Path objek di bucket privat (FR-SUB-04), atau catatan bila upload tidak dipakai. */
  objectPath: text("object_path"),
  note: text("note"),
  uploadedBy: uuid("uploaded_by").notNull().references(() => users.id),
  createdAt,
}, (t) => [index("payment_proofs_invoice_idx").on(t.invoiceId, t.createdAt)]);

export const platformAdmins = app.table("platform_admins", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  mfaSecret: text("mfa_secret"),
  mfaEnabled: boolean("mfa_enabled").notNull().default(false),
  createdAt,
});

export const invitations = app.table("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: roleEnum("role").notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  invitedBy: uuid("invited_by").notNull().references(() => users.id),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt,
}, (t) => [
  uniqueIndex("invitations_token_uq").on(t.token),
  index("invitations_business_idx").on(t.businessId, t.createdAt),
]);

export const notifications = app.table("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  /** Kunci deduplikasi (FR-NOTIF-05); null berarti notifikasi tidak dideduplikasi. */
  dedupeKey: text("dedupe_key"),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt,
}, (t) => [
  uniqueIndex("notifications_dedupe_uq").on(t.userId, t.dedupeKey),
  index("notifications_user_idx").on(t.userId, t.createdAt),
]);

export const aiUsage = app.table("ai_usage", {
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  /** yyyy-mm di zona Asia/Jakarta. */
  period: text("period").notNull(),
  requests: integer("requests").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("ai_usage_uq").on(t.businessId, t.period)]);

/** Percobaan login untuk rate limiting sederhana (FR 8.1). */
export const loginAttempts = app.table("login_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email"),
  ip: text("ip"),
  success: boolean("success").notNull(),
  createdAt,
}, (t) => [index("login_attempts_email_idx").on(t.email, t.createdAt), index("login_attempts_ip_idx").on(t.ip, t.createdAt)]);

/** Preferensi kanal notifikasi per pengguna (FR-NOTIF-01/02). */
export const notificationPrefs = app.table("notification_prefs", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  emailEnabled: boolean("email_enabled").notNull().default(true),
  whatsappOptIn: boolean("whatsapp_opt_in").notNull().default(false),
  whatsappNumber: text("whatsapp_number"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Ringkasan AI yang tersimpan per hari agar dashboard tidak memanggil AI setiap muat. */
export const aiInsights = app.table("ai_insights", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  /** yyyy-mm-dd di zona Asia/Jakarta. */
  dayKey: text("day_key").notNull(),
  model: text("model").notNull(),
  content: jsonb("content").notNull(),
  createdAt,
}, (t) => [uniqueIndex("ai_insights_day_uq").on(t.businessId, t.dayKey)]);

export const idempotencyKeys = app.table("idempotency_keys", {
  key: text("key").primaryKey(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  scope: text("scope").notNull(),
  response: jsonb("response"),
  createdAt,
});