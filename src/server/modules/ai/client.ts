import { z } from "zod";

/** Bentuk jawaban yang diterima dari AI (FR-AI-06). */
export const answerSchema = z.object({
  temuan: z.array(z.string()).default([]),
  interpretasi: z.string().default(""),
  rekomendasi: z.array(z.string()).default([]),
  keterbatasan: z.array(z.string()).default([]),
});

export type AiAnswer = z.infer<typeof answerSchema>;

const SYSTEM_RULES = `Anda analis keuangan untuk usaha kecil di Indonesia. Aturan wajib:
- Semua angka sudah dihitung sistem. Jangan menghitung ulang, jangan mengarang angka di luar ringkasan.
- Jangan menyebut selisih arus kas sebagai "laba bersih" atau "keuntungan"; sebut "arus kas bersih".
- Setiap temuan harus menyebut periode dan angka pendukung dari ringkasan.
- Pisahkan temuan, interpretasi, rekomendasi, dan keterbatasan. Jangan mencampur.
- Rekomendasi harus berupa langkah praktis yang bisa dicek pemilik usaha ke catatannya.
- Bila data kurang, katakan kurangnya dan langkah menambah data.
Jawab HANYA dengan JSON: {"temuan":[],"interpretasi":"","rekomendasi":[],"keterbatasan":[]}`;

export type AiCallInput = {
  baseUrl: string;
  apiKey: string;
  model: string;
  userContent: string;
  maxTokens?: number;
  systemExtra?: string;
};

export type AiCallResult = { ok: true; answer: AiAnswer } | { ok: false; error: string };

/** Ambil objek JSON pertama walau model membungkusnya dengan pagar markdown. */
function extractJson(content: string) {
  const cleaned = content.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  return start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
}

async function request(input: AiCallInput, jsonMode: boolean) {
  const response = await fetch(`${input.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${input.apiKey}` },
    body: JSON.stringify({
      model: input.model,
      temperature: jsonMode ? 0.2 : 0.4,
      max_tokens: input.maxTokens ?? 1400,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: input.systemExtra ? `${SYSTEM_RULES}\n${input.systemExtra}` : SYSTEM_RULES },
        { role: "user", content: input.userContent },
      ],
    }),
    signal: AbortSignal.timeout(45_000),
  });
  const body = await response.text();
  return { response, body };
}

/**
 * Memanggil model dengan mode JSON; bila layanan menolak karena JSON tidak valid
 * (jawaban terpotong, mis. Groq 400 json_validate_failed), ulangi sekali tanpa mode JSON
 * lalu parsing longgar.
 */
export async function callAiJson(input: AiCallInput): Promise<AiCallResult> {
  try {
    let { response, body } = await request(input, true);

    if (!response.ok && response.status === 400 && body.includes("json_validate_failed")) {
      ({ response, body } = await request(input, false));
    }

    if (!response.ok) {
      return { ok: false, error: `Layanan AI menolak permintaan (${response.status}): ${body.slice(0, 200)}` };
    }

    const payload = JSON.parse(body) as { choices?: { message?: { content?: string } }[] };
    const content = payload.choices?.[0]?.message?.content ?? "";
    if (!content.trim()) return { ok: false, error: "Layanan AI mengirim jawaban kosong." };

    try {
      return { ok: true, answer: answerSchema.parse(JSON.parse(extractJson(content))) };
    } catch {
      return { ok: false, error: "Jawaban AI tidak bisa dibaca sebagai JSON." };
    }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Permintaan AI gagal." };
  }
}