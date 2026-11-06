import type { NextRequest } from "next/server";
import { runScheduledMaintenance } from "@/server/modules/billing/maintenance";

export const dynamic = "force-dynamic";

/**
 * Tugas terjadwal: invoice kedaluwarsa, masa tenggang habis, pengingat Pro,
 * dan retensi audit 90 hari. Lindungi dengan CRON_SECRET.
 * Contoh: curl -H "authorization: Bearer $CRON_SECRET" https://app/api/cron/notifications
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: "CRON_SECRET belum diisi." }, { status: 503 });

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : request.nextUrl.searchParams.get("secret");
  if (token !== secret) return Response.json({ error: "Tidak berwenang." }, { status: 401 });

  try {
    const result = await runScheduledMaintenance();
    return Response.json({ ok: true, ...result });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Tugas gagal." }, { status: 500 });
  }
}