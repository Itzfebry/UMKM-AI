import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";

export default function DaftarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-ink">
      <main className="relative flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-12">
        {/* Foto latar UMKM (opacity 6%, desaturasi) di atas canvas gelap. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Image
            src="/images/umkm/warung.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-[0.06] grayscale"
          />
        </div>

        <div className="relative w-full max-w-sm">
          <Link href="/" className="mb-6 flex items-center justify-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-small font-bold text-white">U</span>
            <span className="text-h3 font-bold text-primary">UMKM-AI</span>
          </Link>
          <div className="rounded-xl border border-deep/10 bg-white p-6 shadow-sm sm:p-8">{children}</div>
        </div>
      </main>

      <SiteFooter compact />
    </div>
  );
}
