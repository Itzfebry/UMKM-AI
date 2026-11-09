"use server";

import { randomUUID } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { and, count, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { auditEvents, invitations, memberships, users } from "@/server/db/schema";
import { requireRole, requireUser, requireWritableBusiness } from "@/server/lib/access";
import { appUrl, createNotification, sendEmail } from "@/server/lib/email";
import { getPlanState, PLAN_LABEL } from "@/server/modules/billing/plan";

export type MemberState = { error?: string; ok?: boolean; info?: string } | undefined;

const INVITE_DAYS = 7;

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email tidak valid."),
  role: z.enum(["admin", "staff"]),
});

async function activeMemberCount(businessId: string) {
  const [row] = await db.select({ total: count() }).from(memberships).where(eq(memberships.businessId, businessId));
  return Number(row?.total ?? 0);
}

export async function inviteMember(_prev: MemberState, formData: FormData): Promise<MemberState> {
  const { user, business } = await requireWritableBusiness();
  try {
    await requireRole(business.id, user.id, ["owner", "admin"]);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Tidak punya izin." };
  }

  const parsed = inviteSchema.safeParse({ email: formData.get("email"), role: formData.get("role") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const plan = await getPlanState(business.id);
  const [active, pending] = await Promise.all([
    activeMemberCount(business.id),
    db
      .select({ total: count() })
      .from(invitations)
      .where(and(eq(invitations.businessId, business.id), isNull(invitations.acceptedAt), isNull(invitations.revokedAt))),
  ]);
  const usedSlots = active + Number(pending[0]?.total ?? 0);
  if (usedSlots >= plan.limits.members) {
    return {
      error: `Paket ${PLAN_LABEL[plan.plan]} maksimal ${plan.limits.members} anggota aktif. Upgrade untuk menambah anggota.`,
    };
  }

  const token = randomUUID().replace(/-/g, "");
  await db.insert(invitations).values({
    businessId: business.id,
    email: parsed.data.email,
    role: parsed.data.role,
    token,
    expiresAt: new Date(Date.now() + INVITE_DAYS * 86_400_000),
    invitedBy: user.id,
  });

  const [invitedUser] = await db.select({ id: users.id }).from(users).where(sql`lower(${users.email}) = ${parsed.data.email}`).limit(1);
  if (invitedUser) {
    await createNotification({
      userId: invitedUser.id,
      businessId: business.id,
      type: "invitation",
      title: `Undangan bergabung ke ${business.name}`,
      body: "Buka halaman Menu → Anggota atau tautan pada email untuk menerima undangan.",
    });
  }

  const result = await sendEmail({
    to: parsed.data.email,
    subject: `Undangan bergabung ke ${business.name}`,
    text: `Anda diundang masuk ke ${business.name} sebagai ${parsed.data.role}.\nBuka tautan ini untuk menerima (berlaku ${INVITE_DAYS} hari):\n${appUrl(`/undangan/${token}`)}`,
  });

  await db.insert(auditEvents).values({
    businessId: business.id,
    actorId: user.id,
    type: "member",
    metadata: { action: "invite", email: parsed.data.email, role: parsed.data.role, emailSent: result.sent },
  });

  revalidatePath("/anggota");
  return { ok: true, info: result.sent ? "Undangan dikirim lewat email." : `Undangan dibuat. ${result.detail}` };
}

export async function revokeInvitation(formData: FormData) {
  const { user, business } = await requireWritableBusiness();
  await requireRole(business.id, user.id, ["owner", "admin"]);
  const id = String(formData.get("id") ?? "");
  await db
    .update(invitations)
    .set({ revokedAt: new Date() })
    .where(and(eq(invitations.id, id), eq(invitations.businessId, business.id)));
  await db.insert(auditEvents).values({
    businessId: business.id,
    actorId: user.id,
    type: "member",
    metadata: { action: "revoke_invitation", invitationId: id },
  });
  revalidatePath("/anggota");
}

/** FR-MEM-01/02: token unik, masa berlaku, dan slot diperiksa ulang saat diterima. */
export async function acceptInvitation(_prev: MemberState, formData: FormData): Promise<MemberState> {
  const user = await requireUser();
  const token = String(formData.get("token") ?? "");
  const [invitation] = await db.select().from(invitations).where(eq(invitations.token, token)).limit(1);
  if (!invitation) return { error: "Undangan tidak ditemukan." };
  if (invitation.revokedAt) return { error: "Undangan sudah dicabut." };
  if (invitation.acceptedAt) return { error: "Undangan sudah diterima." };
  if (invitation.expiresAt.getTime() < Date.now()) return { error: "Undangan sudah kedaluwarsa." };
  if ((user.email ?? "").toLowerCase() !== invitation.email.toLowerCase()) {
    return { error: `Undangan ini ditujukan untuk ${invitation.email}. Masuk dengan email tersebut.` };
  }

  const existing = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.businessId, invitation.businessId), eq(memberships.userId, user.id)))
    .limit(1);
  if (existing.length) return { error: "Anda sudah menjadi anggota bisnis ini." };

  const plan = await getPlanState(invitation.businessId);
  if (plan.readOnly) return { error: "Masa aktif paket Free bisnis ini sudah habis. Minta pemilik upgrade ke Pro dulu." };
  const members = await activeMemberCount(invitation.businessId);
  if (members >= plan.limits.members) {
    return { error: `Slot anggota paket ${PLAN_LABEL[plan.plan]} sudah penuh. Minta pemilik upgrade paket.` };
  }

  await db.transaction(async (tx) => {
    await tx.insert(memberships).values({ businessId: invitation.businessId, userId: user.id, role: invitation.role });
    await tx.update(invitations).set({ acceptedAt: new Date() }).where(eq(invitations.id, invitation.id));
    await tx.insert(auditEvents).values({
      businessId: invitation.businessId,
      actorId: user.id,
      type: "member",
      metadata: { action: "accept", email: invitation.email, role: invitation.role },
    });
  });

  await createNotification({
    userId: invitation.invitedBy,
    businessId: invitation.businessId,
    type: "member_joined",
    title: `${user.email} bergabung sebagai ${invitation.role}`,
    dedupeKey: `member_joined:${invitation.id}`,
  });

  revalidatePath("/anggota");
  revalidatePath("/beranda");
  return { ok: true };
}

export async function updateMemberRole(formData: FormData) {
  const { user, business } = await requireWritableBusiness();
  await requireRole(business.id, user.id, ["owner"]);
  const membershipId = String(formData.get("membershipId") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!["admin", "staff"].includes(role)) throw new Error("Peran tidak valid.");

  const [target] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.id, membershipId), eq(memberships.businessId, business.id)))
    .limit(1);
  if (!target) throw new Error("Anggota tidak ditemukan.");
  if (target.role === "owner") throw new Error("Ubah kepemilikan lewat alur transfer kepemilikan.");

  await db.update(memberships).set({ role: role as "admin" | "staff" }).where(eq(memberships.id, membershipId));
  await db.insert(auditEvents).values({
    businessId: business.id,
    actorId: user.id,
    type: "member",
    metadata: { action: "role_change", membershipId, from: target.role, to: role },
  });
  revalidatePath("/anggota");
}

export async function removeMember(formData: FormData) {
  const { user, business } = await requireWritableBusiness();
  await requireRole(business.id, user.id, ["owner"]);
  const membershipId = String(formData.get("membershipId") ?? "");
  const [target] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.id, membershipId), eq(memberships.businessId, business.id)))
    .limit(1);
  if (!target) throw new Error("Anggota tidak ditemukan.");
  if (target.role === "owner") throw new Error("Pemilik tidak bisa dihapus; transfer kepemilikan dulu.");

  await db.delete(memberships).where(eq(memberships.id, membershipId));
  await db.insert(auditEvents).values({
    businessId: business.id,
    actorId: user.id,
    type: "member",
    metadata: { action: "remove", membershipId, email: target.userId },
  });
  revalidatePath("/anggota");
}

/** FR-MEM-05..08: butuh autentikasi ulang, atomik, dan tidak boleh ada dua pemilik. */
export async function transferOwnership(_prev: MemberState, formData: FormData): Promise<MemberState> {
  const { user, business } = await requireWritableBusiness();
  try {
    await requireRole(business.id, user.id, ["owner"]);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Tidak punya izin." };
  }

  const membershipId = String(formData.get("membershipId") ?? "");
  const password = String(formData.get("password") ?? "");
  const [me] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, user.id)).limit(1);
  if (!me?.passwordHash || !(await verify(me.passwordHash, password))) return { error: "Kata sandi salah." };

  const [target] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.id, membershipId), eq(memberships.businessId, business.id)))
    .limit(1);
  if (!target) return { error: "Anggota tidak ditemukan." };
  if (target.role === "owner") return { error: "Anggota ini sudah pemilik." };

  await db.transaction(async (tx) => {
    // Satu pemilik pada satu waktu: pemilik lama turun jadi admin sebelum yang baru naik.
    await tx.update(memberships).set({ role: "admin" }).where(and(eq(memberships.businessId, business.id), eq(memberships.userId, user.id)));
    await tx.update(memberships).set({ role: "owner" }).where(eq(memberships.id, membershipId));
    await tx.insert(auditEvents).values({
      businessId: business.id,
      actorId: user.id,
      type: "member",
      metadata: { action: "transfer_ownership", toUserId: target.userId },
    });
  });

  await createNotification({
    userId: target.userId,
    businessId: business.id,
    type: "ownership",
    title: `Anda kini pemilik ${business.name}`,
    dedupeKey: `ownership:${business.id}:${Date.now()}`,
  });

  revalidatePath("/anggota");
  return { ok: true, info: "Kepemilikan dipindahkan. Peran Anda sekarang admin." };
}

export async function changePassword(_prev: MemberState, formData: FormData): Promise<MemberState> {
  const user = await requireUser();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  if (next.length < 8) return { error: "Kata sandi baru minimal 8 karakter." };

  const [me] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, user.id)).limit(1);
  if (!me?.passwordHash || !(await verify(me.passwordHash, current))) return { error: "Kata sandi saat ini salah." };

  await db.update(users).set({ passwordHash: await hash(next) }).where(eq(users.id, user.id));
  await db.insert(auditEvents).values({ actorId: user.id, type: "security", metadata: { action: "password_change" } });
  return { ok: true, info: "Kata sandi diperbarui." };
}