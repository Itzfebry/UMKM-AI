import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, EmptyState, input, btn } from "@/components/ui";
import { TransactionForm } from "@/components/transaction-form";
import { formatDate, formatRupiah } from "@/lib/format";
import { requireBusiness } from "@/server/lib/access";
import { getCategories, listTransactions } from "@/server/modules/ledger/queries";
import { TYPE_LABEL, type TransactionType } from "@/server/modules/ledger/types";
import { DeleteTransactionButton, EditTransactionButton, RestoreTransactionButton } from "@/components/transaction-actions";

const OUT = new Set<TransactionType>(["operational_expense", "owner_draw", "loan_repayment"]);
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const metadata: Metadata = { title: "Transaksi" };

type SearchParams = {
  q?: string;
  type?: string;
  page?: string;
  from?: string;
  to?: string;
  categoryId?: string;
  deleted?: string;
};

export default async function TransaksiPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { business } = await requireBusiness();
  const sp = await searchParams;
  const type = sp.type && sp.type in TYPE_LABEL ? (sp.type as TransactionType) : undefined;
  const uncategorized = sp.categoryId === "none";
  const categoryId = !uncategorized && sp.categoryId && UUID.test(sp.categoryId) ? sp.categoryId : undefined;
  const from = sp.from && DATE.test(sp.from) ? sp.from : undefined;
  const to = sp.to && DATE.test(sp.to) ? sp.to : undefined;
  const showDeleted = sp.deleted === "1";

  const [categories, list] = await Promise.all([
    getCategories(business.id),
    listTransactions(business.id, {
      search: sp.q,
      type,
      categoryId,
      uncategorized,
      from,
      to,
      page: Number(sp.page ?? 1),
      includeDeleted: showDeleted,
    }),
  ]);

  const canDelete = business.role !== "staff";
  const lastPage = Math.max(1, Math.ceil(list.total / list.pageSize));
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({
      q: sp.q,
      type: sp.type,
      categoryId: sp.categoryId,
      from: sp.from,
      to: sp.to,
      deleted: sp.deleted,
    })) {
      if (value) params.set(key, String(value));
    }
    params.set("page", String(page));
    return `/transaksi?${params.toString()}`;
  };

  return (
    <>
      <PageHeader title="Transaksi" subtitle="Catat dan telusuri arus kas usaha." />

      <div className="grid gap-4 lg:grid-cols-[360px_1fr] lg:items-start">
        <section className="rounded-xl border border-deep/10 bg-white p-4">
          <h2 className="mb-3 text-h3 text-deep">Catat transaksi</h2>
          <TransactionForm categories={categories} />
        </section>

        <section>
          <form className="mb-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3" action="/transaksi">
            <input
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="Cari catatan transaksi..."
              className={input}
              aria-label="Cari transaksi"
            />
            <select name="type" defaultValue={sp.type ?? ""} className={input} aria-label="Filter jenis">
              <option value="">Semua jenis</option>
              {Object.entries(TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select name="categoryId" defaultValue={sp.categoryId ?? ""} className={input} aria-label="Filter kategori">
              <option value="">Semua kategori</option>
              <option value="none">Tanpa kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-caption text-deep/75">
              Dari
              <input type="date" name="from" defaultValue={sp.from ?? ""} className={`${input} min-h-9`} />
            </label>
            <label className="flex items-center gap-2 text-caption text-deep/75">
              Sampai
              <input type="date" name="to" defaultValue={sp.to ?? ""} className={`${input} min-h-9`} />
            </label>
            <div className="flex gap-2">
              <button type="submit" className={`${btn.secondary} flex-1`}>
                Terapkan
              </button>
              <Link href="/transaksi" className={btn.ghost}>
                Reset
              </Link>
            </div>
            {showDeleted ? <input type="hidden" name="deleted" value="1" /> : null}
          </form>

          {canDelete ? (
            <p className="mb-2 text-caption">
              <Link
                href={showDeleted ? "/transaksi" : "/transaksi?deleted=1"}
                className="font-semibold text-primary hover:underline"
              >
                {showDeleted ? "Sembunyikan yang dihapus" : "Tampilkan yang dihapus"}
              </Link>
            </p>
          ) : null}

          {list.rows.length === 0 ? (
            <EmptyState title="Tidak ada transaksi" hint="Ubah filter atau catat transaksi baru." />
          ) : (
            <ul className="divide-y divide-deep/10 rounded-xl border border-deep/10 bg-white">
              {list.rows.map((t) => (
                <li key={t.id} className={`flex items-center justify-between gap-3 p-3 ${t.deletedAt ? "bg-surface" : ""}`}>
                  <div className="min-w-0">
                    <p className="truncate text-small font-semibold text-ink">
                      {t.note || t.categoryName || TYPE_LABEL[t.type]}
                    </p>
                    <p className="text-caption text-deep/75">
                      {formatDate(t.transactionDate)} · {TYPE_LABEL[t.type]}
                      {t.categoryName ? ` · ${t.categoryName}` : ""}
                    </p>
                    {t.deletedAt ? (
                      <p className="text-caption text-primary">Dihapus{t.deletedReason ? `: ${t.deletedReason}` : ""}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className={`tabular mr-2 text-small font-semibold ${OUT.has(t.type) ? "text-primary" : "text-deep"}`}>
                      {OUT.has(t.type) ? "−" : "+"}
                      {formatRupiah(t.amount)}
                    </span>
                    {t.deletedAt ? (
                      canDelete ? <RestoreTransactionButton id={t.id} /> : null
                    ) : (
                      <>
                        <EditTransactionButton
                          transaction={{
                            id: t.id,
                            type: t.type,
                            amount: t.amount,
                            categoryId: t.categoryId,
                            transactionDate: t.transactionDate,
                            note: t.note,
                            paymentMethod: t.paymentMethod,
                          }}
                          categories={categories}
                        />
                        {canDelete ? <DeleteTransactionButton id={t.id} /> : null}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-caption text-deep/75">
            <p>
              {list.total} transaksi · halaman {list.page} dari {lastPage}
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
