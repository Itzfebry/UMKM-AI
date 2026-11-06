import type { Metadata } from "next";
import { Card, PageHeader, EmptyState } from "@/components/ui";
import { formatRupiah } from "@/lib/format";
import { requireBusiness, requireRole } from "@/server/lib/access";
import { listDebtAudit, listTransactionAudit } from "@/server/modules/audit/queries";

export const metadata: Metadata = { title: "Riwayat perubahan" };

const ACTION_LABEL: Record<string, string> = {
  create: "Dibuat",
  update: "Diubah",
  delete: "Dihapus",
  restore: "Dipulihkan",
};

const stamp = (date: Date) =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(date);

export default async function RiwayatPage() {
  const { user, business } = await requireBusiness();
  // Riwayat lengkap hanya untuk pemilik dan admin bisnis.
  await requireRole(business.id, user.id, ["owner", "admin"]);

  const [txAudit, debtAudit] = await Promise.all([listTransactionAudit(business.id), listDebtAudit(business.id)]);

  return (
    <>
      <PageHeader title="Riwayat perubahan" subtitle="Siapa mengubah apa, kapan, dan alasannya. Riwayat tidak dihapus bersama transaksi." />

      <div className="grid gap-4 xl:grid-cols-2 xl:items-start">
      <Card>
        <h2 className="text-h3 text-deep">Transaksi ({txAudit.length} terakhir)</h2>
        {txAudit.length === 0 ? (
          <p className="mt-2 text-small text-deep/70">Belum ada perubahan transaksi.</p>
        ) : (
          <ul className="mt-2 divide-y divide-deep/10">
            {txAudit.map((row) => {
              const after = (row.after ?? {}) as { note?: string; amount?: number };
              const before = (row.before ?? {}) as { note?: string; amount?: number };
              return (
                <li key={row.id} className="py-2.5">
                  <p className="text-small font-semibold text-ink">
                    {ACTION_LABEL[row.action] ?? row.action} · {row.note || row.type || "(transaksi)"}
                  </p>
                  <p className="text-caption text-deep/70">
                    {stamp(row.createdAt)} WIB · oleh {row.actor ?? "sistem"} · nominal {formatRupiah(row.amount ?? 0)}
                    {row.transactionDate ? ` · tanggal ${row.transactionDate}` : ""}
                  </p>
                  <p className="text-caption text-deep/60">
                    Sebelum: {before.note ?? "—"} / {formatRupiah(before.amount ?? 0)} → Sesudah: {after.note ?? "—"} /{" "}
                    {formatRupiah(after.amount ?? 0)}
                    {row.reason ? ` · alasan: ${row.reason}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="text-h3 text-deep">Utang & piutang ({debtAudit.length} terakhir)</h2>
        {debtAudit.length === 0 ? (
          <p className="mt-2 text-small text-deep/70">Belum ada perubahan utang/piutang.</p>
        ) : (
          <ul className="mt-2 divide-y divide-deep/10">
            {debtAudit.map((row) => (
              <li key={row.id} className="py-2.5">
                <p className="text-small font-semibold text-ink">
                  {ACTION_LABEL[row.action] ?? row.action} · {row.counterparty ?? "(catatan dihapus)"}
                </p>
                <p className="text-caption text-deep/70">
                  {stamp(row.createdAt)} WIB · oleh {row.actor ?? "sistem"} · nominal {formatRupiah(row.amount ?? 0)}
                  {row.reason ? ` · alasan: ${row.reason}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
      </div>

      {txAudit.length === 0 && debtAudit.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="Riwayat masih kosong" hint="Setiap pencatatan, perubahan, penghapusan, dan pemulihan akan muncul di sini." />
        </div>
      ) : null}
    </>
  );
}