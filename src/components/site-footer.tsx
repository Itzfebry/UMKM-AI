import Link from "next/link";

/* Anchor memakai "#/..." bukan "#..." supaya tautan tetap benar di halaman non-landing. */
const NAV = [
  { href: "/#fitur", label: "Fitur" },
  { href: "/#analisis", label: "Analisis AI" },
  { href: "/#cara-kerja", label: "Cara kerja" },
  { href: "/#keamanan", label: "Keamanan" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#harga", label: "Harga" },
];

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
const label = "font-mono text-[11px] font-medium uppercase tracking-[0.16em]";

/** Footer global, sama seperti landing page. `compact` = satu baris tipis (tanpa deskripsi, nav, status). */
export function SiteFooter({ compact = false }: { compact?: boolean } = {}) {
  if (compact) {
    return (
      <footer className="border-t border-deep/10 bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <p className="text-small font-bold text-primary">
            UMKM-AI
            <span className="ml-1 align-super font-mono text-[9px] text-deep/50">®</span>
          </p>
          <span className={`flex flex-wrap items-center gap-2 text-deep/80 ${label}`}>
            © {new Date().getFullYear()} UMKM-AI · By
            <a
              href="https://itzai.site"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center rounded-full border border-deep/15 bg-white px-2.5 py-0.5 font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary hover:text-white ${focus}`}
            >
              ITZ AI
              <span className="sr-only"> (buka itzai.site di tab baru)</span>
            </a>
          </span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-deep/10 bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="text-h3 font-bold text-primary">
            UMKM-AI
            <span className="ml-1 align-super font-mono text-[9px] text-deep/50">®</span>
          </p>
          <p className="mt-3 max-w-sm text-small text-deep/80">
            Aplikasi pencatatan keuangan dan analisis bisnis berbasis AI untuk UMKM Indonesia. Versi pertama fokus
            pada catatan yang rapi dan angka yang mudah dipahami.
          </p>
        </div>

        <nav aria-label="Tautan footer" className="grid grid-cols-2 gap-x-8 gap-y-3 md:col-span-4">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`text-small text-deep/80 transition hover:text-primary ${focus}`}>
              {n.label}
            </Link>
          ))}
          <Link href="/masuk" className={`text-small text-deep/80 transition hover:text-primary ${focus}`}>
            Masuk
          </Link>
          <Link href="/daftar" className={`text-small text-deep/80 transition hover:text-primary ${focus}`}>
            Daftar
          </Link>
        </nav>

        <div className="md:col-span-3">
          <p className={`text-deep/50 ${label}`}>status</p>
          <p className="mt-3 font-mono text-[11px] text-deep/80">v1 · pencatatan, laporan, analisis AI</p>
          <p className="mt-1 font-mono text-[11px] text-deep/80">proyek portofolio · 2026</p>
        </div>
      </div>

      <div className="border-t border-deep/10">
        <div
          className={`mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-deep/80 sm:px-6 ${label}`}
        >
          <span className="flex flex-wrap items-center gap-2">
            © {new Date().getFullYear()} UMKM-AI · By
            <a
              href="https://itzai.site"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center rounded-full border border-deep/15 bg-white px-2.5 py-1 font-semibold text-primary shadow-sm transition-colors hover:border-primary/40 hover:bg-primary hover:text-white ${focus}`}
            >
              ITZ AI
              <span className="sr-only"> (buka itzai.site di tab baru)</span>
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
