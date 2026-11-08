"use client";

import { useEffect, useState } from "react";
import { Cookie, Settings2 } from "lucide-react";

const KEY = "umkm_ai_cookie_choice";

type Choice = "all" | "essential";

/**
 * Banner persetujuan cookie saat pertama membuka situs. Pilihan disimpan di localStorage;
 * tanpa pilihan, banner muncul lagi pada kunjungan berikutnya. Cookie esensial selalu aktif.
 */
export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {
      // localStorage diblokir: biarkan banner tampil tanpa menyimpan.
      setOpen(true);
    }
  }, []);

  function save(choice: Choice) {
    try {
      localStorage.setItem(KEY, choice);
    } catch {
      // abaikan; keputusan tetap berlaku untuk sesi ini.
    }
    setOpen(false);
  }

  /**
   * "Simpan pilihan" menghormati sakelar analitik; saat pengaturan belum dibuka, tombol
   * kedua berarti tolak semua non-esensial.
   */
  function saveFromDetail() {
    save(detail && analytics ? "all" : "essential");
  }

  if (!open) return null;

  return (
    <div
      role="region"
      aria-label="Persetujuan cookie"
      className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4"
    >
      <div className="mx-auto flex max-w-xl flex-col overflow-hidden rounded-2xl border border-deep/15 bg-white shadow-[0_30px_70px_-30px_rgba(26,26,26,0.5)]">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Cookie className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-h3 text-ink">Kami memakai cookie</p>
            <p className="mt-1 text-small text-deep/80">
              Cookie esensial menjaga situs tetap berjalan. Cookie analitik membantu kami memahami cara
              situs digunakan, dan hanya aktif bila kamu setujui.
            </p>
          </div>
        </div>

        {/* Kelola: daftar kategori */}
        {detail ? (
          <ul className="mt-4 space-y-px border-y border-deep/10 bg-surface/60">
            <li className="flex items-start justify-between gap-4 px-5 py-4">
              <span>
                <span className="block text-small font-semibold text-ink">Esensial</span>
                <span className="text-small text-deep/75">
                  Keamanan sesi dan fungsi dasar. Selalu aktif.
                </span>
              </span>
              <span className="mt-0.5 shrink-0 rounded-full bg-moss/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-moss">
                Aktif
              </span>
            </li>
            <li className="flex items-start justify-between gap-4 px-5 py-4">
              <label htmlFor="cookie-analytics" className="cursor-pointer">
                <span className="block text-small font-semibold text-ink">Analitik</span>
                <span className="text-small text-deep/75">Statistik anonim tentang penggunaan situs.</span>
              </label>
              <label className="relative mt-0.5 inline-flex shrink-0 cursor-pointer items-center">
                <input
                  id="cookie-analytics"
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className="h-6 w-11 rounded-full bg-deep/20 transition-colors peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary"
                />
                <span
                  aria-hidden
                  className="absolute left-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"
                />
                <span className="sr-only">Izinkan cookie analitik</span>
              </label>
            </li>
          </ul>
        ) : null}

        {/* Aksi: hierarki utama / sekunder / tersier */}
        <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row-reverse sm:items-center sm:gap-3">
          <button
            type="button"
            onClick={() => save("all")}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-primary px-5 text-small font-semibold text-white transition-colors hover:bg-[#C01717] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:flex-none"
          >
            Terima semua
          </button>
          <button
            type="button"
            onClick={detail ? saveFromDetail : () => save("essential")}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-deep/25 px-5 text-small font-semibold text-deep transition-colors hover:border-deep/45 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:flex-none"
          >
            {detail ? "Simpan pilihan" : "Tolak non-esensial"}
          </button>
          {!detail ? (
            <button
              type="button"
              onClick={() => setDetail(true)}
              className="mr-auto inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-small font-semibold text-deep/80 transition-colors hover:text-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Settings2 className="size-4" aria-hidden />
              Pengaturan
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
