import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Card, EmptyState, btn } from "@/components/ui";
import { requireUser } from "@/server/lib/access";
import { countUnread, listNotifications } from "@/server/modules/notifications/queries";
import { markAllNotificationsRead, markNotificationRead } from "@/server/modules/notifications/actions";

export const metadata: Metadata = { title: "Notifikasi" };

export default async function NotifikasiPage() {
  const user = await requireUser();
  const [items, unread] = await Promise.all([listNotifications(user.id, 30), countUnread(user.id)]);

  return (
    <>
      <PageHeader title="Notifikasi" subtitle={`${unread} belum dibaca dari ${items.length} terbaru.`} />

      {items.length === 0 ? (
        <EmptyState title="Belum ada notifikasi" hint="Status langganan dan aktivitas anggota muncul di sini." />
      ) : (
        <Card>
          <ul className="divide-y divide-deep/10">
            {items.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <p className={`text-small ${n.readAt ? "text-deep/70" : "font-semibold text-ink"}`}>{n.title}</p>
                  {n.body ? <p className="text-caption text-deep/70">{n.body}</p> : null}
                  <p className="text-caption text-deep/50">
                    {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(n.createdAt)} WIB ·{" "}
                    {n.type}
                  </p>
                </div>
                {n.readAt ? null : (
                  <form action={markNotificationRead}>
                    <input type="hidden" name="id" value={n.id} />
                    <button type="submit" className="min-h-9 rounded-lg px-2 text-caption font-semibold text-primary hover:underline">
                      Tandai dibaca
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>

          {unread > 0 ? (
            <form action={markAllNotificationsRead} className="mt-3">
              <button type="submit" className={btn.secondary}>
                Tandai semua dibaca
              </button>
            </form>
          ) : null}
        </Card>
      )}

      <p className="mt-3 text-caption text-deep/70">
        Kanal email aktif bila <code>RESEND_API_KEY</code> diisi. WhatsApp belum dipakai pada versi ini.{" "}
        <Link href="/menu" className="font-semibold text-primary hover:underline">
          Kembali ke menu
        </Link>
      </p>
    </>
  );
}