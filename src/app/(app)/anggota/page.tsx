import type { Metadata } from "next";
import { PageHeader, Card, EmptyState, input } from "@/components/ui";
import { InviteMemberForm, TransferOwnershipForm } from "@/components/member-forms";
import { formatDate } from "@/lib/format";
import { requireBusiness } from "@/server/lib/access";
import { getPlanState, PLAN_LABEL } from "@/server/modules/billing/plan";
import { listMembers, listPendingInvitations } from "@/server/modules/members/queries";
import { removeMember, revokeInvitation, updateMemberRole } from "@/server/modules/members/actions";

export const metadata: Metadata = { title: "Anggota" };

const ROLE_LABEL: Record<string, string> = { owner: "Pemilik", admin: "Admin", staff: "Staf" };

export default async function AnggotaPage() {
  const { user, business } = await requireBusiness();
  const [members, invitations, plan] = await Promise.all([
    listMembers(business.id),
    listPendingInvitations(business.id),
    getPlanState(business.id),
  ]);

  const isOwner = business.role === "owner";
  const canManage = isOwner || business.role === "admin";
  const otherMembers = members.filter((m) => m.role !== "owner").map((m) => ({ membershipId: m.membershipId, label: `${m.name ?? m.email} · ${ROLE_LABEL[m.role]}` }));

  return (
    <>
      <PageHeader title="Anggota" subtitle="Undang tim, atur peran, dan pindahkan kepemilikan bila perlu." />

      <div className="grid gap-4 lg:grid-cols-[1fr_340px] lg:items-start">
        <Card>
          <h2 className="text-h3 text-deep">Anggota aktif ({members.length})</h2>
          <ul className="mt-2 divide-y divide-deep/10">
            {members.map((m) => (
              <li key={m.membershipId} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <div>
                  <p className="text-small font-semibold text-ink">{m.name ?? m.email}</p>
                  <p className="text-caption text-deep/70">
                    {m.email} · {ROLE_LABEL[m.role]} · sejak {formatDate(m.joinedAt.toISOString().slice(0, 10))}
                    {m.userId === user.id ? " · Anda" : ""}
                  </p>
                </div>
                {isOwner && m.role !== "owner" ? (
                  <div className="flex items-center gap-2">
                    <form action={updateMemberRole} className="flex items-center gap-2">
                      <input type="hidden" name="membershipId" value={m.membershipId} />
                      <select name="role" defaultValue={m.role} className={`${input} min-h-9 w-28 text-caption`} aria-label={`Peran ${m.email}`}>
                        <option value="admin">Admin</option>
                        <option value="staff">Staf</option>
                      </select>
                      <button type="submit" className="min-h-9 rounded-lg border border-deep/25 px-2 text-caption font-semibold text-deep">
                        Simpan
                      </button>
                    </form>
                    <form action={removeMember}>
                      <input type="hidden" name="membershipId" value={m.membershipId} />
                      <button type="submit" className="min-h-9 rounded-lg px-2 text-caption font-semibold text-primary hover:underline">
                        Keluarkan
                      </button>
                    </form>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>

          <h2 className="mt-5 text-h3 text-deep">Undangan menunggu ({invitations.length})</h2>
          {invitations.length === 0 ? (
            <p className="mt-1 text-small text-deep/70">Belum ada undangan menunggu.</p>
          ) : (
            <ul className="mt-2 divide-y divide-deep/10">
              {invitations.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between gap-2 py-2.5">
                  <div>
                    <p className="text-small text-ink">{inv.email}</p>
                    <p className="text-caption text-deep/70">
                      {ROLE_LABEL[inv.role]} · berlaku sampai {formatDate(inv.expiresAt.toISOString().slice(0, 10))}
                    </p>
                  </div>
                  {canManage ? (
                    <form action={revokeInvitation}>
                      <input type="hidden" name="id" value={inv.id} />
                      <button type="submit" className="min-h-9 rounded-lg px-2 text-caption font-semibold text-primary hover:underline">
                        Cabut
                      </button>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="text-h3 text-deep">Undang anggota</h2>
            <p className="mt-1 text-caption text-deep/70">
              Paket {PLAN_LABEL[plan.plan]} maksimal {plan.limits.members} anggota aktif. Terpakai {members.length + invitations.length}.
            </p>
            {canManage ? (
              <div className="mt-3">
                <InviteMemberForm />
              </div>
            ) : (
              <p className="mt-3 text-small text-deep/70">Hanya pemilik dan admin yang bisa mengundang anggota.</p>
            )}
          </Card>

          {isOwner ? (
            <Card>
              <h2 className="text-h3 text-deep">Transfer kepemilikan</h2>
              {otherMembers.length ? (
                <div className="mt-3">
                  <TransferOwnershipForm members={otherMembers} />
                </div>
              ) : (
                <p className="mt-2 text-small text-deep/70">Belum ada anggota lain yang bisa menerima kepemilikan.</p>
              )}
            </Card>
          ) : null}

          {!canManage ? (
            <EmptyState title="Akses terbatas" hint="Peran staf tidak dapat mengelola anggota." />
          ) : null}
        </div>
      </div>
    </>
  );
}