"use client";

import { useEffect, useRef } from "react";

type GraphConfig = {
  fn: string;
  color?: string;
  range?: [number, number];
};

type FunctionGraphProps = {
  expressions: GraphConfig[];
  title?: string;
};

export function FunctionGraph({ expressions, title }: FunctionGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = "";

    const width = Math.min(el.clientWidth || 600, 600);
    const height = Math.min(width * 0.75, 400);

    import("function-plot").then((mod) => {
      try {
        mod.default({
          target: el,
          width,
          height,
          disableZoom: true,
          grid: true,
          data: expressions.map((exp) => ({
            fn: exp.fn,
            color: exp.color ?? "hsl(0, 0%, 20%)",
            range: exp.range,
            graphType: "polyline",
          })),
          xAxis: { domain: [-10, 10] },
          yAxis: { domain: [-10, 10] },
        });
      } catch {
        el.innerHTML = '<p class="text-sm text-stone-500">Could not render graph.</p>';
      }
    });

    return () => {
      el.innerHTML = "";
    };
  }, [expressions]);

  return (
    <div className="my-4">
      {title ? <p className="mb-2 text-sm font-semibold text-stone-700">{title}</p> : null}
      <div
        ref={containerRef}
        className="rounded-xl border border-stone-300 bg-white"
        style={{ maxWidth: 600 }}
      />
    </div>
  );
}
