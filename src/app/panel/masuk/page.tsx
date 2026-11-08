import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { ScreenIntro } from "@/components/screen-intro";
import { requireAdminSession } from "@/admin-auth";

export const metadata: Metadata = { title: "Masuk panel platform" };

export default async function PanelLoginPage() {
  const admin = await requireAdminSession();
  if (admin) redirect("/panel");

  return (
    // `isolate` membuat lapisan latar tetap di belakang isi walau kontainer induk punya warna sendiri.
    <section className="relative isolate z-10 w-full max-w-sm">
      <Image
        src="/images/umkm/pasar.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none fixed inset-0 -z-20 size-full object-cover object-center"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-[#06171D]/90 via-[#0B2229]/84 to-[#123039]/90"
      />
      <ScreenIntro className="w-full">
        <p data-intro className="mb-4 text-center text-caption font-semibold uppercase tracking-[0.2em] text-white/85">
          Panel platform UMKM-AI
        </p>
        <div data-intro className="rounded-2xl border border-white/40 bg-white p-6 shadow-2xl shadow-black/30">
          <AdminLoginForm />
          <p className="mt-4 text-caption text-deep/70">
            Bukan admin platform?{" "}
            <a href="/masuk" className="font-semibold text-primary hover:underline">
              Masuk sebagai pengguna
            </a>
          </p>
        </div>
      </ScreenIntro>
    </section>
  );
}