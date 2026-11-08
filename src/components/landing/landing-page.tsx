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
import { CookieConsent } from "@/components/cookie-consent";

/*
 * Tema cerah: latar surface/putih, teks ink, garis rambut deep, label monospace huruf kapital.
 * Satu aksen dekoratif (gold) plus merah brand untuk aksi. Tiap bagian punya "highlight":
 * angka besar sebagai tanda air, garis aksen yang memanjang, dan judul bermask.
 */

const NAV = [
  { href: "#masalah", label: "Masalah" },
  { href: "#pengguna", label: "Cocok untuk" },
  { href: "#fitur", label: "Fitur" },
  { href: "#analisis", label: "Analisis AI" },
  { href: "#cara-kerja", label: "Cara kerja" },
  { href: "#keamanan", label: "Keamanan" },
  { href: "#faq", label: "FAQ" },
  { href: "#harga", label: "Harga" },
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
  className,
  dark,
  center,
  hideRule,
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
  /** Latar/kustom kelas untuk seluruh bagian. */
  className?: string;
  /** Bagian berlatar gelap/warna pekat: teks judul & anotasi jadi terang. */
  dark?: boolean;
  /** Judul & anotasi rata tengah. */
  center?: boolean;
  /** Sembunyikan garis gradien di bawah anotasi. */
  hideRule?: boolean;
}) {
  const annotated = Boolean(index && name);

  return (
    <section
      id={id}
      className={`relative scroll-mt-24 overflow-hidden ${children ? "py-20 sm:py-28" : "py-16 sm:py-20"} ${className ?? ""}`}
    >
      {annotated ? (
        <span
          aria-hidden
          data-numeral
          className={`pointer-events-none absolute -right-4 top-6 select-none text-[9rem] font-bold leading-none tracking-tighter sm:text-[14rem] ${dark ? "text-white/[0.08]" : "text-deep/[0.06]"}`}
        >
          {index}
        </span>
      ) : null}

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {annotated ? (
          <>
            <div className={`flex flex-wrap items-baseline gap-3 ${center ? "justify-center text-center" : "justify-between"} ${label} ${dark ? "text-white/80" : "text-ochre"}`}>
              <span>{name}</span>
              {meta ? <span className={`tabular ${dark ? "text-white/70" : "text-deep/80"}`}>{meta}</span> : null}
            </div>
            {hideRule ? null : (
              <div
                aria-hidden
                data-rule
                className="mt-4 h-px w-full origin-left bg-gradient-to-r from-gold via-primary/60 to-transparent"
              />
            )}
          </>
        ) : null}

        {intro ? (
          <div className="max-w-none">{intro}</div>
        ) : (
          <div className={center ? "mt-8 text-center" : "mt-8 grid gap-6 lg:grid-cols-12 lg:gap-12"}>
            <h2
              className={`text-h1 ${center ? "mx-auto" : "lg:col-span-5"} ${dark ? "text-white" : "text-ink"}`}
              data-mask
            >
              <span data-mask-line className="block">
                {title}
              </span>
            </h2>
            {desc ? (
              <p
                className={`max-w-[62ch] text-body ${center ? "mx-auto mt-4" : "lg:col-span-7"} ${dark ? "text-white/80" : "text-deep/80"}`}
                data-motion
              >
                {desc}
              </p>
            ) : null}
          </div>
        )}

        {children ? <div className={center ? "mx-auto mt-12 max-w-3xl sm:mt-14" : "mt-12 sm:mt-14"}>{children}</div> : null}
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
        <Link href="/" className={`flex items-center gap-2 rounded-sm ${focus}`}>
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-md bg-surface text-lg font-extrabold leading-none text-primary ring-1 ring-primary/15"
          >
            U
          </span>
          <span className="text-h3 font-bold text-primary">
            UMKM-AI
            <span className="ml-1 align-super font-mono text-[9px] font-medium text-deep/50">®</span>
          </span>
        </Link>

        <ul className={`hidden items-center gap-7 text-deep/85 lg:flex ${label}`}>
          {NAV.map((n) => (
            <li key={n.href}>
              <a href={n.href} className={`rounded-sm transition hover:text-primary ${focus}`}>
                {n.label}
              </a>
            </li>
          ))}
        </ul>

        <Link
          href="/masuk"
          className={`inline-flex min-h-11 items-center rounded-md px-3 text-small font-semibold text-primary transition hover:text-[#C01717] ${focus}`}
        >
          Login
        </Link>
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
    <section className="bg-surface px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Teks duduk langsung di latar terang — tanpa panel bertumpuk. */}
        <div className="lg:col-span-6">
          <h1 className="landing-rise text-display leading-[1.08] text-ink">
            <span className="block">Platform Keuangan dan</span>
            <span className="block text-primary">Analisis Bisnis Berbasis AI</span>
            <span className="mt-1 block text-[1em] font-bold text-ink">untuk UMKM</span>
          </h1>

          <p
            className="landing-rise mt-5 max-w-[46ch] text-body text-deep"
            style={{ animationDelay: "80ms" }}
          >
            UMKM-AI membantu pemilik UMKM mencatat transaksi, memahami kondisi keuangan, memantau utang dan
            piutang, serta mendapatkan rekomendasi bisnis berdasarkan data keuangan aktual.
          </p>

          <div
            className="landing-rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "160ms" }}
          >
            <Link href="/daftar" className={`${btnPrimary} btn-shimmer`}>
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

        {/* Foto UMKM sebagai kartu terang (tanpa lapisan gelap) + kartu contoh analisis AI. */}
        <div className="relative lg:col-span-6">
          <div
            className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-deep/12 shadow-[0_40px_80px_-45px_rgba(44,104,123,0.55)]"
            data-hero-group
          >
            {HERO_SLIDES.map((s, i) => (
              <Image
                key={s.src}
                data-hero-slide
                src={s.src}
                alt={s.alt}
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 560px, 100vw"
                quality={92}
                className="size-full object-cover object-center"
              />
            ))}
          </div>
          <div className="pointer-events-none absolute bottom-4 left-2 w-56 rounded-lg border border-deep/12 bg-white p-4 shadow-[0_30px_60px_-25px_rgba(26,26,26,0.35)] sm:-bottom-6 sm:-left-6">
            <p className={`flex items-center gap-2 text-ochre ${label}`}>
              <Sparkles className="size-3.5" aria-hidden />
              insight AI
            </p>
            <p className="mt-2 text-small text-ink">Bahan baku naik 18%. Periksa harga pemasok.</p>
            <p className="mt-1.5 font-mono text-[11px] text-deep/80">42 transaksi · November</p>
          </div>
        </div>
      </div>

      <dl className="mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-deep/12 bg-deep/10 sm:mt-20 md:grid-cols-4">
        {BUKTI.map((b) => (
          <div key={b.k} className="bg-white px-4 py-5">
            <dt className={`text-deep/80 ${label}`}>{b.k}</dt>
            <dd className="mt-2 font-mono text-[11px] text-deep">{b.v}</dd>
          </div>
        ))}
      </dl>

      {/* Produk sebagai objek: bingkai perspektif. */}
      <div className="mx-auto mt-12 max-w-6xl sm:mt-14" data-clip>
        <TiltFrame className="mx-auto max-w-5xl">
          <div className="rounded-xl border border-deep/12 bg-white p-1.5 shadow-[0_50px_100px_-50px_rgba(44,104,123,0.6)]">
            <BerandaContoh />
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
    <div className="relative">
      <Section
        id="masalah"
        className="section-grain bg-primary bg-[radial-gradient(100%_140%_at_100%_100%,rgba(0,0,0,0.30),transparent_55%)] text-white shadow-[inset_0_-60px_90px_-50px_rgba(0,0,0,0.40)]"
        intro={
          <div
            className="relative text-h2 leading-[1.35] sm:text-display sm:leading-[1.25]"
            data-run-opacity
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-2 -top-10 select-none text-[6rem] font-bold leading-none tracking-tighter text-white/[0.06] sm:text-[10rem]"
            >
              masalah
            </span>
            <p className="relative max-w-[62ch]">
              <Words text="Banyak pelaku UMKM sudah menggunakan buku tulis," />{" "}
              <Brand src="/logos/excel.svg" label="Excel," />{" "}
              <Brand src="/logos/google-sheets.svg" label="Google Sheets," />{" "}
              <Words text="atau aplikasi pencatatan sederhana." />
            </p>
            <p className="mt-6 max-w-[62ch] text-white/85">
              <Words text="Masalahnya bukan hanya bagaimana mencatat transaksi, melainkan bagaimana mengubah catatan tersebut menjadi informasi yang mudah dipahami dan berguna untuk mengambil keputusan." />
            </p>
            <p className="mt-6 max-w-[62ch]">
              <Words text="UMKM-AI menggabungkan pencatatan keuangan yang sederhana dengan" />{" "}
              <strong className="font-semibold underline decoration-white/50 underline-offset-[6px]">
                <Words text="analisis berbasis AI." />
              </strong>
            </p>
          </div>
        }
      />

      {/* Foto yang menembus batas bawah bagian — sengaja di luar <Section> yang overflow-hidden. */}
      <div className="pointer-events-none absolute -bottom-14 right-6 z-10 hidden w-52 rotate-2 overflow-hidden rounded-xl border-4 border-white shadow-[0_40px_70px_-30px_rgba(0,0,0,0.55)] lg:block">
        <Image
          src="/images/umkm/kopi.webp"
          alt=""
          width={416}
          height={312}
          sizes="208px"
          className="h-32 w-full object-cover"
        />
      </div>
    </div>
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
      index="03"
      name="fitur"
      meta="6 modul"
      title="Fitur untuk kelola keuangan usaha tiap hari"
      desc="Enam fitur inti yang sudah bisa kamu pakai sejak hari pertama."
    >
      <dl className="divide-y divide-deep/10 border-y border-deep/10">
        {FITUR.map((f, i) => (
          <div key={f.judul} className="grid gap-4 py-8 md:grid-cols-12 md:gap-8" data-motion>
            <p className={`text-ochre md:col-span-1 ${label}`}>{String(i + 1).padStart(2, "0")}</p>
            <dt className="flex origin-left items-start gap-3 text-h3 text-ink md:col-span-4" data-zoom-blur>
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
      index="04"
      name="analisis ai"
      meta="3 insight"
      title="Analisis keuangan dari data usahamu"
      dark
      className="section-grain bg-primary bg-[radial-gradient(100%_140%_at_100%_100%,rgba(0,0,0,0.32),transparent_55%)] text-white shadow-[inset_0_-60px_90px_-50px_rgba(0,0,0,0.40)]"
    >
      <div className="relative isolate space-y-12 sm:space-y-16">
        {/* Tanda air: logo GPT tanpa saturasi, berputar lambat. Dekoratif, tanpa makna aksesibel. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden">
          <div className="absolute -right-12 top-1/2 h-[150%] w-auto -translate-y-1/2 sm:-right-4">
            <svg
              viewBox="0 0 611 611"
              fill="currentColor"
              className="h-full w-auto animate-[spin_45s_linear_infinite] text-white saturate-0 opacity-[0.06] motion-reduce:animate-none"
            >
              <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M252.794 108.802C289.191 99.0484 326.265 110.305 351.148 135.135C385.113 126.072 422.85 134.862 449.492 161.505C476.136 188.149 484.925 225.888 475.862 259.85V259.854C500.696 284.735 511.95 321.81 502.198 358.207C492.447 394.602 464.161 421.084 430.215 430.217C421.083 464.162 394.603 492.448 358.206 502.199C321.812 511.951 284.734 500.693 259.852 475.864C225.887 484.927 188.15 476.137 161.507 449.495C134.864 422.851 126.073 385.111 135.136 351.149C110.304 326.266 99.0496 289.192 108.801 252.795C118.552 216.4 146.84 189.918 180.784 180.785C189.917 146.841 216.396 118.553 252.794 108.802ZM374.292 407.145C374.292 411.271 372.092 415.086 368.517 417.148L283.723 466.102C302.487 480.585 327.555 486.459 352.217 479.852C386.997 470.532 410.068 439.312 410.555 405.006V317.717C410.555 315.08 409.125 312.621 406.843 311.303L374.292 292.509V407.145ZM251.868 415.897C248.296 417.959 243.893 417.959 240.317 415.897L155.526 366.942C152.366 390.436 159.811 415.08 177.866 433.136H177.863C203.325 458.594 241.896 462.962 271.85 446.232L347.449 402.586C349.735 401.268 351.148 398.8 351.148 396.163V358.579L251.868 415.897ZM368.602 220.628C366.319 219.309 363.474 219.318 361.191 220.637L328.641 239.431L427.921 296.749C431.496 298.811 433.697 302.627 433.697 306.752V404.661C455.622 395.654 473.244 376.881 479.851 352.218C489.169 317.442 473.668 281.85 444.201 264.274L368.602 220.628ZM177.303 206.34C155.377 215.348 137.756 234.122 131.148 258.783C121.832 293.561 137.331 329.153 166.799 346.727L242.398 390.373C244.68 391.692 247.525 391.684 249.807 390.366L282.357 371.572L183.078 314.253C179.504 312.189 177.303 308.375 177.303 304.251V206.34ZM259.849 279.145V331.858L305.5 358.213L351.15 331.858V279.145L305.5 252.789L259.849 279.145ZM327.276 144.9C308.512 130.418 283.445 124.543 258.782 131.15C224.002 140.471 200.931 171.691 200.445 205.995V293.286C200.445 295.923 201.875 298.381 204.158 299.7L236.707 318.493V203.856C236.707 199.731 238.909 195.916 242.483 193.853L327.276 144.9ZM433.137 177.867C407.675 152.407 369.103 148.038 339.149 164.769L263.55 208.415C261.265 209.734 259.852 212.202 259.852 214.838V252.423L359.132 195.105C362.703 193.041 367.108 193.041 370.682 195.105L455.473 244.06C458.635 220.567 451.189 195.922 433.135 177.867H433.137Z"
              />
            </svg>
          </div>
        </div>

        {/* 1. Contoh keluaran: satu insight = satu kartu, gampang dipindai. */}
        <div data-motion>
          <p className={`flex items-center gap-2 text-white ${label}`}>
            <Sparkles className="size-3.5" aria-hidden />
            Contoh keluaran AI
          </p>
          <ul className="mt-4 grid gap-4 sm:gap-5 lg:grid-cols-3" data-insight-list>
            {INSIGHT.map((s, i) => (
              <li
                key={i}
                data-insight-item
                className="flex flex-col rounded-xl border border-white/15 bg-white p-5 shadow-sm sm:p-6"
              >
                <p className={`text-ochre ${label}`}>Insight {String(i + 1).padStart(2, "0")}</p>
                <p className="mt-3 flex-1 text-body text-ink">{s.isi}</p>
                <p className="mt-4 border-t border-deep/10 pt-3 font-mono text-[11px] text-deep/80">{s.meta}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-[70ch] font-mono text-[11px] leading-relaxed text-white/70">
            Contoh tampilan. Insight sebenarnya dibuat dari data usahamu sendiri. Selisih kas tidak pernah kami
            sebut laba bersih, karena versi ini belum menghitung harga pokok penjualan.
          </p>
        </div>

        {/* 2. Batas dan aturan AI: daftar tegas + foto pendukung. */}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7" data-motion>
            <p className={`flex items-center gap-2 text-white ${label}`}>
              <ShieldCheck className="size-3.5" aria-hidden />
              Batas dan aturan AI
            </p>
            <ul className="mt-4 divide-y divide-white/15 border-y border-white/15" data-check-list>
              {AI_POIN.map((p) => (
                <li key={p} className="flex items-start gap-3 py-4 text-small text-white/85">
                  <Check data-check className="mt-0.5 size-4 shrink-0 text-white" strokeWidth={3} aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative hidden lg:col-span-5 lg:block">
            <div
              data-foreground
              className="relative z-10 overflow-hidden rounded-xl border border-white/20 shadow-[0_50px_90px_-40px_rgba(0,0,0,0.55)]"
            >
              <div className="relative h-56 w-full">
                <Image
                  src="/images/umkm/anyaman.webp"
                  alt="Tumpukan keranjang anyaman bermotif warna-warni di pasar kerajinan"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="size-full object-cover grayscale"
                />
              </div>
              <div className="bg-white px-4 py-3">
                <p className={`text-ochre ${label}`}>data lapangan</p>
                <p className="mt-1 text-small text-deep">Catatan harian usaha kerajinan, dirapikan jadi angka.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
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
      id="pengguna"
      index="02"
      name="pengguna"
      meta="3 jenis usaha"
      title="Cocok untuk berbagai jenis usaha kecil"
      desc="UMKM-AI dibuat untuk usaha dengan pencatatan sederhana dan pemilik yang mengurus sendiri operasional hariannya."
    >
      <ul className="grid gap-6 sm:grid-cols-3" data-jenis-list>
        {JENIS.map((j, i) => (
          <li key={j.judul} className={i === 1 ? "sm:mt-10" : ""} data-jenis-card>
            <div
              className="relative h-48 w-full overflow-hidden rounded-xl border border-deep/12"
              data-jenis-media
            >
              <Image
                src={j.src}
                alt={j.alt}
                fill
                data-jenis-parallax
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <h3 className="mt-4 text-h3 text-ink" data-jenis-text>
              {j.judul}
            </h3>
            <p className="mt-1.5 text-small text-deep/80" data-jenis-text>
              {j.isi}
            </p>
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
      index="06"
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
    <Section id="faq" index="07" name="faq" meta="6 pertanyaan" title="Pertanyaan yang sering muncul" center hideRule>
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

const PLAN = [
  {
    nama: "Free",
    icon: Wallet,
    harga: "Rp 0",
    periode: "/bulan",
    ringkas: "Cukup untuk mulai mencatat dan membaca kondisi usaha.",
    fitur: [
      "Maksimal 100 transaksi manual per bulan",
      "Kuota analisis AI bulanan dasar",
      "Dashboard dasar dan laporan sesuai batas paket",
      "Akses riwayat tetap ada walau kuota transaksi habis",
      "Impor CSV mengikuti batas transaksi",
      "Pencatatan keuangan tetap jalan tanpa AI",
    ],
    cta: "Mulai gratis",
    href: "/daftar",
    featured: false,
  },
  {
    nama: "Pro",
    icon: Sparkles,
    harga: "Rp 49.000",
    periode: "/bulan",
    ringkas: "Untuk usaha yang butuh laporan lengkap dan AI lebih sering.",
    fitur: [
      "Semua di paket Free, tanpa batas transaksi manual",
      "Hingga 5 anggota aktif per bisnis",
      "Laporan lanjutan dan perbandingan historis lebih panjang",
      "Ekspor penuh CSV, Excel, dan PDF",
      "Kuota analisis AI lebih besar (fair use)",
      "Pembayaran manual diverifikasi admin",
    ],
    cta: "Pilih Pro",
    href: "/daftar",
    featured: true,
  },
] as const;

function Harga() {
  return (
    <Section
      id="harga"
      index="08"
      name="harga"
      meta="2 paket"
      title="Mulai gratis, naik ke Pro saat perlu"
      desc="Harga transparan tanpa biaya tersembunyi. Bisa berhenti kapan saja."
      center
    >
      <div className="grid gap-6 lg:grid-cols-2" style={{ perspective: "1400px" }}>
        {PLAN.map((p) => (
          <article
            key={p.nama}
            data-price-card
            data-price-featured={p.featured ? "true" : undefined}
            className={`relative flex flex-col rounded-2xl p-6 sm:p-8 ${
              p.featured
                ? "price-glow bg-white shadow-[0_40px_90px_-45px_rgba(219,26,26,0.45)]"
                : "border border-deep/12 bg-white/70"
            }`}
          >
            {p.featured ? (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
              >
                <span className="price-shimmer-bar absolute -left-1/2 inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              </span>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-h3 text-ink">
                <p.icon className="size-5 text-primary" aria-hidden />
                {p.nama}
              </span>
              {p.featured ? (
                <span className={`rounded-full bg-primary px-3 py-1 text-white ${label}`}>Paling populer</span>
              ) : null}
            </div>

            <p className="mt-6 flex items-baseline gap-1">
              <span className="text-h1 text-ink">{p.harga}</span>
              <span className="text-small text-deep/70">{p.periode}</span>
            </p>
            <p className="mt-2 max-w-[42ch] text-small text-deep/80">{p.ringkas}</p>

            <ul className="mt-6 space-y-3">
              {p.fitur.map((f) => (
                <li key={f} className="flex items-start gap-3 text-small text-deep">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={3} aria-hidden />
                  {f}
                </li>
              ))}
            </ul>

            <Link href={p.href} className={`mt-8 ${p.featured ? btnPrimary : btnOutline}`}>
              {p.cta}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </article>
        ))}
      </div>

      <p className={`mt-6 text-center text-deep/60 ${label}`}>
        Harga Pro awal · bisa berubah setelah validasi · pembayaran manual
      </p>
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
          <span className="flex flex-wrap items-center gap-2">
            © {new Date().getFullYear()} UMKM-AI · By
            <a
              href="https://itzai.site"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center rounded-full border border-deep/15 bg-white px-2.5 py-1 font-semibold text-primary shadow-sm transition-colors hover:border-primary/40 hover:bg-primary hover:text-white ${focus}`}
            >
              ITZ AI
              <span className="sr-only"> (buka itzai.site di tab baru)</span>
            </a>
          </span>
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
          <UntukSiapa />
          <Fitur />
          <Analisis />
          <CaraKerja />
          <Keamanan />
          <Faq />
          <Harga />
          <AjakanTerakhir />
        </main>
        <Footer />
        <CookieConsent />
      </div>
    </LandingMotion>
  );
}
