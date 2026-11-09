import Link from "next/link";
import { requireBusiness } from "@/server/lib/access";
import { logout } from "@/server/modules/auth/actions";
import { AppNav } from "@/components/app-nav";
import { PlanBadge } from "@/components/plan-badge";
import { getPlanState } from "@/server/modules/billing/plan";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { business } = await requireBusiness();
  const plan = await getPlanState(business.id);

  return (
    <div className="min-h-dvh bg-background lg:pl-16">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-16 flex-col items-center border-r border-white/10 bg-deep py-4 lg:flex">
        <Link href="/beranda" className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary text-h3 font-extrabold text-surface shadow-sm" title="UMKM-AI">
          U
        </Link>
        <AppNav variant="rail" logout={logout} />
      </aside>

      <div className="mx-auto w-full max-w-[1600px] px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-3 sm:px-6 lg:px-8 lg:pb-8">
        <header className="mb-4 flex items-center justify-between gap-3 lg:hidden">
          <Link href="/beranda" className="text-h3 font-bold text-primary">
            UMKM-AI
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2">
              <span className="max-w-32 truncate text-small text-deep/80">{business.name}</span>
              <PlanBadge plan={plan.plan} compact />
            </span>
            <form action={logout}>
              <button type="submit" className="min-h-11 text-small font-semibold text-deep hover:underline">
                Keluar
              </button>
            </form>
          </div>
        </header>
        <main>{children}</main>
      </div>

      <AppNav variant="bottom" logout={logout} />
    </div>
  );
}