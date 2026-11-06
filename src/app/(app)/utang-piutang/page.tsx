import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, EmptyState, input, btn } from "@/components/ui";
import { DebtForm } from "@/components/debt-form";
import { DebtPaymentButton, DeleteDebtButton, RestoreDebtButton } from "@/components/debt-actions";
import { formatDate, formatRupiah } from "@/lib/format";
import { requireBusiness } from "@/server/lib/access";
import { getDebtSummary, listDebts } from "@/server/modules/debts/queries";
import { KIND_LABEL, STATUS_LABEL, type DebtKind, type DebtStatus } from "@/server/modules/debts/types";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const metadata: Metadata = { title: "Utang & Piutang" };

type SearchParams = {
  kind?: string;
  status?: string;
  q?: string;
  from?: string;
  to?: string;
  page?: string;
  deleted?: string;
};

export default async function UtangPiutangPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { business } = await requireBusiness();
  const sp = await searchParams;

  const kind = sp.kind && sp.kind in KIND_LABEL ? (sp.kind as DebtKind) : undefined;
  const status = sp.status && sp.status in STATUS_LABEL ? (sp.status as DebtStatus) : undefined;
  const dueFrom = sp.from && DATE.test(sp.from) ? sp.from : undefined;
  const dueTo = sp.to && DATE.test(sp.to) ? sp.to : undefined;
  const showDeleted = sp.deleted === "1";

  const [summary, list] = await Promise.all([
    getDebtSummary(business.id),
    listDebts(business.id, { kind, status, search: sp.q, dueFrom, dueTo, page: Number(sp.page ?? 1), includeDeleted: showDeleted }),
  ]);

  const canDelete = business.role !== "staff";
  const lastPage = Math.max(1, Math.ceil(list.total / list.pageSize));
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ kind: sp.kind, status: sp.status, q: sp.q, from: sp.from, to: sp.to, deleted: sp.deleted })) {
      if (value) params.set(key, String(value));
    }
    params.set("page", String(page));
    return `/utang-piutang?${params.toString()}`;
  };

  const card = (label: string, value: string, hint: string) => (
    <div className="rounded-xl border border-deep/10 bg-white p-4 shadow-sm">
      <p className="text-caption text-deep/75">{label}</p>
      <p className="tabular mt-1 text-h2 text-deep">{value}</p>
      <p className="mt-1 text-caption text-deep/60">{hint}</p>
    </div>
  );

  return (
    <>
      <PageHeader title="Utang & Piutang" subtitle="Kewajiban dan tagihan usaha. Kas hanya berubah saat pembayaran dicatat." />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {card("Sisa utang", formatRupiah(summary.payable), "Kewajiban yang belum dibayar")}
        {card("Sisa piutang", formatRupiah(summary.receivable), "Tagihan yang belum diterima")}
        {card("Lewat jatuh tempo", String(summary.overdue), "Jumlah catatan, bukan nominal")}
      </div>

      <div className="grid gap-4 lg:grid-cols-[360px_1fr] lg:items-start">
        <section className="rounded-xl border border-deep/10 bg-white p-4">
          <h2 className="mb-3 text-h3 text-deep">Catat utang/piutang</h2>
          <DebtForm />
        </section>

        <section>
          <form className="mb-3 grid gap-2 sm:grid-cols-2" action="/utang-piutang">
            <input
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="Cari pihak terkait..."
              className={input}
              aria-label="Cari pihak terkait"
            />
            <select name="kind" defaultValue={sp.kind ?? ""} className={input} aria-label="Filter jenis">
              <option value="">Semua jenis</option>
              {Object.entries(KIND_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select name="status" defaultValue={sp.status ?? ""} className={input} aria-label="Filter status">
              <option value="">Semua status</option>
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <label className="flex flex-1 items-center gap-2 text-caption text-deep/75">
                Jatuh tempo
                <input type="date" name="from" defaultValue={sp.from ?? ""} className={`${input} min-h-9`} />
              </label>
              <label className="flex flex-1 items-center gap-2 text-caption text-deep/75">
                s.d.
                <input type="date" name="to" defaultValue={sp.to ?? ""} className={`${input} min-h-9`} />
              </label>
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" className={`${btn.secondary} flex-1`}>
                Terapkan
              </button>
              <Link href="/utang-piutang" className={btn.ghost}>
                Reset
              </Link>
            </div>
            {showDeleted ? <input type="hidden" name="deleted" value="1" /> : null}
          </form>

          {canDelete ? (
            <p className="mb-2 text-caption">
              <Link
                href={showDeleted ? "/utang-piutang" : "/utang-piutang?deleted=1"}
                className="font-semibold text-primary hover:underline"
              >
                {showDeleted ? "Sembunyikan yang dihapus" : "Tampilkan yang dihapus"}
              </Link>
            </p>
          ) : null}

          {list.rows.length === 0 ? (
            <EmptyState title="Belum ada catatan" hint="Utang dan piutang tidak mengubah saldo kas sampai pembayaran dicatat." />
          ) : (
            <ul className="divide-y divide-deep/10 rounded-xl border border-deep/10 bg-white">
              {list.rows.map((d) => (
                <li key={d.id} className="flex flex-wrap items-start justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="text-small font-semibold text-ink">
                      {d.counterparty}
                      <span className="ml-2 rounded-full bg-deep/5 px-2 py-0.5 text-caption text-deep/75">
                        {KIND_LABEL[d.kind]}
                      </span>
                    </p>
                    <p className="text-caption text-deep/75">
                      {formatDate(d.transactionDate)} · jatuh tempo {d.dueDate ? formatDate(d.dueDate) : "—"} ·{" "}
                      {STATUS_LABEL[d.status]}
                    </p>
                    {d.note ? <p className="mt-0.5 truncate text-caption text-deep/60">{d.note}</p> : null}
                    {d.deletedAt ? (
                      <p className="text-caption text-primary">Dihapus{d.deletedReason ? `: ${d.deletedReason}` : ""}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-right">
                      <p className="tabular text-small font-semibold text-deep">{formatRupiah(d.remaining)}</p>
                      <p className="text-caption text-deep/60">dari {formatRupiah(d.amount)}</p>
                    </div>
                    {d.deletedAt ? (
                      canDelete ? <RestoreDebtButton id={d.id} /> : null
                    ) : (
                      <>
                        {d.status !== "paid" ? <DebtPaymentButton debtId={d.id} remaining={d.remaining} label="Bayar" /> : null}
                        {canDelete ? <DeleteDebtButton id={d.id} /> : null}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-caption text-deep/75">
            <p>
              {list.total} catatan · halaman {list.page} dari {lastPage}
            </p>
            <div className="flex gap-2">
              {list.page > 1 ? (
                <Link href={pageHref(list.page - 1)} className={`${btn.secondary} min-h-9 px-3 text-caption`}>
                  Sebelumnya
                </Link>
              ) : null}
              {list.page < lastPage ? (
                <Link href={pageHref(list.page + 1)} className={`${btn.secondary} min-h-9 px-3 text-caption`}>
                  Berikutnya
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}