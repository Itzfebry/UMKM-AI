"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, CreditCard, FileBarChart, LayoutDashboard, LogOut, Menu, ReceiptText, Settings, Users } from "lucide-react";

const NAV_ITEMS = {
  beranda: { href: "/beranda", label: "Beranda", icon: LayoutDashboard },
  transaksi: { href: "/transaksi", label: "Transaksi", icon: ReceiptText },
  laporan: { href: "/laporan", label: "Laporan", icon: FileBarChart },
  ai: { href: "/ai", label: "Analis AI", icon: Bot },
  anggota: { href: "/anggota", label: "Anggota", icon: Users },
  langganan: { href: "/langganan", label: "Langganan", icon: CreditCard },
  pengaturan: { href: "/pengaturan", label: "Pengaturan", icon: Settings },
  menu: { href: "/menu", label: "Menu", icon: Menu },
} as const;

// Sidebar (rail) desktop: urutan logo - beranda - menu - transaksi - AI - laporan - anggota - langganan - pengaturan.
const RAIL_ORDER = ["beranda", "menu", "transaksi", "ai", "laporan", "anggota", "langganan", "pengaturan"] as const;
// Bottom nav mobile: sesuai DESIGN.md.
const BOTTOM_ORDER = ["beranda", "transaksi", "laporan", "ai", "menu"] as const;

const NAV = RAIL_ORDER.map((key) => NAV_ITEMS[key]);
const BOTTOM_NAV = BOTTOM_ORDER.map((key) => NAV_ITEMS[key]);

export function AppNav({ variant, logout }: { variant: "rail" | "bottom"; logout: () => Promise<void> }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  if (variant === "rail") {
    return (
      <nav aria-label="Navigasi utama" className="hidden lg:flex lg:w-full lg:flex-1 lg:flex-col lg:items-center lg:gap-2">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={label}
            aria-current={isActive(href) ? "page" : undefined}
            className={`flex size-11 items-center justify-center rounded-xl transition ${
              isActive(href) ? "bg-white text-primary shadow-sm" : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="size-5" aria-hidden />
            <span className="sr-only">{label}</span>
          </Link>
        ))}
        <form action={logout} className="mt-auto">
          <button
            type="submit"
            title="Keluar"
            className="flex size-11 items-center justify-center rounded-xl bg-white text-primary-matte shadow-sm hover:bg-white/90"
          >
            <LogOut className="size-5" aria-hidden />
            <span className="sr-only">Keluar</span>
          </button>
        </form>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-deep/10 bg-white/95 backdrop-blur lg:hidden"
    >
      <ul className="flex items-stretch">
        {BOTTOM_NAV.map(({ href, label, icon: Icon }) => (
          <li key={href} className="flex-1">
            <Link
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 text-caption ${
                isActive(href) ? "text-primary" : "text-deep/75"
              }`}
            >
              <Icon aria-hidden className="size-5" strokeWidth={1.75} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}