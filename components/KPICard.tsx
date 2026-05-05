"use client";

import { MetricFormat } from "@/types/dashboard";
import { formatValue } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: number | string | null;
  format: MetricFormat;
  color: string;
  highlight?: boolean;
}

export default function KPICard({ label, value, format, color, highlight }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-surface p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        highlight ? "" : "border-border"
      )}
      style={highlight ? { borderColor: `${color}50`, background: `${color}08` } : undefined}
    >
      {highlight && (
        <div
          className="w-8 h-1 rounded-full mb-3"
          style={{ background: color }}
        />
      )}
      <p className="text-xs font-medium text-subtle truncate mb-1.5 leading-tight">{label}</p>
      <p
        className={cn("text-xl font-bold tabular-nums leading-none", !highlight && "text-text-main")}
        style={highlight ? { color } : undefined}
      >
        {formatValue(value, format)}
      </p>
    </div>
  );
}
