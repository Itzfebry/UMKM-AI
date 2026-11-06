# TASKS — Fondasi (Fase 1, tahap 1)

Scope tahap ini: auth + profil bisnis + saldo awal + ledger transaksi + dashboard dasar. Review dulu sebelum lanjut ke utang/piutang, laporan, impor/ekspor, AI, langganan.

## F0 — Fondasi proyek `[selesai]`
- [x] Next.js 15 + TS strict + Tailwind 4 + ESLint (App Router, `src/`)
- [x] Dependensi: drizzle-orm, next-auth v5, zod, TanStack Query, zustand, apexcharts, react-grid-layout, framer-motion, lucide, argon2
- [x] Design token + Plus Jakarta Sans (`globals.css`, `layout.tsx`, `docs/DESIGN.md`)
- [x] `drizzle.config.ts`, `src/server/db/`, skrip `db:generate|migrate|studio`
- [x] `.env.example` (placeholder) + `.env.local` (lokal, ignored)
- [x] `pnpm typecheck` & `pnpm build` hijau

## F1 — Auth (Auth.js v5) `[selesai]`
- [x] Skema `users`, `accounts`, `sessions`, `verification_tokens`
- [x] Register email+password (argon2), login, logout
- [x] Google OAuth (butuh `GOOGLE_CLIENT_ID/SECRET` di `.env.local`)
- [x] Guard route lewat `requireUser()` di server (layout & page)
- [x] Verifikasi email (`/verifikasi?token=`) + kirim ulang; reset kata sandi (`/lupa-sandi`, `/reset-sandi?token=`)
- [x] Rate limit login: 5 percobaan gagal per 15 menit per email (tabel `login_attempts`) + audit login gagal/berhasil
- [x] Sesi JWT — lihat `docs/adr/0002-sesi-jwt.md` (menggantikan pilihan database session di ADR 0001)
- [ ] Pengiriman email butuh `RESEND_API_KEY`; tanpa itu tautan hanya tercatat di log server
- [ ] MFA admin — selesai di F8 (TOTP)

## F2 — Bisnis & onboarding `[selesai]`
- [x] Skema `businesses`, `memberships`, `opening_balances`
- [x] Onboarding: nama usaha → saldo awal + tanggal acuan → beranda
- [x] Satu bisnis aktif per user; model siap multi-bisnis
- [x] Saldo awal tidak dihitung pendapatan

## F3 — Ledger transaksi
- [x] Skema `categories`, `transactions`, `transaction_audit_logs`, `idempotency_keys`
- [x] 12 kategori default saat onboarding
- [x] Form catat transaksi (jenis, nominal, kategori sesuai jenis, tanggal, catatan, metode bayar)
- [x] Zod dipakai untuk validasi server
- [x] Idempotent create (`idempotencyKey`)
- [x] Edit + audit before/after (form inline di daftar)
- [x] Soft delete + alasan, daftar "tampilkan yang dihapus", tombol pulihkan
- [x] Daftar transaksi: pencarian catatan, filter jenis, pagination
- [x] RBAC backend: staff tidak boleh hapus/restore
- [x] Filter tanggal, kategori, jenis, pencarian, pagination, reset

## F4 — Dashboard dasar `[selesai]`
- [x] Saldo kas (opening + masuk − keluar)
- [x] Pendapatan & pengeluaran bulan berjalan + delta vs bulan lalu
- [x] Rincian kategori (ApexCharts donut, dynamic import)
- [x] 5 transaksi terbaru (urut `created_at`)
- [x] Empty state saat belum ada transaksi
- [x] Grid responsif: react-grid-layout (desktop), stack (mobile)
- [x] Insight AI harian di dashboard: disimpan di `ai_insights` (satu baris per hari per bisnis), tombol perbarui manual memakai satu kuota AI; beranda menampilkan insight hari ini atau yang terakhir tersimpan
- [x] Analisis otomatis tanpa perintah: tugas terjadwal harian (`runScheduledMaintenance`) membuat insight untuk setiap usaha yang punya transaksi (maks 20 per jalan), kuota AI dan jumlah transaksi diperiksa di dalam `ensureDailyInsight`, kegagalan satu usaha tidak menghentikan sisanya
- [x] Kartu "Perlu perhatian" di beranda: utang/piutang lewat jatuh tempo, piutang belum tertagih, transaksi tanpa kategori bulan ini, saldo awal belum diisi, sisa kuota transaksi/AI menipis
- [x] Grafik tren enam bulan (pendapatan vs pengeluaran, bukan laba bersih) di beranda
- [x] Kartu Insight AI di beranda: maximize lewat portal (dialog tengah, tutup dengan Esc/backdrop, fokus kembali ke kartu), tombol sembunyikan/tampilkan, dan kartu normal mengikuti tinggi sel grid
- [x] Tautan kartu "Perlu perhatian" menembus ke daftar yang sudah terfilter: `/utang-piutang?to=<kemarin>` untuk lewat jatuh tempo, `/transaksi?categoryId=none&from=<awal bulan>` untuk transaksi tanpa kategori (filter "Tanpa kategori" ditambah di `/transaksi`)
- [x] Grid beranda desktop: "Transaksi terbaru" di baris kedua kolom kiri, "Perlu perhatian" di baris ketiga kolom kiri
- [x] Log analisis di `/ai`: waktu, jenis (otomatis/manual/tanya jawab), model, lama proses, status sukses/gagal dari `audit_events`

## F5 — Utang & piutang (tahap 2)
- [x] Skema `debts` (+ enum `debt_kind`), `debt_audit_logs`, kolom `transactions.debt_id`
- [x] Catat utang/piutang: jenis, pihak, nominal, tanggal, jatuh tempo, catatan
- [x] Pembayaran parsial; sisa dihitung backend dari nominal − pembayaran valid
- [x] Pembayaran dicatat sebagai transaksi ledger (`debt_id` terisi) → kas & laporan ikut otomatis
- [x] Tolak pembayaran melebihi sisa (cek di dalam transaksi DB + row lock)
- [x] Status belum dibayar / sebagian / lunas; filter status, jenis, pihak, rentang jatuh tempo
- [x] Ringkasan utang/piutang + jumlah lewat jatuh tempo di halaman dan dashboard
- [x] Hapus (soft) utang/piutang oleh owner/admin dengan alasan; staff tidak bisa
- [x] Idempotensi create & pembayaran
- [ ] Pengingat jatuh tempo otomatis — di luar MVP (FR-ARAP-10)
- [x] Pulihkan utang yang dihapus (tampilan "yang dihapus" + tombol Pulihkan, audit `restore`)

## F5 — Laporan, ekspor, impor, AI, anggota, langganan, keamanan (tahap 2)
- [x] Laporan (`/laporan`): preset hari ini, 7 hari, bulan berjalan, bulan lalu, rentang khusus; delta nominal + persen; catatan periode belum penuh
- [x] Ekspor CSV/XLSX/PDF (`/laporan/ekspor`): satu sumber angka, proteksi formula injection, audit ekspor, staf hanya ringkasan, berkas dibuat di memori (tanpa berkas publik)
- [x] Impor CSV (`/impor`): template resmi, pratinjau valid/tidak valid/duplikat, batch `import_batches`, sidik baris `import_row_keys` mencegah impor ulang, tunduk kuota paket
- [x] AI Finance Analyst (`/ai`): ringkasan backend 3 bulan, kuota per paket, audit metadata, tanpa simpan riwayat, kegagalan AI tidak menghentikan fitur keuangan
- [x] Anggota & undangan (`/anggota`, `/undangan/[token]`): token unik + masa berlaku 7 hari, pencabutan, peran admin/staf, slot paket diperiksa ulang saat menerima, transfer kepemilikan dengan autentikasi ulang
- [x] Paket Free/Pro + kuota: 100 transaksi/bulan & 10 permintaan AI (Free), 200 AI & 5 anggota (Pro); kuota habis tidak menghapus data
- [x] Langganan manual (`/langganan`) + verifikasi admin (`/panel`): invoice 3 hari, bukti privat (opsional berkas), approve/reject dengan alasan, aktivasi Pro idempoten 30 hari, pembatalan perpanjangan
- [x] Notifikasi (`/notifikasi`): in-app + email via Resend; deduplikasi lewat `dedupe_key`; preferensi kanal di `/pengaturan` (email, persetujuan WhatsApp), email transaksional verifikasi/reset tetap dikirim
- [x] Riwayat perubahan (`/riwayat`, owner/admin): audit transaksi dan utang/piutang
- [x] Panel admin platform terpisah: `/panel` + login sendiri `/panel/masuk` (`/api/auth-admin`, cookie `umkm-ai.admin-session-token`), MFA di dalam panel, `/admin` dihapus (ADR 0003)
- [x] Label reset kuota bulanan di `/langganan` dan `/ai`
- [x] Keamanan: rate limit login, MFA TOTP admin, audit 90 hari + pembersihan, hapus bisnis permanen dengan autentikasi ulang
- [x] Tugas terjadwal `/api/cron/notifications` (`CRON_SECRET`): invoice kedaluwarsa, masa tenggang Pro berakhir, pengingat Pro H-3 (notifikasi + email pemilik), retensi audit 90 hari; jadwal Vercel Cron ada di `vercel.json`, tombol manual di `/panel`
- [x] Backup: skrip `pnpm backup:export` (seluruh tabel `umkm_ai` ke NDJSON + manifest) dan prosedur uji restore di `docs/BACKUP.md`
- [x] Uji isolasi antar bisnis otomatis: `pnpm security:tenant-check` (7 pemeriksaan, akun kedua tidak melihat data bisnis lain)
- [x] Pulihkan utang/piutang yang dihapus (tampilan "yang dihapus" + tombol Pulihkan, audit `restore`)
- [ ] WhatsApp: menunggu penyedia + persetujuan pengguna
- [ ] Uji restore backup terakhir masih perlu dijalankan manual di database uji (prosedurnya sudah ada)
- [ ] Pemantauan backup dan uji restore berkala (FR-BACKUP-03/04) masih manual

## Catatan deviasi
- Sesi memakai JWT, bukan database session seperti ADR 0001 — lihat ADR 0002.
- Hapus utang/piutang tidak menghapus transaksi pembayarannya: uangnya benar-benar berpindah.
- Ekspor detail dibatasi 2000 baris dan impor 1000 baris per berkas (batas awal, mudah dinaikkan).
- Bukti pembayaran berbentuk berkas hanya bila Supabase Storage dikonfigurasi; tanpa itu tersimpan sebagai keterangan teks.
- PDF dibuat tanpa dependensi (mesin PDF minimal): teks Latin-1, tanpa tabel bergaris.