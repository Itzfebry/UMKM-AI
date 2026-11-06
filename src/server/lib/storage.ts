/** Unggahan berkas ke bucket privat Supabase Storage lewat REST (tanpa dependensi). */
export function storageConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function uploadPrivateFile(path: string, bytes: ArrayBuffer, contentType: string) {
  if (!storageConfigured()) throw new Error("Storage belum dikonfigurasi (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).");
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "umkm-ai-private";
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, "")}/storage/v1/object/${bucket}/${path}`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        "content-type": contentType,
        "x-upsert": "true",
      },
      body: bytes,
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (!response.ok) throw new Error(`Unggahan gagal (${response.status}): ${(await response.text()).slice(0, 160)}`);
  return path;
}

/** URL sementara untuk objek di bucket privat (default 1 jam). Null bila belum dikonfigurasi. */
export async function createSignedUrl(path: string | null, expiresIn = 3600): Promise<string | null> {
  if (!path || !storageConfigured()) return null;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "umkm-ai-private";
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, "");
  const response = await fetch(`${base}/storage/v1/object/sign/${bucket}/${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ expiresIn }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { signedURL?: string };
  return data.signedURL ? `${base}/storage/v1${data.signedURL}` : null;
}