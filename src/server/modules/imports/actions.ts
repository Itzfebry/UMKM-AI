"use server";

import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import {
  auditEvents,
  categories,
  importBatches,
  importRowKeys,
  transactionAuditLogs,
  transactions,
} from "@/server/db/schema";
import { requireBusiness, requireWritableBusiness } from "@/server/lib/access";
import { parseTransactionsCsv, type ParsedRow } from "./parse";
export type ImportState = {
  error?: string;
  filename?: string;
  csv?: string;
  counts?: { total: number; valid: number; invalid: number; duplicate: number };
  preview?: { line: number; date: string; type: string | null; amount: number; category: string; error?: string }[];
  imported?: { rows: number; invalid: number; duplicate: number };
  ok?: boolean;
};

type Checked = { rows: ParsedRow[]; counts: ImportState["counts"]; valid: ParsedRow[] };

/** Validasi backend: jenis, kategori milik bisnis, dan duplikat baris (FR-IMPORT-04/08/11). */
async function check(businessId: string, csv: string): Promise<Checked> {
  const rows = parseTransactionsCsv(csv);
  const wanted = [...new Set(rows.filter((r) => !r.error && r.category).map((r) => r.category.toLowerCase()))];

  const known = wanted.length
    ? await db
        .select({ name: categories.name, type: categories.type })
        .from(categories)
        .where(and(eq(categories.businessId, businessId), isNull(categories.archivedAt), inArray(sql`lower(${categories.name})`, wanted)))
    : [];
  const knownKeys = new Set(known.map((c) => `${c.type}|${c.name.toLowerCase()}`));

  const hashes = rows.filter((r) => !r.error).map((r) => r.hash);
  const existing = hashes.length
    ? await db
        .select({ rowHash: importRowKeys.rowHash })
        .from(importRowKeys)
        .where(and(eq(importRowKeys.businessId, businessId), inArray(importRowKeys.rowHash, hashes)))
    : [];
  const seen = new Set(existing.map((e) => e.rowHash));

  const checked = rows.map((row) => {
    if (row.error) return row;
    if (row.category && !knownKeys.has(`${row.type}|${row.category.toLowerCase()}`)) {
      return { ...row, error: `Kategori "${row.category}" tidak ada untuk jenis ini.` };
    }
    if (seen.has(row.hash)) return { ...row, error: "Baris ini sudah pernah diimpor (duplikat)." };
    return row;
  });

  const valid = checked.filter((r) => !r.error);
  return {
    rows: checked,
    valid,
    counts: {
      total: checked.length,
      valid: valid.length,
      invalid: checked.filter((r) => r.error && !r.error.startsWith("Baris ini sudah")).length,
      duplicate: checked.filter((r) => r.error?.startsWith("Baris ini sudah")).length,
    },
  };
}

export async function previewImport(_prev: ImportState, formData: FormData): Promise<ImportState> {
  const { business } = await requireBusiness();
  const upload = formData.get("file");
  const csv = upload instanceof File && upload.size > 0 ? await upload.text() : String(formData.get("csv") ?? "");
  if (!csv.trim()) return { error: "Pilih berkas CSV dulu." };
  if (csv.length > 2_000_000) return { error: "Berkas terlalu besar (maksimal 2 MB)." };

  const { rows, counts } = await check(business.id, csv);
  if (!rows.length) return { error: "Tidak ada baris data yang bisa dibaca." };

  return {
    filename: (upload instanceof File && upload.name) || String(formData.get("filename") ?? "impor.csv"),
    csv,
    counts,
    preview: rows.slice(0, 50).map((r) => ({ line: r.line, date: r.date, type: r.type, amount: r.amount, category: r.category, error: r.error })),
  };
}

export async function commitImport(_prev: ImportState, formData: FormData): Promise<ImportState> {
  const { user, business } = await requireWritableBusiness();
  const csv = String(formData.get("csv") ?? "");
  if (!csv.trim()) return { error: "Tidak ada data untuk diimpor." };

  const checked = await check(business.id, csv);
  if (!checked.valid.length) {
    return { error: "Tidak ada baris valid untuk diimpor.", counts: checked.counts };
  }

  try {
    await db.transaction(async (tx) => {
      const [batch] = await tx
        .insert(importBatches)
        .values({
          businessId: business.id,
          filename: String(formData.get("filename") ?? "impor.csv").slice(0, 200),
          totalRows: checked.counts!.total,
          importedRows: checked.valid.length,
          invalidRows: checked.counts!.invalid,
          duplicateRows: checked.counts!.duplicate,
          createdBy: user.id,
        })
        .returning({ id: importBatches.id });

      for (const row of checked.valid) {
        const [inserted] = await tx
          .insert(transactions)
          .values({
            businessId: business.id,
            type: row.type!,
            amount: row.amount,
            transactionDate: row.date,
            note: row.note,
            createdBy: user.id,
          })
          .returning({ id: transactions.id });

        await tx.insert(transactionAuditLogs).values({
          businessId: business.id,
          transactionId: inserted.id,
          action: "create",
          after: { ...row, source: "import", batchId: batch.id },
          actorId: user.id,
        });
      }

      await tx
        .insert(importRowKeys)
        .values(checked.valid.map((row) => ({ businessId: business.id, rowHash: row.hash, batchId: batch.id })))
        .onConflictDoNothing();
    });

    await db.insert(auditEvents).values({
      businessId: business.id,
      actorId: user.id,
      type: "import",
      metadata: { counts: checked.counts, filename: formData.get("filename") },
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Impor gagal.", counts: checked.counts };
  }

  revalidatePath("/transaksi");
  revalidatePath("/beranda");
  return { ok: true, imported: { rows: checked.valid.length, invalid: checked.counts!.invalid, duplicate: checked.counts!.duplicate } };
}