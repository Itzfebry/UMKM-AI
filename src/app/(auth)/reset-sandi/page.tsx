import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Reset kata sandi" };

export default async function ResetSandiPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-h2 text-deep">Tautan tidak lengkap</h1>
        <p className="text-small text-deep/80">Buka tautan reset dari email Anda, atau minta tautan baru.</p>
        <Link href="/lupa-sandi" className="font-semibold text-primary hover:underline">
          Minta tautan baru
        </Link>
      </div>
    );
  }
  return <ResetPasswordForm token={token} />;
}