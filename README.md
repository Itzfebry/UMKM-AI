# UMKM-AI

**Platform Keuangan dan Analisis Bisnis Berbasis AI untuk UMKM Indonesia**

> "Bukan sekadar mencatat keuangan. Pahami bisnis di balik angkanya."

UMKM-AI membantu pemilik UMKM mencatat transaksi, memahami kondisi keuangan, memantau utang dan piutang, serta mendapatkan rekomendasi bisnis berdasarkan data keuangan aktual.

---

## ✨ Fitur Utama

- **Pencatatan Transaksi** — formulir manual dengan kategori, tanggal, catatan, metode pembayaran
- **Dashboard Keuangan** — saldo kas, pendapatan, pengeluaran, perbandingan periode, rincian kategori
- **Utang & Piutang** — pembayaran parsial, status, filter jatuh tempo
- **Laporan & Perbandingan** — periode harian/mingguan/bulanan, ekspor CSV/Excel/PDF
- **Impor CSV** — template resmi, validasi, pratinjau, deteksi duplikat
- **AI Finance Analyst** — insight berbasis angka aktual, kuota per paket
- **Manajemen Anggota & RBAC** — Owner, Admin Bisnis, Staf
- **Langganan Free & Pro** — pembayaran manual (transfer bank / QRIS) dengan verifikasi admin
- **Keamanan** — MFA admin, audit log, tenant isolation, backup 30 hari

---

## 🛠️ Tech Stack

| Lapisan | Teknologi |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| State | TanStack Query + Zustand |
| Backend | Next.js Server Actions + Route Handlers |
| Database | PostgreSQL 16 (Neon/Supabase) |
| ORM | Drizzle ORM |
| Auth | Auth.js v5 (Google OAuth + Email/Password) |
| Storage | Cloudflare R2 / AWS S3 (privat) |
| AI | OpenAI API (via backend) |
| Email | Resend + React Email |
| WhatsApp | Fonnte API |
| Queue | BullMQ + Redis (Upstash) |
| Monitoring | Sentry + Vercel Analytics |
| Testing | Vitest + Playwright |
| Deploy | Vercel |

Detail lengkap: lihat [PRD-TECH-STACK.md](./PRD-TECH-STACK.md)

---

## 📁 Struktur Proyek

```
UMKM-AI/
├── src/
│   ├── app/          # Next.js App Router (pages & API routes)
│   ├── components/   # UI components (shadcn/ui)
│   ├── server/       # Backend modules (auth, transaction, ai, dll.)
│   ├── lib/          # Shared utilities
│   └── types/        # TypeScript types
├── drizzle/          # Database migrations
├── public/           # Static assets & PWA manifest
├── tests/            # E2E tests (Playwright)
├── PRD.md            # Product Requirements Document
└── PRD-TECH-STACK.md # Tech Stack Document
```

---

## 🚀 Getting Started

### Prasyarat

- Node.js 20+
- pnpm / npm / yarn
- PostgreSQL (lokal atau Neon)
- Redis (opsional, untuk queue)

### Instalasi

```bash
# Clone repository
git clone https://github.com/your-org/umkm-ai.git
cd umkm-ai

# Install dependencies
pnpm install

# Salin environment variables
cp .env.example .env.local

# Jalankan migrasi database
pnpm db:migrate

# Seed data awal (opsional)
pnpm db:seed

# Jalankan development server
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Environment Variables

Lihat `.env.example` untuk daftar lengkap. Variabel utama:

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
OPENAI_API_KEY=...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
RESEND_API_KEY=...
```

---

## 📜 Scripts

| Command | Deskripsi |
|---|---|
| `pnpm dev` | Jalankan development server |
| `pnpm build` | Build production |
| `pnpm start` | Jalankan production server |
| `pnpm lint` | Lint kode |
| `pnpm typecheck` | Type checking |
| `pnpm test` | Jalankan unit & component tests |
| `pnpm test:e2e` | Jalankan E2E tests (Playwright) |
| `pnpm db:migrate` | Jalankan migrasi database |
| `pnpm db:studio` | Buka Drizzle Studio |

---

## 📖 Dokumentasi

- [PRD.md](./PRD.md) — Product Requirements Document (lengkap)
- [PRD-TECH-STACK.md](./PRD-TECH-STACK.md) — Dokumen Tech Stack

---

## 🔒 Keamanan

- HTTPS untuk semua koneksi
- Tenant isolation (Row-Level Security di PostgreSQL)
- RBAC diterapkan di backend
- MFA wajib untuk admin platform
- Audit log untuk perubahan sensitif
- Backup otomatis dengan retensi 30 hari

---

## 📄 Lisensi

Proprietary — All rights reserved.

---

## 👤 Kontak

Untuk pertanyaan atau kontribusi, hubungi tim pengembang UMKM-AI.
