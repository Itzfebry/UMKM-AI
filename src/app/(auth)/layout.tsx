import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-6 flex items-center justify-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-small font-bold text-white">
              U
            </span>
            <span className="text-h3 font-bold text-primary">UMKM-AI</span>
          </Link>
          <div className="rounded-xl border border-deep/10 bg-white p-6 shadow-sm sm:p-8">{children}</div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
