"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createTransaction, updateTransaction, type ActionState } from "@/server/modules/ledger/actions";
import { TYPE_LABEL, type TransactionType } from "@/server/modules/ledger/types";
import { SubmitButton } from "@/components/submit-button";
import { ErrorText, input } from "@/components/ui";

const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());

// Isian awal untuk transaksi baru.
const emptyDraft = { amount: "", categoryId: "", transactionDate: today, paymentMethod: "", note: "" };

export type TransactionDraft = {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string | null;
  transactionDate: string;
  note: string | null;
  paymentMethod: string | null;
};

export function TransactionForm({
  categories,
  initial,
  onDone,
}: {
  categories: { id: string; name: string; type: TransactionType }[];
  initial?: TransactionDraft;
  onDone?: () => void;
}) {
  const [state, action] = useActionState<ActionState, FormData>(
    initial ? updateTransaction : createTransaction,
    undefined,
  );
  const [type, setType] = useState<TransactionType>(initial?.type ?? "operational_income");
  const [key, setKey] = useState(() => crypto.randomUUID());
  const router = useRouter();
  const suffix = initial?.id ?? "baru";

  // React 19 mereset form setelah aksi (select kembali ke opsi pertama) tanpa menulis ulang DOM
  // karena props nilainya tidak berubah. Isian dijaga di state dan form di-remount lewat `version`.
  const [draft, setDraft] = useState(
    initial
      ? {
          amount: String(initial.amount),
          categoryId: initial.categoryId ?? "",
          transactionDate: initial.transactionDate,
          paymentMethod: initial.paymentMethod ?? "",
          note: initial.note ?? "",
        }
      : emptyDraft,
  );
  const [version, setVersion] = useState(0);
  const patchDraft = (values: Partial<typeof draft>) => setDraft((current) => ({ ...current, ...values }));

  const options = useMemo(() => categories.filter((c) => c.type === type), [categories, type]);

  useEffect(() => {
    if (!state) return;
    setVersion((current) => current + 1); // remount agar select ikut menampilkan isian dari state
    if (!state.ok) return;
    if (initial) {
      onDone?.();
    } else {
      setDraft(emptyDraft);
      setKey(crypto.randomUUID());
    }
    router.refresh();
  }, [state, router, initial, onDone]);

  return (
    <form key={version} action={action} className="flex flex-col gap-3">
      {initial ? (
        <input type="hidden" name="id" value={initial.id} />
      ) : (
        <input type="hidden" name="idempotencyKey" value={key} />
      )}
      <ErrorText>{state?.error}</ErrorText>

      <label className="text-small font-semibold text-deep" htmlFor={`type-${suffix}`}>
        Jenis transaksi
        <select
          id={`type-${suffix}`}
          name="type"
          className={`${input} mt-1`}
          value={type}
          onChange={(e) => {
            setType(e.target.value as TransactionType);
            patchDraft({ categoryId: "" }); // kategori ikut berubah saat jenis berganti
          }}
        >
          {Object.entries(TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="text-small font-semibold text-deep" htmlFor={`amount-${suffix}`}>
        Nominal (Rp)
        <input
          id={`amount-${suffix}`}
          name="amount"
          inputMode="numeric"
          pattern="\d*"
          required
          placeholder="50000"
          value={draft.amount}
          onChange={(e) => patchDraft({ amount: e.target.value })}
          className={`${input} mt-1 tabular`}
        />
      </label>

      <label className="text-small font-semibold text-deep" htmlFor={`categoryId-${suffix}`}>
        Kategori
        <select
          id={`categoryId-${suffix}`}
          name="categoryId"
          className={`${input} mt-1`}
          value={draft.categoryId}
          onChange={(e) => patchDraft({ categoryId: e.target.value })}
        >
          <option value="">Tanpa kategori</option>
          {options.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-small font-semibold text-deep" htmlFor={`transactionDate-${suffix}`}>
          Tanggal
          <input
            id={`transactionDate-${suffix}`}
            name="transactionDate"
            type="date"
            required
            value={draft.transactionDate}
            onChange={(e) => patchDraft({ transactionDate: e.target.value })}
            className={`${input} mt-1`}
          />
        </label>
        <label className="text-small font-semibold text-deep" htmlFor={`paymentMethod-${suffix}`}>
          Metode bayar
          <select
            id={`paymentMethod-${suffix}`}
            name="paymentMethod"
            className={`${input} mt-1`}
            value={draft.paymentMethod}
            onChange={(e) => patchDraft({ paymentMethod: e.target.value })}
          >
            <option value="">—</option>
            <option value="tunai">Tunai</option>
            <option value="transfer">Transfer</option>
            <option value="qris">QRIS</option>
          </select>
        </label>
      </div>

      <label className="text-small font-semibold text-deep" htmlFor={`note-${suffix}`}>
        Catatan (opsional)
        <input
          id={`note-${suffix}`}
          name="note"
          maxLength={500}
          value={draft.note}
          onChange={(e) => patchDraft({ note: e.target.value })}
          className={`${input} mt-1`}
        />
      </label>

      <SubmitButton pendingLabel="Menyimpan…">{initial ? "Simpan perubahan" : "Simpan transaksi"}</SubmitButton>
    </form>
  );
}