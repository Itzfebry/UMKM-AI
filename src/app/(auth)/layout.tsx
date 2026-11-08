import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/#fitur", label: "Fitur" },
  { href: "/#faq", label: "FAQ" },
  { href: "/daftar", label: "Daftar" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-6 flex items-center justify-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-small font-bold text-white">
              U
            </span>
            <span className="text-h3 font-bold text-primary">UMKM-AI</span>
          </Link>
          <div className="rounded-xl border border-deep/10 bg-white p-6 shadow-sm sm:p-8">{children}</div>
        </div>
      </main>

      <footer className="border-t border-deep/10 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-small text-deep/70 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} UMKM-AI · Manajemen kas usaha dengan AI</p>
          <nav aria-label="Tautan footer" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {FOOTER_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="transition hover:text-primary">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}