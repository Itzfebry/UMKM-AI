"use client";

import { useActionState } from "react";
import { completeOnboarding, type OnboardingState } from "@/server/modules/business/actions";
import { SubmitButton } from "@/components/submit-button";
import { ErrorText, input } from "@/components/ui";

const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());

export function OnboardingForm() {
  const [state, action] = useActionState<OnboardingState, FormData>(completeOnboarding, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <ErrorText>{state?.error}</ErrorText>
      <label className="text-small font-semibold text-deep" htmlFor="businessName">
        Nama usaha
        <input
          id="businessName"
          name="businessName"
          required
          minLength={2}
          placeholder="Contoh: Warung Bu Sari"
          className={`${input} mt-1`}
        />
      </label>
      <label className="text-small font-semibold text-deep" htmlFor="openingAmount">
        Saldo kas saat ini (Rp)
        <input
          id="openingAmount"
          name="openingAmount"
          inputMode="numeric"
          pattern="\d*"
          required
          defaultValue={0}
          className={`${input} mt-1 tabular`}
        />
        <span className="mt-1 block text-caption font-normal text-deep/75">
          Isi perkiraan uang tunai + saldo rekening milik usaha.
        </span>
      </label>
      <label className="text-small font-semibold text-deep" htmlFor="asOf">
        Per tanggal
        <input id="asOf" name="asOf" type="date" required defaultValue={today} className={`${input} mt-1`} />
      </label>
      <label className="flex items-center gap-2 text-small text-deep">
        <input type="checkbox" name="isEstimate" className="size-4 accent-[#DB1A1A]" />
        Angka ini masih perkiraan
      </label>
      <SubmitButton pendingLabel="Menyiapkan…">Mulai catat transaksi</SubmitButton>
    </form>
  );
}