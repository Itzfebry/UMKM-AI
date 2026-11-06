import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NEXT_DIST_DIR dipakai untuk build/verifikasi terpisah saat dev server lain sedang
  // memakai .next. Default tetap .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    serverActions: {
      // Unggahan gambar branding dibatasi 5 MB di kode; default Next 1 MB menolak lebih dulu.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
