import { redirect } from "next/navigation";
import { cache } from "react";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/server/db";
import { businesses, memberships, openingBalances } from "@/server/db/schema";
import { assertWritable, getPlanState } from "@/server/modules/billing/plan";

export type Role = "owner" | "admin" | "staff";

export type ActiveBusiness = {
  id: string;
  name: string;
  role: Role;
  openingAmount: number | null;
};

/** Bisnis aktif = keanggotaan pertama user. PRD: satu bisnis aktif per pengguna di MVP. */
export async function getActiveBusiness(userId: string): Promise<ActiveBusiness | null> {
  const [row] = await db
    .select({
      id: businesses.id,
      name: businesses.name,
      role: memberships.role,
      openingAmount: openingBalances.amount,
    })
    .from(memberships)
    .innerJoin(businesses, eq(businesses.id, memberships.businessId))
    .leftJoin(openingBalances, eq(openingBalances.businessId, businesses.id))
    .where(eq(memberships.userId, userId))
    .orderBy(memberships.createdAt)
    .limit(1);
  return row ?? null;
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/masuk");
  return session.user as { id: string; email?: string | null; name?: string | null };
}

/** Setiap halaman/aksi internal harus lewat sini; businessId tidak pernah dari body request.
 *  `cache` = satu query per request walau layout dan page sama-sama memanggilnya. */
export const requireBusiness = cache(async () => {
  const user = await requireUser();
  const business = await getActiveBusiness(user.id);
  if (!business) redirect("/onboarding");
  return { user, business };
});

/** Sama seperti requireBusiness, tapi menolak saat paket Free sudah lewat masa aktif (read-only).
 *  Dipakai oleh aksi tulis; billing (bayar) dan ekspor sengaja memakai requireBusiness. */
export const requireWritableBusiness = cache(async () => {
  const { user, business } = await requireBusiness();
  assertWritable(await getPlanState(business.id));
  return { user, business };
});

export async function requireRole(businessId: string, userId: string, allowed: Role[]) {
  const [row] = await db
    .select({ role: memberships.role })
    .from(memberships)
    .where(and(eq(memberships.businessId, businessId), eq(memberships.userId, userId)))
    .limit(1);
  if (!row || !allowed.includes(row.role)) throw new Error("Tidak punya izin untuk aksi ini.");
  return row.role;
}