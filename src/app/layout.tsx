import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/* Monospace untuk label, kode, dan angka teknis — bagian dari bahasa "console". */
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: { default: "UMKM-AI: manajemen kas usaha dengan AI", template: "%s · UMKM-AI" },
  description:
    "Catat pendapatan dan pengeluaran usaha, pantau saldo kas, dan pahami perkembangan bisnis dengan analisis AI. Dibuat untuk UMKM Indonesia.",
};

export const viewport: Viewport = {
  themeColor: "#db1a1a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${jakarta.variable} ${jetbrains.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}