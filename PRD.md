# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## UMKM-AI: Platform Keuangan dan Analisis Bisnis Berbasis AI

**Versi:** 1.0 Draft  
**Status:** Konsolidasi hasil discovery 1–100  
**Target pasar:** UMKM Indonesia  
**Model bisnis:** Freemium dan langganan Pro  
**Platform:** Responsive Web + Progressive Web App (PWA)  
**Bahasa utama:** Bahasa Indonesia  
**Zona waktu default:** Asia/Jakarta  
**Harga Pro awal:** Rp49.000/bulan, masih perlu validasi pasar

---

# 1. Ringkasan Produk

UMKM-AI membantu pemilik UMKM mencatat transaksi, memahami kondisi keuangan, memantau utang dan piutang, serta mendapatkan rekomendasi bisnis berdasarkan data keuangan aktual.

Banyak pelaku UMKM sudah menggunakan buku tulis, Excel, Google Sheets, atau aplikasi pencatatan sederhana. Masalahnya bukan hanya bagaimana mencatat transaksi, melainkan bagaimana mengubah catatan tersebut menjadi informasi yang mudah dipahami dan berguna untuk mengambil keputusan.

UMKM-AI menggabungkan pencatatan keuangan yang sederhana dengan analisis berbasis AI.

### 1.1 Visi produk

**“Bukan sekadar mencatat keuangan. Pahami bisnis di balik angkanya.”**

### 1.2 Proposisi nilai

- Pencatatan transaksi yang mudah melalui formulir manual.
- Ringkasan keuangan yang dapat dipahami oleh pengguna nonakuntansi.
- Analisis dan rekomendasi AI berdasarkan data bisnis aktual.
- Laporan yang dapat diekspor untuk evaluasi dan dokumentasi.
- Pencatatan utang dan piutang sederhana.
- Akses kolaboratif bagi pemilik dan anggota usaha.
- Model gratis untuk memulai dan Pro untuk kebutuhan analisis lanjutan.

### 1.3 Prinsip utama produk

1. **Data keuangan harus akurat.** Perhitungan nominal dilakukan backend, bukan diserahkan kepada AI.
2. **AI harus transparan.** Setiap insight menyertakan periode, angka pendukung, dan keterbatasan analisis.
3. **Pencatatan harus tetap berjalan tanpa AI.** Gangguan layanan AI tidak boleh menghentikan fitur keuangan inti.
4. **Keamanan sejak awal.** Data setiap bisnis harus terisolasi.
5. **Antarmuka sederhana.** Pengguna tidak harus memahami istilah akuntansi untuk menggunakan aplikasi.
6. **Tidak mengklaim laba bersih secara keliru.** MVP belum memiliki modul persediaan dan harga pokok penjualan yang lengkap.

# 2. Latar Belakang dan Masalah

## 2.1 Masalah pengguna

| Masalah | Dampak |
|---|---|
| Catatan transaksi tersebar | Pemilik kesulitan memperoleh gambaran keuangan yang konsisten. |
| Pencatatan tidak rutin | Ringkasan keuangan dapat tidak lengkap. |
| Sulit membaca laporan | Pengguna mengetahui nominal, tetapi belum memahami pola bisnis. |
| Utang dan piutang tidak terpantau | Risiko keterlambatan pembayaran dan kekurangan kas meningkat. |
| Data spreadsheet sulit dianalisis | Pemilik harus menghitung dan membandingkan periode secara manual. |
| Koreksi transaksi tidak terlacak | Perubahan dapat menimbulkan ketidakjelasan atau sengketa internal. |

## 2.2 Hipotesis yang perlu divalidasi

- Banyak UMKM sudah terbiasa menggunakan Excel atau Google Sheets.
- Pemilik bersedia mencatat transaksi secara rutin jika prosesnya cukup cepat.
- Analisis keuangan berbasis AI memberikan nilai tambah yang layak dibayar.
- Harga Rp49.000 per bulan dapat diterima oleh segmen pengguna sasaran.
- Pengguna akan kembali menggunakan aplikasi jika laporan mudah dipahami dan membantu keputusan bisnis.

Hipotesis tersebut perlu diuji melalui wawancara dan uji coba dengan pelaku UMKM nyata sebelum menjadi klaim pasar.

# 3. Sasaran Produk

## 3.1 Tujuan MVP

1. Membantu pengguna mencatat transaksi keuangan secara konsisten.
2. Menampilkan ringkasan kondisi keuangan berdasarkan data yang tersedia.
3. Menyediakan laporan periode berjalan dan perbandingan historis.
4. Mengelola utang dan piutang beserta pembayaran parsial.
5. Memberikan insight AI yang berbasis angka dan memiliki penjelasan.
6. Mendukung akses multianggota dengan izin berbeda.
7. Menyediakan model monetisasi Free dan Pro.
8. Menjaga data pelanggan melalui autentikasi, otorisasi, backup, dan audit.

## 3.2 Bukan tujuan MVP

- Menggantikan sistem akuntansi lengkap.
- Menghasilkan laporan laba bersih yang definitif tanpa data biaya produksi dan persediaan yang memadai.
- Mengelola stok barang secara terperinci.
- Melakukan sinkronisasi transaksi offline.
- Mengirim pengingat jatuh tempo otomatis.
- Mengintegrasikan AI chat dan OCR struk pada fase pertama.
- Mengotomatiskan pembayaran langganan melalui payment gateway.
- Menyediakan layanan pemeriksaan laporan oleh tenaga ahli manusia.

# 4. Target Pengguna dan Persona

## 4.1 Pemilik UMKM

Kebutuhan:
- Mengetahui kondisi keuangan usaha.
- Melihat uang masuk dan keluar.
- Memahami tren bisnis.
- Mengelola anggota usaha.
- Mengakses seluruh laporan dan mengelola langganan.

## 4.2 Admin keuangan

Kebutuhan:
- Mengelola transaksi dan kategori.
- Memantau utang dan piutang.
- Melakukan koreksi sesuai kewenangan.
- Mengakses laporan sesuai hak akses.

## 4.3 Staf atau kasir

Kebutuhan:
- Mencatat transaksi dengan cepat.
- Melihat transaksi yang boleh diakses.
- Memahami ringkasan keuangan dasar.
- Mengekspor laporan ringkasan sesuai izin.

Target usaha mencakup berbagai sektor UMKM, baik tradisional maupun digital. Desain harus dapat digunakan oleh pengguna dengan tingkat literasi digital yang beragam.

# 5. Ruang Lingkup dan Tahapan Pengembangan

## Fase 1: MVP Keuangan

- Registrasi dan login.
- Pembuatan profil bisnis.
- Saldo awal.
- Pencatatan transaksi manual.
- Kategori transaksi.
- Dashboard keuangan.
- Pencarian dan filter transaksi.
- Edit, soft delete, dan pemulihan transaksi.
- Utang dan piutang dengan pembayaran parsial.
- Laporan dan perbandingan periode.
- Ekspor CSV, Excel, dan PDF.
- Impor CSV.
- AI Finance Analyst dengan kuota.
- Manajemen anggota dan hak akses.
- Langganan Pro dengan pembayaran manual.
- Notifikasi penting.
- Keamanan, audit, dan backup.

## Fase 2: AI Chat

- Input transaksi melalui percakapan.
- Penguraian maksud dan nominal transaksi.
- Konfirmasi draft sebelum penyimpanan.
- Pertanyaan analisis berdasarkan konteks historis.
- Validasi dan pengendalian penggunaan AI.

## Fase 3: OCR Struk

- Unggah atau ambil foto struk.
- Ekstraksi tanggal, nominal, dan informasi relevan.
- Peninjauan hasil OCR oleh pengguna.
- Konfirmasi sebelum transaksi disimpan.
- Penanganan hasil yang tidak terbaca dan duplikasi.

Ketiga metode input nantinya harus menggunakan model transaksi yang sama. AI tidak boleh langsung menulis ke ledger tanpa validasi backend.

# 6. Arsitektur Fungsional

Modul utama:

1. Identity & Authentication
2. Business & Membership
3. Transaction Ledger
4. Categories
5. Cash Summary
6. Payables & Receivables
7. Dashboard & Reports
8. AI Finance Analyst
9. CSV Import & Export
10. Subscription & Payment Verification
11. Notifications
12. Audit & Security
13. Backup & Data Lifecycle
14. Admin Platform

Backend menjadi sumber kebenaran untuk perhitungan, hak akses, status langganan, kuota, dan penyimpanan data.

# 7. Persyaratan Fungsional

## 7.1 Registrasi dan autentikasi

**FR-AUTH-01:** Pengguna dapat mendaftar menggunakan email dan kata sandi.

**FR-AUTH-02:** Pengguna dapat masuk menggunakan Google.

**FR-AUTH-03:** Sistem mendukung verifikasi email, reset kata sandi, logout, dan kedaluwarsa sesi.

**FR-AUTH-04:** Satu identitas pengguna dapat ditautkan dengan metode login yang sesuai tanpa menciptakan akun duplikat secara tidak sengaja.

**FR-AUTH-05:** Autentikasi dan otorisasi harus diperiksa di backend untuk setiap permintaan yang dilindungi.

**FR-AUTH-06:** Akun admin platform wajib menggunakan MFA.

**FR-AUTH-07:** Sistem menyediakan pemulihan MFA secara aman dan mencatat perubahan pengaturan autentikasi.

## 7.2 Profil bisnis dan onboarding

**FR-ONB-01:** Satu akun pengguna memiliki satu bisnis aktif pada pengalaman produk awal.

**FR-ONB-02:** Model data tetap memungkinkan pengembangan keanggotaan beberapa bisnis di masa mendatang.

**FR-ONB-03:** Pengguna harus mengisi saldo awal saat onboarding.

**FR-ONB-04:** Saldo awal memiliki tanggal acuan dan dapat ditandai sebagai estimasi.

**FR-ONB-05:** Saldo awal tidak dihitung sebagai pendapatan.

**FR-ONB-06:** Onboarding memandu pengguna untuk mengisi saldo awal dan mencatat transaksi pertama.

**FR-ONB-07:** Progres onboarding dapat dilanjutkan kembali. Langkah yang tidak wajib dapat dilewati jika tidak mengganggu kebutuhan inti.

## 7.3 Pencatatan transaksi

**FR-TXN-01:** Pengguna berwenang dapat membuat transaksi melalui formulir manual.

**FR-TXN-02:** Formulir memuat:
- Jenis transaksi.
- Nominal dalam rupiah.
- Kategori.
- Tanggal transaksi.
- Catatan opsional.
- Metode pembayaran opsional.

**FR-TXN-03:** Nominal harus berupa angka positif yang valid. Jenis transaksi menentukan apakah nilai menambah atau mengurangi saldo.

**FR-TXN-04:** Tanggal default adalah hari ini, tetapi pengguna dapat memilih tanggal lampau.

**FR-TXN-05:** Sistem menyimpan tanggal transaksi terpisah dari waktu pencatatan di server.

**FR-TXN-06:** Transaksi yang ditambahkan anggota usaha langsung tercatat tanpa proses persetujuan pemilik.

**FR-TXN-07:** Perubahan transaksi dapat dilakukan oleh anggota yang memiliki izin.

**FR-TXN-08:** Setiap perubahan menyimpan nilai sebelum dan sesudah, pelaku, serta waktu perubahan.

**FR-TXN-09:** Penghapusan transaksi menggunakan soft delete, menyimpan alasan, dan mencatat aktivitas audit.

**FR-TXN-10:** Pemilik dan admin bisnis dapat menghapus serta memulihkan transaksi sesuai izin.

**FR-TXN-11:** Transaksi yang dihapus tidak masuk ke saldo dan laporan aktif.

**FR-TXN-12:** Pemulihan transaksi tercatat sebagai peristiwa audit baru.

**FR-TXN-13:** Pengiriman formulir harus menggunakan mekanisme idempotensi agar klik ganda atau retry tidak menciptakan transaksi ganda.

**FR-TXN-14:** Formulir tidak boleh dianggap berhasil sebelum server mengonfirmasi penyimpanan.

**FR-TXN-15:** Jika jaringan terputus, aplikasi memberi tahu pengguna dan mempertahankan isian selama memungkinkan.

## 7.4 Model transaksi dan kategori

Kategori awal disediakan berdasarkan jenis transaksi, lalu dapat disesuaikan.

Jenis transaksi harus membedakan setidaknya:

- Pendapatan operasional.
- Pengeluaran operasional.
- Setoran modal pemilik.
- Penarikan pribadi pemilik.
- Transaksi pinjaman yang relevan.

Setoran modal, penarikan pribadi, dan penerimaan pinjaman tidak boleh otomatis dikategorikan sebagai pendapatan operasional. Pelunasan pokok pinjaman tidak boleh otomatis dianggap sebagai beban operasional.

**FR-CAT-01:** Pemilik dan admin dapat menambahkan, mengganti nama, serta mengarsipkan kategori sesuai izin.

**FR-CAT-02:** Kategori yang sudah digunakan dalam transaksi historis tidak dihapus secara fisik melalui alur normal.

**FR-CAT-03:** Backend memvalidasi bahwa kategori termasuk dalam bisnis yang bersangkutan.

**FR-CAT-04:** Laporan membedakan jenis transaksi agar perhitungan tidak mencampur arus modal dan operasi bisnis.

## 7.5 Saldo kas

**FR-CASH-01:** MVP menggunakan satu saldo gabungan.

**FR-CASH-02:** Saldo dihitung dari saldo awal ditambah arus masuk yang relevan dikurangi arus keluar yang relevan.

**FR-CASH-03:** Perhitungan dilakukan di backend dari transaksi valid, bukan dari angka saldo yang dapat diubah bebas oleh klien.

**FR-CASH-04:** Transaksi yang dihapus tidak masuk perhitungan aktif.

**FR-CASH-05:** Perubahan transaksi historis memicu perhitungan ulang ringkasan yang terdampak.

**FR-CASH-06:** Saldo harus dibedakan dari laba. Selisih uang masuk dan keluar bukan otomatis laba bersih.

## 7.6 Utang dan piutang

**FR-ARAP-01:** Pengguna dapat mencatat kewajiban usaha dan tagihan kepada pihak lain.

**FR-ARAP-02:** Data memuat jenis, kontak atau pihak terkait, nominal, tanggal transaksi, tanggal jatuh tempo, dan status.

**FR-ARAP-03:** Sistem mendukung pembayaran parsial.

**FR-ARAP-04:** Pembayaran disimpan sebagai catatan terpisah dari tagihan atau kewajiban utama.

**FR-ARAP-05:** Sisa kewajiban dihitung dari nominal awal dikurangi pembayaran yang valid.

**FR-ARAP-06:** Sistem mencegah pembayaran melebihi sisa kewajiban kecuali ada alur koreksi yang dirancang secara eksplisit.

**FR-ARAP-07:** Status mencakup belum dibayar, sebagian dibayar, dan lunas.

**FR-ARAP-08:** Pengguna dapat memfilter data berdasarkan status, tanggal jatuh tempo, dan pihak terkait.

**FR-ARAP-09:** Utang dan piutang tidak otomatis mengubah saldo kas sebelum pembayaran aktual dicatat.

**FR-ARAP-10:** MVP tidak mengirim pengingat jatuh tempo otomatis.

## 7.7 Dashboard

**FR-DASH-01:** Dashboard default menampilkan periode bulan berjalan.

**FR-DASH-02:** Dashboard menampilkan:
- Saldo kas.
- Total pendapatan yang tercatat.
- Total pengeluaran yang tercatat.
- Perbandingan periode.
- Rincian kategori.
- Ringkasan utang dan piutang.
- Insight AI jika data mencukupi.

**FR-DASH-03:** Setiap metrik memiliki penjelasan singkat tentang definisi, cara perhitungan, dan keterbatasannya.

**FR-DASH-04:** Dashboard tidak menyebut selisih arus kas sebagai laba bersih tanpa data biaya dan persediaan yang memadai.

**FR-DASH-05:** Dashboard memiliki keadaan kosong yang memandu pengguna menyelesaikan onboarding.

**FR-DASH-06:** Tampilan mobile memprioritaskan tombol “Catat Transaksi”, ringkasan keuangan, dan lima transaksi terbaru.

**FR-DASH-07:** Transaksi terbaru diurutkan berdasarkan waktu pencatatan terbaru agar transaksi bertanggal lampau tetap mudah ditemukan.

**FR-DASH-08:** Navigasi mobile menggunakan maksimal lima item utama: Beranda, Transaksi, Laporan, AI, dan Menu.

## 7.8 Pencarian dan filter

**FR-SEARCH-01:** Pengguna dapat mencari berdasarkan catatan dan nama kategori.

**FR-SEARCH-02:** Filter mencakup tanggal, jenis transaksi, dan kategori.

**FR-SEARCH-03:** Pengguna dapat menghapus filter dan kembali ke tampilan awal.

**FR-SEARCH-04:** Data menggunakan pagination dan filter berdasarkan bisnis serta izin akses.

**FR-SEARCH-05:** Pencarian tidak boleh membocorkan transaksi dari bisnis lain.

## 7.9 Laporan dan perbandingan

**FR-REPORT-01:** Periode default adalah bulan berjalan.

**FR-REPORT-02:** Pengguna dapat memilih hari ini, tujuh hari terakhir, bulan sebelumnya, dan rentang khusus.

**FR-REPORT-03:** Pengguna dapat membandingkan beberapa periode mingguan atau bulanan.

**FR-REPORT-04:** Paket Pro dapat memperoleh perbandingan historis yang lebih panjang, sesuai batas yang ditetapkan.

**FR-REPORT-05:** Perbandingan menampilkan perubahan nominal dan persentase bila perhitungan bermakna.

**FR-REPORT-06:** Sistem menjelaskan apabila periode belum lengkap atau data tidak cukup untuk perbandingan yang adil.

**FR-REPORT-07:** Penambahan atau koreksi transaksi historis memperbarui laporan periode terkait.

**FR-REPORT-08:** Laporan yang sudah diekspor tidak berubah ketika data sumber berubah. Setiap ekspor menampilkan periode dan waktu pembuatan.

## 7.10 Ekspor laporan

**FR-EXPORT-01:** Sistem menyediakan CSV, Excel (XLSX), dan PDF.

**FR-EXPORT-02:** Semua format menggunakan sumber perhitungan backend yang sama.

**FR-EXPORT-03:** Laporan menggunakan format rupiah dan periode yang konsisten.

**FR-EXPORT-04:** Pemilik dan admin bisnis dapat mengekspor laporan penuh sesuai izin.

**FR-EXPORT-05:** Staf hanya dapat mengekspor laporan ringkasan.

**FR-EXPORT-06:** Ekspor dibatasi berdasarkan peran, bisnis, dan periode.

**FR-EXPORT-07:** Aktivitas ekspor dicatat dalam audit.

**FR-EXPORT-08:** CSV harus dilindungi dari CSV formula injection.

**FR-EXPORT-09:** File sensitif disimpan secara privat dan diakses melalui mekanisme yang aman.

## 7.11 Impor CSV

**FR-IMPORT-01:** Pengguna dapat mengunduh template CSV resmi.

**FR-IMPORT-02:** Kolom template memuat tanggal, jenis transaksi, nominal, kategori, dan catatan opsional.

**FR-IMPORT-03:** Sistem melakukan validasi dan menampilkan pratinjau sebelum impor.

**FR-IMPORT-04:** Sistem mengimpor baris valid dan melaporkan baris tidak valid.

**FR-IMPORT-05:** Pengguna melihat jumlah baris valid, tidak valid, dan kemungkinan duplikat sebelum konfirmasi.

**FR-IMPORT-06:** Setiap impor memiliki identitas batch dan hasil yang dapat ditelusuri.

**FR-IMPORT-07:** Baris yang sudah berhasil diimpor tidak boleh terimpor ulang secara tidak sengaja.

**FR-IMPORT-08:** Duplikat yang sudah terkonfirmasi berdasarkan identitas file/baris atau kunci idempotensi diblokir. Kemiripan tanggal dan nominal saja tidak otomatis dianggap sebagai duplikat pasti.

**FR-IMPORT-09:** Impor tidak mengubah saldo awal.

**FR-IMPORT-10:** Impor tunduk pada batas transaksi paket Free.

**FR-IMPORT-11:** Kategori dan jenis transaksi divalidasi di backend.

## 7.12 AI Finance Analyst

**FR-AI-01:** AI menganalisis data keuangan aktual bisnis.

**FR-AI-02:** Backend menghitung seluruh angka, agregasi, dan metrik keuangan.

**FR-AI-03:** AI menerima ringkasan yang relevan, bukan seluruh data pelanggan secara default.

**FR-AI-04:** Data historis diringkas agar AI dapat membandingkan periode tanpa mengirim semua transaksi setiap kali.

**FR-AI-05:** Detail transaksi diambil secara selektif bila diperlukan untuk menjawab pertanyaan tertentu.

**FR-AI-06:** AI menghasilkan temuan, interpretasi, rekomendasi, dan keterbatasan secara terpisah.

**FR-AI-07:** Setiap insight menyertakan periode analisis, angka pendukung, serta transaksi relevan bila diperlukan.

**FR-AI-08:** Sistem tidak menghasilkan kesimpulan yang tidak didukung data.

**FR-AI-09:** Jika data tidak mencukupi, sistem menjelaskan kekurangannya dan menyarankan langkah berikutnya.

**FR-AI-10:** Ambang kecukupan data ditentukan berdasarkan jenis analisis, bukan satu angka universal.

**FR-AI-11:** Sistem menandai hasil yang perlu diverifikasi pengguna.

**FR-AI-12:** Pengguna bertanggung jawab memeriksa rekomendasi terhadap catatan sumber. MVP tidak menjanjikan pemeriksaan oleh tenaga ahli manusia.

**FR-AI-13:** Riwayat percakapan AI hanya tersedia selama sesi aktif, tanpa fitur penyimpanan riwayat percakapan di produk.

**FR-AI-14:** Data keuangan, transaksi, dan audit tetap disimpan sesuai kebijakan masing-masing meskipun percakapan AI tidak dipersistenkan.

**FR-AI-15:** Kegagalan AI tidak menghentikan pencatatan transaksi, dashboard, atau laporan.

**FR-AI-16:** Pengguna dapat mencoba kembali permintaan AI yang gagal tanpa mengurangi kuota untuk kegagalan sistem yang memenuhi syarat.

**FR-AI-17:** Kuota AI diperiksa di backend dengan perlindungan terhadap permintaan bersamaan.

**FR-AI-18:** Pemakaian AI dibatasi melalui rate limiting, batas token, biaya, dan fair use per akun.

**FR-AI-19:** Sistem mencatat metadata minimum untuk evaluasi internal, seperti model, versi, waktu, periode, jenis insight, dan status permintaan.

**FR-AI-20:** Perubahan atau penghapusan transaksi historis memperbarui ringkasan yang digunakan analisis berikutnya.

## 7.13 Paket Free dan Pro

### Free

- Maksimal 100 transaksi manual per bulan.
- Kuota AI bulanan kecil, dengan angka final ditentukan berdasarkan pengujian biaya.
- Dashboard dasar.
- Riwayat dan laporan yang tersedia sesuai batas paket.
- Akses riwayat tetap tersedia setelah kuota transaksi habis.
- Impor CSV mengikuti batas transaksi.
- Fitur AI berhenti ketika kuota AI habis, tetapi fitur keuangan tetap berfungsi.

### Pro

- Harga awal Rp49.000 per bulan.
- Maksimal lima anggota aktif per bisnis.
- Laporan lanjutan.
- Perbandingan periode historis yang lebih panjang.
- Ekspor penuh CSV, Excel, dan PDF sesuai hak akses.
- Kuota AI lebih besar dengan fair use dan batas teknis.
- Fitur tetap tunduk pada kebijakan penggunaan yang wajar.

**FR-PLAN-01:** Sistem menampilkan kuota tersisa dan waktu reset.

**FR-PLAN-02:** Kuota transaksi dihitung secara konsisten di backend.

**FR-PLAN-03:** Batas transaksi Free tidak menghapus data yang sudah ada.

**FR-PLAN-04:** Anggota aktif dihitung dari keanggotaan yang diterima, bukan undangan yang masih menunggu.

**FR-PLAN-05:** Pembatasan paket tidak boleh menghilangkan akses pengguna terhadap data historis yang menjadi haknya.

## 7.14 Manajemen anggota dan RBAC

Satu bisnis memiliki tepat satu pemilik aktif. Anggota dapat diundang melalui email.

### Matriks izin awal

| Kemampuan | Owner | Admin bisnis | Staf |
|---|---|---|---|
| Mencatat transaksi | Ya | Ya | Ya |
| Mengedit transaksi | Ya | Ya | Sesuai izin |
| Menghapus transaksi | Ya | Ya | Tidak |
| Memulihkan transaksi | Ya | Ya | Tidak |
| Mengakses laporan penuh | Ya | Ya | Tidak |
| Mengakses laporan ringkasan | Ya | Ya | Ya |
| Mengekspor laporan penuh | Ya | Ya | Tidak |
| Mengekspor laporan ringkasan | Ya | Ya | Ya |
| Mengelola kategori | Ya | Ya | Sesuai izin |
| Mengelola anggota | Ya | Sesuai izin | Tidak |
| Mengelola langganan | Ya | Sesuai izin terbatas | Tidak |
| Menghapus bisnis | Ya | Tidak | Tidak |
| Memindahkan kepemilikan | Ya | Tidak | Tidak |

Izin rinci perlu dipetakan ke kebijakan backend, bukan hanya menyembunyikan tombol di frontend.

**FR-MEM-01:** Undangan memiliki token unik, masa berlaku, dan dapat dicabut.

**FR-MEM-02:** Slot anggota diperiksa kembali ketika undangan diterima.

**FR-MEM-03:** Backend memvalidasi peran dan izin pada setiap permintaan.

**FR-MEM-04:** Semua anggota dapat melihat riwayat perubahan untuk transaksi yang memang dapat mereka akses.

**FR-MEM-05:** Pemilik dapat mentransfer kepemilikan kepada anggota aktif melalui autentikasi ulang dan konfirmasi.

**FR-MEM-06:** Anggota penerima harus menerima transfer kepemilikan.

**FR-MEM-07:** Perubahan kepemilikan dilakukan secara atomik, tercatat dalam audit, dan tidak boleh menghasilkan dua pemilik sekaligus.

**FR-MEM-08:** Kebijakan peran mantan pemilik harus ditentukan ketika transfer selesai.

## 7.15 Langganan dan pembayaran manual

### Siklus langganan

Status langganan mencakup:
- `free`
- `active`
- `past_due`
- `grace_period`
- `cancel_at_period_end`

Status dan tanggal langganan harus dikelola secara konsisten di backend.

**FR-SUB-01:** Pengguna dapat membuat invoice langganan melalui aplikasi.

**FR-SUB-02:** Metode pembayaran awal adalah transfer bank dan QRIS.

**FR-SUB-03:** Pengguna dapat mengunggah bukti pembayaran.

**FR-SUB-04:** Bukti pembayaran disimpan privat.

**FR-SUB-05:** Admin platform memverifikasi penerimaan dana aktual, bukan hanya memeriksa tangkapan layar.

**FR-SUB-06:** Hanya admin platform dengan izin khusus yang dapat menyetujui atau menolak pembayaran.

**FR-SUB-07:** Satu admin dapat mengambil keputusan tanpa persetujuan kedua, dengan audit log yang lengkap.

**FR-SUB-08:** Keputusan verifikasi dicatat beserta identitas admin, waktu, invoice, status, dan alasan penolakan jika ada.

**FR-SUB-09:** Bukti yang ditolak dapat diganti tanpa membuat invoice baru selama invoice masih berlaku.

**FR-SUB-10:** Pengunggahan ulang diperbolehkan selama masa berlaku invoice, dengan rate limiting.

**FR-SUB-11:** Invoice berlaku tiga hari kalender.

**FR-SUB-12:** Jika dana telah diterima tetapi verifikasi tertunda setelah invoice kedaluwarsa, kasus masuk pemeriksaan manual.

**FR-SUB-13:** Target verifikasi adalah maksimal dua jam operasional, setiap hari pukul 09.00–17.00 WIB.

**FR-SUB-14:** Waktu SLA yang tersisa berlanjut pada hari berikutnya mulai pukul 09.00 WIB jika jam operasional berakhir.

**FR-SUB-15:** Pembatalan langganan menghentikan perpanjangan otomatis, tetapi akses Pro tetap tersedia sampai akhir periode berbayar.

**FR-SUB-16:** Jika pembayaran gagal, tersedia masa tenggang tujuh hari setelah periode Pro berakhir.

**FR-SUB-17:** Jika bukti sudah diunggah sebelum masa tenggang berakhir tetapi verifikasi belum selesai, akses dapat diperpanjang maksimal dua hari operasional tambahan.

**FR-SUB-18:** Setelah batas tambahan berakhir tanpa keputusan, akun kembali ke Free. Pembayaran yang masih perlu ditelusuri tetap ditangani secara manual.

**FR-SUB-19:** Pembayaran yang berhasil diverifikasi mengaktifkan atau memperbarui langganan secara idempoten.

**FR-SUB-20:** Kebijakan refund umumnya tidak memberikan pengembalian dana, dengan pengecualian sesuai hukum atau koreksi pembayaran yang keliru.

**FR-SUB-21:** Sistem menyediakan alur perpanjangan mandiri dengan invoice baru.

**FR-SUB-22:** Bukti yang telah diverifikasi tidak dapat diganti melalui alur pengunggahan ulang normal.

## 7.16 Notifikasi

Kanal yang direncanakan:
- Notifikasi dalam aplikasi.
- Email.
- WhatsApp dengan persetujuan pengguna.

Jenis notifikasi penting:
- Status pembayaran.
- Bukti pembayaran ditolak.
- Pengingat masa berlaku Pro.
- Peristiwa keamanan penting.

**FR-NOTIF-01:** Pengguna dapat mengatur kanal notifikasi yang diinginkan.

**FR-NOTIF-02:** WhatsApp memerlukan persetujuan eksplisit dan dapat dinonaktifkan.

**FR-NOTIF-03:** Sistem mengirim satu pengingat Pro tiga hari sebelum berakhir.

**FR-NOTIF-04:** Sebelum pengiriman, sistem memeriksa kembali status langganan agar tidak mengirim pengingat yang sudah tidak relevan.

**FR-NOTIF-05:** Sistem menggunakan antrean, percobaan ulang, dan deduplikasi agar notifikasi tidak terkirim berulang tanpa alasan.

**FR-NOTIF-06:** Tidak ada notifikasi otomatis untuk setiap transaksi dan tidak ada fitur reaktivasi pengguna tidak aktif pada MVP.

# 8. Keamanan, Privasi, dan Audit

## 8.1 Keamanan aplikasi

- HTTPS untuk seluruh koneksi.
- Kata sandi dikelola oleh sistem autentikasi yang aman.
- MFA wajib bagi admin platform.
- Validasi input di backend.
- Otorisasi berbasis peran pada setiap endpoint.
- Isolasi data antarbisnis.
- Cookie dan sesi aman.
- Rate limiting dan perlindungan brute force.
- Autentikasi ulang untuk tindakan sensitif.
- Penyimpanan privat untuk bukti pembayaran dan file sensitif.
- Pengujian keamanan untuk akses lintas tenant, manipulasi peran, dan kebocoran data.

## 8.2 Audit log

Audit mencakup:
- Login dan kejadian autentikasi penting.
- Akses admin ke data sensitif.
- Perubahan transaksi.
- Penghapusan dan pemulihan transaksi.
- Ekspor laporan.
- Perubahan anggota dan kepemilikan.
- Verifikasi pembayaran.
- Perubahan langganan.
- Perubahan pengaturan keamanan.

Audit akses dan audit perubahan merupakan jenis peristiwa yang berbeda.

**Retensi audit keamanan dan aktivitas admin: 90 hari**, dengan pengecualian terkontrol untuk insiden atau kewajiban hukum.

Riwayat perubahan transaksi mengikuti kebijakan retensi data keuangan yang terpisah dan tidak otomatis terhapus setelah 90 hari.

## 8.3 Respons insiden

Sistem melakukan notifikasi dan pembatasan otomatis berdasarkan risiko.

Tindakan yang dapat diterapkan:
- MFA atau autentikasi ulang.
- Pembatasan percobaan login.
- Pencabutan sesi mencurigakan.
- Notifikasi kepada admin keamanan.
- Eskalasi kepada admin cadangan jika insiden kritis tidak diakui dalam 15 menit.

Klasifikasi awal insiden menggunakan tiga tingkat: rendah, tinggi, dan kritis. Aturan teknis dan ambang deteksi harus ditetapkan sebelum produksi.

## 8.4 Penghapusan data bisnis

**FR-DATA-01:** Pemilik dapat meminta penghapusan permanen bisnis setelah autentikasi ulang dan konfirmasi eksplisit.

**FR-DATA-02:** Sistem mencabut akses anggota dan menghentikan proses baru yang berkaitan dengan bisnis tersebut.

**FR-DATA-03:** Penghapusan mencakup data terkait sesuai kebijakan, termasuk transaksi, anggota, file, dan ringkasan AI.

**FR-DATA-04:** Backup dapat menyimpan salinan hingga masa retensi berakhir, yaitu 30 hari. Karena itu, penghapusan tidak boleh dijanjikan langsung dari seluruh backup.

**FR-DATA-05:** Kebijakan perlu mempertimbangkan kewajiban penyimpanan berdasarkan hukum yang berlaku.

## 8.5 Backup

**FR-BACKUP-01:** Database dicadangkan secara otomatis.

**FR-BACKUP-02:** Target retensi backup adalah 30 hari.

**FR-BACKUP-03:** Proses backup dan pemulihan dipantau.

**FR-BACKUP-04:** Pengujian restore dilakukan secara berkala.

**FR-BACKUP-05:** Backup harus dilindungi dari akses tidak sah.

**FR-BACKUP-06:** Target RPO dan RTO ditetapkan setelah pilihan infrastruktur dan kebutuhan bisnis divalidasi.

# 9. Desain UX/UI

## 9.1 Prinsip desain

- Mobile-first.
- Modern, minimalis, dan profesional.
- Bahasa Indonesia yang sederhana.
- Navigasi konsisten antara mobile dan desktop.
- Informasi utama mudah ditemukan.
- Formulir transaksi tidak memiliki langkah yang tidak perlu.
- Istilah keuangan disertai penjelasan singkat.
- Keadaan kosong, error, loading, dan sukses dirancang dengan jelas.

## 9.2 Struktur navigasi

Navigasi mobile:
1. Beranda
2. Transaksi
3. Laporan
4. AI
5. Menu

Menu memuat utang/piutang, kategori, anggota, langganan, pengaturan, dan bantuan sesuai izin.

## 9.3 Halaman utama

### Dashboard
- Saldo kas.
- Ringkasan pendapatan dan pengeluaran.
- Perbandingan periode.
- Kategori transaksi.
- Utang dan piutang.
- Lima transaksi terbaru.
- Insight AI bila data cukup.

### Transaksi
- Daftar transaksi.
- Pencarian dan filter.
- Tombol tambah transaksi.
- Formulir tambah/edit.
- Riwayat perubahan.
- Aksi hapus dan pulihkan sesuai izin.

### Laporan
- Filter periode.
- Perbandingan mingguan/bulanan.
- Rincian kategori.
- Ekspor CSV, Excel, dan PDF.

### AI Finance Analyst
- Insight berbasis periode.
- Angka pendukung.
- Rekomendasi.
- Keterbatasan analisis.
- Indikator kuota AI.

### Utang dan piutang
- Daftar tagihan dan kewajiban.
- Sisa pembayaran.
- Tanggal jatuh tempo.
- Riwayat pembayaran parsial.

### Langganan
- Paket aktif.
- Kuota.
- Invoice.
- Instruksi pembayaran.
- Unggah bukti.
- Status verifikasi.
- Riwayat langganan.

### Admin platform
- Antrean verifikasi pembayaran.
- Detail invoice dan bukti pembayaran.
- Keputusan persetujuan/penolakan.
- Riwayat audit.
- Pengelolaan insiden keamanan.
- Status langganan.
- Antrean dan SLA.

# 10. Persyaratan Nonfungsional

## 10.1 Performa

Target awal yang harus diuji:
- Respons endpoint transaksi normal: p95 di bawah 500 ms, tidak termasuk jaringan pengguna dan proses AI.
- Dashboard standar: p95 di bawah 2 detik untuk beban MVP yang disepakati.
- Proses ekspor dan impor besar dilakukan secara asinkron jika diperlukan.
- AI memiliki batas waktu dan mekanisme retry yang terkendali.

Angka ini merupakan target awal engineering, bukan hasil pengujian yang sudah terbukti.

## 10.2 Keandalan

- Kegagalan AI tidak mengganggu pencatatan keuangan.
- Kegagalan notifikasi tidak menggagalkan perubahan status langganan.
- Permintaan yang diulang tidak membuat transaksi atau pembayaran ganda.
- Perubahan saldo dan status pembayaran dilakukan secara konsisten.

## 10.3 Kompatibilitas

- Browser modern desktop dan mobile.
- Layout responsif.
- PWA yang dapat dipasang jika didukung browser.
- Transaksi memerlukan koneksi internet.
- Tidak ada sinkronisasi transaksi offline pada MVP.

## 10.4 Aksesibilitas

- Label input jelas.
- Kontras teks memadai.
- Ukuran target sentuh sesuai perangkat mobile.
- Status tidak hanya dibedakan melalui warna.
- Pesan error menjelaskan cara memperbaiki masalah.

# 11. Model Data Awal

Entitas inti yang direkomendasikan:

| Entitas | Tujuan |
|---|---|
| `users` | Identitas pengguna. |
| `businesses` | Profil dan identitas bisnis. |
| `memberships` | Hubungan pengguna, bisnis, dan peran. |
| `invitations` | Undangan anggota dan statusnya. |
| `transactions` | Ledger transaksi keuangan. |
| `categories` | Kategori per bisnis. |
| `transaction_audit_logs` | Riwayat perubahan transaksi. |
| `opening_balances` | Saldo awal dan tanggal acuannya. |
| `payables_receivables` | Tagihan dan kewajiban. |
| `obligation_payments` | Pembayaran parsial dan pelunasan. |
| `imports` | Batch impor CSV. |
| `import_rows` | Hasil validasi setiap baris impor. |
| `ai_usage` | Kuota dan pemakaian AI. |
| `ai_insights` | Metadata dan hasil analisis yang diperlukan. |
| `subscriptions` | Status paket dan periode berlangganan. |
| `invoices` | Invoice langganan. |
| `payment_proofs` | Referensi bukti pembayaran yang disimpan privat. |
| `payment_verification_logs` | Keputusan verifikasi dan riwayatnya. |
| `notifications` | Status dan kanal notifikasi. |
| `security_audit_logs` | Audit akses sensitif dan aktivitas admin. |
| `security_incidents` | Insiden, tingkat keparahan, dan penanganannya. |
| `backup_records` | Metadata backup dan status pemulihan. |

Setiap data milik bisnis harus memiliki `business_id` atau hubungan kepemilikan yang dapat divalidasi di backend.

Data uang menggunakan tipe numerik presisi atau integer satuan rupiah, bukan floating point yang tidak aman untuk perhitungan finansial.

Tanggal transaksi dan waktu audit harus disimpan secara terpisah. Waktu server disimpan secara konsisten, lalu ditampilkan menggunakan zona waktu yang sesuai.

# 12. Rekomendasi Teknologi

Pilihan berikut adalah rekomendasi awal dan belum merupakan keputusan final.

| Lapisan | Rekomendasi |
|---|---|
| Frontend | Next.js + TypeScript |
| UI | Komponen responsif dan sistem desain yang konsisten |
| Backend | Next.js server-side atau backend terpisah jika kebutuhan meningkat |
| Database | PostgreSQL |
| Autentikasi | Penyedia autentikasi terkelola dengan Google OAuth dan MFA admin |
| Penyimpanan file | Object storage privat |
| AI | API model AI melalui backend |
| Deployment | Platform hosting terkelola dengan HTTPS |
| Observabilitas | Log terstruktur, monitoring error, metrik performa dan biaya AI |
| Backup | Backup database otomatis dengan retensi 30 hari |

Gunakan arsitektur modular yang sederhana. Microservices belum diperlukan kecuali terdapat kebutuhan skalabilitas atau pemisahan operasional yang jelas.

# 13. Kriteria Penerimaan Utama

MVP tidak dinyatakan siap produksi sebelum skenario berikut lolos pengujian.

### Transaksi
- Transaksi valid dapat disimpan dan muncul pada dashboard.
- Transaksi bertanggal lampau masuk periode laporan yang benar.
- Koreksi mengubah laporan dan meninggalkan audit.
- Transaksi yang dihapus tidak dihitung.
- Transaksi yang dipulihkan kembali masuk perhitungan yang benar.
- Retry tidak menciptakan duplikasi.

### Hak akses
- Staf tidak dapat menghapus transaksi.
- Staf hanya dapat mengekspor laporan ringkasan.
- Pengguna bisnis A tidak dapat membaca data bisnis B.
- Perubahan peran tidak dapat dilakukan hanya melalui manipulasi frontend.

### AI
- AI hanya menerima data yang diizinkan dan diperlukan.
- Angka yang ditampilkan sesuai hasil perhitungan backend.
- Data yang tidak cukup menghasilkan penjelasan keterbatasan.
- Kegagalan AI tidak memengaruhi fitur keuangan.
- Kuota dihitung dengan benar saat ada permintaan bersamaan.

### Utang dan piutang
- Pembayaran parsial mengurangi sisa kewajiban secara benar.
- Pembayaran tidak melebihi sisa tanpa penanganan eksplisit.
- Pencatatan tagihan tidak langsung mengubah saldo kas.
- Pembayaran aktual memengaruhi saldo sesuai jenis transaksi.

### Langganan
- Pembayaran tidak aktif sebelum diverifikasi.
- Bukti pembayaran yang ditolak dapat diganti selama invoice berlaku.
- Invoice kedaluwarsa ditangani sesuai kebijakan.
- Masa tenggang dan tambahan dua hari operasional diterapkan konsisten.
- Pembayaran yang diverifikasi tidak memicu aktivasi ganda.

### Keamanan dan pemulihan
- MFA wajib bagi admin platform.
- Akses data sensitif tercatat.
- Insiden kritis dieskalasikan setelah 15 menit tanpa pengakuan.
- Backup dapat dipulihkan dalam pengujian.
- Penghapusan bisnis menangani data terkait dan keterbatasan retensi backup.

# 14. Metrik Keberhasilan Produk

## 14.1 Aktivasi

- Persentase pengguna yang menyelesaikan onboarding.
- Persentase pengguna yang mencatat transaksi pertama.
- Waktu dari registrasi hingga transaksi pertama.

## 14.2 Retensi

- Pengguna aktif mingguan dan bulanan.
- Persentase pengguna yang kembali mencatat transaksi.
- Konsistensi penggunaan pencatatan.
- Persentase pengguna yang menggunakan laporan.

## 14.3 AI

- Persentase permintaan AI yang berhasil.
- Penggunaan kuota per pengguna.
- Biaya AI rata-rata per akun.
- Persentase insight yang lolos evaluasi kualitas internal.
- Jumlah kesalahan atau laporan insight yang tidak akurat.

## 14.4 Bisnis

- Konversi Free ke Pro.
- Pembatalan dan perpanjangan langganan.
- Pendapatan berulang bulanan.
- Biaya layanan per pelanggan berbayar.
- Waktu penyelesaian verifikasi pembayaran.

Target numerik ditetapkan setelah data baseline dari beta tersedia.

# 15. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Pengguna tidak konsisten mencatat transaksi | Formulir singkat, navigasi jelas, onboarding terpandu. |
| Data keuangan tidak lengkap | Tampilkan keterbatasan laporan dan hindari klaim laba bersih. |
| AI memberikan interpretasi keliru | Hitung angka di backend, tampilkan sumber, validasi output, dan evaluasi kualitas. |
| Biaya AI terlalu tinggi | Kuota, rate limit, ringkasan historis, caching yang aman, dan pemantauan biaya. |
| Bukti pembayaran palsu | Verifikasi penerimaan dana aktual dan audit keputusan. |
| Kebocoran data lintas bisnis | Tenant isolation, otorisasi backend, dan pengujian keamanan. |
| Admin menjadi bottleneck | Antrean prioritas, SLA, monitoring, dan prosedur eskalasi. |
| Pengguna kehilangan akses saat langganan bermasalah | Masa tenggang yang jelas, notifikasi, dan akses data historis. |
| Penghapusan data tidak sinkron dengan backup | Prosedur penghapusan terkoordinasi dan retensi backup yang transparan. |
| Salah mengartikan saldo sebagai keuntungan | Definisi metrik yang jelas dan pemisahan arus kas dari laba. |

# 16. Hal yang Belum Final

Item berikut harus ditentukan sebelum peluncuran produksi:

1. Kuota AI bulanan Free dan batas teknis Pro berdasarkan biaya aktual.
2. Batas historis laporan Pro.
3. Rincian izin setiap peran anggota.
4. Masa berlaku undangan anggota.
5. Masa retensi riwayat transaksi dan kewajiban hukum terkait.
6. RPO dan RTO backup.
7. Penyedia autentikasi, database, hosting, object storage, dan AI.
8. Penyedia email dan WhatsApp serta biaya operasionalnya.
9. Aturan final perpindahan peran mantan pemilik setelah transfer kepemilikan.
10. Ambang klasifikasi insiden keamanan.
11. Detail proses refund, sengketa, dan pembayaran yang belum dapat dicocokkan.
12. Batas ukuran dan jumlah baris impor CSV.
13. Batas penggunaan, penyimpanan, dan evaluasi kualitas AI.
14. Ketentuan privasi, penghapusan data, dan kewajiban penyimpanan berdasarkan hukum Indonesia.
15. Validasi harga Pro Rp49.000 per bulan melalui riset pengguna.

# 17. Roadmap Implementasi yang Disarankan

Estimasi berikut merupakan perkiraan awal untuk satu developer full-stack berpengalaman. Waktu dapat berubah berdasarkan cakupan tim, pilihan teknologi, dan kompleksitas integrasi.

| Tahap | Perkiraan |
|---|---|
| Validasi kebutuhan dan desain data | 1–2 minggu |
| UI/UX dan prototipe | 1–2 minggu |
| Autentikasi, bisnis, dan anggota | 1–2 minggu |
| Ledger transaksi dan kategori | 2–3 minggu |
| Dashboard, laporan, utang/piutang | 2–3 minggu |
| Impor CSV dan ekspor | 1–2 minggu |
| AI Finance Analyst | 2–4 minggu |
| Langganan dan verifikasi manual | 1–2 minggu |
| Keamanan, pengujian, dan hardening | 2–3 minggu |

Sebagian tahap dapat dikerjakan secara paralel. Estimasi keseluruhan perlu disesuaikan setelah arsitektur dan kapasitas tim ditetapkan.

# 18. Definisi MVP Selesai

MVP dinyatakan siap dirilis ketika:

- Pengguna dapat membuat akun dan bisnis.
- Saldo awal dapat diisi dan diberi tanggal acuan.
- Transaksi dapat dibuat, dicari, diedit, dihapus, dan dipulihkan sesuai izin.
- Saldo dan laporan konsisten dengan transaksi yang valid.
- Utang dan piutang mendukung pembayaran parsial.
- Laporan dapat dibandingkan dan diekspor.
- Impor CSV menyediakan validasi dan hasil yang dapat ditelusuri.
- AI memberikan analisis berbasis angka aktual dengan kontrol kuota.
- Paket Free dan Pro berjalan sesuai aturan.
- Pembayaran manual dapat diverifikasi dan diaudit.
- Hak akses anggota diterapkan di backend.
- MFA admin, audit keamanan, backup, dan pemulihan telah diuji.
- Tidak ada masalah kritis terkait kebocoran data, perhitungan keuangan, atau akses tanpa izin.

---

## Penutup

UMKM-AI harus dibangun dengan urutan prioritas yang disiplin: **data keuangan yang dapat dipercaya terlebih dahulu, analisis AI yang bertanggung jawab berikutnya, lalu otomatisasi input yang lebih canggih.**

Keunggulan produk tidak hanya terletak pada keberadaan AI, tetapi pada kemampuannya menjelaskan kondisi usaha menggunakan angka yang benar, bahasa yang sederhana, dan rekomendasi yang dapat diperiksa pengguna.

Dokumen ini menjadi dasar product design, technical design, backlog engineering, pengujian, dan validasi pasar. Persyaratan yang belum final harus ditutup sebelum implementasi terkait memasuki produksi.
