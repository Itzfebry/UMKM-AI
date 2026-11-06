import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, CalendarDays, Download, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { PageHeader, EmptyState, input, btn } from "@/components/ui";
import { formatDate, formatRupiah } from "@/lib/format";
import { requireBusiness } from "@/server/lib/access";
import { TYPE_LABEL, type TransactionType } from "@/server/modules/ledger/types";
import { PRESET_LABEL, isPreset, resolvePeriod, type RangePreset } from "@/server/modules/reports/period";
import { delta, getReportSlice } from "@/server/modules/reports/queries";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const metadata: Metadata = { title: "Laporan" };

type SearchParams = { preset?: string; from?: string; to?: string };

export default async function LaporanPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { business } = await requireBusiness();
  const sp = await searchParams;
  const preset: RangePreset = isPreset(sp.preset) ? sp.preset : "month";
  const from = sp.from && DATE.test(sp.from) ? sp.from : undefined;
  const to = sp.to && DATE.test(sp.to) ? sp.to : undefined;

  const { current, previous, incomplete } = resolvePeriod(preset, from, to);
  const [slice, prev] = await Promise.all([getReportSlice(business.id, current), getReportSlice(business.id, previous)]);

  const exportHref = (format: "csv" | "xlsx" | "pdf") => {
    const params = new URLSearchParams({ format, preset });
    if (preset === "custom" && from && to) {
      params.set("from", from);
      params.set("to", to);
    }
    return `/laporan/ekspor?${params.toString()}`;
  };

  const badge = (change: number, changePercent: number | null) => {
    const up = change >= 0;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-caption font-semibold ${
          up ? "bg-accent/25 text-deep" : "bg-primary/10 text-primary"
        }`}
      >
        {up ? <ArrowUpRight className="size-3.5" aria-hidden /> : <ArrowDownRight className="size-3.5" aria-hidden />}
        {formatRupiah(Math.abs(change))}
        {changePercent == null ? " · tanpa pembanding" : ` · ${changePercent.toFixed(1)}%`}
      </span>
    );
  };

  const card = (
    label: string,
    value: number,
    prevValue: number,
    hint: string,
    tone: { bar: string; chip: string },
    Icon: typeof TrendingUp,
  ) => {
    const d = delta(value, prevValue);
    return (
      <div className="relative overflow-hidden rounded-xl border border-deep/10 bg-white p-4 shadow-sm transition hover:shadow-md">
        <span className={`absolute inset-y-0 left-0 w-1 ${tone.bar}`} aria-hidden />
        <div className="flex items-start justify-between gap-2">
          <p className="text-caption text-deep/75">{label}</p>
          <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tone.chip}`}>
            <Icon className="size-4" aria-hidden />
          </span>
        </div>
        <p className="tabular mt-1 text-h2 text-deep">{formatRupiah(value)}</p>
        {badge(d.nominal, d.percent)}
        <p className="mt-1 text-caption text-deep/60">{hint}</p>
      </div>
    );
  };

  return (
    <>
      <PageHeader title="Laporan" subtitle="Ringkasan periode dan perbandingan dengan periode sebelumnya." />

      <section className="mb-4 rounded-xl border border-deep/10 bg-white p-3 shadow-sm sm:p-4" aria-label="Filter periode">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-caption font-semibold uppercase tracking-wide text-deep/70">
            <CalendarDays className="size-4 text-primary" aria-hidden />
            Periode
          </span>
          <nav className="flex flex-wrap gap-2" aria-label="Pilih periode">
            {(Object.keys(PRESET_LABEL) as RangePreset[]).map((key) => (
              <Link
                key={key}
                href={key === "custom" ? "/laporan?preset=custom" : `/laporan?preset=${key}`}
                aria-current={preset === key ? "page" : undefined}
                className={`min-h-9 rounded-lg px-3 text-caption font-semibold transition ${
                  preset === key ? "bg-deep text-white shadow-sm" : "border border-deep/25 bg-white text-deep hover:border-deep/50 hover:bg-deep/5"
                }`}
              >
                {PRESET_LABEL[key]}
              </Link>
            ))}
          </nav>
        </div>

        {preset === "custom" ? (
          <form className="mt-3 flex flex-wrap items-end gap-3 border-t border-deep/10 pt-3" action="/laporan">
            <input type="hidden" name="preset" value="custom" />
            <label className="text-caption text-deep/75">
              Dari
              <input type="date" name="from" defaultValue={from ?? current.from} className={`${input} mt-1 min-h-9`} />
            </label>
            <label className="text-caption text-deep/75">
              Sampai
              <input type="date" name="to" defaultValue={to ?? current.to} className={`${input} mt-1 min-h-9`} />
            </label>
            <button type="submit" className={`${btn.secondary} min-h-9`}>
              Tampilkan
            </button>
          </form>
        ) : null}

        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-deep/10 pt-3 text-caption text-deep/70">
          <span className="font-semibold text-deep">{formatDate(current.from)} – {formatDate(current.to)}</span>
          <span className="text-deep/40">·</span>
          <span>pembanding {formatDate(previous.from)} – {formatDate(previous.to)}</span>
        </p>
      </section>

      {slice.count === 0 ? (
        <EmptyState title="Belum ada transaksi di periode ini" hint="Pilih periode lain atau catat transaksi baru." />
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {card("Pendapatan operasional", slice.income, prev.income, "Hanya transaksi berjenis pendapatan", {
              bar: "bg-deep",
              chip: "bg-deep/10 text-deep",
            }, TrendingUp)}
            {card("Pengeluaran operasional", slice.expense, prev.expense, "Hanya transaksi berjenis pengeluaran", {
              bar: "bg-primary",
              chip: "bg-primary/10 text-primary",
            }, TrendingDown)}
            {card("Arus kas bersih", slice.net, prev.net, "Pendapatan − pengeluaran. Bukan laba bersih.", {
              bar: "bg-accent",
              chip: "bg-accent/20 text-deep",
            }, Wallet)}
          </div>

          {incomplete ? (
            <p className="mb-3 rounded-lg bg-accent/20 px-3 py-2 text-small text-deep">
              Periode berjalan belum penuh, jadi perbandingan belum sepenuhnya setara.
            </p>
          ) : null}

          <section className="mb-4 overflow-hidden rounded-xl border border-deep/10 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-deep/10 px-4 py-3">
              <h2 className="text-h3 text-deep">Rincian kategori</h2>
              <span className="text-caption text-deep/60">{slice.count} transaksi</span>
            </div>
            <table className="w-full text-small">
              <caption className="sr-only">Rincian kategori pada periode terpilih</caption>
              <thead className="bg-surface text-left text-caption text-deep/75">
                <tr>
                  <th scope="col" className="p-3">Kategori</th>
                  <th scope="col" className="p-3">Jenis</th>
                  <th scope="col" className="p-3 text-right">Transaksi</th>
                  <th scope="col" className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deep/10">
                {slice.byCategory.map((c) => (
                  <tr key={`${c.type}-${c.name}`}>
                    <td className="p-3 text-ink">{c.name}</td>
                    <td className="p-3 text-deep/75">{TYPE_LABEL[c.type as TransactionType]}</td>
                    <td className="tabular p-3 text-right text-deep/75">{c.count}</td>
                    <td className="tabular p-3 text-right font-semibold text-deep">{formatRupiah(c.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      <section className="rounded-xl border border-deep/10 bg-white p-4 shadow-sm">
        <h2 className="text-h3 text-deep">Ekspor</h2>
        <p className="mt-1 text-caption text-deep/75">
          {business.role === "staff"
            ? "Sebagai staf, ekspor berisi ringkasan saja. Detail transaksi hanya untuk pemilik dan admin."
            : "Berkas berisi ringkasan dan detail transaksi periode ini. Setiap ekspor tercatat di audit."}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["csv", "xlsx", "pdf"] as const).map((format) => (
            <a key={format} href={exportHref(format)} className={`${btn.secondary} min-h-9 px-3 text-caption`} download>
              <Download className="size-3.5" aria-hidden />
              {format.toUpperCase()}
            </a>
          ))}
        </div>
      </section>
    </>
  );
}