import Link from "next/link";
import { AmbientCanvas } from "@/components/ambient-canvas";
import { ScreenIntro } from "@/components/screen-intro";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      {/* background1.jpg sebagai latar; overlay menjaga kontras form */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[url('/images/background1.jpg')] bg-cover bg-center" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-surface/80 backdrop-blur-[2px]" />
      <AmbientCanvas className="pointer-events-none fixed inset-0 -z-10 size-full opacity-70" density={700} color="#2C687B" />

      <ScreenIntro className="flex w-full flex-col items-center">
        <Link href="/" data-intro className="mb-6 text-h2 font-bold text-primary">
          UMKM-AI
        </Link>
        <div data-intro className="w-full max-w-sm rounded-2xl border border-white/60 bg-white p-6 shadow-xl shadow-deep/10">
          {children}
        </div>
        <p data-intro className="mt-6 max-w-sm text-center text-caption text-deep">
          Bukan sekadar mencatat keuangan. Pahami bisnis di balik angkanya.
        </p>
      </ScreenIntro>
    </main>
  );
}