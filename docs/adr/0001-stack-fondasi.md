# ADR 0001 — Stack fondasi UMKM-AI

Status: diterima · 2026-11-05

## Konteks
PRD menetapkan MVP keuangan multi-tenant dengan angka yang harus akurat di backend. Tim: satu developer. Repo publik, deploy Vercel.

## Keputusan
1. **Next.js 15 App Router + TypeScript strict**, Server Actions + Route Handlers sebagai backend. Satu codebase, modular per domain di `src/server/modules/`.
2. **Drizzle ORM + drizzle-kit** di atas Postgres Supabase (proyek existing, pooler 6543). Uang `bigint` rupiah. Migrasi SQL di repo.
3. **Auth.js v5** dengan Drizzle adapter, database session (bisa dicabut), email+password (argon2) + Google OAuth. MFA admin menyusul.
4. **Supabase Storage** bucket privat untuk bukti pembayaran/ekspor, akses lewat signed URL. R2 tidak dipakai supaya satu vendor.
5. **TanStack Query + Zustand**: server state vs UI state. Form pakai React Hook Form + Zod.
6. **ApexCharts** (bukan Recharts seperti di PRD-TECH-STACK) karena diminta user; dimuat dinamis `ssr: false`. **react-grid-layout** untuk grid dashboard, **Framer Motion** untuk transisi, **Lucide** untuk ikon.
7. **AI provider OpenAI-compatible via env** (`AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`) sehingga bisa diarahkan ke OpenAI, Groq, atau gateway lokal tanpa ubah kode.
8. **BullMQ + Redis ditunda**. Notifikasi/ekspor async baru butuh queue; di fondasi semuanya sinkron. `shortcut: tanpa queue, upgrade saat ekspor/notifikasi async masuk backlog`.

## Konsekuensi
- Vendor lock ringan: Supabase untuk DB + Storage; auth tetap milik aplikasi.
- RLS Postgres tetap dipakai sebagai lapis kedua; lapis pertama adalah `business_id` dari sesi server.
- ApexCharts hanya jalan di client → semua komponen chart wajib `'use client'` + `dynamic(..., { ssr: false })`.