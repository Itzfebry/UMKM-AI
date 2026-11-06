import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Lupa kata sandi" };

export default function LupaSandiPage() {
  return <ForgotPasswordForm />;
}