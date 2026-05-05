"use client";

import { useState } from "react";
import { DashboardData, ChannelMeta } from "@/types/dashboard";
import { autoFormat, formatValue } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  data: DashboardData;
  channels: ChannelMeta[];
}

export default function DataTable({ data, channels }: Props) {
  const [search, setSearch] = useState("");
  const [activeKey, setActiveKey] = useState<string>("all");

  const SHOW_PERIODS = data.periods.filter((p) =>
    ["Trailing 7 day", "Trailing 30 day", "2024", "2025", "Q1 2026", "Q2 2026"].includes(p)
  );
  const showIdxs = SHOW_PERIODS.map((p) => data.periods.indexOf(p));

  // Flatten all rows with their channel meta
  const allRows = channels.flatMap((ch) =>
    data[ch.key].map((r) => ({ ...r, channelKey: ch.key, channelColor: ch.color }))
  );

  const filtered = allRows.filter((r) => {
    const matchCh = activeKey === "all" || r.channelKey === activeKey;
    const matchSearch = r.label.toLowerCase().includes(search.toLowerCase());
    return matchCh && matchSearch;
  });

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
        <div className="flex flex-wrap gap-1 bg-surface rounded-lg p-1 border border-border">
          <button
            onClick={() => setActiveKey("all")}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium transition-all",
              activeKey === "all" ? "bg-[#1d4ed8] text-white" : "text-subtle hover:text-slate-200"
            )}
          >
            All
          </button>
          {channels.map((ch) => (
            <button
              key={ch.key}
              onClick={() => setActiveKey(ch.key)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-all",
                activeKey === ch.key ? "text-white" : "text-subtle hover:text-slate-200"
              )}
              style={activeKey === ch.key ? { background: ch.color } : undefined}
            >
              {ch.title}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-2 border-b border-border">
              <th className="text-left px-4 py-3 text-xs text-subtle uppercase tracking-wider font-medium w-3" />
              <th className="text-left px-4 py-3 text-xs text-subtle uppercase tracking-wider font-medium min-w-[220px]">
                Metric
              </th>
              {SHOW_PERIODS.map((p) => (
                <th key={p} className="text-right px-4 py-3 text-xs text-subtle uppercase tracking-wider font-medium whitespace-nowrap">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => {
              const fmt = autoFormat(row.label);
              const isHL = row.label.toLowerCase().includes("roi") ||
                           row.label.toLowerCase().includes("ltv") ||
                           row.label.toLowerCase().includes("close rate") ||
                           row.label.toLowerCase().includes("total arr");
              return (
                <tr
                  key={`${row.channelKey}-${row.label}`}
                  className={cn(
                    "border-b border-border/50 hover:bg-surface-2 transition-colors",
                    i % 2 === 0 ? "bg-bg" : "bg-surface"
                  )}
                >
                  <td className="pl-4 py-2.5">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ background: row.channelColor }}
                    />
                  </td>
                  <td className="px-4 py-2.5 text-slate-300 font-medium">{row.label}</td>
                  {showIdxs.map((idx) => {
                    const val = row.values[idx] ?? null;
                    return (
                      <td
                        key={idx}
                        className={cn(
                          "px-4 py-2.5 text-right tabular-nums font-mono text-xs",
                          val === null ? "text-muted" : isHL ? "font-semibold" : "text-slate-200"
                        )}
                        style={isHL && val !== null ? { color: row.channelColor } : undefined}
                      >
                        {formatValue(val, fmt)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-subtle text-sm">No metrics found</div>
        )}
      </div>
    </section>
  );
}
