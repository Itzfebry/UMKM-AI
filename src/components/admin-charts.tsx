"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { formatRupiah } from "@/lib/format";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type AdminSeries = { name: string; data: number[] };

const count = new Intl.NumberFormat("id-ID");

/** Sumbu Y ringkas supaya label tidak menabrak grafik pada kartu sempit. */
function compact(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  if (abs >= 1_000) return `${(value / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} rb`;
  return count.format(value);
}

/** Grafik batang/area untuk deret waktu admin; sumbu Y ringkas, tooltip angka penuh. */
export function AdminChart({
  type = "bar",
  categories,
  series,
  colors = ["#2C687B", "#8CC7C4", "#DB1A1A"],
  height = 260,
  stacked = false,
  horizontal = false,
  format = "number",
  empty = "Belum ada data pada rentang ini.",
}: {
  type?: "bar" | "area";
  categories: string[];
  series: AdminSeries[];
  colors?: string[];
  height?: number;
  stacked?: boolean;
  horizontal?: boolean;
  format?: "number" | "idr";
  empty?: string;
}) {
  const total = series.reduce((sum, item) => sum + item.data.reduce((a, b) => a + b, 0), 0);
  if (!total) return <p className="py-8 text-center text-small text-deep/90">{empty}</p>;

  const asCurrency = format === "idr";
  const formatValue = (value: number) => (asCurrency ? formatRupiah(Number(value)) : count.format(Number(value)));
  const options: ApexOptions = {
    chart: { type, fontFamily: "inherit", toolbar: { show: false }, stacked, background: "transparent" },
    plotOptions: { bar: { columnWidth: horizontal ? "58%" : "52%", borderRadius: 6, borderRadiusApplication: "end", horizontal } },
    stroke: { curve: "smooth", width: type === "area" ? 2.5 : 0 },
    fill: type === "bar" ? { type: "solid", opacity: 1 } : { type: "solid", opacity: 0.2 },
    dataLabels: { enabled: false },
    colors,
    xaxis: {
      categories,
      labels: {
        style: { colors: "#2C687B", fontSize: "11px" },
        hideOverlappingLabels: true,
        trim: true,
        // Sumbu mendatar pada grafik horizontal memuat angka, sumbu tegak memuat nama usaha.
        formatter: horizontal ? (value: string) => compact(Number(value)) : undefined,
      },
      tickAmount: horizontal ? undefined : Math.min(8, categories.length),
      axisBorder: { color: "#2C687B22" },
      axisTicks: { color: "#2C687B22" },
    },
    yaxis: {
      labels: {
        style: { colors: "#2C687B", fontSize: "11px" },
        // Pada grafik horizontal, nilai ini adalah nama usaha (bukan angka) sehingga tidak diringkas.
        formatter: (value: number) => (horizontal ? String(value) : compact(value)),
      },
      ...(horizontal ? { minWidth: 120 } : {}),
    },
    legend: { position: "top", horizontalAlign: "left", fontSize: "12px", markers: { strokeWidth: 0 }, labels: { colors: "#2C687B" } },
    grid: { borderColor: "#2C687B1A", strokeDashArray: 3, padding: { left: 4, right: 8 } },
    markers: { size: 0, hover: { size: 4 } },
    tooltip: { theme: "dark", y: { formatter: (value: number) => formatValue(value) } },
    theme: { mode: "light", palette: "palette1", monochrome: { enabled: false } },
    responsive: [{ breakpoint: 640, options: { chart: { height: 220 }, legend: { position: "bottom" } } }],
  };

  return <Chart options={options} series={series} type={type} height={height} />;
}

/** Donat untuk komposisi (peran anggota, paket usaha). Nilai selalu angka bulat. */
export function AdminDonut({
  labels,
  series,
  colors = ["#2C687B", "#8CC7C4", "#DB1A1A", "#F59E0B"],
  height = 240,
  empty = "Belum ada data.",
}: {
  labels: string[];
  series: number[];
  colors?: string[];
  height?: number;
  empty?: string;
}) {
  if (series.every((value) => value === 0)) return <p className="py-8 text-center text-small text-deep/90">{empty}</p>;

  const options: ApexOptions = {
    chart: { type: "donut", fontFamily: "inherit", background: "transparent" },
    labels,
    colors,
    dataLabels: { enabled: true, formatter: (value: number) => `${Math.round(value)}%`, style: { fontSize: "11px", fontWeight: 600 } },
    legend: { position: "bottom", fontSize: "12px", markers: { strokeWidth: 0 }, labels: { colors: "#2C687B" } },
    stroke: { width: 2, colors: ["#FFFFFF"] },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: { fontSize: "12px", color: "#2C687B", offsetY: 18 },
            value: { fontSize: "20px", fontWeight: 700, color: "#1A1A1A", offsetY: -12 },
            total: { show: true, label: "Total", fontSize: "12px", color: "#2C687B", formatter: (w) => count.format(w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)) },
          },
        },
      },
    },
    tooltip: { theme: "dark", y: { formatter: (value: number) => count.format(Number(value)) } },
  };

  return <Chart options={options} series={series} type="donut" height={height} />;
}
