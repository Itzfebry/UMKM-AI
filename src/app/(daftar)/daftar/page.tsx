import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Daftar" };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/beranda");
  return <RegisterForm />;
}
