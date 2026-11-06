import { and, asc, desc, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/server/db";
import { invitations, memberships, users } from "@/server/db/schema";

export async function listMembers(businessId: string) {
  return db
    .select({
      membershipId: memberships.id,
      userId: memberships.userId,
      role: memberships.role,
      name: users.name,
      email: users.email,
      joinedAt: memberships.createdAt,
    })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(eq(memberships.businessId, businessId))
    .orderBy(asc(memberships.createdAt));
}

export async function listPendingInvitations(businessId: string) {
  return db
    .select({
      id: invitations.id,
      email: invitations.email,
      role: invitations.role,
      expiresAt: invitations.expiresAt,
      createdAt: invitations.createdAt,
    })
    .from(invitations)
    .where(
      and(
        eq(invitations.businessId, businessId),
        isNull(invitations.acceptedAt),
        isNull(invitations.revokedAt),
        gt(invitations.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(invitations.createdAt));
}

export async function findInvitationByToken(token: string) {
  const [row] = await db.select().from(invitations).where(eq(invitations.token, token)).limit(1);
  return row ?? null;
}