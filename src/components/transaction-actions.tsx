"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, RotateCcw, Trash2 } from "lucide-react";
import {
  restoreTransaction,
  softDeleteTransaction,
  type ActionState,
} from "@/server/modules/ledger/actions";
import type { TransactionType } from "@/server/modules/ledger/types";
import { TransactionForm, type TransactionDraft } from "./transaction-form";
import { input } from "./ui";

export function DeleteTransactionButton({ id }: { id: string }) {
  const [state, action] = useActionState<ActionState, FormData>(softDeleteTransaction, undefined);

  return (
    <details className="relative">
      <summary
        className="flex size-9 cursor-pointer list-none items-center justify-center rounded-lg text-deep/50 hover:bg-primary/10 hover:text-primary"
        aria-label="Hapus transaksi"
      >
        <Trash2 className="size-4" aria-hidden />
      </summary>
      <form action={action} className="absolute right-0 z-20 mt-1 w-56 rounded-lg border border-deep/15 bg-white p-3 shadow-lg">
        <input type="hidden" name="id" value={id} />
        <label className="text-caption font-semibold text-deep" htmlFor={`reason-${id}`}>
          Alasan hapus
        </label>
        <input
          id={`reason-${id}`}
          name="reason"
          required
          minLength={3}
          placeholder="Salah input"
          className={`${input} mt-1 min-h-9 text-small`}
        />
        {state?.error ? <p className="mt-1 text-caption text-primary">{state.error}</p> : null}
        <button
          type="submit"
          className="mt-2 min-h-9 w-full rounded-lg bg-primary text-small font-semibold text-white"
        >
          Hapus transaksi
        </button>
      </form>
    </details>
  );
}

export function EditTransactionButton({
  transaction,
  categories,
}: {
  transaction: TransactionDraft;
  categories: { id: string; name: string; type: TransactionType }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)} className="relative">
      <summary
        className="flex size-9 cursor-pointer list-none items-center justify-center rounded-lg text-deep/50 hover:bg-deep/5 hover:text-deep"
        aria-label="Ubah transaksi"
      >
        <Pencil className="size-4" aria-hidden />
      </summary>
      <div className="absolute right-0 z-20 mt-1 w-80 max-w-[85vw] rounded-lg border border-deep/15 bg-white p-3 shadow-lg">
        <TransactionForm categories={categories} initial={transaction} onDone={() => setOpen(false)} />
      </div>
    </details>
  );
}

export function RestoreTransactionButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  const router = useRouter();

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await restoreTransaction(id);
            if (result?.error) setError(result.error);
            else router.refresh();
          })
        }
        className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-deep/25 px-2 text-caption font-semibold text-deep hover:border-deep/50 disabled:opacity-60"
      >
        <RotateCcw className="size-3.5" aria-hidden />
        {pending ? "Memulihkan..." : "Pulihkan"}
      </button>
      {error ? <p className="mt-1 text-caption text-primary">{error}</p> : null}
    </div>
  );
}