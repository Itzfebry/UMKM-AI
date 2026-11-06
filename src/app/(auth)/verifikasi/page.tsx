import type { Metadata } from "next";
import Link from "next/link";
import { ResendVerificationForm } from "@/components/auth-forms";
import { verifyEmailToken } from "@/server/modules/auth/actions";

export const metadata: Metadata = { title: "Verifikasi email" };

export default async function VerifikasiPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const verified = token ? await verifyEmailToken(token) : false;

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-h2 text-deep">{verified ? "Email terverifikasi" : "Verifikasi email"}</h1>
      <p className="text-small text-deep/80">
        {verified
          ? "Terima kasih. Alamat email Anda sudah dikonfirmasi."
          : "Tautan verifikasi tidak valid, sudah dipakai, atau kedaluwarsa. Masuk lalu minta kirim ulang."}
      </p>
      <ResendVerificationForm />
      <p className="text-center text-small">
        <Link href="/beranda" className="font-semibold text-primary hover:underline">
          Buka beranda
        </Link>
      </p>
    </div>
  );
}