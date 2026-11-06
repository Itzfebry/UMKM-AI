"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export type TrendPoint = { key: string; label: string; income: number; expense: number };

/** Pendapatan vs pengeluaran per bulan; arus kas bersih tetap dihitung backend, bukan di sini. */
export function TrendChart({ data }: { data: TrendPoint[] }) {
  const empty = data.every((point) => point.income === 0 && point.expense === 0);
  if (empty) {
    return <p className="py-8 text-center text-small text-deep/75">Belum ada pendapatan atau pengeluaran enam bulan terakhir.</p>;
  }

  const options: ApexOptions = {
    chart: { type: "bar", fontFamily: "inherit", toolbar: { show: false }, stacked: false },
    plotOptions: { bar: { columnWidth: "55%", borderRadius: 4 } },
    dataLabels: { enabled: false },
    colors: ["#2C687B", "#DB1A1A"],
    xaxis: { categories: data.map((point) => point.label), labels: { style: { colors: "#2C687B" } } },
    legend: { position: "top", fontSize: "12px", labels: { colors: "#2C687B" } },
    grid: { borderColor: "#E5E7EB", strokeDashArray: 3 },
    tooltip: {
      y: { formatter: (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value ?? 0)) },
    },
  };

  return (
    <Chart
      options={options}
      series={[
        { name: "Pendapatan", data: data.map((point) => point.income) },
        { name: "Pengeluaran", data: data.map((point) => point.expense) },
      ]}
      type="bar"
      height={260}
    />
  );
}