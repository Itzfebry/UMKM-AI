import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      {/* background1.jpg sebagai latar; overlay menjaga kontras form */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[url('/images/background1.jpg')] bg-cover bg-center" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-surface/80 backdrop-blur-[2px]" />

      <Link href="/" className="mb-6 text-h2 font-bold text-primary">
        UMKM-AI
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-white/60 bg-white/95 p-6 shadow-xl shadow-deep/10">
        {children}
      </div>
      <p className="mt-6 max-w-sm text-center text-caption text-deep/80">
        Bukan sekadar mencatat keuangan. Pahami bisnis di balik angkanya.
      </p>
    </main>
  );
}