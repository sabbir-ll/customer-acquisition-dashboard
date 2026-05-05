"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardData, ChannelMeta } from "@/types/dashboard";
import PeriodSelector from "./PeriodSelector";
import ChannelSection from "./ChannelSection";
import DataTable from "./DataTable";
import { RefreshCw, Database } from "lucide-react";

interface Props {
  data: DashboardData;
}

const POLL_INTERVAL = 30_000;

export const CHANNELS: ChannelMeta[] = [
  { key: "facebook",    title: "Facebook Ads",                           color: "#3b82f6", dim: "#1d4ed8" },
  { key: "google",      title: "Google Ads",                             color: "#22c55e", dim: "#15803d" },
  { key: "email",       title: "Email",                                  color: "#a78bfa", dim: "#7c3aed" },
  { key: "conference",  title: "Conference",                             color: "#f59e0b", dim: "#d97706" },
  { key: "bullseyeAds", title: "Bullseye Advertising Aggregate",         color: "#06b6d4", dim: "#0891b2" },
  { key: "bullseyeAll", title: "Bullseye Aggregate — All Deals/Funnels", color: "#f97316", dim: "#ea580c" },
];

function buildGroups(periods: string[]) {
  const find = (label: string) => ({ label, idx: periods.indexOf(label) });
  const groups = [];

  const current = [find("Trailing 7 day"), find("Trailing 30 day")].filter((o) => o.idx >= 0);
  if (current.length) groups.push({ label: "Current", options: current });

  const y2026 = [find("Q1 2026"), find("Q2 2026"), find("2026")].filter((o) => o.idx >= 0);
  if (y2026.length) groups.push({ label: "2026", options: y2026 });

  const y2025 = [find("Q1 2025"), find("Q2 2025"), find("Q3 2025"), find("Q4 2025"), find("2025")].filter((o) => o.idx >= 0);
  if (y2025.length) groups.push({ label: "2025", options: y2025 });

  const y2024 = [find("Q1 2024"), find("Q2 2024"), find("Q3 2024"), find("Q4 2024"), find("2024")].filter((o) => o.idx >= 0);
  if (y2024.length) groups.push({ label: "2024", options: y2024 });

  const hist = [find("2023"), find("2022")].filter((o) => o.idx >= 0);
  if (hist.length) groups.push({ label: "Historical", options: hist });

  return groups;
}

export default function Dashboard({ data: initialData }: Props) {
  const [data, setData]         = useState<DashboardData>(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [lastPoll, setLastPoll] = useState<Date>(new Date(initialData.lastUpdated));

  const groups     = buildGroups(data.periods);
  const defaultIdx =
    data.periods.indexOf("Q1 2026") >= 0     ? data.periods.indexOf("Q1 2026") :
    data.periods.indexOf("Trailing 30 day") >= 0 ? data.periods.indexOf("Trailing 30 day") : 0;

  const [periodIdx, setPeriodIdx] = useState(defaultIdx);

  const fetchLatest = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const res = await fetch("/api/sheets", { cache: "no-store" });
      if (!res.ok) return;
      const fresh: DashboardData = await res.json();
      setData(fresh);
      setLastPoll(new Date(fresh.lastUpdated));
    } finally {
      if (showSpinner) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const id = setInterval(() => fetchLatest(), POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchLatest]);

  // Only show channels that actually have data
  const activeChannels = CHANNELS.filter((ch) => data[ch.key].length > 0);

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-bg/80 backdrop-blur border-b border-border">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1d4ed8]">
                <Database size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-100 leading-none">
                  Customer Acquisition
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <p className="text-xs text-subtle">
                    Live · {lastPoll.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <PeriodSelector groups={groups} selected={periodIdx} onChange={setPeriodIdx} />
              <button
                onClick={() => fetchLatest(true)}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface border border-border text-subtle hover:text-slate-200 hover:border-border-bright transition-all disabled:opacity-50"
              >
                <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        <div className="flex items-center gap-2 -mb-4">
          <span className="text-2xl font-bold text-slate-100">{data.periods[periodIdx] ?? "—"}</span>
          <span className="text-subtle text-sm">overview</span>
        </div>

        {activeChannels.map((ch, i) => (
          <div key={ch.key}>
            <ChannelSection
              title={ch.title}
              color={ch.color}
              dim={ch.dim}
              rows={data[ch.key]}
              periods={data.periods}
              periodIdx={periodIdx}
            />
            {i < activeChannels.length - 1 && <div className="border-t border-border mt-12" />}
          </div>
        ))}

        <div className="border-t border-border" />
        <DataTable data={data} channels={CHANNELS} />

        <footer className="text-center text-xs text-muted pb-4">
          Data sourced from Google Sheets · auto-refreshes every 30 seconds
        </footer>
      </main>
    </div>
  );
}
