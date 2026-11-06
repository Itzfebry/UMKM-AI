import Link from "next/link";
import type { Metadata } from "next";
import { after } from "next/server";
import { ArrowDownRight, ArrowUpRight, Plus } from "lucide-react";
import { CategoryChart } from "@/components/category-chart";
import { DashboardGrid } from "@/components/dashboard-grid";
import { EmptyState } from "@/components/ui";
import { formatDate, formatPercent, formatRupiah } from "@/lib/format";
import { requireBusiness } from "@/server/lib/access";
import { getBranding } from "@/server/modules/business/branding";
import { getDashboard, getMonthlyTrend } from "@/server/modules/ledger/queries";
import { getDebtSummary } from "@/server/modules/debts/queries";
import { ensureDailyInsight, getBusinessInsight } from "@/server/modules/ai/insight";
import { getBusinessAlerts } from "@/server/modules/dashboard/alerts";
import { DashboardInsight } from "@/components/dashboard-insight";
import { PlanBadge } from "@/components/plan-badge";
import { getPlanState } from "@/server/modules/billing/plan";
import { AlertsCard } from "@/components/alerts-card";
import { TrendChart } from "@/components/trend-chart";
import { TYPE_LABEL } from "@/server/modules/ledger/types";

export const metadata: Metadata = { title: "Beranda" };

const OUTFLOW = new Set(["operational_expense", "owner_draw", "loan_repayment"]);

export default async function BerandaPage() {
  const { business } = await requireBusiness();
  const [d, debt, insight, alerts, trend, branding, plan] = await Promise.all([
    getDashboard(business.id),
    getDebtSummary(business.id),
    getBusinessInsight(business.id),
    getBusinessAlerts(business.id),
    getMonthlyTrend(business.id),
    getBranding(business.id),
    getPlanState(business.id),
  ]);

  const heading = (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        {branding.logoUrl ? (
          <span
            className="size-9 shrink-0 rounded-full border border-deep/10 bg-surface bg-cover bg-center shadow-sm"
            style={{ backgroundImage: `url("${branding.logoUrl}")` }}
            aria-hidden
          />
        ) : null}
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-h1 leading-none text-deep">{business.name}</h1>
          <PlanBadge plan={plan.plan} periodEnd={plan.currentPeriodEnd} />
        </div>
      </div>
      <Link
        href="/transaksi"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-small font-semibold text-white shadow-sm hover:opacity-90"
      >
        <Plus className="size-4" aria-hidden />
        Catat transaksi
      </Link>
    </header>
  );

  if (d.txCount === 0) {
    return (
      <>
        {heading}
        <EmptyState
          title="Belum ada transaksi"
          hint="Mulai dari satu catatan. Ringkasan dan analisis muncul setelah ada data."
        />
      </>
    );
  }

  // Analisis otomatis tanpa perintah: bila hari ini belum ada insight, buat setelah respons dikirim
  // (tanpa memblokir render). Tugas terjadwal juga membuatnya, jadi ini hanya jaring pengaman lokal.
  if (!insight?.today) {
    after(async () => {
      try {
        await ensureDailyInsight({ id: business.id, name: business.name });
      } catch (error) {
        console.error("[insight] gagal membuat insight otomatis", error);
      }
    });
  }

  const delta = (current: number, previous: number) => {
    const pct = formatPercent(current, previous);
    const up = current >= previous;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-semibold ${
          up ? "bg-accent/25 text-deep" : "bg-primary/10 text-primary"
        }`}
      >
        {up ? <ArrowUpRight className="size-3.5" aria-hidden /> : <ArrowDownRight className="size-3.5" aria-hidden />}
        {pct ?? "tanpa pembanding"}
      </span>
    );
  };

  const saldo = (
    <div
      className="flex h-full flex-col justify-between rounded-2xl bg-gradient-to-br from-[#0A0F12] via-[#101C21] to-[#14323B] p-5 text-white shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-black/40"
      style={
        branding.balanceUrl
          ? {
              backgroundImage: `linear-gradient(to top, rgba(4,6,8,0.94), rgba(4,6,8,0.62)), url("${branding.balanceUrl}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <p className="text-caption uppercase tracking-wide text-white/80">Saldo kas</p>
      <div>
        <p className="tabular mt-2 text-display">{formatRupiah(d.cash)}</p>
        <p className="mt-2 text-caption text-white/80">
          Saldo awal {formatRupiah(d.opening?.amount ?? 0)} per {d.opening ? formatDate(d.opening.asOf) : "—"}. Saldo kas
          bukan laba.
        </p>
      </div>
    </div>
  );

  const metric = (label: string, value: number, previous: number) => (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-deep/10 bg-white p-5 shadow-sm">
      <p className="text-caption text-deep/75">{label}</p>
      <p className="tabular mt-2 text-h2 text-deep">{formatRupiah(value)}</p>
      {delta(value, previous)}
    </div>
  );

  const flows = (
    <div className="grid h-full gap-3 sm:grid-cols-2">
      {metric("Pendapatan bulan ini", d.income, d.prevIncome)}
      {metric("Pengeluaran bulan ini", d.expense, d.prevExpense)}
    </div>
  );

  const chart = (
    <div className="flex h-full flex-col rounded-2xl border border-deep/10 bg-white p-5 shadow-sm">
      <h2 className="text-h3 text-deep">Pengeluaran per kategori</h2>
      <p className="text-caption text-deep/75">Bulan berjalan</p>
      <div className="mt-2 flex-1">
        <CategoryChart data={d.byCategory} />
      </div>
    </div>
  );

  const recent = (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-deep/10 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <h2 className="text-h3 text-deep">Transaksi terbaru</h2>
        <Link href="/transaksi" className="text-caption font-semibold text-primary hover:underline">
          Lihat semua
        </Link>
      </div>
      <ul className="mt-2 divide-y divide-deep/10">
        {d.recent.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-2 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-small font-semibold text-ink">
                {t.note || t.categoryName || TYPE_LABEL[t.type]}
              </p>
              <p className="text-caption text-deep/75">
                {formatDate(t.transactionDate)} · {TYPE_LABEL[t.type]}
              </p>
            </div>
            <span
              className={`tabular shrink-0 text-small font-semibold ${
                OUTFLOW.has(t.type) ? "text-primary" : "text-deep"
              }`}
            >
              {OUTFLOW.has(t.type) ? "−" : "+"}
              {formatRupiah(t.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  const debts = (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-deep/10 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-h3 text-deep">Utang & piutang</h2>
        <Link href="/utang-piutang" className="text-caption font-semibold text-primary hover:underline">
          Kelola
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-caption text-deep/75">Sisa utang</p>
          <p className="tabular text-h3 text-deep">{formatRupiah(debt.payable)}</p>
        </div>
        <div>
          <p className="text-caption text-deep/75">Sisa piutang</p>
          <p className="tabular text-h3 text-deep">{formatRupiah(debt.receivable)}</p>
        </div>
      </div>
      <p className="mt-2 text-caption text-deep/60">
        {debt.overdue} catatan lewat jatuh tempo. Kas hanya berubah saat pembayaran dicatat.
      </p>
    </div>
  );

  const aiCard = (
    <DashboardInsight
      initial={insight ? { insight: insight.insight, createdAt: insight.createdAt.toISOString(), today: insight.today } : null}
    />
  );

  const alertsCard = <AlertsCard alerts={alerts} />;

  const trendCard = (
    <div className="flex h-full flex-col rounded-2xl border border-deep/10 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-h3 text-deep">Tren enam bulan</h2>
        <Link href="/laporan" className="text-caption font-semibold text-primary hover:underline">
          Laporan
        </Link>
      </div>
      <p className="text-caption text-deep/75">Pendapatan dan pengeluaran per bulan, bukan laba bersih</p>
      <div className="mt-2 flex-1">
        <TrendChart data={trend} />
      </div>
    </div>
  );

  return (
    <>
      {heading}
      <div className="flex flex-col gap-3 lg:hidden">
        {saldo}
        {alertsCard}
        {flows}
        {debts}
        {aiCard}
        {trendCard}
        {chart}
        {recent}
      </div>
      <div className="hidden lg:flex lg:items-start lg:gap-4">
        <div className="min-w-0 flex-1">
          <DashboardGrid
            items={[
              { key: "saldo", grid: { x: 0, y: 0, w: 5, h: 6 }, node: saldo },
              { key: "flows", grid: { x: 5, y: 0, w: 7, h: 6 }, node: flows },
              { key: "recent", grid: { x: 0, y: 6, w: 4, h: 9 }, node: recent },
              { key: "trend", grid: { x: 4, y: 6, w: 8, h: 9 }, node: trendCard },
              { key: "chart", grid: { x: 0, y: 15, w: 4, h: 9 }, node: chart },
              { key: "debts", grid: { x: 4, y: 15, w: 8, h: 9 }, node: debts },
              { key: "alerts", grid: { x: 0, y: 24, w: 4, h: 9 }, node: alertsCard },
            ]}
          />
        </div>
        <aside className="w-80 shrink-0">
          <div className="lg:sticky lg:top-4">{aiCard}</div>
        </aside>
      </div>
    </>
  );
}
