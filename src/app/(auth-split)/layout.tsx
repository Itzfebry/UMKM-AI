import Link from "next/link";
import { AuthShowcase } from "@/components/auth-showcase";

export default function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="grid flex-1 lg:grid-cols-[1fr_minmax(0,32rem)]">
        <AuthShowcase />

        <div className="flex flex-col bg-surface">
          {/* Mobile: aksen merah supaya tampilan tidak monoton tanpa panel gambar. */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-primary-matte to-primary lg:hidden" />

          <main className="flex flex-1 items-center justify-center px-4 py-12">
            <div className="w-full max-w-sm">
              <Link href="/" className="mb-6 flex items-center justify-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-primary text-small font-bold text-white">U</span>
                <span className="text-h3 font-bold text-primary">UMKM-AI</span>
              </Link>
              <div className="rounded-xl border border-deep/10 bg-white p-6 shadow-sm sm:p-8">{children}</div>
              <p className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-caption text-deep/70">
                © {new Date().getFullYear()} UMKM-AI · By
                <a
                  href="https://itzai.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full border border-deep/15 bg-white px-2 py-0.5 font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary hover:text-white"
                >
                  ITZ AI
                  <span className="sr-only"> (buka itzai.site di tab baru)</span>
                </a>
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
