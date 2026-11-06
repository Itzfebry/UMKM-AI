import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  Bot,
  ChevronRight,
  CreditCard,
  FileBarChart,
  FileSpreadsheet,
  HandCoins,
  History,
  LayoutDashboard,
  ReceiptText,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { AlertsCard } from "@/components/alerts-card";
import { PlanBadge } from "@/components/plan-badge";
import { Card, PageHeader, btn } from "@/components/ui";
import { formatRupiah } from "@/lib/format";
import { requireBusiness } from "@/server/lib/access";
import { getBusinessAlerts } from "@/server/modules/dashboard/alerts";
import { getDebtSummary } from "@/server/modules/debts/queries";
import { getDashboard } from "@/server/modules/ledger/queries";
import { isPlatformAdmin } from "@/server/modules/security/actions";
import { countUnread } from "@/server/modules/notifications/queries";
import { getPlanState, periodResetLabel, PLAN_LABEL } from "@/server/modules/billing/plan";

export const metadata: Metadata = { title: "Menu" };

type Item = { href: string; label: string; hint: string; icon: typeof LayoutDashboard; badge?: string };

// Nuansa serumpun (merah → rose → orange → amber → teal) agar tiap menu beda tapi tetap senada.
const TONES = [
  "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white",
  "bg-rose-500/10 text-rose-600 group-hover:bg-rose-500 group-hover:text-white",
  "bg-orange-500/10 text-orange-600 group-hover:bg-orange-500 group-hover:text-white",
  "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
  "bg-deep/10 text-deep group-hover:bg-deep group-hover:text-white",
] as const;

function Tile({ item, tone }: { item: Item; tone: string }) {
  return (
    <Link
      href={item.href}
      className="group flex h-full flex-col gap-2 rounded-xl border border-deep/10 bg-white p-3 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:border-primary"
    >
      <span className="flex items-center justify-between gap-2">
        <span className={`flex size-9 items-center justify-center rounded-lg transition ${tone}`}>
          <item.icon className="size-4.5" aria-hidden />
        </span>
        {item.badge ? <span className="rounded-full bg-primary px-2 py-0.5 text-caption font-semibold text-white">{item.badge}</span> : null}
        <ChevronRight className="size-4 text-deep/40 transition group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
      </span>
      <span>
        <span className="block text-small font-semibold text-ink">{item.label}</span>
        <span className="mt-0.5 line-clamp-2 block text-caption text-deep/85">{item.hint}</span>
      </span>
    </Link>
  );
}

export default async function MenuPage() {
  const { user, business } = await requireBusiness();
  const [admin, unread, d, debt, alerts, plan] = await Promise.all([
    isPlatformAdmin(user.id),
    countUnread(user.id),
    getDashboard(business.id),
    getDebtSummary(business.id),
    getBusinessAlerts(business.id),
    getPlanState(business.id),
  ]);

  const sections: { title: string; purpose: string; icon: typeof LayoutDashboard; items: Item[] }[] = [
    {
      title: "Catat & pantau",
      purpose: "Uang keluar-masuk dan kondisi kas harian.",
      icon: ReceiptText,
      items: [
        { href: "/beranda", label: "Beranda", hint: "Saldo kas, pendapatan/pengeluaran bulan ini, peringatan, analisis AI harian.", icon: LayoutDashboard },
        { href: "/transaksi", label: "Transaksi", hint: "Catat, ubah, hapus dengan alasan, atau pulihkan. Sumber angka semua laporan.", icon: ReceiptText },
        { href: "/utang-piutang", label: "Utang & Piutang", hint: "Kewajiban dan tagihan, cicilan pembayaran, pantau yang lewat jatuh tempo.", icon: HandCoins },
      ],
    },
    {
      title: "Analisis & laporan",
      purpose: "Membaca angka dan mengekspornya untuk pajak atau pembukuan.",
      icon: FileBarChart,
      items: [
        { href: "/laporan", label: "Laporan", hint: "Ringkasan per periode + pembanding, rincian kategori, ekspor CSV/XLSX/PDF.", icon: FileBarChart },
        { href: "/ai", label: "Analis AI", hint: "Tanya jawab angka usaha, analisis otomatis harian, dan log pemanggilannya.", icon: Bot },
        { href: "/impor", label: "Impor CSV", hint: "Pindahkan catatan lama dari Excel. Ada pratinjau valid/duplikat dulu.", icon: FileSpreadsheet },
      ],
    },
    {
      title: "Tim & akses",
      purpose: "Siapa yang boleh membuka data dan apa yang sudah berubah.",
      icon: Users,
      items: [
        { href: "/anggota", label: "Anggota", hint: `Undang staf/admin, atur peran, pindahkan kepemilikan. Peran Anda: ${business.role}.`, icon: Users },
        { href: "/riwayat", label: "Riwayat perubahan", hint: "Audit siapa mengubah apa, kapan, alasannya. Khusus owner/admin.", icon: History },
        { href: "/notifikasi", label: "Notifikasi", hint: "Status langganan, undangan, dan aktivitas penting.", icon: Bell, badge: unread ? `${unread}` : undefined },
      ],
    },
    {
      title: "Paket & pengaturan",
      purpose: "Langganan, kuota bulanan, dan keamanan akun.",
      icon: CreditCard,
      items: [
        { href: "/langganan", label: "Langganan", hint: "Paket Free/Pro, kuota bulanan, invoice, unggah bukti bayar manual.", icon: CreditCard },
        { href: "/pengaturan", label: "Pengaturan", hint: "Ganti kata sandi, atur kanal notifikasi, hapus usaha permanen.", icon: Settings },
      ],
    },
  ];

  const metric = (label: string, value: string, note?: string) => (
    <div className="rounded-xl bg-white/10 p-3">
      <p className="text-caption text-white/75">{label}</p>
      <p className="tabular mt-1 text-h3 text-white">{value}</p>
      {note ? <p className="text-caption text-white/60">{note}</p> : null}
    </div>
  );

  return (
    <>
      <PageHeader title="Menu" subtitle="Semua fitur, fungsi, dan akses akun dalam satu tempat." />

      <div className="grid gap-4 xl:grid-cols-12 xl:items-stretch">
        <section className="rounded-2xl bg-deep p-5 text-white shadow-sm xl:col-span-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-h3">Ringkasan {business.name}</h2>
              <PlanBadge plan={plan.plan} periodEnd={plan.currentPeriodEnd} compact />
            </div>
            <span className="text-caption text-white/70">
              {PLAN_LABEL[plan.plan]} · kuota AI {plan.usage.aiRequests}/{plan.limits.aiRequestsPerMonth} · direset {periodResetLabel()}
            </span>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metric("Saldo kas", formatRupiah(d.cash), `Saldo awal ${formatRupiah(d.opening?.amount ?? 0)}`)}
            {metric("Pendapatan bulan ini", formatRupiah(d.income))}
            {metric("Pengeluaran bulan ini", formatRupiah(d.expense))}
            {metric("Transaksi tercatat", String(d.txCount))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/15 pt-3">
            <div className="mr-auto flex flex-wrap gap-3 text-caption text-white/80">
              <span className="inline-flex items-center gap-1">
                <Wallet className="size-3.5" aria-hidden /> Sisa utang {formatRupiah(debt.payable)}
              </span>
              <span className="inline-flex items-center gap-1">
                <HandCoins className="size-3.5" aria-hidden /> Sisa piutang {formatRupiah(debt.receivable)}
              </span>
            </div>
            <Link href="/transaksi" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-3 text-small font-semibold text-white hover:opacity-90">
              Catat transaksi
            </Link>
            <Link href="/laporan" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/30 px-3 text-small font-semibold text-white hover:bg-white/10">
              Laporan
            </Link>
            <Link href="/ai" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/30 px-3 text-small font-semibold text-white hover:bg-white/10">
              Tanya AI
            </Link>
          </div>
        </section>

        <div className="h-full xl:col-span-4">
          <AlertsCard alerts={alerts} />
        </div>

        {sections.map((section, si) => (
          <Card key={section.title} className="flex h-full flex-col xl:col-span-6">
            <div className="flex items-start gap-3 border-b border-deep/10 pb-3">
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${TONES[si % TONES.length]}`}>
                <section.icon className="size-5" aria-hidden />
              </span>
              <div>
                <h2 className="text-h3 text-deep">{section.title}</h2>
                <p className="text-caption text-deep/80">{section.purpose}</p>
              </div>
            </div>
            <div className="mt-3 grid flex-1 gap-3 sm:grid-cols-2">
              {section.items.map((item, index) => (
                <div key={item.href} className={section.items.length % 2 === 1 && index === section.items.length - 1 ? "sm:col-span-2" : ""}>
                  <Tile item={item} tone={TONES[(si + index) % TONES.length]} />
                </div>
              ))}
            </div>
          </Card>
        ))}

        {admin ? (
          <Card className="xl:col-span-12">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" aria-hidden />
                </span>
                <div>
                  <h2 className="text-h3 text-deep">Panel platform</h2>
                  <p className="text-caption text-deep/80">
                    Halaman admin UMKM-AI: verifikasi pembayaran manual, aktifkan MFA, jalankan tugas terjadwal, bersihkan audit lama. Sesi terpisah dari
                    akun pengguna.
                  </p>
                </div>
              </div>
              <Link href="/panel/masuk" className={btn.secondary}>
                Buka panel
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            </div>
          </Card>
        ) : null}
      </div>
    </>
  );
}
