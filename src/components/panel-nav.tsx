"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  CalendarClock,
  CreditCard,
  Database,
  HardDriveDownload,
  ShieldCheck,
  Sparkles,
  Store,
  type LucideIcon,
} from "lucide-react";
import { adminLogout } from "@/server/modules/platform/actions";

export type PanelSection = { href: string; label: string; icon: LucideIcon; group: string };

export const PANEL_SECTIONS: PanelSection[] = [
  { href: "#ringkasan", label: "Ringkasan", icon: Activity, group: "Pemantauan" },
  { href: "#ai", label: "Penggunaan AI", icon: Sparkles, group: "Pemantauan" },
  { href: "#usaha", label: "Usaha & akun", icon: Store, group: "Pemantauan" },
  { href: "#keamanan", label: "Keamanan", icon: ShieldCheck, group: "Operasional & data" },
  { href: "#database", label: "Database", icon: Database, group: "Operasional & data" },
  { href: "#backup", label: "Backup", icon: HardDriveDownload, group: "Operasional & data" },
  { href: "#langganan", label: "Langganan", icon: CreditCard, group: "Operasional & data" },
  { href: "#operasional", label: "Tugas & audit", icon: CalendarClock, group: "Operasional & data" },
];

const GROUPS = [...new Set(PANEL_SECTIONS.map((section) => section.group))];

/** Bagian yang sedang terlihat; tab/sidebar panjang tetap perlu penanda posisi. */
function useActiveSection() {
  const [active, setActive] = useState(PANEL_SECTIONS[0].href);

  useEffect(() => {
    const targets = PANEL_SECTIONS.map((section) => document.querySelector(section.href)).filter((element): element is Element => Boolean(element));
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const shown = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (shown[0]) setActive(`#${shown[0].target.id}`);
      },
      { rootMargin: "-96px 0px -55% 0px", threshold: 0 },
    );
    targets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return active;
}

function Brand() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-lg bg-deep text-caption font-bold text-white" aria-hidden>
        AI
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-h3 font-bold text-deep">UMKM-AI</span>
        <span className="text-caption text-deep/65">Panel platform</span>
      </span>
    </span>
  );
}

function LogoutButton() {
  return (
    <form action={adminLogout}>
      <button
        type="submit"
        className="min-h-11 w-full rounded-lg bg-deep px-3 text-small font-semibold text-white transition hover:bg-deep/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
      >
        Keluar
      </button>
    </form>
  );
}

/** Sidebar tetap untuk desktop: satu daftar bagian, bukan deretan tab. */
export function PanelSidebar({ email, mfaEnabled }: { email: string | null; mfaEnabled: boolean }) {
  const active = useActiveSection();

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-deep/15 bg-white lg:flex">
      <div className="border-b border-deep/10 px-4 py-3">
        <a href="/panel" className="block">
          <Brand />
        </a>
      </div>

      <nav aria-label="Bagian panel" className="flex-1 overflow-y-auto px-2 py-3">
        {GROUPS.map((group) => (
          <div key={group} className="mb-3 last:mb-0">
            <p className="px-2 pb-1.5 text-caption font-semibold uppercase tracking-wide text-deep/70">{group}</p>
            <ul className="flex flex-col gap-0.5">
              {PANEL_SECTIONS.filter((section) => section.group === group).map((section) => {
                const current = section.href === active;
                const Icon = section.icon;
                return (
                  <li key={section.href}>
                    <a
                      href={section.href}
                      aria-current={current ? "true" : undefined}
                      className={`relative flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-small transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep ${
                        current ? "bg-deep font-bold text-white shadow-sm" : "font-semibold text-deep hover:bg-deep/8"
                      }`}
                    >
                      <span className={`absolute inset-y-2 left-0 w-1 rounded-full ${current ? "bg-accent" : "bg-transparent"}`} aria-hidden />
                      <Icon className={`size-4 shrink-0 ${current ? "text-accent" : "text-deep/80"}`} aria-hidden />
                      {section.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-deep/10 bg-white px-3 py-3">
        <p className="truncate text-caption font-semibold text-deep" title={email ?? undefined}>
          {email ?? "sesi panel"}
        </p>
        <p className={`mt-0.5 flex items-center gap-1.5 text-caption ${mfaEnabled ? "text-deep/80" : "font-semibold text-primary"}`}>
          <span className={`size-1.5 rounded-full ${mfaEnabled ? "bg-deep" : "bg-primary"}`} aria-hidden />
          {mfaEnabled ? "MFA aktif" : "MFA belum aktif"}
        </p>
        <div className="mt-2">
          <LogoutButton />
        </div>
        <p className="mt-2 text-caption text-deep/70">Sesi panel terpisah dari sesi pengguna.</p>
      </div>
    </aside>
  );
}

/** Di layar sempit sidebar diganti bar ringkas + tab datar yang dapat digulir. */
export function PanelMobileNav() {
  const active = useActiveSection();

  return (
    <div className="sticky top-0 z-30 border-b border-deep/10 bg-[#F7F5F4]/95 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <a href="/panel">
          <Brand />
        </a>
        <div className="w-24">
          <LogoutButton />
        </div>
      </div>
      <div className="relative">
        <nav aria-label="Bagian panel" className="-mb-px flex gap-1 overflow-x-auto px-4 sm:px-6">
          {PANEL_SECTIONS.map((section) => {
            const current = section.href === active;
            return (
              <a
                key={section.href}
                href={section.href}
                aria-current={current ? "true" : undefined}
                className={`shrink-0 border-b-2 px-3 py-3 text-small font-semibold transition ${
                  current ? "border-deep text-ink" : "border-transparent text-deep/70 hover:border-deep/30 hover:text-deep"
                }`}
              >
                {section.label}
              </a>
            );
          })}
        </nav>
        {/* Petunjuk bahwa tab bisa digulir ke samping. */}
        <span className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#F7F5F4] to-transparent" aria-hidden />
      </div>
    </div>
  );
}
