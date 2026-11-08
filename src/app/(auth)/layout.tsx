import Image from "next/image";
import Link from "next/link";
import { ScreenIntro } from "@/components/screen-intro";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      {/* Foto UMKM sebagai latar. Lapisan gelap dua tingkat menjaga kontras teks putih dan
          membuat kartu form tetap jadi fokus. */}
      <Image
        src="/images/umkm/jajanan.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-20 size-full object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-[#06171D]/88 via-[#0B2229]/80 to-[#123039]/88" />

            <ScreenIntro className="flex w-full flex-col items-center">
        <Link href="/" data-intro className="mb-6 text-h2 font-bold text-white">
          UMKM-AI
        </Link>
        <div data-intro className="w-full max-w-sm rounded-2xl border border-white/40 bg-white p-6 shadow-2xl shadow-black/30">
          {children}
        </div>
        <p data-intro className="mt-6 max-w-sm text-center text-small text-white/90">
                  Manajemen kas usaha dengan AI untuk UMKM
                </p>
      </ScreenIntro>
    </main>
  );
}