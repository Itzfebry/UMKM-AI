"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HandCoins, Trash2 } from "lucide-react";
import {
  recordDebtPayment,
  restoreDebt,
  softDeleteDebt,
  type DebtActionState,
} from "@/server/modules/debts/actions";
import { SubmitButton } from "@/components/submit-button";
import { input } from "./ui";

const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());

export function DebtPaymentButton({
  debtId,
  remaining,
  label = "Catat pembayaran",
}: {
  debtId: string;
  remaining: number;
  label?: string;
}) {
  const [state, action] = useActionState<DebtActionState, FormData>(recordDebtPayment, undefined);
  const [key, setKey] = useState(() => crypto.randomUUID());
  const router = useRouter();

  // Kunci idempotensi harus berganti setelah berhasil, kalau tidak pembayaran kedua diabaikan.
  useEffect(() => {
    if (!state?.ok) return;
    setKey(crypto.randomUUID());
    router.refresh();
  }, [state, router]);

  return (
    <details className="relative">
      <summary className="flex min-h-9 cursor-pointer list-none items-center gap-1 rounded-lg border border-deep/25 px-2 text-caption font-semibold text-deep hover:border-deep/50">
        <HandCoins className="size-3.5" aria-hidden />
        {label}
      </summary>
      <form
        action={action}
        className="absolute right-0 z-20 mt-1 w-64 rounded-lg border border-deep/15 bg-white p-3 shadow-lg"
      >
        <input type="hidden" name="debtId" value={debtId} />
        <input type="hidden" name="idempotencyKey" value={key} />
        <label className="text-caption font-semibold text-deep" htmlFor={`pay-amount-${debtId}`}>
          Nominal (sisa Rp{remaining.toLocaleString("id-ID")})
        </label>
        <input
          id={`pay-amount-${debtId}`}
          name="amount"
          inputMode="numeric"
          pattern="\d*"
          required
          defaultValue={remaining}
          className={`${input} mt-1 min-h-9 text-small tabular`}
        />
        <label className="mt-2 block text-caption font-semibold text-deep" htmlFor={`pay-date-${debtId}`}>
          Tanggal bayar
        </label>
        <input
          id={`pay-date-${debtId}`}
          name="paidAt"
          type="date"
          required
          defaultValue={today}
          className={`${input} mt-1 min-h-9 text-small`}
        />
        <label className="mt-2 block text-caption font-semibold text-deep" htmlFor={`pay-note-${debtId}`}>
          Catatan (opsional)
        </label>
        <input id={`pay-note-${debtId}`} name="note" maxLength={500} className={`${input} mt-1 min-h-9 text-small`} />
        {state?.error ? <p className="mt-1 text-caption text-primary">{state.error}</p> : null}
        <div className="mt-2">
          <SubmitButton pendingLabel="Menyimpan...">Simpan pembayaran</SubmitButton>
        </div>
      </form>
    </details>
  );
}

export function DeleteDebtButton({ id }: { id: string }) {
  const [state, action] = useActionState<DebtActionState, FormData>(softDeleteDebt, undefined);

  return (
    <details className="relative">
      <summary
        className="flex size-9 cursor-pointer list-none items-center justify-center rounded-lg text-deep/50 hover:bg-primary/10 hover:text-primary"
        aria-label="Hapus utang/piutang"
      >
        <Trash2 className="size-4" aria-hidden />
      </summary>
      <form action={action} className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-deep/15 bg-white p-3 shadow-lg">
        <input type="hidden" name="id" value={id} />
        <label className="text-caption font-semibold text-deep" htmlFor={`debt-reason-${id}`}>
          Alasan hapus
        </label>
        <input
          id={`debt-reason-${id}`}
          name="reason"
          required
          minLength={3}
          placeholder="Salah input"
          className={`${input} mt-1 min-h-9 text-small`}
        />
        {state?.error ? <p className="mt-1 text-caption text-primary">{state.error}</p> : null}
        <button type="submit" className="mt-2 min-h-9 w-full rounded-lg bg-primary text-small font-semibold text-white">
          Hapus
        </button>
      </form>
    </details>
  );
}

export function RestoreDebtButton({ id }: { id: string }) {
  const [state, action] = useActionState<DebtActionState, FormData>(restoreDebt, undefined);

  return (
    <form action={action} className="flex flex-col items-end">
      <input type="hidden" name="id" value={id} />
      <SubmitButton pendingLabel="Memulihkan..." variant="secondary">
        Pulihkan
      </SubmitButton>
      {state?.error ? <p className="mt-1 text-caption text-primary">{state.error}</p> : null}
    </form>
  );
}