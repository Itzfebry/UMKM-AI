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
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { TiltFrame } from "@/components/tilt-frame";
import { LandingMotion } from "./landing-motion";

/*
 * Tema cerah: latar surface/putih, teks ink, garis rambut deep, label monospace huruf kapital.
 * Satu aksen dekoratif (gold) plus merah brand untuk aksi. Tiap bagian punya "highlight":
 * angka besar sebagai tanda air, garis aksen yang memanjang, dan judul bermask.
 */

const NAV = [
  { href: "#fitur", label: "Fitur" },
  { href: "#analisis", label: "Analisis AI" },
  { href: "#cara-kerja", label: "Cara kerja" },
  { href: "#keamanan", label: "Keamanan" },
  { href: "#faq", label: "FAQ" },
];

/** Foto UMKM yang berganti bergiliran di latar hero. */
const HERO_SLIDES = [
  // Urutan: foto paling tajam tampil lebih dulu. `jajanan` punya depth of field dangkal
  // sehingga label rak belakang selalu lembek — tidak dipakai sebagai frame pembuka.
  { src: "/images/umkm/pasar.webp", alt: "Lapak sayur di pasar tradisional, penjual melayani pembeli" },
  { src: "/images/umkm/kopi.webp", alt: "Pedagang kopi tradisional menuang kopi lewat kain saring" },
  { src: "/images/umkm/jajanan.webp", alt: "Etalase kaca toko kue berisi aneka jajanan dengan label harga" },
];

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const btnPrimary = `inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-body font-semibold text-white transition hover:bg-[#C01717] ${focus}`;
const btnOutline = `inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-deep/25 bg-white/70 px-6 text-body font-semibold text-deep backdrop-blur-sm transition hover:border-deep/45 hover:bg-white ${focus}`;

/**
 * Label teknis monospace. Di latar terang gold gagal kontras untuk teks, jadi label memakai ochre
 * (amber gelap) dan gold hanya untuk isian batang dekorasi.
 */
const label = "font-mono text-[11px] font-medium uppercase tracking-[0.16em]";

type Icon = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

/**
 * Kerangka bagian dengan "highlight": angka besar sebagai tanda air, garis aksen yang memanjang
 * saat bagian masuk layar, dan judul bermask yang naik dari dari balik garis. Bagian tanpa
 * `index` tidak menampilkan baris anotasi §.
 */
function Section({
  id,
  index,
  name,
  meta,
  title,
  desc,
  intro,
  children,
}: {
  id?: string;
  index?: string;
  name?: string;
  meta?: string;
  title?: string;
  desc?: string;
  /** Isi pengantar khusus; menggantikan judul + deskripsi bila diisi. */
  intro?: ReactNode;
  children?: ReactNode;
}) {
  const annotated = Boolean(index && name);

  return (
    <section
      id={id}
      className={`relative scroll-mt-24 overflow-hidden ${children ? "py-20 sm:py-28" : "py-16 sm:py-20"}`}
    >
      {annotated ? (
        <span
          aria-hidden
          data-numeral
          className="pointer-events-none absolute -right-4 top-6 select-none text-[9rem] font-bold leading-none tracking-tighter text-deep/[0.06] sm:text-[14rem]"
        >
          {index}
        </span>
      ) : null}

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {annotated ? (
          <>
            <div className={`flex flex-wrap items-baseline justify-between gap-3 text-ochre ${label}`}>
              <span>{name}</span>
              {meta ? <span className="tabular text-deep/80">{meta}</span> : null}
            </div>
            <div
              aria-hidden
              data-rule
              className="mt-4 h-px w-full origin-left bg-gradient-to-r from-gold via-primary/60 to-transparent"
            />
          </>
        ) : null}

        {intro ? (
          <div className="max-w-none">{intro}</div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-12">
            <h2 className="text-h1 text-ink lg:col-span-5" data-mask>
              <span data-mask-line className="block">
                {title}
              </span>
            </h2>
            {desc ? (
              <p className="max-w-[62ch] text-body text-deep/80 lg:col-span-7" data-motion>
                {desc}
              </p>
            ) : null}
          </div>
        )}

        {children ? <div className="mt-12 sm:mt-14">{children}</div> : null}
      </div>
    </section>
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

const RINCIAN = [
  { nama: "Bahan baku", nilai: 45, warna: "bg-primary" },
  { nama: "Gaji", nilai: 30, warna: "bg-deep" },
  { nama: "Lainnya", nilai: 25, warna: "bg-accent" },
];

/** Contoh beranda: satu kerangka, isi dipisah garis rambut. */
function BerandaContoh() {
  return (
    <figure className="overflow-hidden rounded-lg border border-deep/12 bg-white shadow-[0_30px_60px_-40px_rgba(44,104,123,0.45)]">
      <div
        role="img"
        aria-label="Contoh tampilan beranda UMKM-AI: saldo kas Rp 48.250.000, pendapatan dan pengeluaran bulan ini, rincian kategori, tren enam bulan, dan satu insight AI. Semua angka adalah data contoh."
      >
        <div className={`flex items-center justify-between border-b border-deep/10 px-5 py-3 text-deep/80 ${label}`}>
          <span>beranda.usaha · data contoh</span>
          <span className="tabular">1 / 1</span>
        </div>

        <div className="grid md:grid-cols-2">
          <div className="border-b border-deep/10 p-5 md:border-b-0 md:border-r">
            <p className={`text-deep/80 ${label}`}>Saldo kas</p>
            <p className="tabular mt-2 text-display text-ink">Rp 48.250.000</p>
            <p className="mt-2 font-mono text-[11px] text-deep/80">saldo awal + pendapatan − pengeluaran</p>

            <dl className="mt-6 grid grid-cols-2 gap-6 border-t border-deep/10 pt-5">
              <div>
                <dt className={`text-deep/80 ${label}`}>Pendapatan</dt>
                <dd className="tabular mt-1.5 text-h3 text-ink">Rp 62,4 jt</dd>
              </div>
              <div>
                <dt className={`text-deep/80 ${label}`}>Pengeluaran</dt>
                <dd className="tabular mt-1.5 text-h3 text-ink">Rp 38,9 jt</dd>
              </div>
            </dl>

            <div className="mt-6 border-t border-deep/10 pt-5">
              <p className={`text-deep/80 ${label}`}>Rincian pengeluaran bulan ini</p>
              <ul className="mt-4 space-y-3">
                {RINCIAN.map((r) => (
                  <li key={r.nama}>
                    <span className="flex items-center justify-between gap-4 text-small text-deep">
                      {r.nama}
                      <span className="tabular font-mono text-[11px] text-deep/85">{r.nilai}%</span>
                    </span>
                    <span className="mt-1.5 block h-1.5 w-full rounded-full bg-deep/10">
                      <span className={`block h-full rounded-full ${r.warna}`} style={{ width: `${r.nilai}%` }} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-5">
            <p className={`text-deep/80 ${label}`}>Tren enam bulan</p>
            <div className="mt-5 flex h-32 items-end gap-2">
              {TREND.map((t) => (
                <div key={t.bulan} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-24 w-full items-end justify-center gap-1">
                    <div className="w-2.5 rounded-t bg-primary" style={{ height: `${t.masuk}%` }} />
                    <div className="w-2.5 rounded-t bg-deep/60" style={{ height: `${t.keluar}%` }} />
                  </div>
                  <span className="font-mono text-[10px] text-deep/80">{t.bulan}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-4 font-mono text-[10px] uppercase tracking-[0.12em] text-deep/80">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden />
                Pendapatan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-deep/60" aria-hidden />
                Pengeluaran
              </span>
            </div>

            <div className="mt-6 border-t border-deep/10 pt-5">
              <p className={`flex items-center gap-2 text-ochre ${label}`}>
                <Sparkles className="size-3.5" aria-hidden />
                Insight hari ini
              </p>
              <p className="mt-3 text-small text-deep">
                Pengeluaran bahan baku naik lebih cepat dari pendapatan bulan ini. Ada 2 piutang lewat jatuh tempo
                dengan total Rp 3.200.000.
              </p>
              <p className="mt-2 font-mono text-[11px] text-deep/80">periode 1–30 November · 148 transaksi</p>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="border-t border-deep/10 px-5 py-3 font-mono text-[11px] text-deep/80">
        Tampilan di atas memakai data contoh. Angka pada aplikasi dihitung dari catatan usahamu sendiri.
      </figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Bagian halaman                                                      */
/* ------------------------------------------------------------------ */

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-deep/10 bg-surface/85 backdrop-blur">
      <nav aria-label="Navigasi utama" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className={`rounded-sm text-h3 font-bold text-primary ${focus}`}>
          UMKM-AI
          <span className="ml-1 align-super font-mono text-[9px] font-medium text-deep/50">®</span>
        </Link>

        <ul className={`hidden items-center gap-7 text-deep/85 md:flex ${label}`}>
          {NAV.map((n) => (
            <li key={n.href}>
              <a href={n.href} className={`rounded-sm transition hover:text-primary ${focus}`}>
                {n.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/masuk"
            className={`inline-flex min-h-11 items-center rounded-md px-3 text-small font-medium text-deep transition hover:text-primary ${focus}`}
          >
            Masuk
          </Link>
          <Link
            href="/daftar"
            className={`inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-small font-semibold text-white transition hover:bg-[#C01717] ${focus}`}
          >
            Mulai gratis
          </Link>
        </div>
      </nav>
    </header>
  );
}

const BUKTI = [
  { k: "Saldo kas", v: "otomatis dari catatan" },
  { k: "Utang & piutang", v: "terpantau + jatuh tempo" },
  { k: "Ekspor", v: "CSV · Excel · PDF" },
  { k: "Impor", v: "template spreadsheet" },
];

function Hero() {
  return (
    <section className="bg-surface px-4 pt-8 pb-16 sm:px-6 sm:pt-12 sm:pb-20">
      {/* Bidang berfoto: hanya setinggi teks dan strip fakta, berhenti sebelum kartu produk. */}
      <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-2xl border border-deep/10">
        <div aria-hidden className="absolute inset-0 -z-20" data-hero-group>
          {HERO_SLIDES.map((s, i) => (
            <Image
              key={s.src}
              data-hero-slide
              src={s.src}
              alt=""
              fill
              priority={i === 0}
              sizes="(min-width: 1200px) 1152px, 100vw"
              quality={92}
              className="size-full object-cover object-center"
            />
          ))}
        </div>
        {/* Sisi teks ditutup bidang surface; sisi kanan dibiarkan jernih agar foto terbaca. */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-surface via-surface/80 to-transparent" />

        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-12">
          <div className="rounded-2xl border border-white/60 bg-white/85 p-6 shadow-[0_30px_60px_-40px_rgba(44,104,123,0.45)] backdrop-blur-md sm:p-8 lg:max-w-3xl">
            <h1 className="landing-rise text-mega text-ink">
              <span className="block">Platform Keuangan dan</span>
              <span className="mt-1 block text-[0.82em] leading-[1.06] text-primary">
                Analisis Bisnis Berbasis AI
              </span>
              <span className="mt-2 block text-[0.55em] font-bold tracking-[0.01em] text-ink">untuk UMKM</span>
            </h1>

            <p
              className="landing-rise mt-6 max-w-[62ch] text-body text-deep sm:text-lg"
              style={{ animationDelay: "80ms" }}
            >
              UMKM-AI membantu pemilik UMKM mencatat transaksi, memahami kondisi keuangan, memantau utang dan
              piutang, serta mendapatkan rekomendasi bisnis berdasarkan data keuangan aktual.
            </p>

            <div
              className="landing-rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: "160ms" }}
            >
              <Link href="/daftar" className={btnPrimary}>
                Mulai <span className="font-bold">Gratis</span>
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a href="#cara-kerja" className={btnOutline}>
                Lihat cara kerja
              </a>
            </div>

            <p className="mt-4 font-mono text-[11px] text-deep/85">
              tanpa kartu kredit · paket Free tersedia · naik ke Pro kapan pun
            </p>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-deep/12 bg-deep/10 md:grid-cols-4">
            {BUKTI.map((b) => (
              <div key={b.k} className="bg-white/90 px-4 py-5 backdrop-blur-sm">
                <dt className={`text-deep/80 ${label}`}>{b.k}</dt>
                <dd className="mt-2 font-mono text-[11px] text-deep">{b.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Produk sebagai objek: tanpa foto di belakangnya. Bingkai perspektif + kartu insight melayang. */}
      <div className="mx-auto mt-12 max-w-6xl sm:mt-14" data-clip>
        <TiltFrame className="mx-auto max-w-5xl">
          <div className="rounded-xl border border-deep/12 bg-white p-1.5 shadow-[0_50px_100px_-50px_rgba(44,104,123,0.6)]">
            <BerandaContoh />
          </div>
          <div
            className="pointer-events-none absolute -right-4 top-8 hidden w-56 rounded-lg border border-deep/12 bg-white p-4 shadow-[0_30px_60px_-25px_rgba(26,26,26,0.35)] md:block"
            style={{ transform: "translateZ(60px) rotate(-1.5deg)" }}
          >
            <p className={`flex items-center gap-2 text-ochre ${label}`}>
              <Sparkles className="size-3.5" aria-hidden />
              Insight AI
            </p>
            <p className="mt-2 text-small text-ink">Bahan baku naik 18%. Periksa harga pemasok.</p>
            <p className="mt-1.5 font-mono text-[11px] text-deep/80">42 transaksi · November</p>
          </div>
        </TiltFrame>
      </div>
    </section>
  );
}

/** Memecah teks jadi kata berspan supaya bisa dinyalakan bertahap mengikuti gulir. */
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={`${i}-${w}`} data-run-opacity-word>
          {w}{" "}
        </span>
      ))}
    </>
  );
}

/** Logo merek asli di dalam kalimat — dipakai sebagai rujukan nominatif. */
function Brand({ src, label }: { src: string; label: string }) {
  return (
    <span data-run-opacity-word className="inline-flex items-center gap-1.5 whitespace-nowrap">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-[0.78em] w-auto shrink-0 translate-y-[0.06em]" />
      {label}
    </span>
  );
}

function Masalah() {
  return (
    <Section
      intro={
        <div
          className="text-h2 leading-[1.35] text-deep sm:text-display sm:leading-[1.25]"
          data-run-opacity
        >
          <p className="max-w-[62ch] text-ink">
            <Words text="Banyak pelaku UMKM sudah menggunakan buku tulis," />{" "}
            <Brand src="/logos/excel.svg" label="Excel," />{" "}
            <Brand src="/logos/google-sheets.svg" label="Google Sheets," />{" "}
            <Words text="atau aplikasi pencatatan sederhana." />
          </p>
          <p className="mt-6 max-w-[62ch]">
            <Words text="Masalahnya bukan hanya bagaimana mencatat transaksi, melainkan bagaimana mengubah catatan tersebut menjadi informasi yang mudah dipahami dan berguna untuk mengambil keputusan." />
          </p>
          <p className="mt-6 max-w-[62ch] text-ink">
            <Words text="UMKM-AI menggabungkan pencatatan keuangan yang sederhana dengan" />{" "}
            <strong className="font-semibold text-primary">
              <Words text="analisis berbasis AI." />
            </strong>
          </p>
        </div>
      }
    />
  );
}

const FITUR: { icon: Icon; judul: string; isi: string }[] = [
  {
    icon: ReceiptText,
    judul: "Catat pemasukan dan pengeluaran harian",
    isi: "Simpan setiap transaksi lengkap dengan kategori, tanggal, catatan, dan metode pembayaran. Ada yang salah? Ubah, hapus, atau pulihkan kapan saja.",
  },
  {
    icon: Wallet,
    judul: "Saldo kas otomatis",
    isi: "Saldo awal ditambah pemasukan dikurangi pengeluaran. Semua dihitung di server, jadi angka di layar selalu akurat sesuai catatanmu.",
  },
  {
    icon: HandCoins,
    judul: "Utang dan piutang dengan pembayaran parsial",
    isi: "Catat pembayaran parsial, lalu lihat mana yang belum dibayar, sebagian, atau lunas. Tagihan lewat jatuh tempo otomatis ditandai.",
  },
  {
    icon: FileBarChart,
    judul: "Laporan periode dan perbandingan",
    isi: "Lihat ringkasan harian, mingguan, atau bulanan. Bandingkan pemasukan dan pengeluaran antar periode, lalu unduh laporan dalam CSV, Excel, atau PDF.",
  },
  {
    icon: Upload,
    judul: "Impor catatan dari spreadsheet",
    isi: "Pindahkan catatan lama pakai template resmi. Periksa pratinjau sebelum simpan, dan deteksi baris duplikat sebelum data masuk.",
  },
  {
    icon: Users,
    judul: "Kerja bersama tim",
    isi: "Undang anggota sebagai Owner, Admin, atau Staf. Hak akses dicek di server, jadi setiap anggota hanya buka fitur sesuai izinnya.",
  },
];

function Fitur() {
  return (
    <Section
      id="fitur"
      index="02"
      name="fitur"
      meta="6 modul"
      title="Fitur untuk kelola keuangan usaha tiap hari"
      desc="Enam fitur inti yang sudah bisa kamu pakai sejak hari pertama."
    >
      <dl className="divide-y divide-deep/10 border-y border-deep/10">
        {FITUR.map((f, i) => (
          <div key={f.judul} className="grid gap-4 py-8 md:grid-cols-12 md:gap-8" data-motion>
            <p className={`text-ochre md:col-span-1 ${label}`}>{String(i + 1).padStart(2, "0")}</p>
            <dt className="flex items-start gap-3 text-h3 text-ink md:col-span-4">
              <f.icon className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
              {f.judul}
            </dt>
            <dd className="max-w-[62ch] text-body text-deep/80 md:col-span-7">{f.isi}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

const AI_POIN = [
  "Semua nominal dihitung oleh sistem. AI hanya menjelaskan ringkasan angka yang sudah dihitung.",
  "AI tidak bisa membuat, mengubah, atau menghapus catatan transaksi.",
  "Setiap insight menyebut periode dan angka pendukungnya, supaya kamu bisa periksa sendiri.",
  "Kuota analisis mengikuti paket langganan, sementara pencatatan transaksi tetap bisa dipakai tanpa AI.",
];

const INSIGHT = [
  {
    isi: "Pengeluaran bahan baku naik lebih cepat dibanding pendapatan bulan ini. Periksa harga dari pemasok dan jumlah pembelian.",
    meta: "bahan baku +18% vs bulan lalu · 42 transaksi",
  },
  {
    isi: "Dua piutang sudah lewat jatuh tempo dengan total Rp 3.200.000. Sebaiknya ditagih lebih dulu agar arus kas tetap terjaga.",
    meta: "piutang lewat jatuh tempo · 2 dari 9 catatan",
  },
  {
    isi: "Pendapatan pada akhir pekan cenderung lebih tinggi dibanding hari kerja.",
    meta: "berdasarkan 148 transaksi · 1–30 November",
  },
];

function Analisis() {
  return (
    <Section
      id="analisis"
      index="03"
      name="analisis ai"
      meta="contoh keluaran"
      title="Analisis keuangan dari data usahamu"
      desc="AI Finance Analyst menjelaskan kondisi keuangan usahamu dan apa yang perlu dicek lebih dulu. Kami juga terang tentang batasnya."
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5" data-motion>
          <ul className="divide-y divide-deep/10 border-y border-deep/10">
            {AI_POIN.map((p) => (
              <li key={p} className="flex items-start gap-3 py-4 text-small text-deep">
                <Check className="mt-0.5 size-4 shrink-0 text-ochre" strokeWidth={3} aria-hidden />
                {p}
              </li>
            ))}
          </ul>

          {/*
            Foreground: foto yang menonjol keluar dari alur panel dan bergerak lebih cepat saat
            digulir, jadi terbaca berada di depan bagian ini.
          */}
          <div className="relative mt-10 hidden lg:block">
            <div
              data-foreground
              className="relative z-10 -ml-4 w-[19rem] overflow-hidden rounded-xl border border-white/80 shadow-[0_50px_90px_-40px_rgba(26,26,26,0.45)]"
            >
              <div className="relative h-64 w-full">
                <Image
                  src="/images/umkm/anyaman.webp"
                  alt="Tumpukan keranjang anyaman bermotif warna-warni di pasar kerajinan"
                  fill
                  sizes="304px"
                  className="size-full object-cover"
                />
              </div>
              <div className="bg-white px-4 py-3">
                <p className={`text-ochre ${label}`}>data lapangan</p>
                <p className="mt-1 text-small text-deep">Catatan harian usaha kerajinan, dirapikan jadi angka.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7" data-motion>
          <div className="rounded-xl border border-deep/12 bg-white p-6 shadow-sm sm:p-8">
            <p className={`flex items-center justify-between gap-4 text-ochre ${label}`}>
              <span className="flex items-center gap-2">
                <Sparkles className="size-3.5" aria-hidden />
                Insight hari ini
              </span>
              <span className="text-deep/50">contoh keluaran</span>
            </p>

            <ul className="mt-6 divide-y divide-deep/10 border-y border-deep/10">
              {INSIGHT.map((s, i) => (
                <li key={s.meta} className="py-5">
                  <p className={`text-ochre ${label}`}>{String(i + 1).padStart(2, "0")}</p>
                  <p className="mt-2 text-body text-ink">{s.isi}</p>
                  <p className="mt-2 font-mono text-[11px] text-deep/80">{s.meta}</p>
                </li>
              ))}
            </ul>

            <p className="mt-6 border-t border-deep/10 pt-5 font-mono text-[11px] leading-relaxed text-deep/80">
              Contoh tampilan. Insight sebenarnya dibuat dari data usahamu sendiri. Selisih kas tidak pernah kami
              sebut laba bersih, karena versi ini belum menghitung harga pokok penjualan.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

const LAPISAN = [
  {
    src: "/images/umkm/jajanan.webp",
    alt: "Etalase kaca toko kue berisi aneka jajanan dengan label harga",
    langkah: "Langkah 1",
    judul: "Catat",
    isi: "Pendapatan dan pengeluaran tersimpan lengkap dengan kategori, tanggal, dan metode pembayaran.",
  },
  {
    src: "/images/umkm/anyaman.webp",
    alt: "Tumpukan keranjang anyaman bermotif warna-warni di pasar kerajinan",
    langkah: "Langkah 2",
    judul: "Pantau",
    isi: "Saldo kas dan tagihan utang-piutang mengikuti catatan yang tersimpan, bukan hitungan terpisah di tampilan.",
  },
  {
    src: "/images/umkm/pasar.webp",
    alt: "Lapak sayur di pasar tradisional, penjual melayani pembeli",
    langkah: "Langkah 3",
    judul: "Pahami",
    isi: "Ringkasan dan insight AI dihitung dari catatan usahamu sendiri, lengkap dengan periode dan angka pendukungnya.",
  },
];

/**
 * Tiga panel menempel (sticky) yang membesar saat digulir. Tanpa JavaScript panel tetap tampil
 * datar dan bisa dibaca semua.
 */
function Lapisan() {
  return (
    <Section
      index="04"
      name="alur"
      meta="3 lapisan"
      title="Catat, pantau, lalu pahami"
      desc="Tiga lapisan yang menumpuk di atas satu catatan transaksi yang sama."
    >
      <ol>
        {LAPISAN.map((l, i) => (
          <li key={l.judul} className="sticky mb-4 last:mb-0" style={{ top: `${100 + i * 18}px` }}>
            <div
              data-layer
              className="grid overflow-hidden rounded-xl border border-deep/12 bg-white shadow-lg shadow-deep/10 md:grid-cols-12 md:items-center"
            >
              <div className="relative h-44 md:col-span-4 md:h-56">
                <Image
                  src={l.src}
                  alt={l.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <span className={`absolute left-4 top-4 rounded-sm bg-white/90 px-2 py-1 text-ochre ${label}`}>
                  {l.langkah}
                </span>
              </div>
              <div className="p-6 sm:p-8 md:col-span-8">
                <h3 className="text-h2 text-ink">{l.judul}</h3>
                <p className="mt-3 max-w-[56ch] text-body text-deep/80">{l.isi}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

const LANGKAH = [
  {
    judul: "Daftar dan siapkan usaha",
    isi: "Buat akun, masukkan nama usaha, lalu tentukan saldo awal kas sebagai dasar perhitungan saldo.",
  },
  {
    judul: "Catat transaksi harian",
    isi: "Catat langsung di aplikasi, atau pindahkan catatan lama dari spreadsheet lewat template impor.",
  },
  {
    judul: "Pantau dan pahami perkembangan usaha",
    isi: "Periksa dashboard dan laporan, lalu baca insight harian untuk memahami pola transaksi usahamu.",
  },
];

function CaraKerja() {
  return (
    <Section
      id="cara-kerja"
      index="05"
      name="cara kerja"
      meta="± 5 menit"
      title="Tiga langkah untuk mulai"
      desc="Tidak perlu pengalaman akuntansi atau pelatihan khusus."
    >
      <ol className="grid gap-px overflow-hidden rounded-xl border border-deep/12 bg-deep/10 md:grid-cols-3">
        {LANGKAH.map((s, i) => (
          <li key={s.judul} className="bg-white p-6 sm:p-8" data-motion>
            <p className={`text-ochre ${label}`}>{String(i + 1).padStart(2, "0")}</p>
            <p className="mt-4 text-h3 text-ink">{s.judul}</p>
            <p className="mt-2 text-small text-deep/80">{s.isi}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

const JENIS = [
  { src: "/images/umkm/warung.webp", alt: "Meja saji dan papan menu tulisan tangan di sebuah warung makan", judul: "Warung makan", isi: "Penjualan harian dan belanja bahan baku." },
  { src: "/images/umkm/pasar.webp", alt: "Lapak sayur di pasar tradisional, penjual melayani pembeli", judul: "Pasar dan sembako", isi: "Belanja barang dagangan dan penjualan harian." },
  { src: "/images/umkm/tekstil.webp", alt: "Lapak kain dan tas dengan motif beragam", judul: "Tekstil dan kerajinan", isi: "Pesanan dengan pembayaran bertahap yang menjadi piutang." },
];

function UntukSiapa() {
  return (
    <Section
      index="06"
      name="pengguna"
      meta="3 jenis usaha"
      title="Cocok untuk berbagai jenis usaha kecil"
      desc="UMKM-AI dibuat untuk usaha dengan pencatatan sederhana dan pemilik yang mengurus sendiri operasional hariannya."
    >
      <ul className="grid gap-6 sm:grid-cols-3">
        {JENIS.map((j, i) => (
          <li key={j.judul} className={i === 1 ? "sm:mt-10" : ""} data-motion>
            <div className="relative h-48 w-full overflow-hidden rounded-xl border border-deep/12">
              <Image
                src={j.src}
                alt={j.alt}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <h3 className="mt-4 text-h3 text-ink">{j.judul}</h3>
            <p className="mt-1.5 text-small text-deep/80">{j.isi}</p>
          </li>
        ))}
      </ul>
      <p className={`mt-8 text-deep/80 ${label}`}>Foto ilustrasi jenis usaha, bukan testimoni pengguna</p>
    </Section>
  );
}

const AMAN: { icon: Icon; judul: string; isi: string }[] = [
  { icon: ShieldCheck, judul: "Data tiap usaha terpisah", isi: "Data satu usaha tidak bisa diakses usaha lain. Pemisahan ini juga diuji otomatis." },
  { icon: Users, judul: "Izin diperiksa di server", isi: "Owner, Admin, dan Staf punya hak berbeda. Setiap peran hanya bisa membuka fitur sesuai izinnya." },
  { icon: ListChecks, judul: "Riwayat perubahan", isi: "Perubahan transaksi dicatat sebelum dan sesudah, sehingga data yang salah bisa dipulihkan." },
  { icon: Database, judul: "Backup dan audit", isi: "Backup dilakukan setiap hari, dan aktivitas admin dicatat agar kejadian penting bisa ditelusuri." },
];

function Keamanan() {
  return (
    <Section
      id="keamanan"
      index="07"
      name="keamanan"
      meta="4 kendali"
      title="Cara kami menjaga data keuanganmu"
      desc="Hal dasar yang kami kerjakan sebelum menambah fitur."
    >
      <dl className="grid gap-px overflow-hidden rounded-xl border border-deep/12 bg-deep/10 sm:grid-cols-2">
        {AMAN.map((a) => (
          <div key={a.judul} className="bg-white p-6 sm:p-8" data-motion>
            <dt className="flex items-center gap-3 text-h3 text-ink">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <a.icon className="size-5" aria-hidden />
              </span>
              {a.judul}
            </dt>
            <dd className="mt-2.5 max-w-[52ch] text-small text-deep/80">{a.isi}</dd>
          </div>
        ))}
      </dl>
      <p className={`mt-8 flex items-center gap-2 text-deep/80 ${label}`}>
        <RefreshCw className="size-3.5" aria-hidden />
        Versi pertama fokus pada pencatatan, laporan, dan analisis AI · chat transaksi &amp; pemindaian struk menyusul
      </p>
    </Section>
  );
}

/** Pita foto selebar layar: jeda visual antara dua blok data (satu-satunya blok gelap). */
function PitaFoto() {
  return (
    <section className="relative isolate overflow-hidden">
      <Image
        src="/images/background1.jpg"
        alt=""
        fill
        sizes="100vw"
        data-band-image
        className="absolute inset-0 -z-20 size-full scale-110 object-cover"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[#0e2a33]/88" />
      <div data-motion className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-24">
        <p className={`text-gold ${label}`}>sumber angka</p>
        <p className="mt-5 text-h2 text-white">
          Setiap angka di UMKM-AI berasal dari transaksi yang kamu catat, bukan dari rata-rata industri atau
          perkiraan.
        </p>
        <p className="mt-4 text-small text-white/80">
          Memulai butuh beberapa menit, dan hasilnya bisa langsung dipakai membaca usaha.
        </p>
      </div>
    </section>
  );
}

const FAQ = [
  {
    q: "Apakah UMKM-AI gratis?",
    a: "UMKM-AI punya paket Free dengan kuota bulanan untuk jumlah transaksi dan permintaan AI, serta paket Pro untuk pemakaian yang lebih besar. Rinciannya ada di halaman Langganan setelah kamu masuk.",
  },
  {
    q: "Apakah AI bisa mengubah catatan keuanganku?",
    a: "Tidak. AI hanya membaca ringkasan angka yang dihitung sistem, lalu menjelaskannya. Setiap perubahan catatan tetap lewat fitur aplikasi dan diperiksa di server.",
  },
  {
    q: "Apakah saldo kas sama dengan laba?",
    a: "Bukan. Saldo kas adalah posisi uang: saldo awal ditambah pendapatan dikurangi pengeluaran. Versi ini belum menghitung harga pokok penjualan, jadi angkanya tidak pernah disebut laba bersih.",
  },
  {
    q: "Apakah ada pengingat jatuh tempo otomatis?",
    a: "Belum ada. Tagihan yang lewat jatuh tempo ditandai di halaman utang-piutang, jadi kamu bisa melihatnya setiap kali membuka aplikasi.",
  },
  {
    q: "Bisakah memindahkan catatan dari spreadsheet lama?",
    a: "Bisa. Gunakan template impor resmi, periksa pratinjaunya, lalu simpan setelah datanya sesuai. Baris duplikat terdeteksi sebelum data masuk.",
  },
  {
    q: "Siapa saja yang bisa mengakses data usahaku?",
    a: "Hanya anggota yang kamu undang. Setiap peran punya hak akses berbeda, dan data antar usaha dipisahkan di server.",
  },
];

function Faq() {
  return (
    <Section id="faq" index="09" name="faq" meta="6 pertanyaan" title="Pertanyaan yang sering muncul">
      <div className="max-w-3xl border-y border-deep/10">
        {FAQ.map((f, i) => (
          <details key={f.q} className="group border-b border-deep/10 last:border-b-0" data-motion>
            <summary
              className={`flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-5 text-body font-semibold text-ink [&::-webkit-details-marker]:hidden ${focus}`}
            >
              <span className="flex items-start gap-4">
                <span className={`mt-1 text-ochre ${label}`}>{String(i + 1).padStart(2, "0")}</span>
                {f.q}
              </span>
              <ChevronDown
                className="size-5 shrink-0 text-deep/80 transition group-open:rotate-180 motion-reduce:transition-none"
                aria-hidden
              />
            </summary>
            <p className="max-w-[68ch] pb-5 pl-10 text-small text-deep/80">{f.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function AjakanTerakhir() {
  return (
    <section className="px-4 pb-20 sm:px-6 sm:pb-24">
      <div className="mx-auto max-w-6xl">
        <div
          data-clip
          className="relative overflow-hidden rounded-2xl bg-primary px-6 py-14 text-white shadow-[0_40px_80px_-40px_rgba(219,26,26,0.5)] sm:px-12 sm:py-16"
        >
          <span
            aria-hidden
            data-numeral
            className="pointer-events-none absolute -right-6 -top-10 select-none text-[12rem] font-bold leading-none text-white/10"
          >
            10
          </span>
          <div className="relative" data-motion>
            <p className={`text-white/70 ${label}`}>mulai</p>
            <h2 className="mt-5 max-w-[24ch] text-h1 text-white">Mulai catat hari ini, pahami usahamu bulan ini</h2>
            <p className="mt-3 max-w-[52ch] text-body text-white/90">
              Daftar, masukkan saldo awal, lalu catat transaksi pertamamu. Analisis AI mulai bekerja setelah catatan
              usahamu tersedia.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/daftar"
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-white px-6 text-body font-semibold text-primary transition hover:bg-surface ${focus}`}
              >
                Mulai gratis
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/masuk"
                className={`inline-flex min-h-12 items-center justify-center rounded-md border border-white/60 px-6 text-body font-semibold text-white transition hover:bg-white/10 ${focus}`}
              >
                Sudah punya akun? Masuk
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-deep/10 bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="text-h3 font-bold text-primary">
            UMKM-AI
            <span className="ml-1 align-super font-mono text-[9px] text-deep/50">®</span>
          </p>
          <p className="mt-3 max-w-sm text-small text-deep/80">
            Aplikasi pencatatan keuangan dan analisis bisnis berbasis AI untuk UMKM Indonesia. Versi pertama fokus
            pada catatan yang rapi dan angka yang mudah dipahami.
          </p>
        </div>

        <nav aria-label="Tautan footer" className="grid grid-cols-2 gap-x-8 gap-y-3 md:col-span-4">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className={`text-small text-deep/80 transition hover:text-primary ${focus}`}>
              {n.label}
            </a>
          ))}
          <Link href="/masuk" className={`text-small text-deep/80 transition hover:text-primary ${focus}`}>
            Masuk
          </Link>
          <Link href="/daftar" className={`text-small text-deep/80 transition hover:text-primary ${focus}`}>
            Daftar
          </Link>
        </nav>

        <div className="md:col-span-3">
          <p className={`text-deep/50 ${label}`}>status</p>
          <p className="mt-3 font-mono text-[11px] text-deep/80">v1 · pencatatan, laporan, analisis AI</p>
          <p className="mt-1 font-mono text-[11px] text-deep/80">proyek portofolio · 2026</p>
        </div>
      </div>

      <div className="border-t border-deep/10">
        <div
          className={`mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-deep/80 sm:px-6 ${label}`}
        >
          <span>© {new Date().getFullYear()} UMKM-AI</span>
          <span>Foto: Unsplash dan Pexels</span>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <LandingMotion>
      <div className="grain bg-surface text-ink">
        <a
          href="#isi"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-small focus:font-semibold focus:text-primary"
        >
          Langsung ke konten
        </a>
        <Header />
        <main id="isi">
          <Hero />
          <Masalah />
          <Fitur />
          <Analisis />
          <Lapisan />
          <CaraKerja />
          <UntukSiapa />
          <Keamanan />
          <PitaFoto />
          <Faq />
          <AjakanTerakhir />
        </main>
        <Footer />
      </div>
    </LandingMotion>
  );
}
