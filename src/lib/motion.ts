/**
 * Token gerak untuk animasi GSAP/WebGL di sisi klien.
 *
 * Satu tempat untuk durasi, easing, jarak, dan stagger supaya reveal di landing dan di halaman
 * masuk terasa satu keluarga (aturan frontend-atlas: "tokens, not magic numbers").
 */
export const MOTION = {
  /** Durasi reveal standar (detik). */
  duration: 0.6,
  /** Easing masuk: cepat di awal, mendarat halus. */
  easeIn: "power2.out",
  /** Jarak geser reveal (px). */
  distance: 24,
  /** Jeda antar elemen dalam satu batch (detik). */
  stagger: 0.08,
  /** Selang pengumpulan batch ScrollTrigger (detik). */
  batchInterval: 0.12,
  /** Maksimum elemen per batch. */
  batchMax: 6,
  /** Titik picu: elemen mulai tampil saat 88% tinggi viewport. */
  start: "top 88%",
  /** Skala awal kartu yang "muncul" saat digulir (1 = tidak diperkecil). */
  popupScale: 0.94,
  /** Lama satu gambar hero bertahan sebelum berganti (detik). */
  slideHold: 6,
  /** Durasi silang-ganti antar gambar hero (detik). */
  slideFade: 1.4,
} as const;
