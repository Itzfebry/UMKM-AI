"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login, register, googleSignIn, requestPasswordReset, resetPassword, resendVerificationEmail, type FormState } from "@/server/modules/auth/actions";
import { SubmitButton } from "@/components/submit-button";
import { btn, ErrorText, input } from "@/components/ui";

/** Logo Google resmi (empat warna) untuk tombol masuk. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.86c2.26-2.09 3.56-5.17 3.56-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09Z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

export function LoginForm({ google }: { google: boolean }) {
  const [state, action] = useActionState<FormState, FormData>(login, undefined);
  // Email dikendalikan React: React 19 mereset form setelah aksi, jadi tanpa ini email ikut kosong saat login gagal.
  const [email, setEmail] = useState("");
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-h2 text-deep">Masuk</h1>

      {google ? (
        <>
          <form action={googleSignIn}>
            <button type="submit" className={`${btn.secondary} w-full`}>
              <GoogleMark />
              Masuk dengan Google
            </button>
          </form>
          <div className="flex items-center gap-3 text-caption uppercase tracking-[0.16em] text-deep/50">
            <span className="h-px flex-1 bg-deep/10" />
            atau
            <span className="h-px flex-1 bg-deep/10" />
          </div>
        </>
      ) : null}

      <form action={action} className="flex flex-col gap-3">
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
      </form>

      <p className="text-center text-small text-deep/80">
        Belum punya akun?{" "}
        <Link href="/daftar" className="font-semibold text-primary hover:underline">
          Daftar
        </Link>
      </p>
    </div>
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