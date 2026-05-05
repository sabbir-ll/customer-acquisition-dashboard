"use client";

import { MetricFormat } from "@/types/dashboard";
import { formatValue, pctChange } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  label: string;
  value: number | string | null;
  prevValue?: number | string | null;
  format: MetricFormat;
  accent?: "blue" | "green";
  highlight?: boolean;
}

export default function KPICard({ label, value, prevValue, format, accent = "blue", highlight }: Props) {
  const numVal = typeof value === "number" ? value : null;
  const numPrev = typeof prevValue === "number" ? prevValue : null;
  const pct = pctChange(numVal, numPrev);

  const isUp = pct !== null && pct > 0;
  const isDown = pct !== null && pct < 0;

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
      {pct !== null && (
        <div
          className={cn(
            "flex items-center gap-1 mt-2 text-xs font-medium",
            isUp ? "text-emerald-400" : isDown ? "text-red-400" : "text-slate-500"
          )}
        >
          {isUp ? <TrendingUp size={12} /> : isDown ? <TrendingDown size={12} /> : <Minus size={12} />}
          <span>{isUp ? "+" : ""}{pct.toFixed(1)}% vs prev</span>
        </div>
      )}
    </div>
  );
}
