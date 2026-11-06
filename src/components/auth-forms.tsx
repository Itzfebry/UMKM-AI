"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, register, googleSignIn, requestPasswordReset, resetPassword, resendVerificationEmail, type FormState } from "@/server/modules/auth/actions";
import { SubmitButton } from "@/components/submit-button";
import { ErrorText, input } from "@/components/ui";

export function LoginForm({ google }: { google: boolean }) {
  const [state, action] = useActionState<FormState, FormData>(login, undefined);
  // Email dikendalikan React: React 19 mereset form setelah aksi, jadi tanpa ini email ikut kosong saat login gagal.
  const [email, setEmail] = useState("");
  return (
    <form action={action} className="flex flex-col gap-3">
      <h1 className="text-h2 text-deep">Masuk</h1>
      <ErrorText>{state?.error}</ErrorText>
      <label className="text-small font-semibold text-deep" htmlFor="email">
        Email
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={`${input} mt-1`}
        />
      </label>
      <label className="text-small font-semibold text-deep" htmlFor="password">
        Kata sandi
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          className={`${input} mt-1`}
        />
      </label>
      <SubmitButton pendingLabel="Memeriksa...">Masuk</SubmitButton>
      <p className="text-center text-small">
        <Link href="/lupa-sandi" className="font-semibold text-primary hover:underline">
          Lupa kata sandi?
        </Link>
      </p>
      {google ? (
        <>
          <div className="my-1 h-px bg-deep/10" />
          <form action={googleSignIn}>
            <button type="submit" className="w-full text-center text-small font-semibold text-deep hover:underline">
              Masuk dengan Google
            </button>
          </form>
        </>
      ) : null}
      <p className="text-center text-small text-deep/80">
        Belum punya akun?{" "}
        <Link href="/daftar" className="font-semibold text-primary hover:underline">
          Daftar
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState<FormState, FormData>(register, undefined);
  // Sama seperti form masuk: React 19 mereset form setelah aksi, jadi nama dan email dijaga di state.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  return (
    <form action={action} className="flex flex-col gap-3">
      <h1 className="text-h2 text-deep">Buat akun</h1>
      <ErrorText>{state?.error}</ErrorText>
      <label className="text-small font-semibold text-deep" htmlFor="name">
        Nama
        <input
          id="name"
          name="name"
          required
          minLength={2}
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={`${input} mt-1`}
        />
      </label>
      <label className="text-small font-semibold text-deep" htmlFor="email">
        Email
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={`${input} mt-1`}
        />
      </label>
      <label className="text-small font-semibold text-deep" htmlFor="password">
        Kata sandi (min. 8 karakter)
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={`${input} mt-1`}
        />
      </label>
      <SubmitButton pendingLabel="Membuat...">Daftar</SubmitButton>
      <p className="text-center text-small text-deep/80">
        Sudah punya akun?{" "}
        <Link href="/masuk" className="font-semibold text-primary hover:underline">
          Masuk
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(requestPasswordReset, undefined);
  const [email, setEmail] = useState("");

  return (
    <form action={action} className="flex flex-col gap-3">
      <h1 className="text-h2 text-deep">Lupa kata sandi</h1>
      <ErrorText>{state?.error}</ErrorText>
      {state?.ok && state.info ? <p role="status" className="rounded-lg bg-accent/25 px-3 py-2 text-small text-deep">{state.info}</p> : null}
      <label className="text-small font-semibold text-deep" htmlFor="forgot-email">
        Email akun
        <input
          id="forgot-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={`${input} mt-1`}
        />
      </label>
      <SubmitButton pendingLabel="Mengirim...">Kirim tautan reset</SubmitButton>
      <p className="text-center text-small">
        <Link href="/masuk" className="font-semibold text-primary hover:underline">
          Kembali ke halaman masuk
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState<FormState, FormData>(resetPassword, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <h1 className="text-h2 text-deep">Kata sandi baru</h1>
      <input type="hidden" name="token" value={token} />
      <ErrorText>{state?.error}</ErrorText>
      {state?.ok && state.info ? <p role="status" className="rounded-lg bg-accent/25 px-3 py-2 text-small text-deep">{state.info}</p> : null}
      <label className="text-small font-semibold text-deep" htmlFor="new-password">
        Kata sandi baru (minimal 8 karakter)
        <input id="new-password" name="password" type="password" required minLength={8} autoComplete="new-password" className={`${input} mt-1`} />
      </label>
      <SubmitButton pendingLabel="Menyimpan...">Simpan kata sandi</SubmitButton>
      <p className="text-center text-small">
        <Link href="/masuk" className="font-semibold text-primary hover:underline">
          Masuk sekarang
        </Link>
      </p>
    </form>
  );
}

export function ResendVerificationForm() {
  const [state, action] = useActionState<FormState, FormData>(resendVerificationEmail, undefined);

  return (
    <form action={action} className="mt-3 flex flex-col gap-2">
      <ErrorText>{state?.error}</ErrorText>
      {state?.ok && state.info ? <p role="status" className="rounded-lg bg-accent/25 px-3 py-2 text-small text-deep">{state.info}</p> : null}
      <SubmitButton pendingLabel="Mengirim...">Kirim ulang email verifikasi</SubmitButton>
    </form>
  );
}