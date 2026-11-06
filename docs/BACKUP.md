# Backup dan pemulihan

## Kebijakan (PRD 8.5)

- Database: backup otomatis harian dari Supabase, retensi mengikuti paket proyek (Free: 7 hari, Pro: 30 hari). Target retensi 30 hari sesuai FR-BACKUP-02.
- Salinan mandiri: `pnpm backup:export` menulis seluruh tabel schema `umkm_ai` ke `backups/<timestamp>/*.ndjson` + `manifest.json`. Simpan di luar repo; folder `backups/` sudah di-ignore git.
- Berkas sensitif (bukti pembayaran) berada di bucket privat Supabase Storage; backup bucket ditangani Supabase, bukan skrip ini.
- RPO/RTO ditetapkan setelah kebutuhan bisnis divalidasi (FR-BACKUP-06); asumsi awal: RPO 24 jam, RTO 4 jam.

## Prosedur rutin

1. Harian: pastikan backup otomatis Supabase berjalan (Dashboard → Database → Backups).
2. Mingguan: `pnpm backup:export`, lalu simpan hasil ke penyimpanan terenkripsi di luar repo.
3. Bulanan: jalankan **uji pemulihan** (di bawah) minimal pada satu salinan.

## Uji pemulihan (restore drill)

Tujuan: membuktikan data bisa dipulihkan tanpa menyentuh database produksi.

1. `pnpm backup:export` pada database produksi.
2. Buat database/schema uji (mis. project Supabase terpisah atau Postgres lokal).
3. Terapkan migrasi: `pnpm db:migrate` dengan `DATABASE_URL`/`DIRECT_URL` menunjuk ke database uji.
4. Muat satu tabel, contoh `transactions`:
   ```bash
   cat backups/<stamp>/transactions.ndjson \
     | sed 's/^/\\copy umkm_ai.transactions from stdin with (format csv)/' >/dev/null  # lihat catatan
   ```
   Cara paling praktis: gunakan `psql` dengan perintah `\copy umkm_ai.transactions(jsonb_populate_recordset(...))`.
   Untuk volume MVP, cara termudah: jalankan skrip Node kecil yang membaca NDJSON lalu `insert into ... values` per baris (id UUID dipertahankan).
5. Bandingkan hasil: jumlah baris per tabel harus sama dengan `manifest.json`, dan saldo kas dari `opening_balances` + `transactions` harus cocok dengan laporan di aplikasi.
6. Catat tanggal, durasi, dan temuan di `docs/PROGRESS-LOG.md`.

## Penghapusan data

- Penghapusan bisnis oleh pemilik bersifat permanen pada database aktif dan mencabut akses semua anggota (`/pengaturan`, FR-DATA-01..03).
- Salinan backup dan bucket dapat menyimpan data hingga masa retensi berakhir (30 hari), jadi penghapusan tidak dijanjikan langsung dari seluruh salinan (FR-DATA-04).
- Kewajiban penyimpanan menurut hukum yang berlaku perlu ditinjau sebelum produksi penuh (FR-DATA-05).

## Perintah

```bash
pnpm backup:export                       # ekspor schema umkm_ai ke backups/<waktu>/
pnpm security:tenant-check http://...    # uji isolasi data antar bisnis
```
