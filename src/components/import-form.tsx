"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { commitImport, previewImport, type ImportState } from "@/server/modules/imports/actions";
import { SubmitButton } from "@/components/submit-button";
import { ErrorText, btn, input } from "./ui";

const STATUS_LABEL: Record<string, string> = {
  operational_income: "Pendapatan",
  operational_expense: "Pengeluaran",
  capital_in: "Setoran modal",
  owner_draw: "Penarikan pribadi",
  loan_in: "Pinjaman masuk",
  loan_repayment: "Bayar pinjaman",
};

export function ImportForm({ templateHref }: { templateHref: string }) {
  const [preview, previewAction] = useActionState<ImportState, FormData>(previewImport, {});
  const [commit, commitAction] = useActionState<ImportState, FormData>(commitImport, {});
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!commit?.ok) return;
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }, [commit, router]);

  return (
    <div className="flex flex-col gap-4">
      <form action={previewAction} className="flex flex-col gap-3">
        <label className="text-small font-semibold text-deep" htmlFor="csv-file">
          Berkas CSV
          <input ref={fileRef} id="csv-file" name="file" type="file" accept=".csv,text/csv" required className={`${input} mt-1 min-h-11 py-2`} />
        </label>
        <div className="flex flex-wrap gap-2">
          <SubmitButton pendingLabel="Memeriksa...">Pratinjau</SubmitButton>
          <a href={templateHref} className={btn.secondary} download>
            Unduh template
          </a>
        </div>
        <ErrorText>{preview?.error}</ErrorText>
      </form>

      {preview?.counts ? (
        <section className="rounded-xl border border-deep/10 bg-white p-4">
          <h2 className="text-h3 text-deep">Pratinjau</h2>
          <p className="mt-1 text-small text-deep/80">
            {preview.counts.total} baris · {preview.counts.valid} valid · {preview.counts.invalid} tidak valid ·{" "}
            {preview.counts.duplicate} duplikat
          </p>
          {preview.preview?.length ? (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-small">
                <thead className="bg-surface text-left text-caption text-deep/75">
                  <tr>
                    <th scope="col" className="p-2">Baris</th>
                    <th scope="col" className="p-2">Tanggal</th>
                    <th scope="col" className="p-2">Jenis</th>
                    <th scope="col" className="p-2 text-right">Nominal</th>
                    <th scope="col" className="p-2">Kategori</th>
                    <th scope="col" className="p-2">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-deep/10">
                  {preview.preview.map((row) => (
                    <tr key={row.line} className={row.error ? "text-primary" : ""}>
                      <td className="p-2">{row.line}</td>
                      <td className="p-2">{row.date}</td>
                      <td className="p-2">{row.type ? STATUS_LABEL[row.type] : "—"}</td>
                      <td className="tabular p-2 text-right">{row.amount.toLocaleString("id-ID")}</td>
                      <td className="p-2">{row.category || "—"}</td>
                      <td className="p-2">{row.error ?? "siap diimpor"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {(preview.preview?.length ?? 0) < (preview.counts.total ?? 0) ? (
            <p className="mt-2 text-caption text-deep/60">Hanya 50 baris pertama ditampilkan.</p>
          ) : null}

          {preview.counts.valid > 0 ? (
            <form action={commitAction} className="mt-3 flex flex-col gap-2">
              <input type="hidden" name="csv" value={preview.csv ?? ""} />
              <input type="hidden" name="filename" value={preview.filename ?? "impor.csv"} />
              <ErrorText>{commit?.error}</ErrorText>
              <div>
                <SubmitButton pendingLabel="Mengimpor...">Impor {preview.counts.valid} baris valid</SubmitButton>
              </div>
            </form>
          ) : (
            <p className="mt-3 text-small text-primary">Tidak ada baris valid untuk diimpor.</p>
          )}
        </section>
      ) : null}

      {commit?.ok && commit.imported ? (
        <p role="status" className="rounded-lg bg-accent/25 px-3 py-2 text-small text-deep">
          Impor selesai: {commit.imported.rows} baris masuk, {commit.imported.invalid} tidak valid, {commit.imported.duplicate} duplikat dilewati.
        </p>
      ) : null}
    </div>
  );
}