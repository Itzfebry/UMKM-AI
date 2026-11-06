import type { ReactNode } from "react";

export const btn = {
  primary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-body font-semibold text-white transition hover:opacity-90 disabled:opacity-60",
  secondary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-deep/25 bg-white px-4 text-body font-semibold text-deep transition hover:border-deep/50",
  ghost: "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-body text-deep hover:bg-deep/5",
};

export const input =
  "min-h-11 w-full rounded-lg border border-deep/20 bg-white px-3 text-body text-ink outline-none focus:border-deep focus:ring-2 focus:ring-accent/40";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-deep/10 bg-white p-4 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-4">
      <h1 className="text-h1 text-deep">{title}</h1>
      {subtitle ? <p className="mt-1 text-small text-deep/80">{subtitle}</p> : null}
    </header>
  );
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-lg border border-dashed border-deep/25 bg-surface p-6 text-center">
      <p className="text-body font-semibold text-deep">{title}</p>
      <p className="mt-1 text-small text-deep/80">{hint}</p>
    </div>
  );
}

export function ErrorText({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-lg bg-primary/10 px-3 py-2 text-small text-primary">
      {children}
    </p>
  );
}