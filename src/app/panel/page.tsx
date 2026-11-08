import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import {
  Activity,
  AlertTriangle,
  Bot,
  CalendarClock,
  Coins,
  CreditCard,
  Database,
  FileCheck2,
  HardDriveDownload,
  KeyRound,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import { btn } from "@/components/ui";
import { AdminChart, AdminDonut } from "@/components/admin-charts";
import { AdminMfaPanel } from "@/components/admin-mfa-panel";
import { RejectInvoiceForm, VerifyInvoiceButton } from "@/components/admin-forms";
import { Chip, GlassTile, PanelCard, SectionHeader, TableWrap, Tile, count, tbody, td, th } from "@/components/panel-ui";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { requireAdminSession } from "@/admin-auth";
import { db } from "@/server/db";
import { platformAdmins } from "@/server/db/schema";
import { currentPeriod } from "@/server/modules/billing/plan";
import { expireStaleInvoices } from "@/server/modules/billing/actions";
import { listInvoicesForAdmin, listProofs } from "@/server/modules/billing/queries";
import { purgeOldAuditEvents, runMaintenanceNow } from "@/server/modules/security/actions";
import {
  getAiByKind,
  getAiByModel,
  getAiCostRates,
  getAiDaily,
  getBackupStatus,
  getDatabaseStats,
  getPlatformSummary,
  getSecurityOverview,
  listBusinessOverview,
} from "@/server/modules/platform/metrics";

export const metadata: Metadata = { title: "Panel platform" };

const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu verifikasi",
  paid: "Dibayar",
  rejected: "Ditolak",
  expired: "Kedaluwarsa",
  manual_review: "Pemeriksaan manual",
};

const PLAN_STATUS_LABEL: Record<string, string> = {
  free: "Free",
  active: "Pro aktif",
  past_due: "Pro lewat jatuh tempo",
  grace_period: "Masa tenggang",
  cancel_at_period_end: "Berhenti di akhir periode",
};

const dayLabel = (value: string) =>
  new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", timeZone: "Asia/Jakarta" }).format(new Date(`${value}T00:00:00Z`));

/** Waktu lengkap sampai detik (zona Asia/Jakarta) untuk kolom aktivitas dan audit. */
const stamp = formatDateTime;

const dayOnly = (value: string | null) => (value ? stamp(`${value.slice(0, 10)}T00:00:00Z`).split(",")[0] : "—");

const fileSize = (bytes: number) =>
  bytes >= 1_048_576 ? `${(bytes / 1_048_576).toLocaleString("id-ID", { maximumFractionDigits: 1 })} MB` : `${Math.round(bytes / 1024).toLocaleString("id-ID")} KB`;

const iconClass = "size-5";

export default async function PanelPage() {
  const admin = await requireAdminSession();
  if (!admin) redirect("/panel/masuk");

  await expireStaleInvoices();
  const period = currentPeriod();
  const [invoices, [adminRow], summary, daily, byKind, byModel, businesses, database, backup, security] = await Promise.all([
    listInvoicesForAdmin(),
    db.select({ mfaEnabled: platformAdmins.mfaEnabled }).from(platformAdmins).where(eq(platformAdmins.userId, admin.id)).limit(1),
    getPlatformSummary(),
    getAiDaily(30),
    getAiByKind(),
    getAiByModel(),
    listBusinessOverview(period),
    getDatabaseStats(),
    Promise.resolve(getBackupStatus()),
    getSecurityOverview(),
  ]);
  const proofs = await Promise.all(invoices.slice(0, 10).map(async (invoice) => ({ invoiceId: invoice.id, items: await listProofs(invoice.id) })));
  const proofFor = (id: string) => proofs.find((p) => p.invoiceId === id)?.items ?? [];

  const mfaEnabled = Boolean(adminRow?.mfaEnabled);
  const calls30d = daily.reduce((sum, point) => sum + point.total, 0);
  const failed30d = daily.reduce((sum, point) => sum + point.failed, 0);
  const avgMs = calls30d ? Math.round(daily.reduce((sum, point) => sum + point.avgMs * point.total, 0) / calls30d) : 0;
  const tokensIn = daily.reduce((sum, point) => sum + point.tokensIn, 0);
  const tokensOut = daily.reduce((sum, point) => sum + point.tokensOut, 0);
  const rates = getAiCostRates();
  const cost = rates ? (tokensIn / 1_000_000) * rates.input + (tokensOut / 1_000_000) * rates.output : null;
  const brandingBusinesses = businesses.filter((business) => business.brandingFiles > 0);
  const topAiBusinesses = businesses.filter((business) => business.aiRequests > 0).slice(0, 8);
  const adminRoles = summary.memberships - summary.owners - summary.staff;
  const unlinkedUsers = Math.max(0, summary.users - summary.memberships);
  const backupStale = Boolean(backup.latest && backup.latest.rows < database.totalRows);
  const proCount = businesses.filter((item) => item.effectivePlan === "pro").length;
  const needsAttention = summary.invoicesPending + summary.failedLogins24h;

  return (
    <>
      <header className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#070C0F_0%,#123039_55%,#1D4E5C_100%)] p-5 text-white shadow-xl sm:p-6">
        <span className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-accent/20 blur-3xl" aria-hidden />
        <span className="pointer-events-none absolute -bottom-28 left-1/3 size-64 rounded-full bg-primary/20 blur-3xl" aria-hidden />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-caption font-semibold uppercase tracking-[0.2em] text-accent">Panel platform UMKM-AI</p>
            <h1 className="mt-2 text-h1 text-white">Pusat kendali operasional</h1>
            <p className="mt-2 max-w-3xl text-small text-white/75">
              Penggunaan AI, usaha &amp; akun, keamanan, keadaan database, dan kesiapan backup dalam satu layar. Target verifikasi pembayaran 2 jam pada jam operasional
              09.00–17.00 WIB.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="flex flex-wrap gap-2">
              {mfaEnabled ? (
                <Chip tone="ok" dot onDark>
                  MFA aktif
                </Chip>
              ) : null}
              <Chip tone={needsAttention > 0 ? "warn" : "ok"} dot onDark>
                {needsAttention > 0 ? `${count.format(needsAttention)} perlu tindakan` : "tidak ada tindakan tertunda"}
              </Chip>
            </div>
            {admin.email ? (
              <span className="inline-flex items-center gap-1.5 text-caption text-white/80">
                <KeyRound className="size-3.5" aria-hidden /> {admin.email}
              </span>
            ) : null}
          </div>
        </div>

        {!mfaEnabled ? (
          <p
            className="relative mt-4 flex items-start gap-2 rounded-xl border border-accent/60 bg-black/35 px-3 py-2 text-small font-semibold text-white"
            role="alert"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            MFA belum aktif untuk akun ini. Aktifkan di bagian Keamanan sebelum panel dipakai di produksi.
          </p>
        ) : null}

        <div className="relative mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <GlassTile label="Usaha aktif" value={count.format(summary.businesses)} hint={`${count.format(proCount)} paket Pro · ${count.format(summary.users)} pengguna`} tone="deep" />
          <GlassTile label="Request AI 30 hari" value={count.format(calls30d)} hint={`${count.format(failed30d)} gagal · rata-rata ${count.format(avgMs)} ms`} tone="accent" />
          <GlassTile label="Login gagal 24 jam" value={count.format(summary.failedLogins24h)} hint={`${count.format(summary.logins24h)} percobaan masuk total`} tone={summary.failedLogins24h > 0 ? "primary" : "accent"} />
          <GlassTile label="Ukuran database" value={fileSize(summary.dbSizeBytes)} hint={`${count.format(database.totalRows)} baris di ${count.format(database.rlsTotal)} tabel`} tone="deep" />
        </div>
      </header>

      <section id="ringkasan" className="scroll-mt-24">
        <SectionHeader title="Ringkasan platform" icon={<Activity className={iconClass} />} subtitle="Angka inti yang berubah setiap hari. Kartu bergaris merah menandakan hal yang perlu ditindak." />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="Usaha terdaftar" value={count.format(summary.businesses)} hint={`${count.format(summary.memberships)} keanggotaan`} icon={<Store className="size-4" />} />
          <Tile
            label="Pengguna"
            value={count.format(summary.users)}
            hint={`${count.format(summary.owners)} owner · ${count.format(adminRoles)} admin usaha · ${count.format(summary.staff)} staf${
              unlinkedUsers > 0 ? ` · ${count.format(unlinkedUsers)} tanpa usaha` : ""
            }`}
            icon={<Users className="size-4" />}
            tone="accent"
          />
          <Tile
            label="Transaksi aktif"
            value={count.format(summary.transactions)}
            hint={`bulan ini ${count.format(summary.transactionsThisMonth)} · soft delete ${count.format(summary.transactionsDeleted)}`}
            icon={<FileCheck2 className="size-4" />}
          />
          <Tile
            label="Request AI 30 hari"
            value={count.format(calls30d)}
            hint={`${count.format(failed30d)} gagal · ${count.format(avgMs)} ms rata-rata`}
            icon={<Bot className="size-4" />}
            tone="accent"
          />
          <Tile
            label="Token AI 30 hari"
            value={count.format(tokensIn + tokensOut)}
            hint={cost === null ? `masuk ${count.format(tokensIn)} · keluar ${count.format(tokensOut)}` : `taksiran ${formatRupiah(Math.round(cost))}`}
            icon={<Coins className="size-4" />}
            tone="primary"
          />
          <Tile label="Analisis hari ini" value={count.format(summary.insightsToday)} hint="insight otomatis/manual tanggal ini" icon={<Sparkles className="size-4" />} tone="accent" />
          <Tile
            label="Login gagal 24 jam"
            value={count.format(summary.failedLogins24h)}
            hint={`${count.format(security.failed.length)} email bermasalah dalam 7 hari`}
            icon={<ShieldCheck className="size-4" />}
            tone={summary.failedLogins24h > 0 ? "warn" : "deep"}
          />
          <Tile
            label="Invoice perlu tindakan"
            value={count.format(summary.invoicesPending)}
            hint={`${count.format(summary.proofs)} bukti pembayaran tersimpan (riwayat)`}
            icon={<CreditCard className="size-4" />}
            tone={summary.invoicesPending > 0 ? "warn" : "deep"}
          />
          <Tile label="Sesi pengguna aktif" value={count.format(summary.activeSessions)} hint={`${count.format(summary.auditEvents)} baris audit tersimpan`} icon={<Activity className="size-4" />} tone="primary" />
          <Tile label="Ukuran database" value={fileSize(summary.dbSizeBytes)} hint={`schema ${database.schema} · ${count.format(database.totalRows)} baris`} icon={<Database className="size-4" />} />
          <Tile
            label="RLS Postgres"
            value={`${count.format(database.rlsEnabled)}/${count.format(database.rlsTotal)}`}
            hint="RLS belum aktif; isolasi dijaga middleware + requireBusiness"
            icon={<Server className="size-4" />}
            tone={database.rlsEnabled < database.rlsTotal ? "warn" : "deep"}
          />
          <Tile
            label="Salinan mandiri terakhir"
            value={backup.latest ? stamp(backup.latest.createdAt) : "belum ada"}
            hint={backup.latest ? `${count.format(backup.latest.tables)} tabel · ${count.format(backup.latest.rows)} baris` : "jalankan pnpm backup:export"}
            icon={<HardDriveDownload className="size-4" />}
            tone={backup.latest ? "accent" : "warn"}
          />
        </div>
      </section>

      <section id="ai" className="mt-10 scroll-mt-28">
        <SectionHeader
          title="Penggunaan AI"
          icon={<Sparkles className={iconClass} />}
          subtitle="Diambil dari audit internal (audit_events jenis ai). Kuota dipotong hanya setelah jawaban berhasil dibaca."
        />

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <PanelCard title="Request AI per hari (30 hari)">
            <figure>
              <AdminChart
                categories={daily.map((point) => dayLabel(point.day))}
                series={[
                  { name: "Berhasil", data: daily.map((point) => point.ok) },
                  { name: "Gagal", data: daily.map((point) => point.failed) },
                ]}
                colors={["#2C687B", "#DB1A1A"]}
                stacked
                empty="Belum ada panggilan AI dalam 30 hari terakhir."
              />
              <figcaption className="mt-1 text-caption text-deep/70">
                Total {count.format(calls30d)} panggilan, {count.format(failed30d)} gagal, rata-rata {count.format(avgMs)} ms.
              </figcaption>
            </figure>
          </PanelCard>

          <PanelCard title="Token AI per hari">
            <figure>
              <AdminChart
                categories={daily.map((point) => dayLabel(point.day))}
                series={[
                  { name: "Token masuk (prompt)", data: daily.map((point) => point.tokensIn) },
                  { name: "Token keluar (jawaban)", data: daily.map((point) => point.tokensOut) },
                ]}
                colors={["#8CC7C4", "#2C687B"]}
                stacked
                empty="Pemakaian token belum tercatat. Angka mulai terkumpul pada panggilan AI berikutnya."
              />
              <figcaption className="mt-1 text-caption text-deep/70">
                {count.format(tokensIn)} token masuk + {count.format(tokensOut)} token keluar.{" "}
                {cost === null || !rates
                  ? "Tarif biaya belum diset: isi AI_COST_INPUT_PER_MTOK dan AI_COST_OUTPUT_PER_MTOK untuk menaksir biaya."
                  : `Taksiran biaya 30 hari ${formatRupiah(Math.round(cost))} (${formatRupiah(rates.input)}/juta masuk, ${formatRupiah(rates.output)}/juta keluar).`}
              </figcaption>
            </figure>
          </PanelCard>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <PanelCard title="Pemakaian per model">
            {byModel.length === 0 ? (
              <p className="mt-3 text-small text-deep/70">Belum ada panggilan AI tercatat.</p>
            ) : (
              <TableWrap caption="Panggilan AI per model">
                <thead>
                  <tr>
                    <th className={th}>Model</th>
                    <th className={th}>Panggilan</th>
                    <th className={th}>Berhasil</th>
                    <th className={th}>Token masuk</th>
                    <th className={th}>Token keluar</th>
                  </tr>
                </thead>
                <tbody className={tbody}>
                  {byModel.map((item) => (
                    <tr key={item.model}>
                      <td className={td}>{item.model}</td>
                      <td className={`${td} tabular`}>{count.format(item.total)}</td>
                      <td className={`${td} tabular`}>{count.format(item.ok)}</td>
                      <td className={`${td} tabular`}>{count.format(item.tokensIn)}</td>
                      <td className={`${td} tabular`}>{count.format(item.tokensOut)}</td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </PanelCard>

          <PanelCard title="Pemakaian per jenis analisis">
            {byKind.length === 0 ? (
              <p className="mt-3 text-small text-deep/70">Belum ada panggilan AI tercatat.</p>
            ) : (
              <TableWrap caption="Panggilan AI per jenis analisis">
                <thead>
                  <tr>
                    <th className={th}>Jenis</th>
                    <th className={th}>Panggilan</th>
                    <th className={th}>Berhasil</th>
                    <th className={th}>Rata-rata durasi</th>
                  </tr>
                </thead>
                <tbody className={tbody}>
                  {byKind.map((item) => (
                    <tr key={item.kind}>
                      <td className={td}>
                        <Chip tone="info">{item.kind.replace(/_/g, " ")}</Chip>
                      </td>
                      <td className={`${td} tabular`}>{count.format(item.total)}</td>
                      <td className={`${td} tabular`}>{count.format(item.ok)}</td>
                      <td className={`${td} tabular`}>{count.format(item.avgMs)} ms</td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </PanelCard>
        </div>

        <PanelCard
          className="mt-4"
          title="Request AI bulan ini per usaha"
          note={`Periode ${period}. Batang terpanjang menandakan usaha yang paling banyak memakai analisis AI.`}
        >
          <figure className="mt-2">
            <AdminChart
              categories={topAiBusinesses.map((business) => business.name)}
              series={[{ name: "Request AI", data: topAiBusinesses.map((business) => business.aiRequests) }]}
              colors={["#2C687B", "#8CC7C4"]}
              horizontal
              height={Math.max(200, topAiBusinesses.length * 36)}
              empty="Belum ada usaha yang memakai analisis AI bulan ini."
            />
            <figcaption className="mt-1 text-caption text-deep/70">
              {count.format(topAiBusinesses.reduce((sum, business) => sum + business.aiRequests, 0))} request dari {count.format(topAiBusinesses.length)} usaha teratas bulan ini.
            </figcaption>
          </figure>
        </PanelCard>
      </section>

      <section id="usaha" className="mt-10 scroll-mt-28">
        <SectionHeader
          title="Usaha & akun"
          icon={<Store className={iconClass} />}
          subtitle="Siapa pemiliknya, berapa anggota, seberapa aktif catatannya, dan sampai mana kuota terpakai. Isi catatan keuangan pribadi tidak ditampilkan."
        />

        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          <PanelCard title="Peran anggota">
            <figure>
              <AdminDonut
                labels={["Owner", "Admin usaha", "Staf"]}
                series={[summary.owners, adminRoles, summary.staff]}
                colors={["#2C687B", "#8CC7C4", "#DB1A1A"]}
                empty="Belum ada anggota usaha."
              />
              <figcaption className="mt-1 text-caption text-deep/70">
                {count.format(summary.memberships)} keanggotaan untuk {count.format(summary.businesses)} usaha.
              </figcaption>
            </figure>
          </PanelCard>

          <PanelCard title="Paket usaha">
            <figure>
              <AdminDonut
                labels={["Pro efektif", "Free efektif"]}
                series={[proCount, businesses.length - proCount]}
                colors={["#2C687B", "#8CC7C4"]}
                empty="Belum ada usaha terdaftar."
              />
              <figcaption className="mt-1 text-caption text-deep/70">Paket efektif memperhitungkan status langganan dan masa tenggang 7 hari.</figcaption>
            </figure>
          </PanelCard>

          <PanelCard title="Beban data per usaha">
            <ul className="mt-3 flex flex-col gap-2 text-small text-deep">
              {businesses.slice(0, 6).map((business) => (
                <li key={business.id} className="flex items-center justify-between gap-3 border-b border-deep/10 pb-1">
                  <span className="font-semibold text-ink">{business.name}</span>
                  <span className="tabular text-deep/80">
                    {count.format(business.transactions)} transaksi · {count.format(business.openDebts)} utang/piutang
                  </span>
                </li>
              ))}
              {businesses.length === 0 ? <li className="text-deep/70">Belum ada usaha.</li> : null}
            </ul>
          </PanelCard>
        </div>

        <PanelCard className="mt-4" title="Daftar usaha" note={`Kuota memakai periode berjalan ${period}. Hanya owner bisa menghapus usaha.`}>
          {businesses.length === 0 ? (
            <p className="mt-3 text-small text-deep/70">Belum ada usaha terdaftar.</p>
          ) : (
            <TableWrap caption="Daftar usaha beserta pemilik, aktivitas, kuota, dan kesiapan backup" wide>
              <thead>
                <tr>
                  <th className={th}>Usaha</th>
                  <th className={th}>Pemilik</th>
                  <th className={th}>Anggota</th>
                  <th className={th}>Catatan</th>
                  <th className={th}>Kuota AI</th>
                  <th className={th}>Paket</th>
                  <th className={th}>Insight terakhir</th>
                  <th className={th}>Aktivitas terakhir</th>
                  <th className={th}>Backup</th>
                </tr>
              </thead>
              <tbody className={tbody}>
                {businesses.map((business) => (
                  <tr key={business.id}>
                    <td className={td}>
                      <span className="font-semibold text-ink">{business.name}</span>
                      <span className="block text-caption text-deep/60">dibuat {dayOnly(business.createdAt)}</span>
                    </td>
                    <td className={td}>{business.ownerEmail ?? "—"}</td>
                    <td className={`${td} tabular`}>{count.format(business.members)}</td>
                    <td className={`${td} tabular`}>
                      {count.format(business.transactions)}
                      <span className="block text-caption text-deep/60">
                        bulan ini {count.format(business.transactionsThisMonth)}
                        {Number.isFinite(business.txQuota) ? `/${count.format(business.txQuota)}` : ""} · {count.format(business.openDebts)} utang
                      </span>
                    </td>
                    <td className={td}>
                      <span className="tabular">
                        {count.format(business.aiRequests)}/{count.format(business.aiQuota)}
                      </span>
                      <span className="mt-1 block h-1.5 w-24 overflow-hidden rounded-full bg-deep/10">
                        <span
                          className={`block h-full rounded-full ${business.aiRequests >= business.aiQuota ? "bg-primary" : "bg-deep"}`}
                          style={{ width: `${Math.min(100, Math.round((business.aiRequests / Math.max(1, business.aiQuota)) * 100))}%` }}
                        />
                      </span>
                      <span className="block text-caption text-deep/60">sisa {count.format(Math.max(0, business.aiQuota - business.aiRequests))} request</span>
                    </td>
                    <td className={td}>
                      <Chip tone={business.effectivePlan === "pro" ? "ok" : "neutral"} dot>
                        {business.planLabel}
                      </Chip>
                      <span className="mt-1 block text-caption text-deep/60">
                        {PLAN_STATUS_LABEL[business.planStatus] ?? business.planStatus}
                        {business.periodEnd ? ` · sampai ${dayOnly(business.periodEnd)}` : ""}
                      </span>
                    </td>
                    <td className={td}>{business.lastInsight ? dayOnly(business.lastInsight) : "belum ada"}</td>
                    <td className={td}>{stamp(business.lastActivity)}</td>
                    <td className={td}>
                      {business.brandingFiles > 0 ? (
                        <Chip tone="warn">{count.format(business.brandingFiles)} berkas tidak ikut ekspor</Chip>
                      ) : (
                        <Chip tone="ok">ikut ekspor penuh</Chip>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </PanelCard>
      </section>

      <section id="keamanan" className="mt-10 scroll-mt-28">
        <SectionHeader
          title="Keamanan"
          icon={<ShieldCheck className={iconClass} />}
          subtitle="Status admin platform, percobaan masuk, dan kesiapan konfigurasi rahasia. Nilai rahasia hanya ditampilkan terisi atau kosong."
        />

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <PanelCard title="Admin platform">
            <TableWrap caption="Daftar admin platform dan status MFA">
              <thead>
                <tr>
                  <th className={th}>Email</th>
                  <th className={th}>Nama</th>
                  <th className={th}>MFA</th>
                  <th className={th}>Sejak</th>
                </tr>
              </thead>
              <tbody className={tbody}>
                {security.admins.map((item) => (
                  <tr key={item.email}>
                    <td className={td}>{item.email}</td>
                    <td className={td}>{item.name ?? "—"}</td>
                    <td className={td}>
                      <Chip tone={item.mfaEnabled ? "ok" : "warn"} dot>
                        {item.mfaEnabled ? "aktif" : "belum aktif"}
                      </Chip>
                    </td>
                    <td className={td}>{dayOnly(item.since)}</td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div className="mt-4">
              <AdminMfaPanel enabled={mfaEnabled} />
            </div>
          </PanelCard>

          <PanelCard title="Percobaan masuk gagal (7 hari)" note="Batas 5 kegagalan per 15 menit untuk email yang sama, berlaku di login pengguna dan login panel.">
            {security.failed.length === 0 ? (
              <p className="mt-3 text-small text-deep/70">Tidak ada percobaan masuk gagal dalam tujuh hari terakhir.</p>
            ) : (
              <TableWrap caption="Percobaan masuk gagal per email">
                <thead>
                  <tr>
                    <th className={th}>Email</th>
                    <th className={th}>Percobaan</th>
                    <th className={th}>Terakhir</th>
                  </tr>
                </thead>
                <tbody className={tbody}>
                  {security.failed.map((item) => (
                    <tr key={item.email ?? "tanpa-email"}>
                      <td className={td}>{item.email ?? "(tanpa email)"}</td>
                      <td className={td}>
                        <Chip tone={item.attempts >= 5 ? "warn" : "neutral"}>{count.format(item.attempts)}</Chip>
                      </td>
                      <td className={td}>{stamp(item.last)}</td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </PanelCard>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          <PanelCard title="Kesiapan konfigurasi">
            <ul className="mt-3 flex flex-col gap-2 text-small">
              {security.config.map((item) => (
                <li key={item.label} className="flex items-start justify-between gap-3 border-b border-deep/10 pb-1">
                  <span>
                    <span className="font-semibold text-ink">{item.label}</span>
                    <span className="block text-caption text-deep/65">{item.hint}</span>
                  </span>
                  <Chip tone={item.ready ? "ok" : "warn"} dot>
                    {item.ready ? "terisi" : "kosong"}
                  </Chip>
                </li>
              ))}
            </ul>
          </PanelCard>

          <PanelCard title="Peristiwa keamanan terakhir">
            {security.events.length === 0 ? (
              <p className="mt-3 text-small text-deep/70">Belum ada peristiwa keamanan.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2 text-small text-deep">
                {security.events.map((item, index) => (
                  <li key={`${item.at}-${index}`} className="border-b border-deep/10 pb-1">
                    <span className="font-semibold text-ink">{item.action.replace(/_/g, " ")}</span>
                    <span className="block text-caption text-deep/65">
                      {stamp(item.at)} · {item.actor ?? "tanpa aktor"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </PanelCard>

          <PanelCard title="Percobaan masuk terakhir">
            {security.recentLogins.length === 0 ? (
              <p className="mt-3 text-small text-deep/70">Belum ada catatan masuk.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2 text-small text-deep">
                {security.recentLogins.map((item, index) => (
                  <li key={`${item.at}-${index}`} className="flex items-start justify-between gap-3 border-b border-deep/10 pb-1">
                    <span>
                      <span className="font-semibold text-ink">{item.email ?? "(tanpa email)"}</span>
                      <span className="block text-caption text-deep/65">
                        {stamp(item.at)} · {item.scope === "platform_admin" ? "panel platform" : "aplikasi"}
                      </span>
                    </span>
                    <Chip tone={item.success ? "ok" : "warn"} dot>
                      {item.success ? "berhasil" : "gagal"}
                    </Chip>
                  </li>
                ))}
              </ul>
            )}
          </PanelCard>
        </div>
      </section>

      <section id="database" className="mt-10 scroll-mt-28">
        <SectionHeader
          title="Status database"
          icon={<Database className={iconClass} />}
          subtitle={`Database ${database.name} (${database.version}), schema ${database.schema}, koneksi lewat ${database.connection}. Ukuran total ${database.size}.`}
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="Migrasi diterapkan" value={count.format(database.migrationsApplied)} hint={`terakhir ${stamp(database.lastMigration)}`} icon={<Server className="size-4" />} />
          <Tile
            label="Berkas migrasi di repo"
            value={count.format(database.migrationFiles)}
            hint={database.migrationFiles === database.migrationsApplied ? "sama dengan jumlah diterapkan" : "berbeda dari yang diterapkan — periksa"}
            icon={<FileCheck2 className="size-4" />}
            tone={database.migrationFiles === database.migrationsApplied ? "deep" : "warn"}
          />
          <Tile
            label="Tabel tanpa RLS"
            value={count.format(database.rlsTotal - database.rlsEnabled)}
            hint="akses dijaga lapisan aplikasi; aktifkan kebijakan RLS bila perlu batas di database"
            icon={<ShieldCheck className="size-4" />}
            tone={database.rlsEnabled < database.rlsTotal ? "warn" : "deep"}
          />
          <Tile
            label="Tabel terbesar"
            value={database.tables[0]?.table ?? "—"}
            hint={database.tables[0] ? `${database.tables[0].size} · ${count.format(database.tables[0].tableRows)} baris` : undefined}
            icon={<Database className="size-4" />}
          />
        </div>

        <PanelCard className="mt-4" title="Isi & ukuran tabel" note="Ukuran termasuk indeks; jumlah baris dihitung tepat, bukan perkiraan statistik.">
          <TableWrap caption="Jumlah baris, ukuran, dan status RLS tiap tabel" wide>
            <thead>
              <tr>
                <th className={th}>Tabel</th>
                <th className={th}>Baris</th>
                <th className={th}>Ukuran</th>
                <th className={th}>RLS</th>
                <th className={th}>Dipakai untuk</th>
              </tr>
            </thead>
            <tbody className={tbody}>
              {database.tables.map((item) => (
                <tr key={item.table}>
                  <td className={`${td} font-mono text-caption`}>{item.table}</td>
                  <td className={`${td} tabular`}>{count.format(item.tableRows)}</td>
                  <td className={`${td} tabular`}>{item.size}</td>
                  <td className={td}>
                    <Chip tone={item.rls ? "ok" : "neutral"}>{item.rls ? "aktif" : "nonaktif"}</Chip>
                  </td>
                  <td className={`${td} text-deep/70`}>{TABLE_PURPOSE[item.table] ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </PanelCard>
      </section>

      <section id="backup" className="mt-10 scroll-mt-28">
        <SectionHeader
          title="Backup & pemulihan"
          icon={<HardDriveDownload className={iconClass} />}
          subtitle={`Dua lapis: backup otomatis harian Supabase, dan salinan mandiri pnpm backup:export yang menulis seluruh tabel schema ${database.schema}. Berkas branding & bukti bayar hanya ikut backup Supabase.`}
        />

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <PanelCard title="Salinan mandiri" note={backup.latest ? undefined : `Folder yang dipantau: ${backup.folder}`}>
            {backup.latest ? (
              <>
                <p className="mt-2 text-small text-deep">
                  Terbaru {stamp(backup.latest.createdAt)} · {count.format(backup.latest.tables)} tabel · {count.format(backup.latest.rows)} baris
                </p>
                <TableWrap caption="Riwayat salinan mandiri">
                  <thead>
                    <tr>
                      <th className={th}>Folder</th>
                      <th className={th}>Dibuat</th>
                      <th className={th}>Tabel</th>
                      <th className={th}>Baris</th>
                    </tr>
                  </thead>
                  <tbody className={tbody}>
                    {backup.entries.map((entry) => (
                      <tr key={entry.dir}>
                        <td className={`${td} font-mono text-caption`}>{entry.dir}</td>
                        <td className={td}>{stamp(entry.createdAt)}</td>
                        <td className={`${td} tabular`}>{count.format(entry.tables)}</td>
                        <td className={`${td} tabular`}>{count.format(entry.rows)}</td>
                      </tr>
                    ))}
                  </tbody>
                </TableWrap>
              </>
            ) : (
              <p className="mt-3 flex items-start gap-2 rounded-xl border border-primary/35 bg-primary/5 px-3 py-2 text-small text-primary" role="status">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                Belum ada salinan mandiri di folder <code>{backup.folder}</code>. Jalankan <code>pnpm backup:export</code> dari mesin dengan akses database, lalu simpan
                hasilnya di penyimpanan terenkripsi di luar repo.
              </p>
            )}
            <p className="mt-2 text-caption text-deep/70">
              Uji pemulihan bulanan: ekspor → pulihkan ke database uji dengan <code>pnpm db:migrate</code> → bandingkan jumlah baris dengan manifest. Langkah lengkap ada di{" "}
              <code>docs/BACKUP.md</code>.
            </p>
            {backupStale && backup.latest ? (
              <p className="mt-2 flex items-start gap-2 rounded-xl border border-primary/35 bg-primary/5 px-3 py-2 text-caption text-primary" role="status">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                Salinan terakhir memuat {count.format(backup.latest.rows)} baris dari {count.format(database.totalRows)} baris saat ini — data sesudah{" "}
                {stamp(backup.latest.createdAt)} belum tercakup. Jalankan <code>pnpm backup:export</code> lagi.
              </p>
            ) : null}
          </PanelCard>

          <PanelCard title="Cakupan per usaha" note="Ekspor bekerja per schema, bukan per usaha: memulihkan satu usaha berarti memuat tabelnya lalu menyaring business_id.">
            <TableWrap caption="Kesiapan backup per usaha">
              <thead>
                <tr>
                  <th className={th}>Usaha</th>
                  <th className={th}>Baris DB</th>
                  <th className={th}>Berkas storage</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody className={tbody}>
                {businesses.map((business) => (
                  <tr key={business.id}>
                    <td className={td}>{business.name}</td>
                    <td className={`${td} tabular`}>
                      {count.format(business.transactions + business.openDebts)}
                      <span className="block text-caption text-deep/60">transaksi + utang/piutang</span>
                    </td>
                    <td className={`${td} tabular`}>
                      {count.format(business.brandingFiles)}
                      <span className="block text-caption text-deep/60">logo/latar kartu saldo</span>
                    </td>
                    <td className={td}>
                      <Chip tone={business.brandingFiles > 0 ? "warn" : "ok"} dot>
                        {business.brandingFiles > 0 ? "berkas perlu dari Storage" : "pulih penuh dari ekspor"}
                      </Chip>
                    </td>
                  </tr>
                ))}
                {businesses.length === 0 ? (
                  <tr>
                    <td className={td} colSpan={4}>
                      Belum ada usaha terdaftar.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </TableWrap>
            <p className="mt-2 text-caption text-deep/70">
              {brandingBusinesses.length === 0
                ? "Tidak ada usaha dengan berkas branding."
                : `${count.format(brandingBusinesses.length)} usaha punya berkas di bucket privat (${brandingBusinesses.map((item) => item.name).join(", ")}).`}{" "}
              Penghapusan usaha permanen di database aktif, tetapi salinan backup dapat menyimpan data sampai masa retensi berakhir.
            </p>
          </PanelCard>
        </div>
      </section>

      <section id="langganan" className="mt-10 scroll-mt-28">
        <SectionHeader title="Langganan & pembayaran" icon={<CreditCard className={iconClass} />} subtitle="Verifikasi hanya setelah dana benar-benar masuk rekening/QRIS." />
        <PanelCard className="mt-4" title={`Invoice (${count.format(invoices.length)})`}>
          {invoices.length === 0 ? (
            <p className="mt-3 text-small text-deep/70">Belum ada invoice.</p>
          ) : (
            <ul className="mt-2 divide-y divide-deep/10">
              {invoices.map((invoice) => (
                <li key={invoice.id} className="py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="flex flex-wrap items-center gap-2 text-small font-semibold text-ink">
                        <span>
                          {invoice.number} · {invoice.businessName} · {formatRupiah(invoice.amount)}
                        </span>
                        <Chip tone={invoice.status === "paid" ? "ok" : invoice.status === "rejected" ? "warn" : "info"} dot>
                          {STATUS_LABEL[invoice.status] ?? invoice.status}
                        </Chip>
                      </p>
                      <p className="text-caption text-deep/70">
                        dibuat {stamp(invoice.createdAt)} · berlaku sampai {stamp(invoice.expiresAt)}
                      </p>
                      {proofFor(invoice.id).map((proof) => (
                        <p key={proof.id} className="text-caption text-deep/70">
                          Bukti {stamp(proof.createdAt)}: {proof.note ?? "(tanpa keterangan)"}
                          {proof.objectPath ? ` · berkas: ${proof.objectPath}` : " · tanpa berkas"}
                        </p>
                      ))}
                      {invoice.rejectReason ? <p className="text-caption text-primary">Alasan: {invoice.rejectReason}</p> : null}
                    </div>
                    {invoice.status === "pending" || invoice.status === "manual_review" ? (
                      <div className="flex items-start gap-2">
                        <VerifyInvoiceButton invoiceId={invoice.id} />
                        <RejectInvoiceForm invoiceId={invoice.id} />
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </PanelCard>
      </section>

      <section id="operasional" className="mt-10 scroll-mt-28">
        <SectionHeader
          title="Tugas terjadwal & audit"
          icon={<CalendarClock className={iconClass} />}
          subtitle="Retensi audit keamanan dan aktivitas admin 90 hari. Riwayat perubahan transaksi tidak ikut terhapus."
        />
        <PanelCard className="mt-4" title="Jalankan manual">
          <form action={purgeOldAuditEvents} className="mt-3">
            <button type="submit" className={btn.secondary}>
              Bersihkan audit lebih dari 90 hari
            </button>
          </form>
          <form action={runMaintenanceNow} className="mt-3">
            <button type="submit" className={btn.secondary}>
              <RefreshCw className="size-4" aria-hidden />
              Jalankan tugas terjadwal sekarang
            </button>
            <p className="mt-1 text-caption text-deep/70">
              Menandai invoice kedaluwarsa, mengakhiri masa tenggang Pro, mengirim pengingat H-3, membuat analisis harian, dan membersihkan audit lama. Cron otomatis memanggil{" "}
              <code>/api/cron/notifications</code> dengan <code>CRON_SECRET</code>.
            </p>
          </form>
          <p className="mt-4 text-caption text-deep/70">
            <Link href="/masuk" className="font-semibold text-primary hover:underline">
              Masuk sebagai pengguna biasa
            </Link>{" "}
            untuk memakai aplikasi keuangan.
          </p>
        </PanelCard>
      </section>
    </>
  );
}

/** Penjelasan singkat fungsi tabel, untuk staf non-teknis yang membuka panel. */
const TABLE_PURPOSE: Record<string, string> = {
  users: "Akun pengguna",
  accounts: "Akun OAuth (Google)",
  sessions: "Sesi login pengguna",
  verification_tokens: "Token verifikasi email & reset sandi",
  businesses: "Usaha",
  memberships: "Anggota tiap usaha",
  opening_balances: "Saldo awal usaha",
  categories: "Kategori transaksi",
  transactions: "Transaksi (soft delete)",
  transaction_audit_logs: "Riwayat perubahan transaksi",
  debts: "Utang & piutang",
  debt_audit_logs: "Riwayat perubahan utang",
  import_batches: "Riwayat impor CSV",
  import_row_keys: "Sidik anti-duplikat impor",
  subscriptions: "Langganan paket",
  invoices: "Invoice langganan",
  payment_proofs: "Bukti pembayaran",
  platform_admins: "Admin platform + MFA",
  invitations: "Undangan anggota",
  notifications: "Notifikasi pengguna",
  notification_prefs: "Preferensi notifikasi",
  ai_usage: "Kuota AI bulanan",
  ai_insights: "Analisis AI harian",
  login_attempts: "Percobaan login",
  audit_events: "Audit aktivitas",
  idempotency_keys: "Kunci idempotensi (anti dobel catat)",
};
