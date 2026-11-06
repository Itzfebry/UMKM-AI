"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/server/db";
import { businesses, categories, memberships, openingBalances } from "@/server/db/schema";
import { requireUser } from "@/server/lib/access";

const DEFAULT_CATEGORIES = {
  operational_income: ["Penjualan", "Pendapatan lain"],
  operational_expense: ["Bahan baku", "Gaji", "Sewa", "Listrik & air", "Transportasi", "Operasional lain"],
  capital_in: ["Setoran modal"],
  owner_draw: ["Prive"],
  loan_in: ["Pinjaman masuk"],
  loan_repayment: ["Angsuran pinjaman"],
} as const;

const onboardingSchema = z.object({
  businessName: z.string().trim().min(2, "Nama usaha minimal 2 karakter.").max(100),
  openingAmount: z.coerce.number().int("Saldo awal harus bilangan bulat rupiah.").min(0),
  asOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal acuan tidak valid."),
  isEstimate: z.coerce.boolean().default(false),
});

export type OnboardingState = { error?: string } | undefined;

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const user = await requireUser();
  const parsed = onboardingSchema.safeParse({
    businessName: formData.get("businessName"),
    openingAmount: formData.get("openingAmount"),
    asOf: formData.get("asOf"),
    isEstimate: formData.get("isEstimate") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { businessName, openingAmount, asOf, isEstimate } = parsed.data;

  // Satu transaksi: bisnis, keanggotaan owner, saldo awal, kategori default.
  await db.transaction(async (tx) => {
    const [business] = await tx
      .insert(businesses)
      .values({ name: businessName, createdBy: user.id })
      .returning({ id: businesses.id });

    await tx.insert(memberships).values({ businessId: business.id, userId: user.id, role: "owner" });
    await tx.insert(openingBalances).values({ businessId: business.id, amount: openingAmount, asOf, isEstimate });
    await tx.insert(categories).values(
      Object.entries(DEFAULT_CATEGORIES).flatMap(([type, names]) =>
        names.map((name) => ({ businessId: business.id, name, type: type as keyof typeof DEFAULT_CATEGORIES })),
      ),
    );
  });

  redirect("/beranda");
}