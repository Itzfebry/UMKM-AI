# ADR 0002 — Strategi sesi: JWT, bukan database session

Status: diterima (dicatat ulang untuk menghapus deviasi dari ADR 0001)

## Konteks

ADR 0001 memilih Auth.js v5 dengan database session. Implementasi login email+password memakai Credentials provider, dan Auth.js v5 tidak mendukung kombinasi Credentials + database session (dokumentasi Auth.js: sesi database hanya untuk provider OAuth/email). Memaksa database session berarti menulis alur login manual sendiri (verifikasi kata sandi → buat baris `sessions` → set cookie) dan melepas sebagian besar perilaku Auth.js.

## Keputusan

- Sesi memakai JWT (`session: { strategy: "jwt" }` di `src/auth.ts`), ditandatangani `AUTH_SECRET`, cookie httpOnly + sameSite=lax (default Auth.js) dan `secure` otomatis saat HTTPS.
- Tabel `sessions` tetap ada karena adapter Auth.js memerlukannya, tetapi tidak dipakai untuk login credentials.
- Google OAuth tetap lewat adapter yang sama; akun OAuth otomatis dianggap terverifikasi.

## Konsekuensi

- Sesi tidak bisa dicabut dari server (tidak ada baris sesi untuk dihapus). Mitigasi: umur JWT pendek (default Auth.js 30 hari; dapat diturunkan), ganti kata sandi + audit keamanan, dan rencana pencabutan berbasis daftar token saat produksi.
- Tidak ada query DB tambahan per request untuk memuat sesi → halaman lebih cepat.
- Bila pencabutan sesi instan dibutuhkan (mis. insiden keamanan), opsi berikutnya: alur login credentials manual dengan tabel `sessions` (perlu waktu 1–2 hari kerja), atau menyimpan `tokenVersion` di tabel `users` dan memeriksanya di callback `jwt`.
