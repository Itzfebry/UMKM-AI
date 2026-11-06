import type { Metadata } from "next";
import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";
import { BrandingForm, DeleteBusinessForm, NotificationPrefsForm, PasswordForm } from "@/components/settings-forms";
import { requireBusiness } from "@/server/lib/access";
import { getBranding } from "@/server/modules/business/branding";
import { isPlatformAdmin } from "@/server/modules/security/actions";
import { getNotificationPrefs } from "@/server/modules/notifications/prefs";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function PengaturanPage() {
  const { user, business } = await requireBusiness();
  const [admin, prefs, branding] = await Promise.all([
    isPlatformAdmin(user.id),
    getNotificationPrefs(user.id),
    getBranding(business.id),
  ]);

  return (
    <>
      <PageHeader title="Pengaturan" subtitle="Keamanan akun dan tindakan sensitif atas usaha." />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        {business.role !== "staff" ? (
          <Card className="lg:col-span-2">
            <h2 className="text-h3 text-deep">Identitas usaha</h2>
            <p className="mt-1 text-small text-deep/75">Unggah logo usaha dan gambar latar kartu saldo yang tampil di beranda.</p>
            <div className="mt-3">
              <BrandingForm logoUrl={branding.logoUrl} balanceUrl={branding.balanceUrl} />
            </div>
          </Card>
        ) : null}
        <Card>
          <h2 className="text-h3 text-deep">Kata sandi</h2>
          <p className="mt-1 text-small text-deep/75">Ganti kata sandi bila merasa pernah dibagikan atau dipakai di perangkat lain.</p>
          <div className="mt-3">
            <PasswordForm />
          </div>
        </Card>

        {admin ? (
          <Card>
            <h2 className="text-h3 text-deep">Panel platform</h2>
            <p className="mt-1 text-small text-deep/75">
              Akun ini terdaftar sebagai admin platform. Panel memakai halaman masuk dan sesi terpisah, jadi Anda perlu masuk lagi di sana.
            </p>
            <p className="mt-3">
              <Link href="/panel/masuk" className="text-small font-semibold text-primary hover:underline">
                Buka panel platform (/panel/masuk)
              </Link>
            </p>
          </Card>
        ) : null}

        {business.role === "owner" ? (
          <Card className="lg:col-span-2">
            <h2 className="text-h3 text-deep">Hapus usaha</h2>
            <div className="mt-3">
              <DeleteBusinessForm businessName={business.name} />
            </div>
          </Card>
        ) : null}

        <Card className="lg:col-span-2">
          <h2 className="text-h3 text-deep">Notifikasi</h2>
          <p className="mt-1 text-small text-deep/75">
            Preferensi ini mengatur kanal email untuk undangan, status langganan, dan pengingat. Email verifikasi dan reset kata sandi selalu dikirim.
          </p>
          <div className="mt-3">
            <NotificationPrefsForm prefs={prefs} />
          </div>
        </Card>
      </div>

      <p className="mt-4 text-caption text-deep/70">
        Backup: Supabase menyediakan backup otomatis harian dengan retensi sesuai paket proyek. Uji restore berkala dan simpan salinan ekspor bulanan di luar
        database; detail ada di docs/PROGRESS-LOG.md.
      </p>
    </>
  );
}