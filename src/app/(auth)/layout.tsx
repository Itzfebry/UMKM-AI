import Link from "next/link";
import { AuthAurora } from "@/components/auth-aurora";
import { ScreenIntro } from "@/components/screen-intro";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#071318] px-4 py-10">
      <AuthAurora />

      {/* Tanda air monogram raksasa: kedalaman latar tanpa menambah gambar. */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none text-[26vw] font-bold leading-none tracking-tighter text-white/[0.035]"
      >
        AI
      </span>

      <ScreenIntro className="flex w-full flex-col items-center">
        <Link
          href="/"
          data-intro
          className="group mb-8 inline-flex items-center gap-2.5 text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-white/10 text-small font-bold ring-1 ring-white/20 backdrop-blur transition group-hover:bg-white/15">
            U
          </span>
          <span className="text-h3 font-bold tracking-tight">UMKM-AI</span>
        </Link>

        <div
          data-intro
          className="price-glow relative w-full max-w-md rounded-[28px] border border-white/15 bg-white/[0.97] p-6 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-8"
        >
          {children}
        </div>

        <p data-intro className="mt-6 max-w-sm text-center text-small text-white/70">
          Manajemen kas usaha dengan AI untuk UMKM
        </p>
      </ScreenIntro>
    </main>
  );
}