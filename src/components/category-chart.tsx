"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const PALETTE = ["#DB1A1A", "#2C687B", "#8CC7C4", "#E88B8B", "#5E8FA0", "#C4DEDC"];

export type CategorySlice = { name: string; total: number; type: string };

export function CategoryChart({ data }: { data: CategorySlice[] }) {
  const expenses = data.filter((d) => d.type === "operational_expense").slice(0, 6);
  if (expenses.length === 0) {
    return <p className="py-8 text-center text-small text-deep/75">Belum ada pengeluaran bulan ini.</p>;
  }

  const options: ApexOptions = {
    chart: { type: "donut", fontFamily: "inherit", toolbar: { show: false } },
    labels: expenses.map((d) => d.name),
    colors: PALETTE,
    legend: { position: "bottom", fontSize: "12px", labels: { colors: "#2C687B" } },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    tooltip: {
      y: { formatter: (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value ?? 0)) },
    },
  };

  return <Chart options={options} series={expenses.map((d) => d.total)} type="donut" height={240} />;
}