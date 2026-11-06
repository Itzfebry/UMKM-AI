import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth-forms";
import { googleConfigured } from "@/server/modules/auth/actions";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/beranda");
  return <LoginForm google={await googleConfigured()} />;
}