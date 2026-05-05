"use client";

import { useState } from "react";
import { DashboardData, ChannelMeta } from "@/types/dashboard";
import { autoFormat, formatValue, cn } from "@/lib/utils";

interface Props {
  data: DashboardData;
  channels: ChannelMeta[];
}

export default function DataTable({ data, channels }: Props) {
  const [search, setSearch]       = useState("");
  const [activeKey, setActiveKey] = useState<string>("all");

  const SHOW_PERIODS = data.periods.filter((p) =>
    ["Trailing 7 day", "Trailing 30 day", "2024", "2025", "Q1 2026", "Q2 2026"].includes(p)
  );
  const showIdxs = SHOW_PERIODS.map((p) => data.periods.indexOf(p));

  const allRows = channels.flatMap((ch) =>
    (data[ch.key] ?? []).map((r) => ({ ...r, channelKey: ch.key, channelColor: ch.color, channelTitle: ch.title }))
  );

  const filtered = allRows.filter((r) => {
    const matchCh     = activeKey === "all" || r.channelKey === activeKey;
    const matchSearch = r.label.toLowerCase().includes(search.toLowerCase());
    return matchCh && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search metrics…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-surface border border-border rounded-xl px-3 py-2 text-sm text-text-main placeholder-muted focus:outline-none focus:border-primary w-44 transition-colors"
        />

        {/* Channel filter */}
        <div className="flex flex-wrap gap-1 bg-surface-2 rounded-xl p-1 border border-border">
          <button
            onClick={() => setActiveKey("all")}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
              activeKey === "all"
                ? "bg-primary text-white shadow-sm"
                : "text-subtle hover:text-text-main"
            )}
          >
            All
          </button>
          {channels.map((ch) => (
            <button
              key={ch.key}
              onClick={() => setActiveKey(ch.key)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                activeKey === ch.key ? "text-white shadow-sm" : "text-subtle hover:text-text-main"
              )}
              style={activeKey === ch.key ? { background: ch.color } : undefined}
            >
              {ch.title.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-2 border-b border-border">
              <th className="w-2 px-4 py-3" />
              <th className="text-left px-4 py-3 text-xs text-subtle font-semibold uppercase tracking-wider min-w-[200px]">
                Metric
              </th>
              {SHOW_PERIODS.map((p) => (
                <th key={p} className="text-right px-4 py-3 text-xs text-subtle font-semibold uppercase tracking-wider whitespace-nowrap">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => {
              const fmt  = autoFormat(row.label);
              const isHL = row.label.toLowerCase().includes("roi") ||
                           row.label.toLowerCase().includes("ltv") ||
                           row.label.toLowerCase().includes("close rate") ||
                           row.label.toLowerCase().includes("total arr");
              return (
                <tr
                  key={`${row.channelKey}-${row.label}`}
                  className={cn(
                    "border-b border-border/60 hover:bg-surface-2 transition-colors",
                    i % 2 === 0 ? "bg-surface" : "bg-bg"
                  )}
                >
                  <td className="pl-4 py-2.5">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: row.channelColor }} />
                  </td>
                  <td className="px-4 py-2.5 text-text-main font-medium text-xs">{row.label}</td>
                  {showIdxs.map((idx) => {
                    const val = row.values[idx] ?? null;
                    return (
                      <td
                        key={idx}
                        className={cn(
                          "px-4 py-2.5 text-right tabular-nums font-mono text-xs",
                          val === null ? "text-muted" : isHL ? "font-bold" : "text-text-main"
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
          <div className="text-center py-12 text-muted text-sm">No metrics found</div>
        )}
      </div>
    </div>
  );
}
