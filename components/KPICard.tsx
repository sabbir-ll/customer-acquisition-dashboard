"use client";

import { MetricFormat } from "@/types/dashboard";
import { formatValue } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: number | string | null;
  format: MetricFormat;
  accent?: "blue" | "green";
  highlight?: boolean;
}

export default function KPICard({ label, value, format, accent = "blue", highlight }: Props) {
  return (
    <div
      className={cn(
        "relative rounded-xl border p-4 transition-all duration-200 hover:border-opacity-80",
        highlight
          ? accent === "blue"
            ? "bg-[#0d1e3d] border-[#3b82f6]/40"
            : "bg-[#0d2d1e] border-[#22c55e]/40"
          : "bg-surface border-border hover:border-border-bright"
      )}
    >
      {highlight && (
        <div
          className={cn(
            "absolute inset-0 rounded-xl opacity-5",
            accent === "blue" ? "bg-fb" : "bg-goog"
          )}
        />
      )}
      <p className="text-xs text-subtle uppercase tracking-wider font-medium truncate mb-2">{label}</p>
      <p
        className={cn(
          "text-2xl font-bold tabular-nums leading-none",
          highlight && accent === "blue" ? "text-[#60a5fa]" : "",
          highlight && accent === "green" ? "text-[#4ade80]" : "",
          !highlight ? "text-slate-100" : ""
        )}
      >
        {formatValue(value, format)}
      </p>
    </div>
  );
}
