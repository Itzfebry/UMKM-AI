import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Database,
  FileBarChart,
  HandCoins,
  ListChecks,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type { ComponentType } from "react";
import { AmbientCanvas } from "@/components/ambient-canvas";
import { LandingMotion } from "./landing-motion";

/* ------------------------------------------------------------------ */
/* Gaya bersama                                                        */
/* ------------------------------------------------------------------ */

const NAV = [
  { href: "#fitur", label: "Fitur" },
  { href: "#analisis", label: "Analisis AI" },
  { href: "#cara-kerja", label: "Cara kerja" },
  { href: "#keamanan", label: "Keamanan" },
  { href: "#faq", label: "FAQ" },
];

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const btnPrimary = `inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-body font-semibold text-white transition hover:bg-[#C01717] ${focus}`;
const btnSecondary = `inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-deep/30 px-6 text-body font-semibold text-deep transition hover:border-deep/60 hover:bg-deep/5 ${focus}`;

type Icon = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

/** Jarak atas judul selalu lebih besar dari jaraknya ke isi: itu yang memberi ritme. */
function SectionTitle({ id, title, desc }: { id?: string; title: string; desc?: string }) {
  return (
    <div className="max-w-3xl" data-motion>
      <h2 id={id} className="text-h1 text-ink">
        {title}
      </h2>
      {desc ? <p className="mt-3 max-w-[62ch] text-body text-deep">{desc}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Permukaan produk (data contoh)                                      */
/* ------------------------------------------------------------------ */

const TREND = [
  { bulan: "Jun", masuk: 52, keluar: 40 },
  { bulan: "Jul", masuk: 58, keluar: 44 },
  { bulan: "Agu", masuk: 61, keluar: 47 },
  { bulan: "Sep", masuk: 66, keluar: 50 },
  { bulan: "Okt", masuk: 72, keluar: 53 },
  { bulan: "Nov", masuk: 80, keluar: 58 },
];

function DataContoh({ className = "" }: { className?: string }) {
  return <span className={`text-caption font-medium text-deep ${className}`}>Data contoh</span>;
}

/** Contoh beranda. Satu kerangka, isi dipisah garis — bukan kartu di dalam kartu. */
function BerandaContoh() {
  return (
    <figure className="overflow-hidden rounded-xl border border-deep/15 bg-white">
      <div
        role="img"
        aria-label="Contoh tampilan beranda UMKM-AI: saldo kas Rp 48.250.000, pendapatan dan pengeluaran bulan ini, rincian kategori, tren enam bulan, dan satu insight AI. Semua angka adalah data contoh."
      >
        <div className="flex items-center justify-between border-b border-deep/10 px-5 py-3">
          <p className="text-small font-semibold text-ink">Beranda</p>
          <DataContoh />
        </div>

        <div className="grid md:grid-cols-2">
          <div className="border-b border-deep/10 p-5 md:border-b-0 md:border-r">
            <p className="text-small text-deep">Saldo kas</p>
            <p className="tabular mt-1 text-display text-ink">Rp 48.250.000</p>
            <p className="mt-2 text-caption text-deep">Saldo awal + uang masuk − uang keluar</p>

            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-deep/10 pt-4">
              <div>
                <dt className="text-small text-deep">Pendapatan bulan ini</dt>
                <dd className="tabular mt-1 text-h3 text-ink">Rp 62,4 jt</dd>
              </div>
              <div>
                <dt className="text-small text-deep">Pengeluaran bulan ini</dt>
                <dd className="tabular mt-1 text-h3 text-ink">Rp 38,9 jt</dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-deep/10 pt-4">
              <p className="text-small font-semibold text-ink">Ke mana uang keluar bulan ini</p>
              <ul className="mt-3 space-y-2 text-small text-deep">
                <li className="space-y-1.5">
                  <span className="flex items-center justify-between gap-4 text-small text-deep">
                    Bahan baku
                    <span className="tabular">45%</span>
                  </span>
                  <span className="block h-2 w-full rounded-full bg-deep/10">
                    <span className="block h-full w-[45%] rounded-full bg-primary" />
                  </span>
                </li>
                <li className="space-y-1.5">
                  <span className="flex items-center justify-between gap-4 text-small text-deep">
                    Gaji
                    <span className="tabular">30%</span>
                  </span>
                  <span className="block h-2 w-full rounded-full bg-deep/10">
                    <span className="block h-full w-[30%] rounded-full bg-deep" />
                  </span>
                </li>
                <li className="space-y-1.5">
                  <span className="flex items-center justify-between gap-4 text-small text-deep">
                    Lainnya
                    <span className="tabular">25%</span>
                  </span>
                  <span className="block h-2 w-full rounded-full bg-deep/10">
                    <span className="block h-full w-[25%] rounded-full bg-accent" />
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-5">
            <p className="text-small font-semibold text-ink">Tren enam bulan</p>
            <div className="mt-4 flex h-32 items-end gap-2">
              {TREND.map((t) => (
                <div key={t.bulan} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-24 w-full items-end justify-center gap-1">
                    <div className="w-3 rounded-t bg-primary" style={{ height: `${t.masuk}%` }} />
                    <div className="w-3 rounded-t bg-deep" style={{ height: `${t.keluar}%` }} />
                  </div>
                  <span className="text-caption text-deep">{t.bulan}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-4 text-caption text-deep">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary" aria-hidden />
                Pendapatan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-deep" aria-hidden />
                Pengeluaran
              </span>
            </div>

            <div className="mt-5 border-t border-deep/10 pt-4">
              <p className="flex items-center gap-2 text-small font-semibold text-ink">
                <Sparkles className="size-4 text-primary" aria-hidden />
                Insight hari ini
              </p>
              <p className="mt-2 text-small text-deep">
                Pengeluaran bahan baku naik lebih cepat dari pendapatan bulan ini. Ada 2 piutang lewat jatuh tempo
                dengan total Rp 3.200.000.
              </p>
              <p className="mt-2 text-caption text-deep">Periode 1–30 November, dihitung dari 148 transaksi.</p>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="border-t border-deep/10 px-5 py-3 text-caption text-deep">
        Contoh tampilan dengan data contoh. Angka pada aplikasi dihitung dari catatan usahamu sendiri.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Bagian halaman                                                      */
/* ------------------------------------------------------------------ */

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-deep/15 bg-surface/95 backdrop-blur">
      <nav aria-label="Navigasi utama" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className={`rounded-md text-h3 font-bold text-primary ${focus}`}>
          UMKM-AI
        </Link>
        <ul className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <li key={n.href}>
              <a href={n.href} className={`rounded-md text-small font-medium text-deep hover:text-primary ${focus}`}>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Link href="/masuk" className={`inline-flex min-h-11 items-center rounded-lg px-3 text-small font-semibold text-deep hover:bg-deep/5 ${focus}`}>
            Masuk
          </Link>
          <Link href="/daftar" className={`inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-small font-semibold text-white transition hover:bg-[#C01717] ${focus}`}>
            Coba gratis
          </Link>
        </div>
      </nav>
    </header>
  );
}

const BUKTI = [
  "Saldo kas dihitung otomatis",
  "Utang dan piutang terpantau",
  "Laporan CSV, Excel, PDF",
  "Impor dari spreadsheet lama",
];

function Hero() {
  return (
    <section className="relative overflow-hidden bg-surface pt-12 pb-14 sm:pt-16 sm:pb-16">
      <AmbientCanvas className="pointer-events-none absolute inset-0 size-full opacity-70" density={1100} />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <h1 className="landing-rise text-h1 text-ink sm:text-display">
              Bukan sekadar mencatat keuangan.{" "}
              <span className="text-primary">Pahami bisnis di balik angkanya.</span>
            </h1>
            <p className="landing-rise mt-5 max-w-[60ch] text-body text-deep sm:text-lg" style={{ animationDelay: "80ms" }}>
              UMKM-AI mencatat transaksi usahamu, menghitung saldo kas, dan menjelaskan pola yang muncul di
              dalamnya — dengan bahasa yang bisa langsung dipakai untuk mengambil keputusan, tanpa istilah
              akuntansi.
            </p>
            <div className="landing-rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ animationDelay: "160ms" }}>
              <Link href="/daftar" className={btnPrimary}>
                Mulai gratis
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a href="#cara-kerja" className={btnSecondary}>
                Lihat cara kerja
              </a>
            </div>
            <p className="mt-3 text-caption text-deep">
              Paket Free untuk mulai. Pro kalau butuh analisis lanjutan. Tanpa kartu kredit.
            </p>
          </div>

          <ul className="self-end border-t border-deep/15 lg:col-span-5 lg:border-t-0">
            {BUKTI.map((b) => (
              <li
                key={b}
                className="flex items-center gap-3 border-b border-deep/15 py-3.5 text-small font-medium text-ink"
              >
                <Check className="size-4 shrink-0 text-primary" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 sm:mt-12" data-parallax>
          <BerandaContoh />
        </div>
      </div>
    </section>
  );
}

const MASALAH = [
  {
    masalah: "Catatan tersebar di buku, chat, dan spreadsheet",
    akibat: "Tidak ada gambaran keuangan yang utuh saat mau mengambil keputusan.",
    jawab: "Satu tempat untuk semua transaksi, rapi per kategori.",
  },
  {
    masalah: "Utang dan piutang tidak terpantau",
    akibat: "Tagihan terlewat dan kas mendadak kurang.",
    jawab: "Status belum dibayar, sebagian, atau lunas — dengan penanda lewat jatuh tempo.",
  },
  {
    masalah: "Laporan dibuat manual tiap bulan",
    akibat: "Waktu habis untuk menyalin angka, bukan untuk membaca polanya.",
    jawab: "Laporan periode dan perbandingan siap pakai, bisa diekspor.",
  },
  {
    masalah: "Spreadsheet sulit dianalisis",
    akibat: "Nominal terlihat, tetapi pola bisnisnya tidak terbaca.",
    jawab: "Ringkasan dan analisis AI dari data usahamu sendiri.",
  },
];

function Masalah() {
  return (
    <section className="border-t border-deep/15 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle
          title="Masalahnya bukan mencatat. Masalahnya memahami."
          desc="Empat hal yang paling sering membuat pemilik usaha menebak-nebak kondisi keuangannya sendiri."
        />

        <div className="mt-10 divide-y divide-deep/15 border-t border-deep/15">
          {MASALAH.map((m) => (
            <div key={m.masalah} className="grid gap-3 py-6 md:grid-cols-3 md:gap-8" data-motion>
              <p className="flex items-start gap-2.5 text-body font-semibold text-ink">
                <X className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
                {m.masalah}
              </p>
              <p className="text-small text-deep">{m.akibat}</p>
              <p className="flex items-start gap-2.5 text-small text-ink">
                <Check className="mt-0.5 size-4 shrink-0 text-deep" aria-hidden />
                {m.jawab}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FITUR: { icon: Icon; judul: string; isi: string }[] = [
  {
    icon: ReceiptText,
    judul: "Catat transaksi tanpa ribet",
    isi: "Pemasukan dan pengeluaran dengan kategori, tanggal, catatan, dan metode bayar. Salah catat? Ubah atau hapus, lalu pulihkan bila perlu.",
  },
  {
    icon: Wallet,
    judul: "Saldo kas yang bisa dipercaya",
    isi: "Saldo awal ditambah uang masuk dikurangi uang keluar. Tidak ada angka yang dihitung di sisi tampilan saja.",
  },
  {
    icon: HandCoins,
    judul: "Utang dan piutang dengan pembayaran sebagian",
    isi: "Catat pembayaran bertahap dan lihat mana yang belum, sebagian, atau lunas. Yang lewat jatuh tempo ditandai.",
  },
  {
    icon: FileBarChart,
    judul: "Laporan periode dan perbandingan",
    isi: "Bandingkan harian, mingguan, atau bulanan, lalu ekspor ke CSV, Excel, atau PDF untuk dokumentasi.",
  },
  {
    icon: Upload,
    judul: "Impor catatan lama",
    isi: "Pindahkan data dari spreadsheet dengan template resmi. Kamu melihat pratinjau sebelum disimpan, dan baris duplikat dideteksi.",
  },
  {
    icon: Users,
    judul: "Kerja bersama tim",
    isi: "Undang anggota sebagai Owner, Admin, atau Staf. Hak akses diperiksa di server, jadi staf tidak bisa menghapus data penting.",
  },
];

function Fitur() {
  return (
    <section id="fitur" className="scroll-mt-20 bg-surface py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle
          title="Yang benar-benar kamu pakai setiap hari"
          desc="Enam hal ini sudah ada di versi pertama UMKM-AI. Tidak ada janji fitur yang belum dibangun."
        />

        <dl className="mt-10 divide-y divide-deep/15 border-t border-deep/15">
          {FITUR.map((f) => (
            <div key={f.judul} className="grid gap-3 py-7 md:grid-cols-12 md:gap-8" data-motion>
              <dt className="flex items-start gap-3 md:col-span-5 md:pr-8">
                <f.icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <span className="text-h3 text-ink">{f.judul}</span>
              </dt>
              <dd className="text-body text-deep md:col-span-7">{f.isi}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

const AI_POIN = [
  "Angka dihitung sistem, bukan AI. AI hanya menafsirkan ringkasan yang sudah dihitung.",
  "AI tidak menulis atau mengubah catatan keuanganmu.",
  "Setiap insight menyebut periode dan angka pendukungnya, supaya bisa kamu periksa sendiri.",
  "Kuota analisis mengikuti paket, dan pencatatan tetap jalan tanpa AI.",
];

function Analisis() {
  return (
    <section id="analisis" className="scroll-mt-20 bg-[#123039] py-14 text-white sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6" data-motion>
            <h2 className="text-h1 text-white">AI yang membaca angkamu, bukan menebak</h2>
            <p className="mt-3 max-w-[58ch] text-body text-white/90">
              AI Finance Analyst menjelaskan apa yang terjadi pada keuangan usahamu dan apa yang layak
              diperiksa lebih dulu. Batasnya kami sebut terbuka.
            </p>
            <ul className="mt-7 divide-y divide-white/20 border-t border-white/20">
              {AI_POIN.map((p) => (
                <li key={p} className="flex items-start gap-3 py-3.5 text-small text-white">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6" data-motion>
            <div className="border-t border-white/20 pt-6">
              <p className="flex items-center gap-2 text-small font-semibold text-accent">
                <Sparkles className="size-4" aria-hidden />
                Insight hari ini
              </p>
              <ul className="mt-4 divide-y divide-white/20">
                <li className="py-4">
                  <p className="text-body text-white">
                    Pengeluaran bahan baku naik lebih cepat dari pendapatan. Tinjau pemasok atau ukuran pembelian.
                  </p>
                  <p className="mt-1.5 text-caption text-white/85">Bahan baku +18% vs bulan lalu · 42 transaksi</p>
                </li>
                <li className="py-4">
                  <p className="text-body text-white">
                    Dua piutang sudah lewat jatuh tempo dengan total Rp 3.200.000. Pertimbangkan menagih lebih dulu.
                  </p>
                  <p className="mt-1.5 text-caption text-white/85">Piutang lewat jatuh tempo · 2 dari 9 catatan</p>
                </li>
                <li className="py-4">
                  <p className="text-body text-white">Pendapatan akhir pekan konsisten lebih tinggi dari hari kerja.</p>
                  <p className="mt-1.5 text-caption text-white/85">Berdasarkan 148 transaksi · 1–30 November</p>
                </li>
              </ul>
              <p className="mt-4 text-caption text-white/85">
                Contoh tampilan. Insight sebenarnya dibuat dari data usahamu. Selisih kas tidak pernah disebut
                sebagai laba bersih: versi ini belum menghitung harga pokok penjualan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const LANGKAH = [
  {
    judul: "Daftar dan atur usaha",
    isi: "Buat akun, isi nama usaha, lalu masukkan saldo awal kas. Kurang dari lima menit.",
  },
  {
    judul: "Catat transaksi harian",
    isi: "Catat langsung di aplikasi, atau pindahkan catatan lama dari spreadsheet lewat template CSV.",
  },
  {
    judul: "Pantau dan tanya",
    isi: "Baca dashboard dan laporan, lalu lihat insight harian atau tanyakan hal yang ingin kamu pahami.",
  },
];

function CaraKerja() {
  return (
    <section id="cara-kerja" className="scroll-mt-20 border-t border-deep/15 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle title="Mulai tanpa pelatihan khusus" desc="Tiga langkah, dan catatanmu sudah bisa dipakai membaca usaha." />
        <ol className="mt-10 divide-y divide-deep/15 border-t border-deep/15">
          {LANGKAH.map((s, i) => (
            <li key={s.judul} className="grid gap-2 py-6 md:grid-cols-12 md:gap-6" data-motion>
              <p className="tabular text-h3 text-primary md:col-span-1">{i + 1}</p>
              <div className="md:col-span-11">
                <p className="text-h3 text-ink">{s.judul}</p>
                <p className="mt-1 max-w-[68ch] text-body text-deep">{s.isi}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const JENIS = [
  { src: "/images/umkm/warung.webp", alt: "Meja saji dan papan menu tulisan tangan di sebuah warung makan", judul: "Warung makan", isi: "Penjualan harian dan belanja bahan." },
  { src: "/images/umkm/pasar.webp", alt: "Lapak sayur di pasar tradisional, penjual melayani pembeli", judul: "Pasar dan sembako", isi: "Belanja pasar dan penjualan harian." },
  { src: "/images/umkm/tekstil.webp", alt: "Lapak kain dan tas dengan motif beragam", judul: "Tekstil dan kerajinan", isi: "Pesanan lunas sebagian sebagai piutang." },
];

function UntukSiapa() {
  return (
    <section className="border-t border-deep/15 bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle
          title="Dipakai di usaha yang ramai setiap hari"
          desc="UMKM-AI dibuat untuk usaha kecil dengan pencatatan sederhana dan pemilik yang mengurus semuanya sendiri."
        />
        <ul className="mt-10 grid gap-8 sm:grid-cols-3">
          {JENIS.map((j) => (
            <li key={j.judul} data-motion>
              <Image
                src={j.src}
                alt={j.alt}
                width={640}
                height={420}
                sizes="(max-width: 640px) 100vw, 33vw"
                className="h-44 w-full rounded-lg border border-deep/15 object-cover"
              />
              <h3 className="mt-4 text-h3 text-ink">{j.judul}</h3>
              <p className="mt-1 text-small text-deep">{j.isi}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-caption text-deep">Foto ilustrasi jenis usaha, bukan testimoni pengguna.</p>
      </div>
    </section>
  );
}

const AMAN: { icon: Icon; judul: string; isi: string }[] = [
  { icon: ShieldCheck, judul: "Data tiap usaha terpisah", isi: "Satu usaha tidak bisa melihat data usaha lain, dan pemisahan ini diuji otomatis." },
  { icon: Users, judul: "Izin diperiksa di server", isi: "Owner, Admin, dan Staf punya hak berbeda. Staf tidak bisa menghapus atau memulihkan data." },
  { icon: ListChecks, judul: "Riwayat perubahan", isi: "Perubahan transaksi tercatat sebelum dan sesudah, sehingga data yang salah bisa dipulihkan." },
  { icon: Database, judul: "Backup dan audit", isi: "Backup harian dan pencatatan aktivitas admin, agar kejadian penting bisa ditelusuri." },
];

function Keamanan() {
  return (
    <section id="keamanan" className="scroll-mt-20 border-t border-deep/15 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionTitle title="Keuanganmu bukan bahan latihan" desc="Hal-hal dasar yang kami kerjakan sebelum menambah fitur." />
        <dl className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2">
          {AMAN.map((a) => (
            <div key={a.judul} className="border-t border-deep/15 pt-4" data-motion>
              <dt className="flex items-center gap-3 text-h3 text-ink">
                <a.icon className="size-5 shrink-0 text-primary" aria-hidden />
                {a.judul}
              </dt>
              <dd className="mt-2 text-body text-deep">{a.isi}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 flex items-center gap-2 text-caption text-deep">
          <RefreshCw className="size-3.5" aria-hidden />
          Versi pertama ini fokus pada pencatatan, laporan, dan analisis. Chat transaksi dan pemindaian struk menyusul.
        </p>
      </div>
    </section>
  );
}

const FAQ = [
  {
    q: "Apakah UMKM-AI gratis?",
    a: "Ada paket Free dengan kuota bulanan untuk jumlah transaksi dan permintaan AI, dan paket Pro untuk pemakaian yang lebih besar. Rinciannya bisa dilihat di halaman Langganan setelah masuk.",
  },
  {
    q: "Apakah AI bisa mengubah catatan keuanganku?",
    a: "Tidak. AI hanya membaca ringkasan angka yang dihitung sistem lalu menjelaskannya. Semua penulisan catatan lewat validasi backend.",
  },
  {
    q: "Apakah saldo kas sama dengan laba?",
    a: "Bukan. Saldo kas adalah posisi uang: saldo awal ditambah uang masuk dikurangi uang keluar. Versi ini belum menghitung harga pokok penjualan, jadi angkanya tidak pernah disebut laba bersih.",
  },
  {
    q: "Apakah ada pengingat jatuh tempo otomatis?",
    a: "Belum. Utang dan piutang yang lewat jatuh tempo ditandai di dalam aplikasi, dan kamu bisa melihatnya di halaman utang-piutang. Pengingat otomatis belum ada di versi ini.",
  },
  {
    q: "Bisakah memindahkan catatan lama?",
    a: "Bisa, lewat impor CSV dengan template resmi. Kamu melihat pratinjau lebih dulu, dan baris duplikat dideteksi sebelum data disimpan.",
  },
  {
    q: "Siapa saja yang bisa mengakses data usahaku?",
    a: "Hanya anggota yang kamu undang. Peran Admin dan Staf punya hak berbeda, dan data antar usaha dipisahkan di sisi server.",
  },
];

function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-t border-deep/15 bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionTitle title="Pertanyaan yang sering muncul" />
        <div className="mt-8 divide-y divide-deep/15 border-y border-deep/15">
          {FAQ.map((f) => (
            <details key={f.q} className="group" data-motion>
              <summary
                className={`flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-4 text-body font-semibold text-ink [&::-webkit-details-marker]:hidden ${focus}`}
              >
                {f.q}
                <ChevronDown className="size-5 shrink-0 text-deep transition group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
              </summary>
              <p className="max-w-[68ch] pb-4 text-small text-deep">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function AjakanTerakhir() {
  return (
    <section className="border-t border-deep/15 bg-white px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-xl bg-primary px-6 py-12 text-white sm:px-12" data-motion>
          <h2 className="max-w-[24ch] text-h1 text-white">Catat hari ini, pahami usahamu bulan ini</h2>
          <p className="mt-3 max-w-[52ch] text-body text-white">
            Daftar, masukkan saldo awal, lalu catat transaksi pertamamu. Analisis AI menyusul begitu ada data.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/daftar"
              className={`${focus} inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-body font-semibold text-primary transition hover:bg-surface`}
            >
              Daftar sekarang
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/masuk"
              className={`${focus} inline-flex min-h-12 items-center justify-center rounded-lg border border-white/70 px-6 text-body font-semibold text-white transition hover:bg-white/10`}
            >
              Sudah punya akun? Masuk
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-deep/15 bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="text-h3 font-bold text-primary">UMKM-AI</p>
          <p className="mt-2 text-small text-deep">
            Pencatatan keuangan dan analisis bisnis berbasis AI untuk UMKM Indonesia. Versi pertama fokus pada
            catatan yang rapi dan angka yang bisa dipahami.
          </p>
        </div>
        <nav aria-label="Tautan footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-small">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className={`rounded-md text-deep hover:text-primary ${focus}`}>
              {n.label}
            </a>
          ))}
          <Link href="/masuk" className={`rounded-md text-deep hover:text-primary ${focus}`}>
            Masuk
          </Link>
          <Link href="/daftar" className={`rounded-md text-deep hover:text-primary ${focus}`}>
            Daftar
          </Link>
        </nav>
      </div>
      <div className="border-t border-deep/15 py-5 text-center text-caption text-deep">
        © {new Date().getFullYear()} UMKM-AI. Proyek portofolio. Foto: Unsplash dan Pexels.
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <LandingMotion>
      <a
        href="#isi"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-small focus:font-semibold focus:text-primary"
      >
        Langsung ke konten
      </a>
      <Header />
      <main id="isi">
        <Hero />
        <Masalah />
        <Fitur />
        <Analisis />
        <CaraKerja />
        <UntukSiapa />
        <Keamanan />
        <Faq />
        <AjakanTerakhir />
      </main>
      <Footer />
    </LandingMotion>
  );
}
