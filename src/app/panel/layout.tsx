import Link from "next/link";
import { adminLogout } from "@/server/modules/platform/actions";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#F7F5F4]">
      <header className="border-b border-deep/10 bg-white">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-baseline gap-2">
            <Link href="/panel" className="text-h3 font-bold text-primary">
              UMKM-AI
            </Link>
            <span className="text-small text-deep/70">Panel platform</span>
          </div>
          <form action={adminLogout}>
            <button type="submit" className="min-h-11 text-small font-semibold text-deep hover:underline">
              Keluar
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}