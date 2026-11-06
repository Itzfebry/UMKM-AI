"use client";

import { useActionState } from "react";
import { cancelSubscription, createInvoice, uploadProof, type BillingState } from "@/server/modules/billing/actions";
import { SubmitButton } from "@/components/submit-button";
import { ErrorText, btn, input } from "./ui";

function Feedback({ state }: { state: BillingState }) {
  return (
    <>
      <ErrorText>{state?.error}</ErrorText>
      {state?.ok && state.info ? (
        <p role="status" className="rounded-lg bg-accent/25 px-3 py-2 text-small text-deep">
          {state.info}
        </p>
      ) : null}
    </>
  );
}

export function CreateInvoiceForm({ amountLabel, hasActiveInvoice }: { amountLabel: string; hasActiveInvoice: boolean }) {
  const [state, action] = useActionState<BillingState, FormData>(createInvoice, undefined);

  return (
    <form action={action} className="flex flex-col gap-2">
      <Feedback state={state} />
      <p className="text-small text-deep/80">Paket Pro {amountLabel} per bulan, pembayaran transfer bank atau QRIS.</p>
      <div>
        <SubmitButton pendingLabel="Membuat invoice...">{hasActiveInvoice ? "Buat invoice perpanjangan" : "Buat invoice Pro"}</SubmitButton>
      </div>
    </form>
  );
}

export function UploadProofForm({ invoiceId }: { invoiceId: string }) {
  const [state, action] = useActionState<BillingState, FormData>(uploadProof, undefined);

  return (
    <form action={action} className="mt-2 flex flex-col gap-2 rounded-lg border border-deep/10 p-3">
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <Feedback state={state} />
      <label className="text-caption font-semibold text-deep" htmlFor={`note-${invoiceId}`}>
        Keterangan pembayaran
        <input
          id={`note-${invoiceId}`}
          name="note"
          required
          minLength={10}
          placeholder="Transfer 06 Nov 08.15 dari BCA a/n Warung Uji"
          className={`${input} mt-1 min-h-9 text-small`}
        />
      </label>
      <label className="text-caption font-semibold text-deep" htmlFor={`file-${invoiceId}`}>
        Berkas bukti (opsional, maks 5 MB)
        <input id={`file-${invoiceId}`} name="file" type="file" accept="image/*,application/pdf" className={`${input} mt-1 min-h-9 py-1 text-small`} />
      </label>
      <div>
        <SubmitButton pendingLabel="Mengunggah...">Kirim bukti</SubmitButton>
      </div>
    </form>
  );
}

export function CancelSubscriptionForm({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <form action={cancelSubscription} className="mt-2">
      <button type="submit" className={btn.secondary}>
        Batalkan perpanjangan otomatis
      </button>
      <p className="mt-1 text-caption text-deep/70">Akses Pro tetap berlaku sampai akhir periode berbayar.</p>
    </form>
  );
}