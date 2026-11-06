"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { auditEvents, businesses } from "@/server/db/schema";
import { requireBusiness, requireRole } from "@/server/lib/access";
import { createSignedUrl, storageConfigured, uploadPrivateFile } from "@/server/lib/storage";

export type BrandingState = { error?: string; ok?: boolean; info?: string } | undefined;

export type Branding = {
  logoUrl: string | null;
  balanceUrl: string | null;
};

const MAX_LOGO = 2_000_000;
const MAX_BALANCE = 5_000_000;

/** URL gambar (signed) untuk logo usaha dan latar kartu saldo. Null bila belum diunggah. */
export async function getBranding(businessId: string): Promise<Branding> {
  const [row] = await db
    .select({ logoPath: businesses.logoPath, balanceImagePath: businesses.balanceImagePath })
    .from(businesses)
    .where(eq(businesses.id, businessId))
    .limit(1);
  const [logoUrl, balanceUrl] = await Promise.all([
    createSignedUrl(row?.logoPath ?? null),
    createSignedUrl(row?.balanceImagePath ?? null),
  ]);
  return { logoUrl, balanceUrl };
}

async function saveImage(
  field: "logoPath" | "balanceImagePath",
  maxBytes: number,
  formData: FormData,
): Promise<BrandingState> {
  const { user, business } = await requireBusiness();
  try {
    await requireRole(business.id, user.id, ["owner", "admin"]);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Tidak punya izin." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Pilih berkas gambar dulu." };
  if (!file.type.startsWith("image/")) return { error: "Berkas harus berupa gambar (PNG, JPG, atau WEBP)." };
  if (file.size > maxBytes) return { error: `Ukuran gambar maksimal ${Math.round(maxBytes / 1_000_000)} MB.` };
  if (!storageConfigured()) {
    return { error: "Storage privat belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY." };
  }

  const path = `branding/${business.id}/${field}`;
  try {
    await uploadPrivateFile(path, await file.arrayBuffer(), file.type);
    await db
      .update(businesses)
      .set(field === "logoPath" ? { logoPath: path } : { balanceImagePath: path })
      .where(eq(businesses.id, business.id));
    await db.insert(auditEvents).values({
      businessId: business.id,
      actorId: user.id,
      type: "security",
      metadata: { action: "update_branding", field, size: file.size },
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengunggah gambar." };
  }

  revalidatePath("/beranda");
  revalidatePath("/pengaturan");
  return { ok: true, info: "Gambar tersimpan." };
}

/** Unggah logo usaha (tampil di samping judul pada beranda). */
export async function uploadBusinessLogo(_prev: BrandingState, formData: FormData): Promise<BrandingState> {
  return saveImage("logoPath", MAX_LOGO, formData);
}

/** Unggah gambar latar kartu saldo (diberi gradasi hitam agar angka saldo tetap terbaca). */
export async function uploadBalanceImage(_prev: BrandingState, formData: FormData): Promise<BrandingState> {
  return saveImage("balanceImagePath", MAX_BALANCE, formData);
}