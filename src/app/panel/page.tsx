import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, PageHeader, btn } from "@/components/ui";
import { RejectInvoiceForm, VerifyInvoiceButton } from "@/components/admin-forms";
import { AdminMfaPanel } from "@/components/admin-mfa-panel";
import { formatRupiah } from "@/lib/format";
import { requireAdminSession } from "@/admin-auth";
import { db } from "@/server/db";
import { platformAdmins } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { purgeOldAuditEvents, runMaintenanceNow } from "@/server/modules/security/actions";
import { expireStaleInvoices } from "@/server/modules/billing/actions";
import { listInvoicesForAdmin, listProofs } from "@/server/modules/billing/queries";

export const metadata: Metadata = { title: "Panel platform" };

const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu verifikasi",
  paid: "Dibayar",
  rejected: "Ditolak",
  expired: "Kedaluwarsa",
  manual_review: "Pemeriksaan manual",
};

export default async function PanelPage() {
  const admin = await requireAdminSession();
  if (!admin) redirect("/panel/masuk");

  await expireStaleInvoices();
  const [invoices, [adminRow]] = await Promise.all([
    listInvoicesForAdmin(),
    db.select({ mfaEnabled: platformAdmins.mfaEnabled }).from(platformAdmins).where(eq(platformAdmins.userId, admin.id)).limit(1),
  ]);
  const proofs = await Promise.all(
    invoices.slice(0, 10).map(async (invoice) => ({ invoiceId: invoice.id, items: await listProofs(invoice.id) })),
  );
  const proofFor = (id: string) => proofs.find((p) => p.invoiceId === id)?.items ?? [];
  const mfaEnabled = Boolean(adminRow?.mfaEnabled);

  return (
    <>
      <PageHeader
        title="Panel platform"
        subtitle="Verifikasi pembayaran manual, pantau langganan, dan bersihkan audit lama. Target verifikasi 2 jam pada jam operasional 09.00–17.00 WIB."
      />

      {!mfaEnabled ? (
        <p className="mb-4 rounded-lg bg-primary/10 px-3 py-2 text-small text-primary">
          MFA belum aktif. Aktifkan di bagian Keamanan di bawah sebelum panel ini dipakai untuk produksi.
        </p>
      ) : null}

      {admin.email ? <p className="mb-3 text-caption text-deep/70">Masuk sebagai {admin.email} · sesi panel terpisah dari sesi pengguna.</p> : null}

      <Card>
        <h2 className="text-h3 text-deep">Invoice ({invoices.length})</h2>
        {invoices.length === 0 ? (
          <p className="mt-2 text-small text-deep/70">Belum ada invoice.</p>
        ) : (
          <ul className="mt-2 divide-y divide-deep/10">
            {invoices.map((invoice) => (
              <li key={invoice.id} className="py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-small font-semibold text-ink">
                      {invoice.number} · {invoice.businessName} · {formatRupiah(invoice.amount)}
                    </p>
                    <p className="text-caption text-deep/70">
                      {STATUS_LABEL[invoice.status] ?? invoice.status} · dibuat {invoice.createdAt.toISOString().slice(0, 19).replace("T", " ")} UTC · berlaku
                      sampai {invoice.expiresAt.toISOString().slice(0, 10)}
                    </p>
                    {proofFor(invoice.id).map((proof) => (
                      <p key={proof.id} className="text-caption text-deep/70">
                        Bukti {proof.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC: {proof.note ?? "(tanpa keterangan)"}
                        {proof.objectPath ? ` · berkas: ${proof.objectPath}` : " · tanpa berkas"}
                      </p>
                    ))}
                    {invoice.rejectReason ? <p className="text-caption text-primary">Alasan: {invoice.rejectReason}</p> : null}
                    <p className="text-caption text-deep/60">
                      Verifikasi hanya setelah dana benar-benar masuk rekening/QRIS, bukan hanya dari tangkapan layar.
                    </p>
                  </div>
                  {invoice.status === "pending" || invoice.status === "manual_review" ? (
                    <div className="flex items-start gap-2">
                      <VerifyInvoiceButton invoiceId={invoice.id} />
                      <RejectInvoiceForm invoiceId={invoice.id} />
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="text-h3 text-deep">Keamanan panel</h2>
        <div className="mt-3">
          <AdminMfaPanel enabled={mfaEnabled} />
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="text-h3 text-deep">Audit dan tugas terjadwal</h2>
        <p className="mt-1 text-small text-deep/80">
          Retensi audit keamanan dan aktivitas admin 90 hari. Riwayat perubahan transaksi tidak ikut terhapus karena tunduk pada kebijakan retensi
          keuangan.
        </p>
        <form action={purgeOldAuditEvents} className="mt-2">
          <button type="submit" className={btn.secondary}>
            Bersihkan audit lebih dari 90 hari
          </button>
        </form>
        <form action={runMaintenanceNow} className="mt-3">
          <button type="submit" className={btn.secondary}>
            Jalankan tugas terjadwal sekarang
          </button>
          <p className="mt-1 text-caption text-deep/70">
            Menandai invoice kedaluwarsa, mengakhiri masa tenggang Pro, mengirim pengingat H-3, dan membersihkan audit lama. Cron otomatis memanggil{" "}
            <code>/api/cron/notifications</code> dengan <code>CRON_SECRET</code>.
          </p>
        </form>
        <p className="mt-4 text-caption text-deep/70">
          <Link href="/masuk" className="font-semibold text-primary hover:underline">
            Masuk sebagai pengguna biasa
          </Link>{" "}
          untuk memakai aplikasi keuangan.
        </p>
      </Card>
    </>
  );
}