"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { aiInsights, aiUsage, auditEvents } from "@/server/db/schema";
import { requireBusiness } from "@/server/lib/access";
import { assertAiQuota, currentPeriod, getPlanState } from "@/server/modules/billing/plan";
import { jakartaDate } from "@/server/modules/ledger/queries";
import { callAiJson, type AiAnswer } from "./client";
import { buildBusinessSummary, type BusinessSummary } from "./summary";

export type InsightState = { error?: string; ok?: boolean; insight?: AiAnswer; createdAt?: string } | undefined;

const INSIGHT_PROMPT = `Buat ringkasan singkat kondisi keuangan periode ini untuk pemilik usaha: satu temuan utama, satu risiko atau hal yang perlu dijaga, dan dua langkah praktis. Sebutkan angka pendukung dari ringkasan.`;

const reader = (summary: BusinessSummary) =>
  `Ringkasan bisnis (JSON):
${JSON.stringify(summary)}

Tugas: ${INSIGHT_PROMPT}`;

type Generated = { ok: true; insight: AiAnswer; createdAt: Date } | { ok: false; error: string };

/**
 * Inti pembuatan insight: dipakai tombol manual di beranda DAN tugas terjadwal
 * (analisis otomatis tanpa perintah pengguna). Satu baris per hari per bisnis.
 */
async function generateInsight(
  business: { id: string; name: string },
  actorId: string | null,
  kind: "insight_otomatis" | "insight_manual",
): Promise<Generated> {
  const baseUrl = process.env.AI_BASE_URL || "https://api.groq.com/openai/v1";
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || "qwen/qwen3.8-27b";
  if (!apiKey) return { ok: false, error: "AI belum dikonfigurasi (AI_API_KEY)." };

  const plan = await getPlanState(business.id);
  try {
    assertAiQuota(plan);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Kuota AI habis." };
  }

  const summary = await buildBusinessSummary(business.id, business.name);
  if (summary.totalTransactions < 5) {
    return { ok: false, error: "Data belum cukup untuk insight otomatis (minimal 5 transaksi dalam tiga bulan)." };
  }

  const log = (status: "sukses" | "gagal", started: number, extra: Record<string, unknown> = {}) =>
    db.insert(auditEvents).values({
      businessId: business.id,
      actorId,
      type: "ai",
      metadata: {
        model,
        status,
        durationMs: Date.now() - started,
        kind,
        period: `${summary.months[0]?.from} s/d ${summary.months.at(-1)?.to}`,
        ...extra,
      },
    });

  const started = Date.now();
  const result = await callAiJson({
    baseUrl,
    apiKey,
    model,
    maxTokens: 1200,
    systemExtra: "Fokus pada satu temuan utama, satu risiko, dan dua langkah praktis.",
    userContent: reader(summary),
  });

  if (!result.ok) {
    await log("gagal", started, { error: result.error.slice(0, 160) });
    return { ok: false, error: result.error };
  }

  try {
    const insight = result.answer;
    const createdAt = new Date();
    await db
      .insert(aiInsights)
      .values({ businessId: business.id, dayKey: jakartaDate(), model, content: insight, createdAt })
      .onConflictDoUpdate({
        target: [aiInsights.businessId, aiInsights.dayKey],
        set: { content: insight, model, createdAt },
      });

    await db
      .insert(aiUsage)
      .values({ businessId: business.id, period: currentPeriod(), requests: 1 })
      .onConflictDoUpdate({
        target: [aiUsage.businessId, aiUsage.period],
        set: { requests: sql`${aiUsage.requests} + 1`, updatedAt: new Date() },
      });

    await log("sukses", started, { usage: result.usage });
    return { ok: true, insight, createdAt };
  } catch (error) {
    await log("gagal", started, { error: error instanceof Error ? error.message.slice(0, 160) : "tidak dikenal" });
    return { ok: false, error: error instanceof Error ? error.message : "Gagal membuat insight." };
  }
}

/** Tombol "Perbarui insight" di beranda. */
export async function generateDashboardInsight(): Promise<InsightState> {
  const { user, business } = await requireBusiness();
  const result = await generateInsight(business, user.id, "insight_manual");
  if (!result.ok) return { error: result.error };
  revalidatePath("/beranda");
  revalidatePath("/ai");
  return { ok: true, insight: result.insight, createdAt: result.createdAt.toISOString() };
}

/** Insight harian tanpa perintah: dipanggil tugas terjadwal; dilewati bila hari ini sudah ada. */
export async function ensureDailyInsight(business: { id: string; name: string }): Promise<"ada" | "dibuat" | "dilewati"> {
  const [existing] = await db
    .select({ id: aiInsights.id })
    .from(aiInsights)
    .where(and(eq(aiInsights.businessId, business.id), eq(aiInsights.dayKey, jakartaDate())))
    .limit(1);
  if (existing) return "ada";

  const result = await generateInsight(business, null, "insight_otomatis");
  return result.ok ? "dibuat" : "dilewati";
}

export type InsightRecord = { insight: AiAnswer; createdAt: Date; model: string; dayKey: string; today: boolean };

/** Insight hari ini, atau yang terakhir tersimpan, supaya beranda tidak menampilkan kekosongan. */
export async function getBusinessInsight(businessId: string): Promise<InsightRecord | null> {
  const [row] = await db
    .select({ content: aiInsights.content, createdAt: aiInsights.createdAt, model: aiInsights.model, dayKey: aiInsights.dayKey })
    .from(aiInsights)
    .where(eq(aiInsights.businessId, businessId))
    .orderBy(desc(aiInsights.dayKey))
    .limit(1);
  if (!row) return null;
  return {
    insight: row.content as AiAnswer,
    createdAt: row.createdAt,
    model: row.model,
    dayKey: row.dayKey,
    today: row.dayKey === jakartaDate(),
  };
}

export type AiActivity = { at: string; status: string; kind: string; model: string; durationMs: number | null; detail: string | null };

/** Log aktivitas AI (audit_events type 'ai'): kapan sistem menganalisis, model apa, berhasil atau tidak. */
export async function listAiActivity(businessId: string, limit = 8): Promise<AiActivity[]> {
  const rows = await db
    .select({ metadata: auditEvents.metadata, createdAt: auditEvents.createdAt })
    .from(auditEvents)
    .where(and(eq(auditEvents.businessId, businessId), eq(auditEvents.type, "ai")))
    .orderBy(desc(auditEvents.createdAt))
    .limit(limit);

  return rows.map((row) => {
    const meta = (row.metadata ?? {}) as Record<string, unknown>;
    return {
      at: row.createdAt.toISOString(),
      status: String(meta.status ?? "tidak diketahui"),
      kind: String(meta.kind ?? "analisis"),
      model: String(meta.model ?? "-"),
      durationMs: typeof meta.durationMs === "number" ? meta.durationMs : null,
      detail: typeof meta.error === "string" ? meta.error : typeof meta.question === "string" ? meta.question : null,
    };
  });
}
