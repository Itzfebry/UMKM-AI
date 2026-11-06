import { requireBusiness } from "@/server/lib/access";
import { TEMPLATE_HEADER } from "@/server/modules/imports/parse";

export const dynamic = "force-dynamic";

/** FR-IMPORT-01/02: template resmi beserta contoh baris. */
export async function GET() {
  await requireBusiness();
  const rows = [
    TEMPLATE_HEADER.join(","),
    "2026-11-01,Pendapatan,250000,Penjualan,Penjualan pagi",
    "2026-11-02,Pengeluaran,75000,Bahan baku,Belanja pasar",
  ];
  return new Response(rows.join("\r\n") + "\r\n", {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="template-impor-transaksi.csv"',
      "cache-control": "no-store",
    },
  });
}