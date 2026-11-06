import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getActiveBusiness } from "@/server/lib/access";
import { OnboardingForm } from "@/components/onboarding-form";

export const metadata: Metadata = { title: "Siapkan usaha" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/masuk");
  const business = await getActiveBusiness(session.user.id);
  if (business) redirect("/beranda");

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-10">
      <h1 className="text-h1 text-deep">Siapkan usaha Anda</h1>
      <p className="mt-1 mb-6 text-small text-deep/80">
        Dua langkah singkat: profil usaha dan saldo kas saat ini. Saldo awal bukan pendapatan.
      </p>
      <div className="rounded-xl border border-deep/10 bg-white p-5 shadow-sm">
        <OnboardingForm />
      </div>
    </main>
  );
}