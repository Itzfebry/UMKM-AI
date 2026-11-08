import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NEXT_DIST_DIR dipakai untuk build/verifikasi terpisah saat dev server lain sedang
  // memakai .next. Default tetap .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Tombol indikator dev menutupi konten panel saat memeriksa tampilan; hanya berlaku di dev.
  devIndicators: false,
  images: {
    // Kualitas 92 dipakai foto hero; Next 16 mewajibkan daftar eksplisit.
    qualities: [75, 92],
  },
  experimental: {
    serverActions: {
      // Unggahan gambar branding dibatasi 5 MB di kode; default Next 1 MB menolak lebih dulu.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
