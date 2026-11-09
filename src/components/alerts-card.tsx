import Link from "next/link";
import { AlertTriangle, ArrowRight, Info, ListChecks, ShieldAlert } from "lucide-react";
import type { Alert } from "@/server/modules/dashboard/alerts";

const STYLE: Record<Alert["level"], { box: string; icon: typeof Info; label: string; labelClass: string }> = {
  danger: { box: "border-primary/30 bg-primary/5", icon: ShieldAlert, label: "Segera", labelClass: "bg-primary text-white" },
  warning: { box: "border-accent bg-accent/15", icon: AlertTriangle, label: "Perlu dicek", labelClass: "bg-deep text-white" },
  info: { box: "border-deep/15 bg-surface", icon: Info, label: "Info", labelClass: "bg-deep/10 text-deep" },
};

/**
 * Daftar peringatan otomatis. Isinya dihitung backend setiap halaman dibuka dari data pengguna
 * sendiri: utang/piutang lewat jatuh tempo, transaksi tanpa kategori, saldo awal, dan kuota paket.
 */
export function AlertsCard({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-deep/10 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ListChecks className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-h3 text-deep">Perlu perhatian</h2>
          <p className="break-words text-caption text-deep/80">
            Pemeriksaan otomatis atas data usaha Anda, diperbarui setiap halaman ini dibuka tanpa perlu memindai manual.
          </p>
        </div>
      </div>

      <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto">
        {alerts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-deep/20 bg-surface/60 p-3 text-small text-deep/80">
            Tidak ada yang mendesak. Semua tagihan, kategori, dan kuota dalam keadaan wajar.
          </p>
        ) : (
          <ul className="space-y-2">
          {alerts.map((alert) => {
            const { box, icon: Icon, label, labelClass } = STYLE[alert.level];
            return (
              <li key={alert.title} className={`rounded-xl border p-3 ${box}`}>
                <div className="flex items-start gap-2">
                  <Icon className="mt-0.5 size-4 shrink-0 text-deep/70" aria-hidden />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${labelClass}`}>{label}</span>
                      <p className="break-words text-small font-semibold text-ink">{alert.title}</p>
                    </div>
                    <p className="mt-0.5 break-words text-caption text-deep/85">{alert.hint}</p>
                    <Link
                      href={alert.href}
                      className="mt-1 inline-flex items-center gap-1 text-caption font-semibold text-primary hover:underline"
                      aria-label={`Buka halaman untuk menindaklanjuti: ${alert.title}`}
                    >
                      Tindak lanjuti
                      <ArrowRight className="size-3" aria-hidden />
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
          </ul>
        )}
      </div>

      <div className="mt-3 shrink-0 space-y-1.5 border-t border-deep/10 pt-3">
        <p className="text-caption font-semibold uppercase tracking-wide text-deep/70">Cara memakai</p>
        <ol className="list-decimal space-y-1 break-words pl-4 text-caption text-deep/80">
          <li>Klik “Tindak lanjuti” pada peringatan. Anda dibawa ke halaman yang tepat, sudah tersaring.</li>
          <li>Selesaikan di sana: catat pembayaran, beri kategori, isi saldo awal, atau urus paket.</li>
          <li>Kembali ke halaman ini; peringatan hilang sendiri setelah datanya beres.</li>
        </ol>
        <p className="break-words text-caption text-deep/65">
          Urutan warna: <span className="font-semibold text-primary">Segera</span> &gt;{" "}
          <span className="font-semibold text-deep">Perlu dicek</span> &gt; <span className="font-semibold text-deep/80">Info</span>. Kartu ini tidak
          mengubah data apa pun. Semua tindakan tetap Anda yang lakukan.
        </p>
      </div>
    </div>
  );
}