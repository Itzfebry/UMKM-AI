"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { askAi, type AiState } from "@/server/modules/ai/actions";
import { SubmitButton } from "@/components/submit-button";
import { ErrorText, btn, input } from "./ui";

const SUGGESTIONS = [
  "Bagaimana tren pendapatan tiga bulan terakhir?",
  "Pengeluaran kategori apa yang paling perlu ditekan?",
  "Apakah arus kas cukup sehat untuk menambah stok?",
];

function Answer({ state }: { state: AiState }) {
  if (!state.answer) return null;
  const { temuan, interpretasi, rekomendasi, keterbatasan } = state.answer;
  return (
    <article className="rounded-xl border border-deep/10 bg-white p-4">
      <p className="text-small font-semibold text-deep">{state.question}</p>
      {state.meta ? (
        <p className="text-caption text-deep/60">
          Periode {state.meta.period} · model {state.meta.model} · {state.meta.durationMs} ms
        </p>
      ) : null}

      {temuan.length ? (
        <>
          <h3 className="mt-3 text-caption font-semibold uppercase tracking-wide text-deep/70">Temuan</h3>
          <ul className="list-disc space-y-1 pl-5 text-small text-ink">
            {temuan.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}

      {interpretasi ? (
        <>
          <h3 className="mt-3 text-caption font-semibold uppercase tracking-wide text-deep/70">Interpretasi</h3>
          <p className="text-small text-ink">{interpretasi}</p>
        </>
      ) : null}

      {rekomendasi.length ? (
        <>
          <h3 className="mt-3 text-caption font-semibold uppercase tracking-wide text-deep/70">Rekomendasi</h3>
          <ul className="list-disc space-y-1 pl-5 text-small text-ink">
            {rekomendasi.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}

      {keterbatasan.length ? (
        <>
          <h3 className="mt-3 text-caption font-semibold uppercase tracking-wide text-deep/70">Keterbatasan</h3>
          <ul className="list-disc space-y-1 pl-5 text-caption text-deep/80">
            {keterbatasan.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}

      <p className="mt-3 rounded-lg bg-accent/20 px-3 py-2 text-caption text-deep">
        Periksa angka pada rekomendasi ke catatan transaksi sumber. Percakapan tidak disimpan setelah Anda menutup halaman.
      </p>
    </article>
  );
}

export function AiChat({
  configured,
  quota,
}: {
  configured: boolean;
  quota: { used: number; limit: number; plan: string; resetLabel: string };
}) {
  const [state, action] = useActionState<AiState, FormData>(askAi, {});
  const [history, setHistory] = useState<AiState[]>([]);
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const seen = useRef<AiState | null>(null);

  useEffect(() => {
    if (state.answer && state !== seen.current) {
      seen.current = state;
      setHistory((prev) => [...prev, state]);
      if (questionRef.current) questionRef.current.value = "";
    }
  }, [state]);

  const remaining = Math.max(quota.limit - quota.used, 0);

  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-col gap-2 rounded-xl border border-deep/10 bg-white p-4">
        <label className="text-small font-semibold text-deep" htmlFor="ai-question">
          Pertanyaan
        </label>
        <textarea
          ref={questionRef}
          id="ai-question"
          name="question"
          rows={3}
          required
          minLength={5}
          maxLength={500}
          placeholder="Contoh: kenapa arus kas bulan ini turun?"
          className={`${input} min-h-20 py-2`}
        />
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className={`${btn.ghost} min-h-9 px-3 text-caption`}
              onClick={() => {
                if (questionRef.current) questionRef.current.value = s;
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="text-caption text-deep/70">
          Paket {quota.plan} · sisa kuota AI bulan ini {remaining} dari {quota.limit} · direset {quota.resetLabel}
          {configured ? "" : " · AI belum dikonfigurasi di server"}
        </p>
        <ErrorText>{state.error}</ErrorText>
        <div>
          <SubmitButton pendingLabel="Menganalisis...">Tanya analis</SubmitButton>
        </div>
      </form>

      {history.map((item, index) => (
        <Answer key={`${item.question}-${index}`} state={item} />
      ))}
    </div>
  );
}