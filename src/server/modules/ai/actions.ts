"use server";

import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db";
import { aiUsage, auditEvents } from "@/server/db/schema";
import { requireBusiness } from "@/server/lib/access";
import { assertAiQuota, currentPeriod, getPlanState } from "@/server/modules/billing/plan";
import { callAiJson, type AiAnswer } from "./client";
import { buildBusinessSummary } from "./summary";

export type { AiAnswer };

export type AiState = {
  error?: string;
  answer?: AiAnswer;
  question?: string;
  meta?: { model: string; period: string; durationMs: number; insufficient?: boolean };
};

/** Ambang kecukupan data bergantung jenis analisis; versi awal memakai jumlah transaksi (FR-AI-10). */
const MIN_TRANSACTIONS = 5;

const questionSchema = z.string().trim().min(5, "Pertanyaan minimal 5 karakter.").max(500);

/**
 * AI hanya membaca ringkasan backend dan tidak pernah menulis ke ledger (aturan 6).
 * Kuota baru dipotong setelah jawaban berhasil dibaca (FR-AI-16).
 */
export async function askAi(_prev: AiState, formData: FormData): Promise<AiState> {
  const { user, business } = await requireBusiness();
  const parsed = questionSchema.safeParse(formData.get("question"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const question = parsed.data;

  const baseUrl = process.env.AI_BASE_URL || "https://api.groq.com/openai/v1";
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || "qwen/qwen3.8-27b";
  if (!apiKey) {
    return { error: "AI belum dikonfigurasi. Isi AI_API_KEY (dan opsional AI_BASE_URL/AI_MODEL) di .env.local." };
  }

  const plan = await getPlanState(business.id);
  try {
    assertAiQuota(plan);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Kuota AI habis." };
  }

  const summary = await buildBusinessSummary(business.id, business.name);
  const period = `${summary.months[0]?.from ?? "-"} s/d ${summary.months.at(-1)?.to ?? "-"}`;

  if (summary.totalTransactions < MIN_TRANSACTIONS) {
    return {
      question,
      answer: {
        temuan: [`Baru ada ${summary.totalTransactions} transaksi dalam rentang ${period}; analisis belum bisa dibuat.`],
        interpretasi: "Data belum cukup untuk menyimpulkan pola pendapatan atau pengeluaran.",
        rekomendasi: ["Catat minimal lima transaksi agar pola awal bisa terlihat.", "Pastikan kategori dipilih saat mencatat."],
        keterbatasan: ["Analisis butuh data aktual; sistem tidak mengarang angka."],
      },
      meta: { model: "tanpa-panggilan-ai", period, durationMs: 0, insufficient: true },
    };
  }

  const started = Date.now();
  const result = await callAiJson({
    baseUrl,
    apiKey,
    model,
    maxTokens: 1400,
    userContent: `Ringkasan bisnis (JSON):
${JSON.stringify(summary)}

Pertanyaan pemilik usaha: ${question}`,
  });

  if (!result.ok) {
    // FR-AI-15/16: kegagalan layanan atau jawaban tidak terbaca tidak memotong kuota.
    await db.insert(auditEvents).values({
      businessId: business.id,
      actorId: user.id,
      type: "ai",
      metadata: { model, period, status: "gagal", durationMs: Date.now() - started, kind: "tanya_jawab", error: result.error.slice(0, 200) },
    });
    return { error: `${result.error} Kuota tidak dipotong, silakan coba lagi.`, question };
  }
  const answer = result.answer;

  await db
    .insert(aiUsage)
    .values({ businessId: business.id, period: currentPeriod(), requests: 1 })
    .onConflictDoUpdate({
      target: [aiUsage.businessId, aiUsage.period],
      set: { requests: sql`${aiUsage.requests} + 1`, updatedAt: new Date() },
    });

  await db.insert(auditEvents).values({
    businessId: business.id,
    actorId: user.id,
    type: "ai",
    metadata: { model, period, status: "sukses", durationMs: Date.now() - started, kind: "tanya_jawab", question: question.slice(0, 200) },
  });

  return { question, answer, meta: { model, period, durationMs: Date.now() - started } };
}