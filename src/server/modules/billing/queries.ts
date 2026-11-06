import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/server/db";
import { businesses, invoices, memberships, paymentProofs, subscriptions, users } from "@/server/db/schema";
import { getPlanState } from "./plan";

export async function getSubscriptionOverview(businessId: string) {
  const [plan, [row], invoiceRows] = await Promise.all([
    getPlanState(businessId),
    db.select().from(subscriptions).where(eq(subscriptions.businessId, businessId)).limit(1),
    db.select().from(invoices).where(eq(invoices.businessId, businessId)).orderBy(desc(invoices.createdAt)).limit(10),
  ]);

  const proofs = invoiceRows.length
    ? await db
        .select({ invoiceId: paymentProofs.invoiceId, note: paymentProofs.note, objectPath: paymentProofs.objectPath, createdAt: paymentProofs.createdAt })
        .from(paymentProofs)
        .where(inArray(paymentProofs.invoiceId, invoiceRows.map((i) => i.id)))
    : [];

  return { plan, subscription: row ?? null, invoices: invoiceRows, proofs };
}

export async function listInvoicesForAdmin() {
  return db
    .select({
      id: invoices.id,
      number: invoices.number,
      amount: invoices.amount,
      status: invoices.status,
      expiresAt: invoices.expiresAt,
      createdAt: invoices.createdAt,
      businessId: invoices.businessId,
      businessName: businesses.name,
      rejectReason: invoices.rejectReason,
    })
    .from(invoices)
    .innerJoin(businesses, eq(businesses.id, invoices.businessId))
    .where(inArray(invoices.status, ["pending", "manual_review", "rejected", "paid", "expired"]))
    .orderBy(desc(invoices.createdAt))
    .limit(50);
}

export async function listProofs(invoiceId: string) {
  return db
    .select({ id: paymentProofs.id, note: paymentProofs.note, objectPath: paymentProofs.objectPath, createdAt: paymentProofs.createdAt })
    .from(paymentProofs)
    .where(eq(paymentProofs.invoiceId, invoiceId))
    .orderBy(desc(paymentProofs.createdAt));
}

/** Email pemilik + admin bisnis untuk pemberitahuan langganan. */
export async function businessOwnerAndAdmins(businessId: string) {
  return db
    .select({ userId: memberships.userId, role: memberships.role, email: users.email })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(and(eq(memberships.businessId, businessId), inArray(memberships.role, ["owner", "admin"])));
}