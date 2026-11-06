"use client";

import { useActionState } from "react";
import { rejectInvoice, verifyInvoice, type BillingState } from "@/server/modules/billing/actions";
import { SubmitButton } from "@/components/submit-button";
import { ErrorText, input } from "./ui";

export function VerifyInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const [state, action] = useActionState<BillingState, FormData>(verifyInvoice, undefined);

  return (
    <form action={action} className="flex flex-col gap-1">
      <input type="hidden" name="id" value={invoiceId} />
      <SubmitButton pendingLabel="Memverifikasi...">Verifikasi & aktifkan Pro</SubmitButton>
      <ErrorText>{state?.error}</ErrorText>
      {state?.ok && state.info ? <p className="text-caption text-deep/80">{state.info}</p> : null}
    </form>
  );
}

export function RejectInvoiceForm({ invoiceId }: { invoiceId: string }) {
  const [state, action] = useActionState<BillingState, FormData>(rejectInvoice, undefined);

  return (
    <details className="relative">
      <summary className="min-h-9 cursor-pointer list-none rounded-lg border border-deep/25 px-3 py-2 text-caption font-semibold text-deep">
        Tolak
      </summary>
      <form action={action} className="mt-2 flex w-64 flex-col gap-2 rounded-lg border border-deep/15 bg-white p-3 shadow-lg">
        <input type="hidden" name="id" value={invoiceId} />
        <label className="text-caption font-semibold text-deep" htmlFor={`reject-${invoiceId}`}>
          Alasan penolakan
        </label>
        <input id={`reject-${invoiceId}`} name="reason" required minLength={5} className={`${input} min-h-9 text-small`} />
        <ErrorText>{state?.error}</ErrorText>
        <SubmitButton pendingLabel="Menolak...">Kirim penolakan</SubmitButton>
      </form>
    </details>
  );
}