# AGENTS.md — UMKM-AI

Panduan kerja untuk agen (Hermes / Claude Code / Codex) di repo ini. Bahasa produk: Indonesia.

## Sumber kebenaran

- `PRD.md` — kebutuhan produk & aturan bisnis. Jangan menyimpang tanpa mencatat ADR.
- `PRD-TECH-STACK.md` — stack awal. Keputusan yang berubah dicatat di `docs/adr/`.
- `docs/DESIGN.md` — design token, tipografi, komponen.
- `docs/TASKS.md` — scope yang sedang dikerjakan (urutan, status).
- `docs/PROGRESS-LOG.md` — catatan kemajuan per sesi.

## Keputusan yang sudah dikunci

| Area | Pilihan |
|---|---|
| Framework | Next.js 15 App Router + TypeScript strict |
| ORM | Drizzle ORM (`drizzle-kit` untuk migrasi) |
| Database | Supabase Postgres (proyek existing, pooler port 6543) |
| Storage | Supabase Storage (bucket privat) |
| Auth | Auth.js v5, email+password + Google OAuth, database session |
| AI | OpenAI-compatible API via env (`AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`) |
| UI | Tailwind 4 + shadcn-style components, Lucide, Framer Motion |
| Data client | TanStack Query; UI state Zustand |
| Chart | ApexCharts (`react-apexcharts`, dynamic import, `ssr: false`) |
| Grid | react-grid-layout (dashboard) |
| Font | Plus Jakarta Sans |
| Queue/Redis | belum dipakai di fondasi |

## Aturan teknis yang tidak boleh dilanggar

1. Uang = integer rupiah (`bigint`), bukan float. Semua perhitungan di backend.
2. `business_id` diambil dari sesi server, bukan dari body request. RLS + cek middleware.
3. Setiap route/server action memanggil `requirePermission()` sebelum menyentuh data.
4. Transaksi = soft delete (`deleted_at` + alasan), perubahan tercatat di `transaction_audit_logs`.
5. POST transaksi/pembayaran idempoten (`Idempotency-Key`).
6. AI tidak menulis ke ledger. Backend yang menghitung angka.
7. Jangan sebut selisih arus kas sebagai "laba bersih".
8. Tanggal transaksi (`transaction_date`, date) terpisah dari waktu server (`created_at`, timestamptz).
9. Rahasia hanya di `.env.local`; repo ini publik — `.env.example` hanya placeholder.

## Perintah

```bash
pnpm dev            # dev server
pnpm build          # build produksi
pnpm typecheck      # tsc --noEmit
pnpm lint           # eslint
pnpm db:generate    # drizzle-kit generate
pnpm db:migrate     # drizzle-kit migrate
pnpm db:studio      # drizzle studio
```

## Gaya kerja

Mode ponytail aktif: perubahan terkecil yang benar-benar menyelesaikan tugas. Tanpa abstraksi/opsi yang tidak diminta. Validasi input di batas kepercayaan, error handling yang mencegah kehilangan data, dan aksesibilitas tidak pernah dipotong. Akhiri balasan dengan 1–2 baris: apa yang dilewati dan risikonya.