import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "@/components/admin-login-form";
import { ScreenIntro } from "@/components/screen-intro";
import { requireAdminSession } from "@/admin-auth";

export const metadata: Metadata = { title: "Masuk panel platform" };

export default async function PanelLoginPage() {
  const admin = await requireAdminSession();
  if (admin) redirect("/panel");

  return (
    <section className="relative isolate z-10 w-full max-w-sm">
      <Image
        src="/images/umkm/pasar.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none fixed inset-0 -z-20 size-full object-cover object-center opacity-[0.12] grayscale"
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[#0A0F12]/95" />

      <ScreenIntro className="w-full">
        <Link
          href="/"
          data-intro
          className="mx-auto mb-6 flex w-fit items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-small font-bold text-white">U</span>
          <span className="text-h3 font-bold text-white">UMKM-AI</span>
        </Link>

        <p data-intro className="mb-4 flex items-center justify-center gap-1.5 text-caption font-semibold uppercase tracking-[0.2em] text-white/70">
          <ShieldCheck className="size-4" aria-hidden />
          Panel platform
        </p>

        <div data-intro className="rounded-2xl border border-white/10 bg-white p-6 shadow-2xl shadow-black/40">
          <AdminLoginForm />
        </div>

        <div data-intro className="mt-5 space-y-3 text-center">
          <p className="text-caption text-white/70">
            Bukan admin platform?{" "}
            <a href="/masuk" className="font-semibold text-white hover:underline">
              Masuk sebagai pengguna
            </a>
          </p>
          <p className="flex flex-wrap items-center justify-center gap-1.5 text-caption text-white/55">
            © {new Date().getFullYear()} UMKM-AI · By
            <a
              href="https://itzai.site"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2 py-0.5 font-semibold text-white transition-colors hover:border-primary/60 hover:bg-primary"
            >
              ITZ AI
              <span className="sr-only"> (buka itzai.site di tab baru)</span>
            </a>
          </p>
        </div>
      </ScreenIntro>
    </section>
  );
}
