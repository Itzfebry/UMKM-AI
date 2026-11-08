import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { AmbientCanvas } from "@/components/ambient-canvas";
import { ScreenIntro } from "@/components/screen-intro";
import { requireAdminSession } from "@/admin-auth";

export const metadata: Metadata = { title: "Masuk panel platform" };

export default async function PanelLoginPage() {
  const admin = await requireAdminSession();
  if (admin) redirect("/panel");

  return (
    <section className="relative w-full max-w-sm">
      <AmbientCanvas className="pointer-events-none fixed inset-0 -z-10 size-full opacity-60" density={600} color="#2C687B" />
      <ScreenIntro className="w-full">
        <p data-intro className="mb-4 text-center text-caption font-semibold uppercase tracking-[0.2em] text-deep/70">
          Panel platform UMKM-AI
        </p>
        <div data-intro className="rounded-2xl border border-deep/15 bg-white p-6 shadow-lg shadow-deep/10">
          <AdminLoginForm />
          <p className="mt-4 text-caption text-deep/60">
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