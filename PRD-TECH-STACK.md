# PRD TECH STACK — UMKM-AI
## Teknologi Pembuatan Platform Keuangan dan Analisis Bisnis Berbasis AI

**Versi:** 1.0 Draft  
**Referensi:** PRD.md v1.0 Draft  
**Bahasa:** Bahasa Indonesia  
**Target pasar:** UMKM Indonesia  
**Platform:** Responsive Web + PWA  
**Zona waktu default:** Asia/Jakarta  

---

# 1. Tujuan Dokumen

Dokumen ini merinci seluruh teknologi yang diperlukan untuk membangun UMKM-AI secara end-to-end, mulai dari frontend, backend, database, autentikasi, penyimpanan file, AI, pembayaran, notifikasi, hingga infrastruktur dan observabilitas. Tujuannya adalah memberikan panduan teknis bagi tim engineering untuk menyiapkan arsitektur, memilih library, dan menyusun backlog implementasi.

---

# 2. Ringkasan Teknologi Inti

| Lapisan | Teknologi Utama | Alasan Pemilihan |
|---|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript | SSR/SSG, routing, API routes, PWA-ready |
| UI Styling | Tailwind CSS + shadcn/ui | Mobile-first, komponen aksesibel, konsisten |
| State Management | TanStack Query + Zustand | Server state caching, client state ringan |
| Backend | Next.js Server Actions + Route Handlers | Satu codebase, modular, mudah deploy |
| Database | PostgreSQL 16 | ACID, presisi numerik, JSONB, RLS |
| ORM | Drizzle ORM | Type-safe, migrasi SQL, performa |
| Autentikasi | Auth.js v5 (NextAuth) + Google OAuth | Email/password, Google, session, MFA admin |
| Penyimpanan File | AWS S3 / Cloudflare R2 (privat) | Bukti pembayaran, ekspor file sensitif |
| AI | OpenAI API (gpt-4o-mini / gpt-4o) via backend | Analisis berbasis data aktual, cost-controlled |
| Email | Resend + React Email | Transaksional, template, pengiriman andal |
| WhatsApp | Fonnte / Wablas API | Notifikasi dengan persetujuan pengguna |
| Pembayaran | Manual (transfer bank + QRIS) | Invoice, verifikasi admin platform |
| Ekspor | SheetJS (XLSX), pdfmake / @react-pdf | CSV, Excel, PDF |
| Impor | Papa Parse | Parsing CSV client-side + validasi server |
| Chart | Recharts | Dashboard, laporan, perbandingan periode |
| Validasi | Zod | Schema validation frontend & backend |
| Form | React Hook Form + Zod | Performa, validasi terintegrasi |
| Queue/Job | BullMQ + Redis (opsional MVP) | Notifikasi, ekspor async, impor async |
| Monitoring | Sentry + Vercel Analytics | Error tracking, performa, metrik |
| Logging | Pino (structured JSON) | Log terstruktur, audit |
| Deployment | Vercel (frontend) + Neon/Supabase (Postgres) | Managed, HTTPS, auto-scaling |
| Backup | pg_dump + cron (Neon/Supabase managed) | Backup otomatis 30 hari |
| Testing | Vitest + Playwright + Testing Library | Unit, E2E, komponen |
| Linting | ESLint + Prettier + TypeScript strict | Kualitas kode |

---

# 3. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser/PWA)                      │
│  Next.js App Router + React + Tailwind + shadcn/ui           │
│  TanStack Query (server state) + Zustand (client state)     │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────┴────────────────────────────────────┐
│                  NEXT.JS SERVER (Vercel)                      │
│  Route Handlers / Server Actions                             │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────────────┐    │
│  │ Auth (Auth.js)│ │ Business/RBAC│ │ Transaction Ledger │    │
│  └─────────────┘ └──────────────┘ └────────────────────┘    │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────────────┐    │
│  │ Cash Summary │ │ AR/AP Module │ │ Reports & Export   │    │
│  └─────────────┘ └──────────────┘ └────────────────────┘    │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────────────┐    │
│  │ AI Analyst  │ │ Subscription │ │ Notifications      │    │
│  └─────────────┘ └──────────────┘ └────────────────────┘    │
└────────┬──────────────┬──────────────┬──────────────────────┘
         │              │              │
    ┌────┴────┐   ┌────┴────┐   ┌────┴────┐
    │PostgreSQL│   │  Redis  │   │   S3/R2 │
    │ (Neon)   │   │(BullMQ) │   │(privat) │
    └─────────┘   └─────────┘   └─────────┘
         │
    ┌────┴────┐
    │ OpenAI  │
    │  API    │
    └─────────┘
```

---

# 4. Frontend

## 4.1 Framework & Bahasa

- **Next.js 15 (App Router)** — routing berbasis folder, Server Components, streaming, metadata API.
- **TypeScript 5.x (strict mode)** — type safety end-to-end.
- **React 19** — Server Components, Actions, optimistic updates.

## 4.2 Styling & Komponen

- **Tailwind CSS 4** — utility-first, mobile-first, dark mode.
- **shadcn/ui** — komponen aksesibel berbasis Radix UI, dapat dikustomisasi.
- **Lucide Icons** — ikon konsisten.
- **next-themes** — tema light/dark.

## 4.3 State & Data Fetching

- **TanStack Query v5** — caching, refetch, optimistic updates untuk data server.
- **Zustand** — state client ringan (UI state, filter, modal).
- **React Hook Form + Zod** — form transaksi, validasi, error handling.

## 4.4 Chart & Visualisasi

- **Recharts** — bar chart, line chart, pie chart untuk dashboard dan laporan.

## 4.5 PWA

- **next-pwa** atau **Serwist** — service worker, manifest, offline shell.
- **Workbox** — caching strategi (network-first untuk API, cache-first untuk aset).

## 4.6 Utilitas

- **date-fns + date-fns-tz** — manipulasi tanggal dengan zona waktu Asia/Jakarta.
- **Intl.NumberFormat** — format rupiah.
- **clsx + tailwind-merge** — className conditional.

---

# 5. Backend

## 5.1 Arsitektur Backend

Menggunakan **Next.js Server Actions + Route Handlers** sebagai backend utama. Struktur modular per domain:

```
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   ├── transactions/
│   │   ├── reports/
│   │   ├── export/
│   │   ├── import/
│   │   ├── ai/
│   │   ├── subscriptions/
│   │   └── webhooks/
├── server/
│   ├── modules/
│   │   ├── auth/
│   │   ├── business/
│   │   ├── transaction/
│   │   ├── category/
│   │   ├── cash/
│   │   ├── arap/
│   │   ├── report/
│   │   ├── export/
│   │   ├── import/
│   │   ├── ai/
│   │   ├── subscription/
│   │   ├── member/
│   │   ├── notification/
│   │   └── audit/
│   ├── db/
│   │   ├── schema/
│   │   ├── migrations/
│   │   └── seed/
│   └── lib/
│       ├── auth.ts
│       ├── db.ts
│       ├── storage.ts
│       ├── ai.ts
│       ├── email.ts
│       ├── queue.ts
│       └── logger.ts
```

## 5.2 Validasi

- **Zod** — schema validasi di frontend dan backend (shared package).

## 5.3 Idempotensi

- Header `Idempotency-Key` pada POST transaksi dan pembayaran.
- Tabel `idempotency_keys` di database untuk deduplikasi.

---

# 6. Database

## 6.1 Engine

- **PostgreSQL 16** (managed via Neon / Supabase).
- Tipe data uang: `BIGINT` (satuan rupiah) atau `NUMERIC(18,2)` — **bukan** floating point.
- Waktu: `TIMESTAMPTZ` (UTC), ditampilkan dengan zona waktu user.

## 6.2 ORM & Migrasi

- **Drizzle ORM** — type-safe query, schema-first, migrasi SQL via `drizzle-kit`.

## 6.3 Keamanan Data

- **Row-Level Security (RLS)** PostgreSQL untuk isolasi antar bisnis.
- Setiap tabel bisnis memiliki `business_id` dengan foreign key.
- Middleware backend memvalidasi `business_id` dari sesi, bukan dari request body.

## 6.4 Entitas Utama (sesuai PRD §11)

Tabel inti: `users`, `businesses`, `memberships`, `invitations`, `transactions`, `categories`, `transaction_audit_logs`, `opening_balances`, `payables_receivables`, `obligation_payments`, `imports`, `import_rows`, `ai_usage`, `ai_insights`, `subscriptions`, `invoices`, `payment_proofs`, `payment_verification_logs`, `notifications`, `security_audit_logs`, `security_incidents`, `backup_records`.

## 6.5 Indexing

- Index pada `business_id`, `transaction_date`, `created_at`, `status`.
- Full-text search (PostgreSQL `tsvector`) untuk pencarian transaksi berdasarkan catatan dan kategori.

---

# 7. Autentikasi & Otorisasi

## 7.1 Penyedia Auth

- **Auth.js v5 (NextAuth)** dengan adapter PostgreSQL.
- Metode login:
  - Email + Password (bcrypt / argon2).
  - Google OAuth 2.0.
- Verifikasi email, reset password, logout, session expiry.

## 7.2 MFA (Admin Platform)

- **TOTP** (Time-based One-Time Password) menggunakan `otplib`.
- QR code generasi via `qrcode`.
- Recovery codes disimpan ter-hash.

## 7.3 Session

- JWT atau database session (disarankan database session untuk kontrol revoke).
- Cookie `httpOnly`, `secure`, `sameSite=lax`.

## 7.4 RBAC

- Peran: Owner, Business Admin, Staff.
- Middleware `requirePermission(permission, businessId)` di setiap Route Handler/Server Action.
- Izin diperiksa di backend, bukan hanya UI.

---

# 8. Penyimpanan File (Object Storage)

## 8.1 Penyedia

- **Cloudflare R2** atau **AWS S3** (bucket privat).
- Akses via **pre-signed URL** dengan expiry pendek.

## 8.2 Penggunaan

- Bukti pembayaran (privat, hanya admin platform).
- File ekspor (CSV/XLSX/PDF) — disimpan sementara, diakses via pre-signed URL.
- Template CSV impor.

## 8.3 Keamanan

- Bucket privat, tidak ada public access.
- Validasi MIME type dan ukuran file di backend.
- Scan malware opsional (ClamAV) untuk bukti pembayaran.

---

# 9. AI Finance Analyst

## 9.1 Penyedia Model

- **OpenAI API** — model `gpt-4o-mini` (cost-efficient) untuk insight rutin, `gpt-4o` untuk analisis kompleks.
- Alternatif: Anthropic Claude, Google Gemini (fallback).

## 9.2 Arsitektur AI

```
User Request → Backend
  → Validasi kuota (atomic, dengan lock)
  → Hitung agregasi & metrik (SQL)
  → Bangun ringkasan terstruktur (JSON)
  → Kirim ke OpenAI (system prompt + data summary)
  → Parse output (temuan, interpretasi, rekomendasi, keterbatasan)
  → Simpan metadata (ai_insights)
  → Return ke user
```

## 9.3 Prinsip

- Backend menghitung semua angka; AI hanya menganalisis dan menjelaskan.
- Kirim **ringkasan agregat**, bukan seluruh transaksi (kecuali diperlukan secara selektif).
- Setiap insight menyertakan periode, angka pendukung, dan keterbatasan.
- Kuota diperiksa atomik dengan `SELECT ... FOR UPDATE` atau Redis lock.
- Rate limiting per akun (token bucket).
- Timeout 30s dengan retry (max 2x) untuk kegagalan transient.
- Kegagalan AI tidak memengaruhi fitur keuangan.

## 9.4 Library

- **openai** (npm) — SDK resmi.
- **tiktoken** — estimasi token untuk cost control.

---

# 10. Ekspor & Impor

## 10.1 Ekspor

| Format | Library | Keterangan |
|---|---|---|
| CSV | Native + csv-stringify | Escape CSV injection (prefix `'` atau quoting) |
| XLSX | SheetJS (xlsx) | Format rupiah, header, styling |
| PDF | @react-pdf/renderer atau pdfmake | Layout profesional, logo, tabel |

- Proses besar dilakukan **asinkron** (queue) dengan notifikasi selesai.
- File disimpan di R2, diakses via pre-signed URL (expiry 1 jam).

## 10.2 Impor CSV

- **Papa Parse** — parsing CSV di client untuk pratinjau.
- Validasi baris di server (Zod schema).
- Batch insert dengan transaction.
- Deteksi duplikat via idempotency key / hash baris.
- Laporan hasil: valid, invalid, duplikat.

---

# 11. Notifikasi

## 11.1 Kanal

| Kanal | Teknologi | Keterangan |
|---|---|---|
| In-app | Database table + polling/SSE | Notifikasi real-time sederhana |
| Email | Resend + React Email | Transaksional (status pembayaran, dll.) |
| WhatsApp | Fonnte API | Dengan persetujuan eksplisit pengguna |

## 11.2 Queue

- **BullMQ + Redis** untuk antrean notifikasi dengan retry dan deduplikasi.
- Job scheduler (cron) untuk pengingat Pro 3 hari sebelum berakhir.

---

# 12. Pembayaran & Langganan (Manual)

## 12.1 Alur

1. User membuat invoice → sistem generate nomor invoice unik.
2. User transfer bank / QRIS → unggah bukti pembayaran.
3. Bukti disimpan di R2 (privat).
4. Admin platform melihat antrean verifikasi.
5. Admin approve/reject dengan audit log.
6. Jika approve → aktivasi/perpanjangan langganan (idempoten).

## 12.2 Library

- **QR code generation** — `qrcode` untuk QRIS.
- **File upload** — `react-dropzone` + multipart upload ke R2.

---

# 13. Observabilitas & Monitoring

| Kebutuhan | Teknologi |
|---|---|
| Error tracking | Sentry (frontend + backend) |
| Performa | Vercel Analytics + Web Vitals |
| Logging | Pino (JSON structured) → Vercel Logs / Datadog |
| Metrik AI | Custom dashboard (biaya, kuota, success rate) |
| Uptime | Better Stack / UptimeRobot |
| Database monitoring | Neon/Supabase dashboard |

---

# 14. Keamanan

| Aspek | Implementasi |
|---|---|
| HTTPS | Vercel (otomatis) + HSTS |
| Password hashing | Argon2 (via `@node-rs/argon2`) |
| CSRF | Auth.js built-in + SameSite cookie |
| Rate limiting | `upstash/ratelimit` + Redis, atau Vercel Edge |
| Input validation | Zod di frontend & backend |
| SQL injection | Drizzle ORM (parameterized queries) |
| XSS | React auto-escape + CSP headers |
| CSV injection | Sanitasi prefix `'` pada kolom teks |
| Tenant isolation | RLS PostgreSQL + middleware business_id |
| File access | Pre-signed URL, bucket privat |
| Audit log | Tabel `security_audit_logs` + `transaction_audit_logs` |
| MFA admin | TOTP (otplib) |
| Secrets | Vercel Environment Variables + `.env.local` |

---

# 15. Testing

| Jenis | Teknologi | Cakupan |
|---|---|---|
| Unit | Vitest | Fungsi hitung saldo, validasi, utilitas |
| Component | Testing Library + Vitest | Form, komponen UI |
| E2E | Playwright | Flow transaksi, auth, ekspor, impor |
| API/Integration | Vitest + supertest | Route handlers, RBAC, idempotensi |
| Load | k6 | Endpoint transaksi p95 < 500ms |
| Security | OWASP ZAP / manual | Tenant isolation, RBAC bypass |

---

# 16. Deployment & Infrastruktur

## 16.1 Hosting

- **Frontend + Backend:** Vercel (Edge + Serverless Functions).
- **Database:** Neon (PostgreSQL serverless) atau Supabase.
- **Redis:** Upstash (serverless Redis) untuk BullMQ dan rate limiting.
- **Object Storage:** Cloudflare R2.

## 16.2 Environment

| Environment | Keterangan |
|---|---|
| Development | Lokal (Docker Compose untuk Postgres + Redis) |
| Staging | Vercel Preview + Neon branch |
| Production | Vercel Production + Neon main + R2 |

## 16.3 CI/CD

- **GitHub Actions** — lint, typecheck, test, build, deploy.
- **Vercel Git Integration** — auto-deploy per branch.

## 16.4 Backup

- Neon/Supabase managed backup (point-in-time recovery, retensi 30 hari).
- `pg_dump` harian ke R2 (opsional, untuk disaster recovery).
- Pengujian restore berkala.

---

# 17. Dependensi Utama (package.json)

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "typescript": "^5.6.0",
    "tailwindcss": "^4.0.0",
    "@radix-ui/react-*": "latest",
    "drizzle-orm": "^0.36.0",
    "postgres": "^3.4.0",
    "next-auth": "^5.0.0",
    "@auth/drizzle-adapter": "latest",
    "zod": "^3.23.0",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "@tanstack/react-query": "^5.59.0",
    "zustand": "^5.0.0",
    "recharts": "^2.13.0",
    "date-fns": "^4.1.0",
    "date-fns-tz": "^3.2.0",
    "openai": "^4.70.0",
    "tiktoken": "^1.0.0",
    "resend": "^4.0.0",
    "@react-email/components": "^0.0.25",
    "xlsx": "^0.18.5",
    "@react-pdf/renderer": "^4.0.0",
    "papaparse": "^5.4.1",
    "bullmq": "^5.16.0",
    "ioredis": "^5.4.0",
    "@aws-sdk/client-s3": "^3.690.0",
    "argon2": "^0.41.0",
    "otplib": "^12.0.0",
    "qrcode": "^1.5.4",
    "pino": "^9.5.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.454.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.28.0",
    "vitest": "^2.1.0",
    "@testing-library/react": "^16.0.0",
    "playwright": "^1.48.0",
    "eslint": "^9.0.0",
    "prettier": "^3.3.0",
    "@types/node": "^22.0.0"
  }
}
```

---

# 18. Struktur Proyek

```
UMKM-AI/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/             # UI components (shadcn)
│   ├── server/                 # Backend modules
│   ├── lib/                    # Shared utilities
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global CSS
├── drizzle/                    # Migrations
├── public/                     # Static assets, PWA manifest
├── tests/                      # E2E (Playwright)
├── .env.example
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

# 19. Estimasi Biaya Infrastruktur (Bulanan)

| Layanan | Estimasi Biaya |
|---|---|
| Vercel Pro | $20/bulan |
| Neon PostgreSQL (Pro) | $19/bulan |
| Upstash Redis | $10/bulan (pay-as-you-go) |
| Cloudflare R2 | ~$0.015/GB + request |
| OpenAI API | Variabel (kuota AI) |
| Resend | $20/bulan (50k email) |
| Sentry | $26/bulan (Team) |
| Fonnte (WhatsApp) | Variabel |
| **Total (tanpa AI)** | **~$95/bulan** |

---

# 20. Catatan Penting

1. **Microservices tidak diperlukan** pada MVP. Gunakan arsitektur modular monolith.
2. **AI tidak boleh langsung menulis ke ledger** — selalu melalui validasi backend.
3. **Perhitungan uang menggunakan integer (satuan rupiah)** atau `NUMERIC`, bukan `float`/`double`.
4. **Tenant isolation** diterapkan di level database (RLS) dan aplikasi (middleware).
5. **Idempotensi** wajib untuk transaksi, pembayaran, dan impor.
6. **Audit log** dipisahkan antara audit akses dan audit perubahan.
7. **Backup retensi 30 hari** dengan pengujian restore berkala.

---

*Dokumen ini menjadi dasar technical design, backlog engineering, dan keputusan arsitektur UMKM-AI.*
