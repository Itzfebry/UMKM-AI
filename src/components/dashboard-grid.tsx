"use client";

import type { ReactElement } from "react";
import ReactGridLayout, { useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";

/** Grid dashboard desktop. Di mobile (<1024px) kartu ditumpuk biasa tanpa drag. */
export function DashboardGrid({ items }: { items: { key: string; grid: { x: number; y: number; w: number; h: number }; node: ReactElement }[] }) {
  const { width, containerRef, mounted } = useContainerWidth();

  return (
    <div ref={containerRef} className="hidden lg:block">
      {mounted ? (
        <ReactGridLayout
          // `layout` eksplisit: v2 tidak memakai data-grid anak untuk posisi.
          layout={items.map((item) => ({ i: item.key, ...item.grid, static: true }))}
          gridConfig={{ cols: 12, rowHeight: 34, margin: [8, 8], containerPadding: [0, 0] }}
          dragConfig={{ enabled: false }}
          resizeConfig={{ enabled: false }}
          width={width}
        >
          {items.map((item) => (
            <div key={item.key}>{item.node}</div>
          ))}
        </ReactGridLayout>
      ) : null}
    </div>
  );
}