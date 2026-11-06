import { jakartaDate } from "@/server/modules/ledger/queries";

export type RangePreset = "today" | "last7" | "month" | "prev_month" | "custom";
export type Period = { from: string; to: string };

export const PRESET_LABEL: Record<RangePreset, string> = {
  today: "Hari ini",
  last7: "7 hari terakhir",
  month: "Bulan berjalan",
  prev_month: "Bulan lalu",
  custom: "Rentang khusus",
};

export const isPreset = (value: string | undefined): value is RangePreset => Boolean(value && value in PRESET_LABEL);

const DAY = 86_400_000;
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const parse = (d: string) => Date.parse(`${d}T00:00:00Z`);

export function addDays(date: string, days: number) {
  return iso(parse(date) + days * DAY);
}

/** Tanggal harus 1 sampai 366 hari agar tidak ada rentang tak terbatas. */
const MAX_DAYS = 366;
const spanDays = (p: Period) => Math.min(Math.round((parse(p.to) - parse(p.from)) / DAY) + 1, MAX_DAYS);

export function monthRange(offset = 0): Period {
  const [y, m] = jakartaDate().split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1 + offset, 1));
  const end = new Date(Date.UTC(y, m + offset, 0));
  return { from: iso(start.getTime()), to: iso(end.getTime()) };
}

const today = () => jakartaDate();

/** Periode terpilih + periode pembanding dengan panjang sama tepat sebelumnya. */
export function resolvePeriod(preset: RangePreset, from?: string, to?: string) {
  const current: Period = (() => {
    switch (preset) {
      case "today":
        return { from: today(), to: today() };
      case "last7":
        return { from: addDays(today(), -6), to: today() };
      case "prev_month":
        return monthRange(-1);
      case "custom":
        return from && to ? { from, to } : monthRange(0);
      default:
        return monthRange(0);
    }
  })();

  const days = spanDays(current);
  const previous: Period = { from: addDays(current.from, -days), to: addDays(current.from, -1) };

  // Periode berjalan belum penuh: pembanding tidak adil (FR-REPORT-06).
  const incomplete = current.to >= today() && current.from <= today();
  return { current, previous, days, incomplete: incomplete && preset !== "prev_month" };
}
