# DESIGN — UMKM-AI

## Palet

| Token | Hex | Pakai |
|---|---|---|
| `--color-primary` | `#DB1A1A` | aksi utama, angka negatif/penting, brand |
| `--color-surface` | `#FFF6F6` | latar halaman, kartu sekunder |
| `--color-accent` | `#8CC7C4` | aksen positif, chart sekunder, badge |
| `--color-deep` | `#2C687B` | teks kuat, header, chart utama |

Turunan (dihitung, bukan hex baru): `primary/10` untuk hover halus, `deep/60` untuk teks sekunder, `accent/20` untuk latar badge, `background` = `#E4E4E7` (latar halaman abu muda, kartu dibedakan lewat border). Teks utama `#1A1A1A`, teks sekunder `#2C687B` opasitas 70%. Putih `#FFFFFF` untuk kartu di atas surface.

## Tipografi — Plus Jakarta Sans

| Peran | Ukuran/line-height | Weight | Pakai |
|---|---|---|---|
| display | 36/40 | 700 | angka saldo besar |
| h1 | 30/36 | 700 | judul halaman |
| h2 | 24/32 | 600 | judul seksi |
| h3 | 20/28 | 600 | judul kartu |
| body | 16/24 | 400 | teks umum |
| body-strong | 16/24 | 600 | label nilai, tombol |
| small | 14/20 | 400 | metadata, helper |
| caption | 12/16 | 500 | label chart, badge |

Angka uang memakai `font-variant-numeric: tabular-nums`. Mata uang: `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })`.

## Prinsip

- Mobile-first; target sentuh ≥ 44px; navigasi bawah maks 5 item (Beranda, Transaksi, Laporan, AI, Menu).
- Status tidak dibedakan lewat warna saja (selalu ada label/ikon).
- Kontras teks ≥ 4.5:1. Putih di atas `#DB1A1A` lolos; `#8CC7C4` hanya untuk latar/aksen, bukan teks di surface terang tanpa penguatan.
- Setiap metrik punya penjelasan definisi singkat (tooltip/info), dan saldo tidak pernah dilabeli laba.

## Komponen wajib

- `Button` (primary/secondary/ghost), `Input`, `Select`, `DatePicker` (input type=date native), `Card`, `Badge`, `Table` (responsif → kartu di mobile), `EmptyState`, `Skeleton`, `Toast`.
- Chart: ApexCharts diimpor dinamis (`ssr: false`) di dalam komponen client.
- Dashboard grid pakai `react-grid-layout` (desktop); di mobile menumpuk vertikal.
- Animasi Framer Motion: transisi halaman 150–200ms, tanpa animasi yang menghalangi input.

## Keadaan

Setiap layar punya: kosong (panduan onboarding), loading (skeleton), error (pesan + cara perbaiki), sukses (toast singkat).