import Image from "next/image";
import Link from "next/link";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#1b262d]">
      <main className="relative flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 pt-10 pb-28">
        {/* Foto latar UMKM (opacity 6%) di atas canvas gelap. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Image
            src="/images/umkm/warung.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.06]"
          />
        </div>

        <div className="relative w-full max-w-lg">
          <Link href="/" className="mb-6 flex items-center justify-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-small font-bold text-white">U</span>
            <span className="text-h3 font-bold text-primary">UMKM-AI</span>
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
