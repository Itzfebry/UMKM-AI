import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import { auditEvents } from "@/server/db/schema";
import { requireBusiness } from "@/server/lib/access";
import { formatDate } from "@/lib/format";
import { TYPE_LABEL, type TransactionType } from "@/server/modules/ledger/types";
import { delta, getReportSlice, getReportTransactions } from "@/server/modules/reports/queries";
import { isPreset, PRESET_LABEL, resolvePeriod } from "@/server/modules/reports/period";
import { toCsv, toPdf, toXlsx, type Cell, type PdfLine } from "@/server/modules/reports/export";

export const dynamic = "force-dynamic";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const FORMATS = { csv: "text/csv; charset=utf-8", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", pdf: "application/pdf" } as const;
type Format = keyof typeof FORMATS;

const percent = (value: number | null) => (value == null ? "tanpa pembanding" : `${value.toFixed(1)}%`);

export async function GET(request: NextRequest) {
  const { user, business } = await requireBusiness();
  const params = request.nextUrl.searchParams;

  const format = (params.get("format") ?? "csv") as Format;
  if (!(format in FORMATS)) return new Response("Format tidak dikenal.", { status: 400 });

  const preset = isPreset(params.get("preset") ?? undefined) ? (params.get("preset") as keyof typeof PRESET_LABEL) : "month";
  const from = params.get("from");
  const to = params.get("to");
  const { current, previous, incomplete } = resolvePeriod(
    preset,
    from && DATE.test(from) ? from : undefined,
    to && DATE.test(to) ? to : undefined,
  );

  // FR-EXPORT-04/05: staf hanya menerima ringkasan.
  const full = business.role !== "staff";
  const [slice, prevSlice, rows] = await Promise.all([
    getReportSlice(business.id, current),
    getReportSlice(business.id, previous),
    full ? getReportTransactions(business.id, current) : Promise.resolve([]),
  ]);

  const generated = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date());
  const title = `Laporan keuangan ${business.name}`;

  const summary: Cell[][] = [
    [title],
    [`Periode: ${PRESET_LABEL[preset]} (${formatDate(current.from)} - ${formatDate(current.to)})`],
    [`Dibuat: ${generated} WIB`],
    [],
    ["Ringkasan", "Periode ini", "Periode sebelumnya", "Perubahan", "Persen"],
    ["Pendapatan operasional", slice.income, prevSlice.income, delta(slice.income, prevSlice.income).nominal, percent(delta(slice.income, prevSlice.income).percent)],
    ["Pengeluaran operasional", slice.expense, prevSlice.expense, delta(slice.expense, prevSlice.expense).nominal, percent(delta(slice.expense, prevSlice.expense).percent)],
    ["Arus kas bersih (bukan laba)", slice.net, prevSlice.net, delta(slice.net, prevSlice.net).nominal, percent(delta(slice.net, prevSlice.net).percent)],
    ["Jumlah transaksi", slice.count, prevSlice.count, slice.count - prevSlice.count, ""],
    [],
    ["Kategori", "Jenis", "Jumlah transaksi", "Total"],
    ...slice.byCategory.map((c) => [c.name, TYPE_LABEL[c.type as TransactionType], c.count, c.total] as Cell[]),
  ];
  if (incomplete) summary.push([], ["Catatan: periode berjalan belum penuh, pembanding belum setara."]);

  if (full && rows.length) {
    summary.push(
      [],
      ["Tanggal", "Jenis", "Kategori", "Catatan", "Metode bayar", "Nominal", "Dicatat"],
      ...rows.map((r) => [
        r.transactionDate,
        TYPE_LABEL[r.type as TransactionType],
        r.categoryName,
        r.note ?? "",
        r.paymentMethod ?? "",
        r.amount,
        new Intl.DateTimeFormat("id-ID", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(r.createdAt),
      ] as Cell[]),
    );
  }

  await db.insert(auditEvents).values({
    businessId: business.id,
    actorId: user.id,
    type: "export",
    metadata: { format, preset, from: current.from, to: current.to, scope: full ? "penuh" : "ringkasan", rows: rows.length },
  });

  const stamp = `${current.from}_${current.to}`;
  const filename = `laporan-${business.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${stamp}.${format}`;

  const body =
    format === "csv"
      ? toCsv(summary)
      : format === "xlsx"
        ? toXlsx(`Laporan ${current.from}`, summary)
        : toPdf(summary.map((row, i) => ({ text: row.join("  |  "), bold: i < 4 || row[0] === "Ringkasan", size: i < 4 ? 12 : 9 }) as PdfLine));

  const payload = typeof body === "string" ? new TextEncoder().encode(body) : new Uint8Array(body);

  return new Response(payload, {
    headers: {
      "content-type": FORMATS[format],
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}