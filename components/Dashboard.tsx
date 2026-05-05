"use client";

import { useState, useEffect } from "react";
import { DashboardData } from "@/types/dashboard";
import PeriodSelector from "./PeriodSelector";
import ChannelSection from "./ChannelSection";
import DataTable from "./DataTable";
import { RefreshCw, Database } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  data: DashboardData;
}

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

export default function Dashboard({ data }: Props) {
  const router = useRouter();
  const groups = buildGroups(data.periods);
  const defaultIdx = data.periods.indexOf("Q1 2026") >= 0
    ? data.periods.indexOf("Q1 2026")
    : data.periods.indexOf("Trailing 30 day") >= 0
    ? data.periods.indexOf("Trailing 30 day")
    : 0;

  const [periodIdx, setPeriodIdx] = useState(defaultIdx);
  const [refreshing, setRefreshing] = useState(false);
  const isLive = !!(process.env.NEXT_PUBLIC_LIVE);

  async function refresh() {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 1500);
  }

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
                <p className="text-xs text-subtle mt-0.5">
                  Updated {new Date(data.lastUpdated).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <PeriodSelector
                groups={groups}
                selected={periodIdx}
                onChange={setPeriodIdx}
              />
              <button
                onClick={refresh}
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
        {/* Period label */}
        <div className="flex items-center gap-2 -mb-4">
          <span className="text-2xl font-bold text-slate-100">
            {data.periods[periodIdx] ?? "—"}
          </span>
          <span className="text-subtle text-sm">overview</span>
        </div>

        {/* Facebook */}
        <ChannelSection
          channel="facebook"
          rows={data.facebook}
          periods={data.periods}
          periodIdx={periodIdx}
        />

        <div className="border-t border-border" />

        {/* Google */}
        <ChannelSection
          channel="google"
          rows={data.google}
          periods={data.periods}
          periodIdx={periodIdx}
        />

        <div className="border-t border-border" />

        {/* Full table */}
        <DataTable data={data} />

        <footer className="text-center text-xs text-muted pb-4">
          Data sourced from Google Sheets · Auto-refreshes every 5 min
        </footer>
      </main>
    </div>
  );
}
