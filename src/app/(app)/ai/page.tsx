import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { AiChat } from "@/components/ai-chat";
import { requireBusiness } from "@/server/lib/access";
import { getPlanState, periodResetLabel, PLAN_LABEL } from "@/server/modules/billing/plan";
import { getBusinessInsight, listAiActivity } from "@/server/modules/ai/insight";

export const metadata: Metadata = { title: "Analis AI" };

const KIND_LABEL: Record<string, string> = {
  insight_otomatis: "Analisis otomatis harian",
  insight_manual: "Analisis manual",
  tanya_jawab: "Tanya jawab",
  analisis: "Analisis",
};

export default async function AiPage() {
  const { business } = await requireBusiness();
  const [plan, insight, activity] = await Promise.all([
    getPlanState(business.id),
    getBusinessInsight(business.id),
    listAiActivity(business.id),
  ]);
  const configured = Boolean(process.env.AI_API_KEY);

  return (
    <>
      <PageHeader title="Analis AI" subtitle="Tanya soal angka usaha Anda. Semua perhitungan dilakukan sistem, AI hanya menafsirkan." />

      <div className="grid gap-4 xl:grid-cols-2 xl:items-start">
        <div className="flex flex-col gap-4">
          <AiChat
            configured={configured}
            quota={{
              used: plan.usage.aiRequests,
              limit: plan.limits.aiRequestsPerMonth,
              plan: PLAN_LABEL[plan.plan],
              resetLabel: periodResetLabel(),
            }}
          />

          <section className="rounded-xl border border-deep/10 bg-white p-4">
            <h2 className="text-h3 text-deep">Log analisis</h2>
            <p className="mt-1 text-small text-deep/75">
              Setiap pemanggilan AI tercatat di audit: waktu, jenis, model, lama proses, dan hasilnya.
            </p>
            {activity.length === 0 ? (
              <p className="mt-2 text-small text-deep/70">Belum ada aktivitas AI.</p>
            ) : (
              <ul className="mt-2 divide-y divide-deep/10">
                {activity.map((item) => (
                  <li key={item.at} className="py-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-small font-semibold text-ink">{KIND_LABEL[item.kind] ?? item.kind}</p>
                      <span className={`shrink-0 text-caption font-semibold ${item.status === "sukses" ? "text-deep" : "text-primary"}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-caption text-deep/70">
                      {item.at.slice(0, 16).replace("T", " ")} UTC · {item.model}
                      {item.durationMs !== null ? ` · ${item.durationMs} ms` : ""}
                    </p>
                    {item.detail ? <p className="text-caption text-deep/60">{item.detail.slice(0, 140)}</p> : null}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-caption text-deep/60">Log ini juga bisa dilihat di halaman Riwayat perubahan (owner/admin).</p>
          </section>
        </div>

        <div className="flex flex-col gap-4">
          {insight ? (
            <section className="rounded-xl border border-deep/10 bg-white p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-h3 text-deep">Analisis {insight.today ? "hari ini" : "terakhir"}</h2>
                <span className="text-caption text-deep/60">
                  {insight.dayKey} · {insight.model}
                </span>
              </div>
              {insight.insight.temuan?.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-small text-ink">
                  {insight.insight.temuan.slice(0, 4).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {insight.insight.interpretasi ? <p className="mt-2 text-small text-ink">{insight.insight.interpretasi}</p> : null}
              {insight.insight.rekomendasi?.length ? (
                <>
                  <h3 className="mt-3 text-small font-semibold text-deep">Langkah yang disarankan</h3>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-small text-deep/85">
                    {insight.insight.rekomendasi.slice(0, 4).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {insight.insight.keterbatasan?.length ? (
                <p className="mt-2 text-caption text-deep/60">Keterbatasan: {insight.insight.keterbatasan.join(" ")}</p>
              ) : null}
              <p className="mt-2 text-caption text-deep/60">
                Analisis ini dibuat otomatis setiap hari oleh tugas terjadwal. Tombol perbarui ada di beranda.
              </p>
            </section>
          ) : (
            <section className="rounded-xl border border-deep/10 bg-white p-4">
              <h2 className="text-h3 text-deep">Belum ada analisis</h2>
              <p className="mt-1 text-small text-deep/75">
                Analisis otomatis dibuat setelah ada minimal 5 transaksi. Tekan tombol Perbarui insight di beranda untuk membuatnya sekarang.
              </p>
            </section>
          )}

          <section className="rounded-xl border border-deep/10 bg-white p-4">
            <h2 className="text-h3 text-deep">Batas yang perlu Anda tahu</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-small text-deep/80">
              <li>AI tidak menulis ke buku besar. Pencatatan tetap manual atau lewat impor.</li>
              <li>Riwayat percakapan hanya bertahan selama halaman ini terbuka.</li>
              <li>Kegagalan layanan AI tidak menghentikan pencatatan, laporan, atau dashboard.</li>
              <li>Rekomendasi wajib Anda cek ke transaksi sumber.</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
