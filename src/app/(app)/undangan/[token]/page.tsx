import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { Card, PageHeader, btn } from "@/components/ui";
import { AcceptInvitationForm } from "@/components/member-forms";
import { db } from "@/server/db";
import { businesses } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { findInvitationByToken } from "@/server/modules/members/queries";

export const metadata: Metadata = { title: "Undangan" };

export default async function UndanganPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await auth();
  const invitation = await findInvitationByToken(token);

  if (!invitation) {
    return (
      <>
        <PageHeader title="Undangan tidak ditemukan" />
        <Card>
          <p className="text-small text-deep/80">Tautan undangan salah atau sudah dihapus.</p>
        </Card>
      </>
    );
  }

  const [business] = await db.select({ name: businesses.name }).from(businesses).where(eq(businesses.id, invitation.businessId)).limit(1);
  const expired = invitation.expiresAt.getTime() < Date.now();

  return (
    <>
      <PageHeader title={`Undangan ke ${business?.name ?? "bisnis"}`} subtitle={`Peran yang ditawarkan: ${invitation.role}.`} />

      <Card>
        {!session?.user ? (
          <div className="flex flex-col gap-2">
            <p className="text-small text-deep/80">Masuk dulu dengan email {invitation.email} untuk menerima undangan.</p>
            <Link href="/masuk" className={btn.primary}>
              Masuk
            </Link>
          </div>
        ) : expired ? (
          <p className="text-small text-primary">Undangan kedaluwarsa. Minta pemilik mengirim undangan baru.</p>
        ) : invitation.acceptedAt ? (
          <p className="text-small text-deep/80">Undangan ini sudah diterima.</p>
        ) : invitation.revokedAt ? (
          <p className="text-small text-primary">Undangan ini sudah dicabut.</p>
        ) : (
          <AcceptInvitationForm token={token} />
        )}
      </Card>
    </>
  );
}