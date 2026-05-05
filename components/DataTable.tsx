"use client";

import { useState } from "react";
import { DashboardData } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface Props {
  data: DashboardData;
}

const FB_FORMAT: Record<string, string> = {
  "Facebook Spend": "$",
  "CP LP": "$",
  "Cost Per Landing Pg Meeting Set": "$",
  "CPM Set": "$",
  "CPM Had": "$",
  "Close Rate": "%",
  "Avg ARR": "$",
  "Customer Acq Cost (CAC)": "$",
  "Total ARR": "$",
  "ROI on Dollars": "$",
  "Lifetime Value (LTV)": "$",
  "LTV:CAC": "x",
};

function fmt(v: number | string | null, label: string): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return v;
  const type = FB_FORMAT[label];
  if (type === "$") {
    if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(0)}K`;
    return v % 1 === 0 ? `$${v}` : `$${v.toFixed(2)}`;
  }
  if (type === "%") return `${v.toFixed(0)}%`;
  if (type === "x") return v >= 100 ? `${v.toFixed(0)}x` : `${v.toFixed(1)}x`;
  return new Intl.NumberFormat("en-US").format(Math.round(v));
}

export default function DataTable({ data }: Props) {
  const [search, setSearch] = useState("");
  const [showChannel, setShowChannel] = useState<"all" | "fb" | "goog">("all");

  const allRows = [
    ...data.facebook.map((r) => ({ ...r, channel: "fb" as const })),
    ...data.google.map((r) => ({ ...r, channel: "goog" as const })),
  ];

  const filtered = allRows.filter((r) => {
    const matchCh = showChannel === "all" || r.channel === showChannel;
    const matchSearch = r.label.toLowerCase().includes(search.toLowerCase());
    return matchCh && matchSearch;
  });

  const SHOW_PERIODS = data.periods.filter((p) =>
    ["Trailing 7 day", "Trailing 30 day", "2024", "2025", "Q1 2026", "Q2 2026"].includes(p)
  );
  const showIdxs = SHOW_PERIODS.map((p) => data.periods.indexOf(p));

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 rounded-full bg-slate-500" />
        <h2 className="text-lg font-bold text-slate-100">All Metrics</h2>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search metrics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder-subtle focus:outline-none focus:border-border-bright w-48"
        />
        <div className="flex gap-1 bg-surface rounded-lg p-1 border border-border">
          {(["all", "fb", "goog"] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setShowChannel(ch)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                showChannel === ch
                  ? "bg-[#1d4ed8] text-white"
                  : "text-subtle hover:text-slate-200"
              )}
            >
              {ch === "all" ? "All" : ch === "fb" ? "Facebook" : "Google"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-2 border-b border-border">
              <th className="text-left px-4 py-3 text-xs text-subtle uppercase tracking-wider font-medium w-12">
                Ch.
              </th>
              <th className="text-left px-4 py-3 text-xs text-subtle uppercase tracking-wider font-medium min-w-[200px]">
                Metric
              </th>
              {SHOW_PERIODS.map((p) => (
                <th
                  key={p}
                  className="text-right px-4 py-3 text-xs text-subtle uppercase tracking-wider font-medium whitespace-nowrap"
                >
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr
                key={`${row.channel}-${row.label}`}
                className={cn(
                  "border-b border-border/50 hover:bg-surface-2 transition-colors",
                  i % 2 === 0 ? "bg-bg" : "bg-surface"
                )}
              >
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "inline-block w-2 h-2 rounded-full",
                      row.channel === "fb" ? "bg-fb" : "bg-goog"
                    )}
                  />
                </td>
                <td className="px-4 py-2.5 text-slate-300 font-medium">{row.label}</td>
                {showIdxs.map((idx) => {
                  const val = row.values[idx] ?? null;
                  const isHighlight =
                    row.label.includes("ROI") || row.label.includes("LTV") || row.label.includes("CAC");
                  return (
                    <td
                      key={idx}
                      className={cn(
                        "px-4 py-2.5 text-right tabular-nums font-mono",
                        val === null ? "text-muted" : isHighlight ? "text-[#60a5fa] font-semibold" : "text-slate-200"
                      )}
                    >
                      {fmt(val, row.label)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-subtle text-sm">No metrics found</div>
        )}
      </div>
    </section>
  );
}
