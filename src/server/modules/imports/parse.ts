import { createHash } from "node:crypto";
import type { TransactionType } from "@/server/modules/ledger/types";

export const TEMPLATE_HEADER = ["tanggal", "jenis", "nominal", "kategori", "catatan"] as const;
/** shortcut: satu impor maksimal 1000 baris; naikkan bila impor besar dibutuhkan. */
export const MAX_IMPORT_ROWS = 1000;

const TYPE_ALIASES: Record<string, TransactionType> = {
  pendapatan: "operational_income",
  operational_income: "operational_income",
  pengeluaran: "operational_expense",
  operational_expense: "operational_expense",
  "setoran modal": "capital_in",
  capital_in: "capital_in",
  "penarikan pribadi": "owner_draw",
  owner_draw: "owner_draw",
  "pinjaman masuk": "loan_in",
  loan_in: "loan_in",
  "bayar pinjaman": "loan_repayment",
  loan_repayment: "loan_repayment",
};

export type ParsedRow = {
  line: number;
  date: string;
  type: TransactionType | null;
  amount: number;
  category: string;
  note?: string;
  hash: string;
  error?: string;
};

/** Pisah satu baris CSV; dukung tanda kutip ganda. */
function splitLine(line: string) {
  const out: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else current += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      out.push(current);
      current = "";
    } else current += ch;
  }
  out.push(current);
  return out.map((v) => v.trim());
}

/** Tanggal menerima yyyy-mm-dd dan dd/mm/yyyy. */
function parseDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const dmy = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  return null;
}

function parseAmount(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return null;
  const amount = Number(digits);
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}

const rowHash = (date: string, type: string, amount: number, category: string, note: string) =>
  createHash("sha256").update(`${date}|${type}|${amount}|${category.toLowerCase()}|${note}`).digest("hex");

/** Baris tanpa kesalahan saja yang dianggap valid; sisanya dilaporkan. */
export function parseTransactionsCsv(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (!lines.length) return [];
  const start = lines[0].toLowerCase().includes("tanggal") ? 1 : 0;

  return lines.slice(start, start + MAX_IMPORT_ROWS).map((line, index) => {
    const [rawDate = "", rawType = "", rawAmount = "", rawCategory = "", rawNote = ""] = splitLine(line);
    const date = parseDate(rawDate);
    const type = TYPE_ALIASES[rawType.trim().toLowerCase()] ?? null;
    const amount = parseAmount(rawAmount);
    const category = rawCategory.trim();
    const note = rawNote.slice(0, 500) || undefined;

    const error =
      !date
        ? "Tanggal tidak dikenali (pakai yyyy-mm-dd)."
        : !type
          ? `Jenis transaksi tidak dikenali: "${rawType}".`
          : !amount
            ? "Nominal harus bilangan bulat positif."
            : undefined;

    return {
      line: start + index + 1,
      date: date ?? rawDate,
      type,
      amount: amount ?? 0,
      category,
      note,
      hash: rowHash(date ?? rawDate, type ?? rawType, amount ?? 0, category, note ?? ""),
      error,
    };
  });
}