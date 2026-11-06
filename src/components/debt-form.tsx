"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createDebt, type DebtActionState } from "@/server/modules/debts/actions";
import { KIND_LABEL } from "@/server/modules/debts/types";
import { SubmitButton } from "@/components/submit-button";
import { ErrorText, input } from "@/components/ui";

const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());

// Isian awal; dipakai ulang saat form direset setelah berhasil.
const emptyDebt = { kind: "payable", counterparty: "", amount: "", transactionDate: today, dueDate: "", note: "" };

export function DebtForm() {
  const [state, action] = useActionState<DebtActionState, FormData>(createDebt, undefined);
  const [key, setKey] = useState(() => crypto.randomUUID());
  const router = useRouter();

  // React 19 mereset form setelah aksi (select kembali ke opsi pertama) tanpa menulis ulang DOM.
  // Isian dijaga di state dan form di-remount lewat `version` agar select ikut benar.
  const [draft, setDraft] = useState(emptyDebt);
  const [version, setVersion] = useState(0);
  const patchDraft = (values: Partial<typeof emptyDebt>) => setDraft((current) => ({ ...current, ...values }));

  useEffect(() => {
    if (!state) return;
    setVersion((current) => current + 1);
    if (!state.ok) return;
    setDraft(emptyDebt);
    setKey(crypto.randomUUID());
    router.refresh();
  }, [state, router]);

  return (
    <form key={version} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="idempotencyKey" value={key} />
      <ErrorText>{state?.error}</ErrorText>

      <label className="text-small font-semibold text-deep" htmlFor="debt-kind">
        Jenis
        <select
          id="debt-kind"
          name="kind"
          className={`${input} mt-1`}
          value={draft.kind}
          onChange={(e) => patchDraft({ kind: e.target.value })}
        >
          {Object.entries(KIND_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="text-small font-semibold text-deep" htmlFor="debt-counterparty">
        Pihak terkait
        <input
          id="debt-counterparty"
          name="counterparty"
          required
          minLength={2}
          maxLength={120}
          placeholder="Contoh: Toko Berkah"
          value={draft.counterparty}
          onChange={(e) => patchDraft({ counterparty: e.target.value })}
          className={`${input} mt-1`}
        />
      </label>

      <label className="text-small font-semibold text-deep" htmlFor="debt-amount">
        Nominal (Rp)
        <input
          id="debt-amount"
          name="amount"
          inputMode="numeric"
          pattern="\d*"
          required
          placeholder="500000"
          value={draft.amount}
          onChange={(e) => patchDraft({ amount: e.target.value })}
          className={`${input} mt-1 tabular`}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-small font-semibold text-deep" htmlFor="debt-date">
          Tanggal
          <input
            id="debt-date"
            name="transactionDate"
            type="date"
            required
            value={draft.transactionDate}
            onChange={(e) => patchDraft({ transactionDate: e.target.value })}
            className={`${input} mt-1`}
          />
        </label>
        <label className="text-small font-semibold text-deep" htmlFor="debt-due">
          Jatuh tempo
          <input
            id="debt-due"
            name="dueDate"
            type="date"
            value={draft.dueDate}
            onChange={(e) => patchDraft({ dueDate: e.target.value })}
            className={`${input} mt-1`}
          />
        </label>
      </div>

      <label className="text-small font-semibold text-deep" htmlFor="debt-note">
        Catatan (opsional)
        <input
          id="debt-note"
          name="note"
          maxLength={500}
          value={draft.note}
          onChange={(e) => patchDraft({ note: e.target.value })}
          className={`${input} mt-1`}
        />
      </label>

      <SubmitButton pendingLabel="Menyimpan...">Simpan</SubmitButton>
    </form>
  );
}