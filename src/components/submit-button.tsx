"use client";

import { useFormStatus } from "react-dom";
import { btn } from "./ui";

export function SubmitButton({
  children,
  pendingLabel = "Menyimpan…",
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${btn[variant]} ${className}`} aria-busy={pending}>
      {pending ? (
        <span className="inline-flex items-center gap-2">
          {/* Animasi React (useFormStatus): batang kecil menari selama aksi berjalan. */}
          <span className="flex h-3 items-end gap-0.5" aria-hidden>
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="ledger-bar w-1 rounded-full bg-current"
                style={{ height: `${[7, 11, 9][index]}px`, animationDelay: `${index * 0.12}s` }}
              />
            ))}
          </span>
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}