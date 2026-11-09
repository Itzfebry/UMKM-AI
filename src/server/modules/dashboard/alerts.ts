import { and, count, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { openingBalances, transactions } from "@/server/db/schema";
import { getPlanState } from "@/server/modules/billing/plan";
import { getDebtSummary } from "@/server/modules/debts/queries";
import { jakartaDate } from "@/server/modules/ledger/queries";
import { formatRupiah } from "@/lib/format";

export type AlertLevel = "danger" | "warning" | "info";
export type Alert = { level: AlertLevel; title: string; hint: string; href: string };

/** Pemeriksaan otomatis yang berjalan setiap kali beranda dibuka — tanpa perintah pengguna. */
export async function getBusinessAlerts(businessId: string): Promise<Alert[]> {
  const today = jakartaDate();
  const monthStart = `${today.slice(0, 7)}-01`;
  // Ringkasan "lewat jatuh tempo" memakai dueDate < hari ini, jadi tautan pun berhenti kemarin.
  const yesterday = jakartaDate(new Date(Date.now() - 86_400_000));

  const [debt, plan, [uncategorized], opening] = await Promise.all([
    getDebtSummary(businessId),
    getPlanState(businessId),
    db
      .select({ total: count() })
      .from(transactions)
      .where(
        and(
          eq(transactions.businessId, businessId),
          isNull(transactions.deletedAt),
          isNull(transactions.categoryId),
          sql`${transactions.transactionDate} >= ${monthStart}::date`,
        ),
      ),
    db.select({ amount: openingBalances.amount }).from(openingBalances).where(eq(openingBalances.businessId, businessId)).limit(1),
  ]);

  const alerts: Alert[] = [];

  if (debt.overdue > 0) {
    alerts.push({
      level: "danger",
      title: `${debt.overdue} utang/piutang lewat jatuh tempo`,
      hint: "Tagih piutang atau lunasi utang yang sudah melewati tanggal jatuh tempo.",
      href: `/utang-piutang?to=${yesterday}`,
    });
  }
  if (debt.receivable > 0) {
    alerts.push({
      level: "info",
      title: `Piutang belum tertagih ${formatRupiah(debt.receivable)}`,
      hint: "Catat pembayaran begitu uang benar-benar diterima agar kas tetap akurat.",
      href: "/utang-piutang?kind=receivable",
    });
  }
  if (Number(uncategorized?.total ?? 0) > 0) {
    alerts.push({
      level: "warning",
      title: `${uncategorized.total} transaksi bulan ini tanpa kategori`,
      hint: "Kategori membuat rincian pengeluaran dan laporan lebih berguna.",
      href: `/transaksi?categoryId=none&from=${monthStart}`,
    });
  }
  if (!opening) {
    alerts.push({
      level: "info",
      title: "Saldo awal kas belum diisi",
      hint: "Isi saldo kas saat mulai memakai aplikasi agar angka kas tidak menebak.",
      href: "/pengaturan",
    });
  }

  if (plan.readOnly) {
    alerts.push({
      level: "danger",
      title: "Masa aktif paket Free sudah habis",
      hint: "Akun kini mode baca saja: data masih bisa dibaca dan diekspor, tetapi pencatatan baru diblokir. Upgrade ke Pro untuk melanjutkan.",
      href: "/langganan",
    });
  } else if (plan.plan === "free" && plan.trialDaysLeft <= 2) {
    alerts.push({
      level: "warning",
      title: `Masa aktif Free tersisa ${plan.trialDaysLeft} hari`,
      hint: "Setelah masa aktif habis, akun beralih ke mode baca saja (ekspor tetap bisa). Upgrade ke Pro kapan saja.",
      href: "/langganan",
    });
  }

  const aiLeft = plan.limits.aiRequests - plan.usage.aiRequests;
  if (aiLeft <= 2) {
    alerts.push({
      level: aiLeft <= 0 ? "warning" : "info",
      title:
        aiLeft <= 0
          ? plan.limits.aiPeriod === "lifetime"
            ? "Kuota AI Free sudah habis"
            : "Kuota AI bulan ini habis"
          : plan.limits.aiPeriod === "lifetime"
            ? `Sisa kuota AI Free ${aiLeft}`
            : `Sisa kuota AI bulan ini ${aiLeft}`,
      hint: "Fitur pencatatan dan laporan tetap berjalan walau kuota AI habis.",
      href: "/langganan",
    });
  }

  // Urutkan sesuai tingkat kepentingan supaya kartu "Perlu perhatian" konsisten dengan legendanya.
  const rank: Record<AlertLevel, number> = { danger: 0, warning: 1, info: 2 };
  return alerts.sort((a, b) => rank[a.level] - rank[b.level]);
}