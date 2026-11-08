import { eq } from "drizzle-orm";
import { PanelMobileNav, PanelSidebar } from "@/components/panel-nav";
import { requireAdminSession } from "@/admin-auth";
import { db } from "@/server/db";
import { platformAdmins } from "@/server/db/schema";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminSession();

  // Halaman masuk panel tidak memakai kerangka sidebar.
  if (!admin) {
    return <div className="grid min-h-dvh place-items-center bg-[#F7F5F4] px-4 py-10">{children}</div>;
  }

  const [row] = await db.select({ mfaEnabled: platformAdmins.mfaEnabled }).from(platformAdmins).where(eq(platformAdmins.userId, admin.id)).limit(1);

  return (
    <div className="min-h-dvh bg-[#F7F5F4] lg:flex">
      <PanelSidebar email={admin.email ?? null} mfaEnabled={Boolean(row?.mfaEnabled)} />
      <div className="min-w-0 flex-1">
        <PanelMobileNav />
        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}