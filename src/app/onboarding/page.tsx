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
    <>
      <h1 className="text-center text-h1 text-white">Siapkan usaha Anda</h1>
      <p className="mb-6 mt-1 text-center text-small text-white/70">
        Dua langkah singkat: profil usaha dan saldo kas saat ini. Saldo awal bukan pendapatan.
      </p>
      <div className="rounded-xl border border-deep/10 bg-white p-6 shadow-sm sm:p-8">
        <OnboardingForm />
      </div>
    </>
  );
}
