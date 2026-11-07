import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  FileBarChart,
  HandCoins,
  LayoutDashboard,
  ListChecks,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { HeroParallax } from "./hero-parallax";
import { Reveal } from "./reveal";
import { SmoothScroll } from "./smooth-scroll";
import { UmkmCarousel } from "./umkm-carousel";

/* ------------------------------------------------------------------ */
/* Konstanta & gaya bersama                                            */
/* ------------------------------------------------------------------ */

const NAV = [
  { href: "#fitur", label: "Fitur" },
  { href: "#ai", label: "Analisis AI" },
  { href: "#cara-kerja", label: "Cara kerja" },
  { href: "#keamanan", label: "Keamanan" },
  { href: "#faq", label: "FAQ" },
];

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none";

const btnPrimary = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-body font-semibold text-white shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:opacity-95 motion-reduce:hover:translate-y-0 ${focus}`;
const btnSecondary = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-deep/25 bg-white px-6 text-body font-semibold text-deep transition hover:border-deep/50 ${focus}`;

type Icon = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

function SectionHeading({
  eyebrow,
  title,
  desc,
  light = false,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  light?: boolean;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p
        className={`text-caption font-semibold uppercase tracking-widest ${light ? "text-accent" : "text-primary"}`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${light ? "text-white" : "text-ink"}`}
      >
        {title}
      </h2>
      {desc ? (
        <p className={`mt-4 text-body ${light ? "text-white/75" : "text-deep/80"}`}>{desc}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mockup produk (data contoh, murni dekoratif)                        */
/* ------------------------------------------------------------------ */

const TREND = [
  { bulan: "Jun", masuk: 52, keluar: 40 },
  { bulan: "Jul", masuk: 58, keluar: 44 },
  { bulan: "Agu", masuk: 61, keluar: 47 },
  { bulan: "Sep", masuk: 66, keluar: 50 },
  { bulan: "Okt", masuk: 72, keluar: 53 },
  { bulan: "Nov", masuk: 80, keluar: 58 },
];

function SampleTag() {
  return (
    <span className="rounded-full bg-deep/10 px-2 py-0.5 text-caption font-medium text-deep">
      Data contoh
    </span>
  );
}

function DashboardMockup() {
  return (
    <div
      role="img"
      aria-label="Contoh tampilan beranda UMKM-AI berisi saldo kas, grafik tren, rincian kategori, dan insight AI. Semua angka adalah data contoh."
      className="overflow-hidden rounded-2xl border border-deep/10 bg-white shadow-2xl shadow-deep/15"
    >
      <div aria-hidden>
        {/* Bilah jendela */}
        <div className="flex items-center justify-between border-b border-deep/10 bg-surface px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-deep/20" />
            <span className="size-2.5 rounded-full bg-deep/20" />
            <span className="size-2.5 rounded-full bg-deep/20" />
          </div>
          <span className="text-caption font-medium text-deep/70">Beranda</span>
          <SampleTag />
        </div>

        <div className="grid gap-4 bg-[#F6F7F8] p-4 text-left sm:p-6 lg:grid-cols-12">
          {/* Kolom kiri */}
          <div className="space-y-4 lg:col-span-7">
            <div className="rounded-xl bg-gradient-to-br from-[#0A0F12] via-[#101C21] to-[#14323B] p-5 text-white">
              <p className="text-small text-white/70">Saldo kas</p>
              <p className="tabular mt-1 text-3xl font-bold sm:text-4xl">Rp 48.250.000</p>
              <p className="mt-2 text-caption text-white/60">Saldo awal + uang masuk − uang keluar</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-deep/10 bg-white p-4">
                <p className="text-small text-deep/80">Pendapatan bulan ini</p>
                <p className="tabular mt-1 text-h3 text-ink">Rp 62,4 jt</p>
                <p className="mt-1 inline-flex items-center gap-1 text-caption font-medium text-deep">
                  <ArrowUpRight className="size-3.5" aria-hidden />
                  12% dari bulan lalu
                </p>
              </div>
              <div className="rounded-xl border border-deep/10 bg-white p-4">
                <p className="text-small text-deep/80">Pengeluaran bulan ini</p>
                <p className="tabular mt-1 text-h3 text-ink">Rp 38,9 jt</p>
                <p className="mt-1 inline-flex items-center gap-1 text-caption font-medium text-primary">
                  <ArrowDownRight className="size-3.5" aria-hidden />
                  4% dari bulan lalu
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5 rounded-xl border border-deep/10 bg-white p-4">
              <svg viewBox="0 0 100 100" className="size-24 shrink-0 -rotate-90" aria-hidden>
                <circle cx="50" cy="50" r="36" fill="none" strokeWidth="14" className="stroke-deep/10" />
                <circle cx="50" cy="50" r="36" fill="none" strokeWidth="14" strokeDasharray="101.79 124.4" strokeDashoffset="0" className="stroke-primary" />
                <circle cx="50" cy="50" r="36" fill="none" strokeWidth="14" strokeDasharray="67.86 158.33" strokeDashoffset="-101.79" className="stroke-deep" />
                <circle cx="50" cy="50" r="36" fill="none" strokeWidth="14" strokeDasharray="56.55 169.64" strokeDashoffset="-169.65" className="stroke-accent" />
              </svg>
              <ul className="space-y-1.5 text-small text-deep">
                <li className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-primary" />Bahan baku 45%</li>
                <li className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-deep" />Gaji 30%</li>
                <li className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-accent" />Lainnya 25%</li>
              </ul>
            </div>
          </div>

          {/* Kolom kanan */}
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-xl border border-deep/10 bg-white p-4">
              <p className="text-small font-semibold text-deep">Tren enam bulan</p>
              <div className="mt-4 flex h-32 items-end justify-between gap-2">
                {TREND.map((t) => (
                  <div key={t.bulan} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="flex h-24 w-full items-end justify-center gap-1">
                      <div className="w-2.5 rounded-t bg-primary" style={{ height: `${t.masuk}%` }} />
                      <div className="w-2.5 rounded-t bg-deep" style={{ height: `${t.keluar}%` }} />
                    </div>
                    <span className="text-caption text-deep/70">{t.bulan}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-4 text-caption text-deep/80">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Pendapatan</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-deep" />Pengeluaran</span>
              </div>
            </div>

            <div className="rounded-xl border border-deep/10 bg-white p-4">
              <p className="flex items-center gap-2 text-small font-semibold text-deep">
                <Sparkles className="size-4 text-primary" aria-hidden />
                Insight AI
              </p>
              <p className="mt-2 text-small text-ink">
                Pengeluaran bahan baku naik dibanding bulan lalu, sementara pendapatan naik lebih cepat.
                Ada 2 piutang yang sudah lewat jatuh tempo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bagian-bagian halaman                                               */
/* ------------------------------------------------------------------ */

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-deep/10 bg-surface/80 backdrop-blur-md">
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
          <Link
            href="/masuk"
            className={`inline-flex min-h-11 items-center rounded-lg px-3 text-small font-semibold text-deep hover:bg-deep/5 ${focus}`}
          >
            Masuk
          </Link>
          <Link
            href="/daftar"
            className={`inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-small font-semibold text-white transition hover:opacity-90 ${focus}`}
          >
            Coba gratis
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-surface">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(219,26,26,0.10),transparent),radial-gradient(40%_40%_at_90%_30%,rgba(140,199,196,0.35),transparent)]"
      />
      <div className="relative mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-20 lg:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-deep/15 bg-white/80 px-3 py-1 text-caption font-semibold text-deep">
              <Sparkles className="size-3.5 text-primary" aria-hidden />
              Keuangan dan analisis bisnis untuk UMKM Indonesia
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Bukan sekadar mencatat keuangan.{" "}
              <span className="text-primary">Pahami bisnis di balik angkanya.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-5 max-w-2xl text-body text-deep/80 sm:text-lg">
              Catat transaksi, pantau utang dan piutang, lalu dapatkan analisis dari angka usahamu sendiri,
              tanpa harus menjadi akuntan.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/daftar" className={btnPrimary}>
                Mulai gratis
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a href="#cara-kerja" className={btnSecondary}>
                Lihat cara kerja
              </a>
            </div>
            <p className="mt-3 text-caption text-deep/70">Gratis untuk memulai. Tanpa kartu kredit.</p>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="mt-14">
          <HeroParallax>
            <div
              style={{
                maskImage: "linear-gradient(to bottom, black 80%, transparent)",
                WebkitMaskImage: "linear-gradient(to bottom, black 80%, transparent)",
              }}
            >
              <DashboardMockup />
            </div>
          </HeroParallax>
        </Reveal>
      </div>
    </section>
  );
}

const BEFORE = [
  "Catatan tersebar di buku, chat, dan spreadsheet",
  "Utang dan piutang terlupa jatuh tempo",
  "Tidak yakin berapa uang kas yang sebenarnya ada",
  "Laporan bulanan dibuat manual dan memakan waktu",
];
const AFTER = [
  "Semua transaksi di satu tempat, rapi per kategori",
  "Kartu “Perlu perhatian” menandai utang dan piutang yang lewat jatuh tempo",
  "Saldo kas dihitung otomatis dari saldo awal dan transaksi",
  "Laporan periode dan ekspor ke CSV, Excel, atau PDF",
];

function Problem() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Kenapa UMKM-AI"
            title="Dari catatan yang berserakan ke satu tempat yang jelas"
            desc="Mengelola usaha sudah cukup melelahkan. Keuanganmu tidak perlu ikut membingungkan."
          />
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-deep/10 bg-surface p-6 sm:p-8">
              <h3 className="text-h3 text-deep">Sebelum</h3>
              <ul className="mt-5 space-y-4">
                {BEFORE.map((t) => (
                  <li key={t} className="flex gap-3 text-body text-deep/80">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-deep/10 text-deep">
                      <X className="size-3.5" aria-hidden />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="h-full rounded-2xl border border-primary/25 bg-white p-6 shadow-xl shadow-primary/10 sm:p-8">
              <h3 className="text-h3 text-primary">Dengan UMKM-AI</h3>
              <ul className="mt-5 space-y-4">
                {AFTER.map((t) => (
                  <li key={t} className="flex gap-3 text-body text-ink">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent/30 text-deep">
                      <Check className="size-3.5" aria-hidden />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: IconComp,
  title,
  desc,
  className = "",
  children,
}: {
  icon: Icon;
  title: string;
  desc: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`group h-full rounded-2xl border border-deep/10 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-deep/10 motion-reduce:hover:translate-y-0 ${className}`}
    >
      <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
        <IconComp className="size-5" aria-hidden />
      </span>
      <h3 className="mt-4 text-h3 text-ink">{title}</h3>
      <p className="mt-2 text-small text-deep/80">{desc}</p>
      {children}
    </div>
  );
}


function Showcase() {
  return (
    <section id="untuk-siapa" className="scroll-mt-20 overflow-hidden bg-accent/15 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Untuk siapa"
            title="Dibuat untuk usaha sehari-hari seperti milikmu"
            desc="Dari warung makan sampai lapak pasar, UMKM-AI membantu mencatat dan memahami keuangan usaha kecil."
          />
        </Reveal>
        <Reveal delay={0.1} className="mt-12">
          <UmkmCarousel />
          <p className="mt-6 text-center text-caption text-deep/70">
            Foto ilustrasi jenis usaha, bukan testimoni pengguna.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

const SAMPLE_TX = [
  { nama: "Penjualan harian", kategori: "Penjualan", nominal: "+ Rp 1.250.000", masuk: true },
  { nama: "Beli bahan baku", kategori: "Bahan baku", nominal: "− Rp 480.000", masuk: false },
  { nama: "Tagihan listrik", kategori: "Operasional", nominal: "− Rp 350.000", masuk: false },
];

function Features() {
  return (
    <section id="fitur" className="scroll-mt-20 bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Fitur"
            title="Semua yang dibutuhkan untuk mengelola keuangan usaha"
            desc="Dari pencatatan harian sampai laporan, dalam satu aplikasi yang ringkas."
          />
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <Reveal className="md:col-span-2">
            <FeatureCard
              icon={ReceiptText}
              title="Catat transaksi tanpa ribet"
              desc="Pemasukan dan pengeluaran dengan kategori, tanggal, catatan, dan metode bayar. Salah catat? Ubah atau hapus, semuanya tercatat di riwayat dan bisa dipulihkan."
            >
              <div aria-hidden className="mt-5 space-y-2 rounded-xl bg-surface p-3">
                <div className="flex justify-end"><SampleTag /></div>
                {SAMPLE_TX.map((t) => (
                  <div key={t.nama} className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 text-small">
                    <div>
                      <p className="font-medium text-ink">{t.nama}</p>
                      <p className="text-caption text-deep/70">{t.kategori}</p>
                    </div>
                    <p className={`tabular font-semibold ${t.masuk ? "text-deep" : "text-primary"}`}>{t.nominal}</p>
                  </div>
                ))}
              </div>
            </FeatureCard>
          </Reveal>
          <Reveal delay={0.05}>
            <FeatureCard
              icon={LayoutDashboard}
              title="Dashboard yang langsung jelas"
              desc="Saldo kas, pendapatan dan pengeluaran bulan ini dibanding bulan lalu, rincian per kategori, dan tren enam bulan."
            />
          </Reveal>
          <Reveal>
            <FeatureCard
              icon={HandCoins}
              title="Utang dan piutang"
              desc="Catat pembayaran sebagian, pantau status belum dibayar, sebagian, atau lunas, dan lihat yang sudah lewat jatuh tempo."
            />
          </Reveal>
          <Reveal delay={0.05}>
            <FeatureCard
              icon={FileBarChart}
              title="Laporan dan ekspor"
              desc="Bandingkan periode harian, mingguan, atau bulanan, lalu ekspor ke CSV, Excel, atau PDF."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <FeatureCard
              icon={Upload}
              title="Impor catatan lama"
              desc="Pindahkan data dari spreadsheet dengan template resmi, lengkap dengan pratinjau dan deteksi baris duplikat."
            />
          </Reveal>
          <Reveal className="md:col-span-3">
            <FeatureCard
              icon={Users}
              title="Kerja bersama tim"
              desc="Undang anggota sebagai Admin atau Staf. Hak akses diatur di sisi server, jadi staf tidak bisa menghapus data penting."
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const AI_POINTS = [
  "Angka dihitung oleh sistem. AI hanya menafsirkan, bukan menebak.",
  "AI tidak mengubah catatan keuanganmu.",
  "Insight harian otomatis di beranda, dan tanya jawab di halaman Analis AI.",
];

function AiSection() {
  return (
    <section id="ai" className="scroll-mt-20 bg-white px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A0F12] via-[#101C21] to-[#14323B] p-6 sm:p-12">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="text-caption font-semibold uppercase tracking-widest text-accent">AI Finance Analyst</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              AI yang membaca angkamu, lalu menjelaskannya dengan bahasa sederhana
            </h2>
            <ul className="mt-6 space-y-4">
              {AI_POINTS.map((t) => (
                <li key={t} className="flex gap-3 text-body text-white/80">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent/25 text-accent">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <div
              role="img"
              aria-label="Contoh kartu insight AI berisi tiga temuan dari data contoh."
              className="rounded-2xl bg-white p-5 shadow-2xl shadow-black/30 sm:p-6"
            >
              <div aria-hidden>
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 text-body font-semibold text-deep">
                    <Sparkles className="size-4 text-primary" aria-hidden />
                    Insight hari ini
                  </p>
                  <SampleTag />
                </div>
                <ul className="mt-4 space-y-3 text-small text-ink">
                  <li className="rounded-lg bg-surface p-3">
                    Pengeluaran bahan baku naik dibanding bulan lalu. Tinjau pemasok atau ukuran pembelian.
                  </li>
                  <li className="rounded-lg bg-surface p-3">
                    Ada 2 piutang lewat jatuh tempo dengan total Rp 3.200.000. Pertimbangkan menagih lebih dulu.
                  </li>
                  <li className="rounded-lg bg-surface p-3">
                    Pendapatan akhir pekan konsisten lebih tinggi dari hari kerja.
                  </li>
                </ul>
                <p className="mt-4 text-caption text-deep/70">
                  Contoh tampilan. Insight sebenarnya dibuat dari data usahamu sendiri. Selisih kas tidak
                  disebut sebagai laba bersih.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { judul: "Daftar dan atur usahamu", isi: "Buat akun, isi nama usaha, lalu masukkan saldo awal kas." },
  { judul: "Catat transaksi harian", isi: "Catat langsung di aplikasi, atau impor dari spreadsheet lama lewat template CSV." },
  { judul: "Pantau dan tanya AI", isi: "Lihat dashboard dan laporan, lalu baca insight atau tanyakan hal yang ingin kamu pahami." },
];

function HowItWorks() {
  return (
    <section id="cara-kerja" className="scroll-mt-20 bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="Cara kerja" title="Tiga langkah untuk mulai" desc="Tidak perlu pelatihan khusus." />
        </Reveal>
        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.judul}>
              <Reveal delay={i * 0.08} className="h-full">
                <div className="h-full rounded-2xl border border-deep/10 bg-white p-6">
                  <span className="grid size-10 place-items-center rounded-full bg-primary text-body font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-h3 text-ink">{s.judul}</h3>
                  <p className="mt-2 text-small text-deep/80">{s.isi}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const TRUST = [
  { icon: ShieldCheck, judul: "Data tiap usaha terpisah", isi: "Satu usaha tidak bisa melihat data usaha lain, dan ini diuji otomatis." },
  { icon: Users, judul: "Peran Owner, Admin, Staf", isi: "Hak akses diperiksa di server. Staf tidak bisa menghapus atau memulihkan data." },
  { icon: ListChecks, judul: "Riwayat perubahan", isi: "Perubahan transaksi tercatat sebelum dan sesudah. Data yang dihapus bisa dipulihkan." },
  { icon: Wallet, judul: "Angka uang yang presisi", isi: "Nominal disimpan sebagai rupiah bulat dan semua perhitungan dilakukan di server." },
];

function Trust() {
  return (
    <section id="keamanan" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Keamanan dan kontrol"
            title="Dirancang agar datamu tetap rapi dan terkendali"
          />
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((t, i) => (
            <Reveal key={t.judul} delay={i * 0.06}>
              <FeatureCard icon={t.icon} title={t.judul} desc={t.isi} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQ = [
  {
    q: "Apakah UMKM-AI gratis?",
    a: "Ada paket Free dengan kuota bulanan untuk jumlah transaksi dan permintaan AI. Rincian paket bisa kamu lihat di halaman Langganan setelah masuk.",
  },
  {
    q: "Apakah AI mengubah catatan keuanganku?",
    a: "Tidak. AI hanya membaca ringkasan angka yang dihitung sistem dan menjelaskannya. AI tidak menulis ke catatan keuangan.",
  },
  {
    q: "Apakah saldo kas sama dengan laba?",
    a: "Bukan. Saldo kas adalah posisi uang tunai: saldo awal ditambah uang masuk dikurangi uang keluar. UMKM-AI tidak menyebut selisih kas sebagai laba bersih.",
  },
  {
    q: "Bisakah memindahkan catatan lama?",
    a: "Bisa. Gunakan impor CSV dengan template resmi. Kamu akan melihat pratinjau dulu, dan baris yang duplikat dideteksi.",
  },
  {
    q: "Siapa saja yang bisa mengakses data usahaku?",
    a: "Hanya anggota yang kamu undang. Peran Admin dan Staf punya hak yang berbeda, dan data antar usaha dipisahkan.",
  },
];

function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="Pertanyaan yang sering muncul" />
        </Reveal>
        <Reveal delay={0.05} className="mt-10">
          <div className="divide-y divide-deep/10 rounded-2xl border border-deep/10 bg-white">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-5 py-4 sm:px-6">
                <summary
                  className={`flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-md text-body font-semibold text-ink [&::-webkit-details-marker]:hidden ${focus}`}
                >
                  {f.q}
                  <ChevronDown
                    className="size-5 shrink-0 text-deep transition group-open:rotate-180 motion-reduce:transition-none"
                    aria-hidden
                  />
                </summary>
                <p className="pb-2 pt-2 text-small text-deep/80">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 sm:py-24">
      <Reveal>
        <div className="mx-auto max-w-5xl rounded-3xl bg-primary px-6 py-14 text-center text-white sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Mulai rapikan keuangan usahamu hari ini</h2>
          <p className="mx-auto mt-4 max-w-xl text-body text-white/90">
            Daftar dalam hitungan menit, lalu catat transaksi pertamamu.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/daftar"
              className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-body font-semibold text-primary transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
            >
              Daftar sekarang
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/masuk"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/50 px-6 text-body font-semibold text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Sudah punya akun? Masuk
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-deep/10 bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <p className="text-h3 font-bold text-primary">UMKM-AI</p>
          <p className="mt-2 text-small text-deep/80">
            Bukan sekadar mencatat keuangan. Pahami bisnis di balik angkanya.
          </p>
        </div>
        <nav aria-label="Tautan footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-small">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className={`rounded-md text-deep hover:text-primary ${focus}`}>
              {n.label}
            </a>
          ))}
          <Link href="/masuk" className={`rounded-md text-deep hover:text-primary ${focus}`}>Masuk</Link>
          <Link href="/daftar" className={`rounded-md text-deep hover:text-primary ${focus}`}>Daftar</Link>
        </nav>
      </div>
      <div className="border-t border-deep/10 py-5 text-center text-caption text-deep/70">
        © {new Date().getFullYear()} UMKM-AI. Proyek portofolio. Foto: Unsplash dan Pexels.
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */

export function LandingPage() {
  return (
    <SmoothScroll>
      <Header />
      <main>
        <Hero />
        <Problem />
        <Showcase />
        <Features />
        <AiSection />
        <HowItWorks />
        <Trust />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </SmoothScroll>
  );
}
