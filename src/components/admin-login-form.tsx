"use client";

import { useActionState, useState } from "react";
import { adminLogin, type AdminLoginState } from "@/server/modules/platform/actions";
import { SubmitButton } from "@/components/submit-button";
import { ErrorText, input } from "@/components/ui";

export function AdminLoginForm() {
  const [state, action] = useActionState<AdminLoginState, FormData>(adminLogin, undefined);
  // React 19 mereset form setelah aksi: email dikendalikan agar tidak hilang saat login gagal.
  const [email, setEmail] = useState("");

  return (
    <form action={action} className="flex flex-col gap-3">
      <h1 className="text-h2 text-deep">Masuk panel platform</h1>
      <p className="text-caption text-deep/90">Halaman ini hanya untuk admin platform UMKM-AI. Sesi terpisah dari akun pengguna biasa.</p>
      <ErrorText>{state?.error}</ErrorText>
      <label className="text-small font-semibold text-deep" htmlFor="admin-email">
        Email admin
        <input
          id="admin-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={`${input} mt-1`}
        />
      </label>
      <label className="text-small font-semibold text-deep" htmlFor="admin-password">
        Kata sandi
        <input id="admin-password" name="password" type="password" required minLength={8} autoComplete="current-password" className={`${input} mt-1`} />
      </label>
      <label className="text-small font-semibold text-deep" htmlFor="admin-code">
        Kode MFA (wajib bila sudah aktif)
        <input id="admin-code" name="code" inputMode="numeric" pattern="\d{6}" autoComplete="one-time-code" className={`${input} mt-1 tabular`} />
      </label>
      <SubmitButton pendingLabel="Memeriksa...">Masuk</SubmitButton>
    </form>
  );
}