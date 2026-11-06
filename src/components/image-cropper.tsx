"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { Image as ImageIcon, Move, RotateCcw } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { ErrorText, input } from "./ui";

export type CropState = { error?: string; ok?: boolean; info?: string } | undefined;

type Source = { url: string; width: number; height: number };

/**
 * Unggah gambar dengan pemotongan manual (geser + zoom) lalu diperkecil otomatis
 * sampai di bawah batas ukuran. Hasilnya dikirim lewat Server Action yang sama.
 */
export function ImageCropper({
  action,
  aspect,
  outputWidth,
  outputHeight,
  targetBytes,
  label,
  hint,
  buttonLabel,
  currentUrl,
  frameClass = "aspect-square",
  previewClass = "size-14 rounded-full",
}: {
  action: (prev: CropState, formData: FormData) => Promise<CropState>;
  aspect: number;
  outputWidth: number;
  outputHeight: number;
  targetBytes: number;
  label: string;
  hint: string;
  buttonLabel: string;
  currentUrl?: string | null;
  frameClass?: string;
  previewClass?: string;
}) {
  const [state, formAction] = useActionState<CropState, FormData>(action, undefined);
  const [source, setSource] = useState<Source | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [cropped, setCropped] = useState<{ file: File; url: string; size: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const imageId = useId();

  // Bersihkan object URL agar tidak menahan memori.
  useEffect(() => {
    return () => {
      if (source) URL.revokeObjectURL(source.url);
      if (cropped) URL.revokeObjectURL(cropped.url);
    };
  }, [source, cropped]);

  const onPick = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => setSource({ url, width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => URL.revokeObjectURL(url);
    image.src = url;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setCropped(null);
  };

  /** Batas geser: gambar harus selalu menutupi bingkai. */
  const clampOffset = (next: { x: number; y: number }, z: number) => {
    if (!source) return next;
    const base = Math.max(outputWidth / source.width, outputHeight / source.height);
    const limitX = Math.max(0, (source.width * base * z - outputWidth) / 2);
    const limitY = Math.max(0, (source.height * base * z - outputHeight) / 2);
    return { x: Math.min(limitX, Math.max(-limitX, next.x)), y: Math.min(limitY, Math.max(-limitY, next.y)) };
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (!source) return;
    dragRef.current = { x: event.clientX, y: event.clientY };
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const start = dragRef.current;
    const frame = frameRef.current;
    if (!start || !frame || !source) return;
    const displayScale = frame.clientWidth / outputWidth;
    const dx = (event.clientX - start.x) / (displayScale || 1);
    const dy = (event.clientY - start.y) / (displayScale || 1);
    dragRef.current = { x: event.clientX, y: event.clientY };
    setOffset((current) => clampOffset({ x: current.x + dx, y: current.y + dy }, zoom));
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  /** Potong + kecilkan sampai di bawah target ukuran (kualitas turun, lalu dimensi turun). */
  const buildCrop = async () => {
    if (!source) return;
    setBusy(true);
    try {
      const base = Math.max(outputWidth / source.width, outputHeight / source.height);
      const scale = base * zoom;
      const sw = outputWidth / scale;
      const sh = outputHeight / scale;
      const sx = Math.min(source.width - sw, Math.max(0, source.width / 2 - sw / 2 - offset.x / scale));
      const sy = Math.min(source.height - sh, Math.max(0, source.height / 2 - sh / 2 - offset.y / scale));

      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("Gambar tidak bisa dibaca."));
        el.src = source.url;
      });

      let width = outputWidth;
      let height = outputHeight;
      let blob: Blob | null = null;
      const type = canvasSupportsWebp() ? "image/webp" : "image/jpeg";

      for (let attempt = 0; attempt < 4 && !blob; attempt++) {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Kanvas tidak tersedia di peramban ini.");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);

        for (const quality of [0.9, 0.78, 0.66, 0.55]) {
          const candidate = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
          if (candidate && candidate.size <= targetBytes) {
            blob = candidate;
            break;
          }
        }
        if (!blob) {
          width = Math.round(width * 0.82);
          height = Math.round(height * 0.82);
        }
      }
      if (!blob) throw new Error("Gambar masih terlalu besar setelah diperkecil. Coba gambar lain.");

      setCropped({
        file: new File([blob], `gambar.${type === "image/webp" ? "webp" : "jpg"}`, { type }),
        url: URL.createObjectURL(blob),
        size: blob.size,
      });
    } catch (error) {
      console.error("[cropper]", error);
      alert(error instanceof Error ? error.message : "Gagal memotong gambar.");
    } finally {
      setBusy(false);
    }
  };

  const submitCropped = (event: React.FormEvent<HTMLFormElement>) => {
    if (!cropped || !submitInputRef.current) {
      event.preventDefault();
      return;
    }
    const transfer = new DataTransfer();
    transfer.items.add(cropped.file);
    submitInputRef.current.files = transfer.files;
  };

  const reset = () => {
    setSource(null);
    setCropped(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const frame = frameRef.current;
  const displayScale = frame && source ? frame.clientWidth / outputWidth : 0;
  const base = source ? Math.max(outputWidth / source.width, outputHeight / source.height) : 1;
  const imageStyle =
    source && displayScale
      ? {
          width: `${source.width * base * zoom * displayScale}px`,
          height: "auto",
          transform: `translate(${offset.x * displayScale}px, ${offset.y * displayScale}px)`,
        }
      : undefined;

  return (
    <form action={formAction} onSubmit={submitCropped} className="flex flex-col gap-3">
      <ErrorText>{state?.error}</ErrorText>
      {state?.ok && state.info ? <p className="rounded-lg bg-accent/25 px-3 py-2 text-small text-deep">{state.info}</p> : null}

      <div className="flex items-center gap-3">
        <span
          className={`${previewClass} shrink-0 border border-deep/10 bg-surface bg-cover bg-center`}
          style={{ backgroundImage: currentUrl ? `url("${currentUrl}")` : undefined }}
          aria-hidden
        />
        <div className="flex-1">
          <p className="text-small font-semibold text-deep">{label}</p>
          <p className="text-caption text-deep/70">{hint}</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        id={imageId}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className={`${input} file:mr-2 file:rounded file:border-0 file:bg-deep/10 file:px-2 file:py-1 file:text-caption file:font-semibold file:text-deep`}
        onChange={(event) => onPick(event.target.files?.[0])}
      />

      {source ? (
        <div className="flex flex-col gap-3 rounded-xl border border-deep/10 bg-surface/60 p-3">
          <div className="flex items-center gap-2 text-caption text-deep/75">
            <Move className="size-3.5" aria-hidden />
            Geser gambar untuk mengatur posisi, atur perbesaran dengan penggeser.
          </div>

          <div
            ref={frameRef}
            className={`relative w-full max-w-md overflow-hidden rounded-lg border border-deep/15 bg-deep/5 ${frameClass}`}
            style={{ aspectRatio: String(aspect), touchAction: "none", cursor: "grab" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            role="img"
            aria-label={`Area potong ${label}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={source.url}
              alt=""
              draggable={false}
              className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 select-none"
              style={imageStyle}
            />
            <span className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-black/10" aria-hidden />
          </div>

          <label className="flex items-center gap-3 text-caption font-semibold text-deep" htmlFor={`${imageId}-zoom`}>
            Perbesaran
            <input
              id={`${imageId}-zoom`}
              type="range"
              min={1}
              max={2.5}
              step={0.05}
              value={zoom}
              onChange={(event) => {
                const next = Number(event.target.value);
                setZoom(next);
                setOffset((current) => clampOffset(current, next));
              }}
              className="flex-1 accent-[var(--color-primary)]"
            />
            <span className="tabular w-10 text-right">{zoom.toFixed(2)}×</span>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={buildCrop}
              disabled={busy}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-deep px-3 text-small font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              <ImageIcon className="size-4" aria-hidden />
              {busy ? "Memotong..." : cropped ? "Potong ulang" : "Potong & kecilkan"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-deep/25 px-3 text-small font-semibold text-deep hover:border-deep/50"
            >
              <RotateCcw className="size-4" aria-hidden />
              Ganti gambar
            </button>
          </div>

          {cropped ? (
            <div className="flex items-center gap-3 rounded-lg border border-deep/10 bg-white p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cropped.url} alt="Pratinjau hasil potongan" className="size-16 rounded-lg object-cover" />
              <p className="text-caption text-deep/75">
                Siap diunggah · {Math.round(cropped.size / 1024)} KB ({outputWidth}×{outputHeight} px). Ukuran ini jauh di bawah batas server, jadi
                unggahan tidak akan ditolak.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      <input ref={submitInputRef} type="file" name="file" className="hidden" tabIndex={-1} aria-hidden />
      <div className="flex items-center gap-3">
        <SubmitButton pendingLabel="Mengunggah...">{buttonLabel}</SubmitButton>
        <span className="text-caption text-deep/70">{cropped ? "Siap disimpan." : "Pilih gambar, atur potongan, lalu potong & kecilkan."}</span>
      </div>
    </form>
  );
}

function canvasSupportsWebp() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  return canvas.toDataURL("image/webp").startsWith("data:image/webp");
}
