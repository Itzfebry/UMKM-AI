import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LandingPage } from "@/components/landing/landing-page";
import { getActiveBusiness } from "@/server/lib/access";

export default async function Home() {
  const session = await auth();
  // Pengunjung belum login melihat landing page; yang sudah login langsung masuk ke aplikasi.
  if (!session?.user?.id) return <LandingPage />;
  const business = await getActiveBusiness(session.user.id);
  redirect(business ? "/beranda" : "/onboarding");
}
