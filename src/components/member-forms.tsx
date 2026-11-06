"use client";

import { useActionState } from "react";
import {
  acceptInvitation,
  inviteMember,
  transferOwnership,
  type MemberState,
} from "@/server/modules/members/actions";
import { SubmitButton } from "@/components/submit-button";
import { ErrorText, input } from "./ui";

export function InviteMemberForm() {
  const [state, action] = useActionState<MemberState, FormData>(inviteMember, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <ErrorText>{state?.error}</ErrorText>
      {state?.ok && state.info ? <p role="status" className="rounded-lg bg-accent/25 px-3 py-2 text-small text-deep">{state.info}</p> : null}

      <label className="text-small font-semibold text-deep" htmlFor="invite-email">
        Email anggota
        <input id="invite-email" name="email" type="email" required className={`${input} mt-1`} placeholder="nama@email.com" />
      </label>
      <label className="text-small font-semibold text-deep" htmlFor="invite-role">
        Peran
        <select id="invite-role" name="role" className={`${input} mt-1`} defaultValue="staff">
          <option value="staff">Staf — catat, lihat ringkasan</option>
          <option value="admin">Admin — kelola transaksi & laporan penuh</option>
        </select>
      </label>
      <SubmitButton pendingLabel="Mengirim...">Kirim undangan</SubmitButton>
    </form>
  );
}

export function TransferOwnershipForm({ members }: { members: { membershipId: string; label: string }[] }) {
  const [state, action] = useActionState<MemberState, FormData>(transferOwnership, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <ErrorText>{state?.error}</ErrorText>
      {state?.ok && state.info ? <p role="status" className="rounded-lg bg-accent/25 px-3 py-2 text-small text-deep">{state.info}</p> : null}

      <label className="text-small font-semibold text-deep" htmlFor="transfer-target">
        Anggota penerima
        <select id="transfer-target" name="membershipId" required className={`${input} mt-1`} defaultValue="">
          <option value="">Pilih anggota</option>
          {members.map((m) => (
            <option key={m.membershipId} value={m.membershipId}>
              {m.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-small font-semibold text-deep" htmlFor="transfer-password">
        Konfirmasi kata sandi Anda
        <input id="transfer-password" name="password" type="password" required className={`${input} mt-1`} />
      </label>
      <SubmitButton pendingLabel="Memindahkan...">Transfer kepemilikan</SubmitButton>
      <p className="text-caption text-deep/70">Setelah transfer, peran Anda turun menjadi admin dan anggota penerima menjadi pemilik.</p>
    </form>
  );
}

export function AcceptInvitationForm({ token }: { token: string }) {
  const [state, action] = useActionState<MemberState, FormData>(acceptInvitation, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="token" value={token} />
      <ErrorText>{state?.error}</ErrorText>
      {state?.ok ? (
        <p role="status" className="rounded-lg bg-accent/25 px-3 py-2 text-small text-deep">
          Undangan diterima. Buka beranda untuk mulai bekerja.
        </p>
      ) : (
        <SubmitButton pendingLabel="Memproses...">Terima undangan</SubmitButton>
      )}
    </form>
  );
}