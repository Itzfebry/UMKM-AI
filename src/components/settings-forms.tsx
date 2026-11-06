"use client";

import { useActionState } from "react";
import { changePassword, type MemberState } from "@/server/modules/members/actions";
import { updateNotificationPrefs, type PrefsState } from "@/server/modules/notifications/actions";
import { deleteBusiness, type SecurityState } from "@/server/modules/security/actions";
import { uploadBalanceImage, uploadBusinessLogo, type BrandingState } from "@/server/modules/business/branding";
import { SubmitButton } from "@/components/submit-button";
import { ImageCropper } from "@/components/image-cropper";
import { ErrorText, input } from "./ui";

function Feedback({ state }: { state: MemberState | SecurityState | BrandingState }) {
  return (
    <>
      <ErrorText>{state?.error}</ErrorText>
      {state?.ok ? <p role="status" className="rounded-lg bg-accent/25 px-3 py-2 text-small text-deep">{state?.info ?? "Tersimpan."}</p> : null}
    </>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState<MemberState, FormData>(changePassword, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <Feedback state={state} />
      <label className="text-small font-semibold text-deep" htmlFor="current-password">
        Kata sandi saat ini
        <input id="current-password" name="current" type="password" required className={`${input} mt-1`} />
      </label>
      <label className="text-small font-semibold text-deep" htmlFor="next-password">
        Kata sandi baru (minimal 8 karakter)
        <input id="next-password" name="next" type="password" required minLength={8} className={`${input} mt-1`} />
      </label>
      <SubmitButton pendingLabel="Menyimpan...">Ganti kata sandi</SubmitButton>
    </form>
  );
}

export function DeleteBusinessForm({ businessName }: { businessName: string }) {
  const [state, action] = useActionState<SecurityState, FormData>(deleteBusiness, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <Feedback state={state} />
      <p className="text-small text-deep/80">
        Menghapus usaha akan mencabut akses semua anggota dan menghapus transaksi, utang/piutang, kategori, serta berkas terkait. Salinan backup dapat bertahan
        sampai 30 hari sebelum benar-benar hilang.
      </p>
      <label className="text-small font-semibold text-deep" htmlFor="confirm-name">
        Ketik nama usaha <strong>{businessName}</strong> untuk konfirmasi
        <input id="confirm-name" name="confirmation" required className={`${input} mt-1`} />
      </label>
      <label className="text-small font-semibold text-deep" htmlFor="delete-password">
        Kata sandi Anda
        <input id="delete-password" name="password" type="password" required className={`${input} mt-1`} />
      </label>
      <div>
        <SubmitButton pendingLabel="Menghapus...">Hapus usaha permanen</SubmitButton>
      </div>
    </form>
  );
}

export function NotificationPrefsForm({
  prefs,
}: {
  prefs: { emailEnabled: boolean; whatsappOptIn: boolean; whatsappNumber: string | null };
}) {
  const [state, action] = useActionState<PrefsState, FormData>(updateNotificationPrefs, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <Feedback state={state} />
      <label className="flex items-center gap-2 text-small text-deep" htmlFor="pref-email">
        <input id="pref-email" name="emailEnabled" type="checkbox" defaultChecked={prefs.emailEnabled} className="size-4" />
        Kirim notifikasi ke email saya
      </label>
      <label className="flex items-center gap-2 text-small text-deep" htmlFor="pref-wa">
        <input id="pref-wa" name="whatsappOptIn" type="checkbox" defaultChecked={prefs.whatsappOptIn} className="size-4" />
        Saya setuju dihubungi lewat WhatsApp (kanal belum aktif)
      </label>
      <label className="text-small font-semibold text-deep" htmlFor="pref-wa-number">
        Nomor WhatsApp (opsional)
        <input
          id="pref-wa-number"
          name="whatsappNumber"
          defaultValue={prefs.whatsappNumber ?? ""}
          placeholder="+62 812 3456 7890"
          className={`${input} mt-1`}
        />
      </label>
      <SubmitButton pendingLabel="Menyimpan...">Simpan preferensi</SubmitButton>
    </form>
  );
}

export function BrandingForm({ logoUrl, balanceUrl }: { logoUrl: string | null; balanceUrl: string | null }) {
  return (
    <div className="flex flex-col gap-5">
      <ImageCropper
        action={uploadBusinessLogo}
        aspect={1}
        outputWidth={512}
        outputHeight={512}
        targetBytes={400_000}
        label="Logo usaha"
        hint="Tampil di samping judul usaha. Geser dan perbesar untuk memilih bagian yang tampil; hasilnya otomatis diperkecil."
        buttonLabel="Unggah logo"
        currentUrl={logoUrl}
        frameClass="aspect-square max-w-xs"
        previewClass="size-14 rounded-full"
      />

      <div className="border-t border-deep/10 pt-5">
        <ImageCropper
          action={uploadBalanceImage}
          aspect={16 / 9}
          outputWidth={1600}
          outputHeight={900}
          targetBytes={900_000}
          label="Gambar latar kartu saldo"
          hint="Latar kartu saldo di beranda, diberi gradasi gelap agar angka tetap terbaca. Potong ke rasio 16:9."
          buttonLabel="Unggah gambar saldo"
          currentUrl={balanceUrl}
          frameClass="aspect-video"
          previewClass="h-14 w-24 rounded-lg"
        />
      </div>
    </div>
  );
}
