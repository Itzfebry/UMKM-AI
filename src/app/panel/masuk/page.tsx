import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { requireAdminSession } from "@/admin-auth";

export const metadata: Metadata = { title: "Masuk panel platform" };

export default async function PanelLoginPage() {
  const admin = await requireAdminSession();
  if (admin) redirect("/panel");

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-deep/10 bg-white p-6 shadow-sm">
      <AdminLoginForm />
      <p className="mt-4 text-caption text-deep/60">
        Bukan admin platform? <a href="/masuk" className="font-semibold text-primary hover:underline">Masuk sebagai pengguna</a>
      </p>
    </div>
  );
}