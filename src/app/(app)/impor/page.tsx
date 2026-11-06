import type { Metadata } from "next";
import { PageHeader, Card } from "@/components/ui";
import { ImportForm } from "@/components/import-form";
import { requireBusiness } from "@/server/lib/access";
import { getPlanState, PLAN_LABEL } from "@/server/modules/billing/plan";
import { MAX_IMPORT_ROWS } from "@/server/modules/imports/parse";

export const metadata: Metadata = { title: "Impor CSV" };

export default async function ImporPage() {
  const { business } = await requireBusiness();
  const plan = await getPlanState(business.id);

  return (
    <>
      <PageHeader title="Impor CSV" subtitle="Unggah catatan lama dari buku atau aplikasi lain lewat berkas CSV." />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
        <Card>
          <ImportForm templateHref="/impor/template" />
        </Card>

        <Card>
          <h2 className="text-h3 text-deep">Cara pakai</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-small text-deep/80">
            <li>Unduh template, isi satu baris per transaksi.</li>
            <li>Tanggal menerima format <code>2026-11-05</code> atau <code>05/11/2026</code>.</li>
            <li>Jenis memakai nama Indonesia: Pendapatan, Pengeluaran, Setoran modal, Penarikan pribadi, Pinjaman masuk, Bayar pinjaman.</li>
            <li>Kategori harus sudah ada di aplikasi dengan jenis yang sama; kosongkan bila tidak perlu.</li>
          </ol>
          <p className="mt-3 text-caption text-deep/70">
            Maksimal {MAX_IMPORT_ROWS} baris per berkas. Baris yang sama tidak bisa masuk dua kali. Impor tidak menyentuh saldo
            awal, dan paket {PLAN_LABEL[plan.plan]} saat ini terpakai {plan.usage.transactions} transaksi bulan ini.
          </p>
        </Card>
      </div>
    </>
  );
}