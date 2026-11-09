import type { Metadata } from "next";
import Image from "next/image";
import { Card, PageHeader } from "@/components/ui";
import { CancelSubscriptionForm, CreateInvoiceForm, UploadProofForm } from "@/components/billing-forms";
import { formatRupiah } from "@/lib/format";
import { storageConfigured } from "@/server/lib/storage";
import { requireBusiness } from "@/server/lib/access";
import { getSubscriptionOverview } from "@/server/modules/billing/queries";
import { PLAN_LABEL, PLAN_LIMITS, PRICE_PRO, periodResetLabel } from "@/server/modules/billing/plan";

export const metadata: Metadata = { title: "Langganan" };

const STATUS_LABEL: Record<string, string> = {
  free: "Free",
  active: "Aktif",
  past_due: "Pembayaran gagal",
  grace_period: "Masa tenggang",
  cancel_at_period_end: "Berhenti di akhir periode",
  pending: "Menunggu pembayaran",
  paid: "Dibayar",
  rejected: "Ditolak",
  expired: "Kedaluwarsa",
  manual_review: "Pemeriksaan manual",
};

export default async function LanggananPage() {
  const { business } = await requireBusiness();
  const { plan, subscription: _subscription, invoices, proofs } = await getSubscriptionOverview(business.id);
  const activeInvoice = invoices.find((i) => i.status === "pending" || i.status === "manual_review");
  const canManage = business.role === "owner" || business.role === "admin";

  return (
    <>
      <PageHeader title="Langganan" subtitle="Paket, invoice, dan bukti pembayaran manual." />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px] lg:items-start">
        <Card>
          <h2 className="text-h3 text-deep">Paket saat ini: {PLAN_LABEL[plan.plan]}</h2>
          <p className="mt-1 text-small text-deep/80">
            Status {STATUS_LABEL[plan.status] ?? plan.status}
            {plan.currentPeriodEnd ? ` · berlaku sampai ${plan.currentPeriodEnd.toISOString().slice(0, 10)}` : ""}
          </p>
          {plan.readOnly ? (
            <p className="mt-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-small font-semibold text-primary">
              Masa aktif Free sudah habis. Akun dalam mode baca saja: dashboard, laporan, dan ekspor (CSV/XLSX/PDF) tetap bisa; pencatatan
              baru diblokir. Upgrade ke Pro untuk kembali mencatat.
            </p>
          ) : plan.plan === "free" ? (
            <p className="mt-3 rounded-lg border border-deep/15 bg-surface px-3 py-2 text-small text-deep/85">
              Masa aktif Free tersisa <strong>{plan.trialDaysLeft} hari</strong> (sampai {plan.trialEndsAt.toISOString().slice(0, 10)}).
              Setelah itu akun menjadi baca saja; ekspor tetap bisa.
            </p>
          ) : null}
          <ul className="mt-3 list-disc space-y-1 pl-5 text-small text-deep/80">
            <li>Transaksi: tanpa batas.</li>
            <li>
              {plan.limits.aiPeriod === "lifetime"
                ? `Kuota AI ${plan.usage.aiRequests} dari ${plan.limits.aiRequests} (total selama masa Free).`
                : `Kuota AI bulan ini ${plan.usage.aiRequests} dari ${plan.limits.aiRequests}, direset ${periodResetLabel()}.`}
            </li>
            <li>Slot anggota {plan.limits.members} (paket Pro {PLAN_LIMITS.pro.members}, Free {PLAN_LIMITS.free.members}).</li>
            <li>Data historis tetap bisa dibaca dan diekspor kapan saja.</li>
          </ul>
          {canManage ? (
            <div className="mt-4 flex flex-col gap-2">
              <CreateInvoiceForm amountLabel={formatRupiah(PRICE_PRO)} hasActiveInvoice={Boolean(activeInvoice)} />
              <CancelSubscriptionForm active={plan.plan === "pro" && !plan.cancelAtPeriodEnd} />
            </div>
          ) : (
            <p className="mt-3 text-small text-deep/70">Hanya pemilik/admin yang dapat mengelola langganan.</p>
          )}
        </Card>

        <Card>
          <h2 className="text-h3 text-deep">Cara bayar</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-small text-deep/80">
            <li>Buat invoice, catat nomornya.</li>
            <li>Transfer ke rekening/QRIS yang diberikan admin platform (hubungi admin bila belum ada).</li>
            <li>Unggah bukti beserta keterangan; invoice berlaku tiga hari.</li>
            <li>Verifikasi manual maksimal 2 jam pada jam operasional 09.00–17.00 WIB.</li>
          </ol>
          <p className="mt-3 text-caption text-deep/70">
            {storageConfigured()
              ? "Bukti disimpan di bucket privat."
              : "Storage privat belum dikonfigurasi: bukti hanya berupa keterangan teks. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY untuk menyimpan berkas."}
          </p>
          <figure className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-deep/10 bg-surface p-3 shadow-sm">
            <Image
              src="/images/QRIS.jpeg"
              alt="QRIS pembayaran paket Pro"
              width={260}
              height={260}
              className="rounded-lg bg-white p-1 shadow-sm"
            />
            <figcaption className="text-caption text-deep/70">Scan QRIS untuk membayar paket Pro Rp 49.000/bulan.</figcaption>
          </figure>
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="text-h3 text-deep">Riwayat invoice</h2>
        {invoices.length === 0 ? (
          <p className="mt-2 text-small text-deep/70">Belum ada invoice.</p>
        ) : (
          <ul className="mt-2 divide-y divide-deep/10">
            {invoices.map((invoice) => (
              <li key={invoice.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-small font-semibold text-ink">
                      {invoice.number} · {formatRupiah(invoice.amount)}
                    </p>
                    <p className="text-caption text-deep/70">
                      {STATUS_LABEL[invoice.status] ?? invoice.status} · dibuat {invoice.createdAt.toISOString().slice(0, 10)} · berlaku sampai{" "}
                      {invoice.expiresAt.toISOString().slice(0, 10)}
                    </p>
                    {invoice.rejectReason ? <p className="text-caption text-primary">Alasan penolakan: {invoice.rejectReason}</p> : null}
                    {proofs
                      .filter((p) => p.invoiceId === invoice.id)
                      .map((p) => (
                        <p key={p.createdAt.toISOString()} className="text-caption text-deep/70">
                          Bukti: {p.note ?? "(tanpa keterangan)"} {p.objectPath ? "· berkas tersimpan" : "· tanpa berkas"}
                        </p>
                      ))}
                  </div>
                  {canManage && (invoice.status === "pending" || invoice.status === "rejected") && invoice.expiresAt.getTime() > Date.now() ? (
                    <div className="min-w-64 flex-1">
                      <UploadProofForm invoiceId={invoice.id} />
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}