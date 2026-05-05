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
        "relative rounded-xl border p-4 transition-all duration-200",
        highlight ? "" : "bg-surface border-border hover:border-border-bright"
      )}
      style={highlight ? { background: `${color}12`, borderColor: `${color}45` } : undefined}
    >
      <p className="text-xs text-subtle uppercase tracking-wider font-medium truncate mb-2">{label}</p>
      <p
        className={cn("text-2xl font-bold tabular-nums leading-none", !highlight && "text-slate-100")}
        style={highlight ? { color } : undefined}
      >
        {formatValue(value, format)}
      </p>
    </div>
  );
}
