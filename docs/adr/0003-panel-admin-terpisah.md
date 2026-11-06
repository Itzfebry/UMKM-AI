# ADR 0003 — Panel admin platform terpisah dari aplikasi pengguna

Tanggal: 2026-11-06
Status: diterima

## Konteks

Panel admin platform (verifikasi pembayaran manual, MFA, audit) semula memakai halaman masuk pengguna (`/masuk`) dengan satu sesi Auth.js dan alamat `/admin`. Artinya satu cookie sesi berlaku untuk dua peran yang sangat berbeda: peran bisnis (pemilik/staf) dan peran platform (admin). Permintaan pemilik produk: pisahkan login admin, alamat berbeda, dan jangan `/admin`.

## Keputusan

1. Instans Auth.js kedua `src/admin-auth.ts` (`adminAuth`) dengan `basePath: "/api/auth-admin"`, handler di `src/app/api/auth-admin/[...nextauth]/route.ts`.
2. Cookie sesi sendiri: `umkm-ai.admin-session-token` (plus csrf/callback-url terpisah). Sesi pengguna biasa tetap `authjs.session-token`.
3. Hanya akun yang terdaftar di tabel `platform_admins` bisa masuk lewat jalur ini; provider Google tidak diaktifkan di panel.
4. MFA (TOTP) wajib pada jalur masuk panel begitu admin mendaftarkan authenticator; pendaftaran/pematian MFA ada di dalam panel (`/panel`), bukan di `/pengaturan` pengguna.
5. Alamat: halaman masuk `GET /panel/masuk`, konsol `GET /panel`. Rute `/admin` dihapus.
6. Aksi panel (`requirePlatformAdmin()`, MFA, pembersihan audit, tugas terjadwal manual) memakai sesi panel; aksi bisnis (`deleteBusiness`) tetap memakai sesi pengguna.

## Konsekuensi

- Admin platform perlu masuk dua kali bila ingin memakai aplikasi keuangan dan panel: sesi sengaja tidak dibagi.
- `isPlatformAdmin(userId)` tetap berbasis database sehingga aplikasi pengguna bisa menampilkan tautan ke panel tanpa membuka data panel.
- `AUTH_URL` di `.env.local` harus diarahkan ke domain produksi; bila salah, Auth.js mengarahkan balik ke host yang salah (gejala: `MissingCSRF` saat diuji di port lain). Untuk verifikasi lokal pakai `AUTH_URL=http://localhost:3010 NEXT_DIST_DIR=.next-verify PORT=3010 pnpm start`.
- Menambah rute panel berarti penambahan entri di `vercel.json` tidak diperlukan (fungsi dinamis biasa); cron tetap `/api/cron/notifications` dengan `CRON_SECRET`.
