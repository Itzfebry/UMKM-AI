"use client";

import { useActionState } from "react";
import { disableMfa, enableMfa, startMfaEnrollment, type AdminState } from "@/server/modules/platform/actions";
import { SubmitButton } from "@/components/submit-button";
import { ErrorText, input } from "./ui";

function Feedback({ state }: { state: AdminState }) {
  return (
    <>
      <ErrorText>{state?.error}</ErrorText>
      {state?.ok && state.info ? <p className="rounded-lg bg-accent/25 px-3 py-2 text-small text-deep">{state.info}</p> : null}
    </>
  );
}

export function AdminMfaPanel({ enabled }: { enabled: boolean }) {
  const [startState, startAction] = useActionState<AdminState, FormData>(startMfaEnrollment, undefined);
  const [enrollState, enrollAction] = useActionState<AdminState, FormData>(enableMfa, undefined);
  const [disableState, disableAction] = useActionState<AdminState, FormData>(disableMfa, undefined);
  const otpauth = startState?.otpauth;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-small text-deep/80">
        MFA wajib untuk admin platform. {enabled ? "Status: aktif." : "Status: belum aktif."}
      </p>

      {otpauth ? (
        <p className="break-all rounded-lg bg-surface p-2 text-caption text-deep/80">
          Tambahkan ke aplikasi authenticator: <code>{otpauth}</code>
        </p>
      ) : (
        <form action={startAction} className="flex flex-col gap-2">
          <Feedback state={startState} />
          <div>
            <SubmitButton pendingLabel="Menyiapkan..." variant="secondary">
              Mulai pendaftaran MFA
            </SubmitButton>
          </div>
        </form>
      )}

      <form action={enrollAction} className="flex flex-col gap-2">
        <Feedback state={enrollState} />
        <label className="text-small font-semibold text-deep" htmlFor="admin-mfa-code">
          Kode 6 digit dari authenticator
          <input id="admin-mfa-code" name="code" inputMode="numeric" pattern="\d{6}" required className={`${input} mt-1 tabular`} />
        </label>
        <div>
          <SubmitButton pendingLabel="Mengaktifkan...">Aktifkan MFA</SubmitButton>
        </div>
      </form>

      {enabled ? (
        <form action={disableAction} className="flex flex-col gap-2">
          <Feedback state={disableState} />
          <label className="text-small font-semibold text-deep" htmlFor="admin-mfa-password">
            Kata sandi untuk mematikan MFA
            <input id="admin-mfa-password" name="password" type="password" required className={`${input} mt-1`} />
          </label>
          <div>
            <SubmitButton pendingLabel="Mematikan...">Matikan MFA</SubmitButton>
          </div>
        </form>
      ) : null}
    </div>
  );
}