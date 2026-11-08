export const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(`${value}T00:00:00`),
  );

/**
 * Waktu lengkap sampai detik di zona Asia/Jakarta. Dipakai supaya urutan kejadian
 * (pencatatan, perubahan, percobaan masuk) bisa dibedakan walau terjadi di menit yang sama.
 */
export const formatDateTime = (value: Date | string | null) => {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  const text = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date);
  return `${text.replace(/\./g, ":")} WIB`;
};

export const formatPercent = (current: number, previous: number) => {
  if (previous === 0) return null;
  const delta = ((current - previous) / previous) * 100;
  return `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;
};