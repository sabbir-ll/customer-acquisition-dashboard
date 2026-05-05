"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardData, ChannelMeta } from "@/types/dashboard";
import Sidebar, { NavKey } from "./Sidebar";
import PeriodSelector from "./PeriodSelector";
import ChannelSection from "./ChannelSection";
import DataTable from "./DataTable";
import { RefreshCw, Menu, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props { data: DashboardData; }

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
  const find = (l: string) => ({ label: l, idx: periods.indexOf(l) });
  const g = [];
  const cur  = [find("Trailing 7 day"), find("Trailing 30 day")].filter((o) => o.idx >= 0);
  if (cur.length)  g.push({ label: "Current",    options: cur });
  const y26  = [find("Q1 2026"), find("Q2 2026"), find("2026")].filter((o) => o.idx >= 0);
  if (y26.length)  g.push({ label: "2026",       options: y26 });
  const y25  = [find("Q1 2025"), find("Q2 2025"), find("Q3 2025"), find("Q4 2025"), find("2025")].filter((o) => o.idx >= 0);
  if (y25.length)  g.push({ label: "2025",       options: y25 });
  const y24  = [find("Q1 2024"), find("Q2 2024"), find("Q3 2024"), find("Q4 2024"), find("2024")].filter((o) => o.idx >= 0);
  if (y24.length)  g.push({ label: "2024",       options: y24 });
  const hist = [find("2023"), find("2022")].filter((o) => o.idx >= 0);
  if (hist.length) g.push({ label: "Historical", options: hist });
  return g;
}

export default function Dashboard({ data: initialData }: Props) {
  const [data, setData]           = useState<DashboardData>(initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [lastPoll, setLastPoll]   = useState<Date>(new Date(initialData.lastUpdated));
  const [activeNav, setActiveNav] = useState<NavKey>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const groups     = buildGroups(data.periods);
  const defaultIdx =
    data.periods.indexOf("Q1 2026")        >= 0 ? data.periods.indexOf("Q1 2026") :
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

  // Which channels to render in main area
  const visibleChannels =
    activeNav === "overview" ? CHANNELS :
    activeNav === "table"    ? [] :
    CHANNELS.filter((ch) => ch.key === activeNav);

  const selectedPeriodLabel = groups.flatMap((g) => g.options).find((o) => o.idx === periodIdx)?.label ?? "—";

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar */}
      <Sidebar
        channels={CHANNELS}
        active={activeNav}
        onSelect={setActiveNav}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Right panel */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Header ── */}
        <header className="bg-surface border-b border-border px-4 sm:px-6 py-3 flex items-center gap-3 shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg hover:bg-surface-2 text-subtle transition-colors"
          >
            <Menu size={18} />
          </button>

          {/* Title */}
          <div className="mr-auto min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-text-main truncate">Customer Acquisition</h1>
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs text-muted hidden sm:inline">{lastPoll.toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Period selector */}
          <PeriodSelector groups={groups} selected={periodIdx} onChange={setPeriodIdx} />

          {/* Refresh */}
          <button
            onClick={() => fetchLatest(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-2 border border-border text-subtle hover:text-text-main hover:border-border-bright transition-all disabled:opacity-50 shrink-0"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </header>

        {/* ── Mobile nav tabs ── */}
        <div className="lg:hidden flex overflow-x-auto border-b border-border bg-surface shrink-0 px-2 py-1.5 gap-1 no-scrollbar">
          {(["overview", ...CHANNELS.map((c) => c.key), "table"] as NavKey[]).map((key) => {
            const ch    = CHANNELS.find((c) => c.key === key);
            const label = key === "overview" ? "All" : key === "table" ? "Table" : (ch?.title.split(" ")[0] ?? key);
            const color = ch?.color;
            const isActive = activeNav === key;
            return (
              <button
                key={key}
                onClick={() => setActiveNav(key)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  isActive ? "text-white shadow-sm" : "text-subtle bg-transparent hover:bg-surface-2"
                )}
                style={isActive ? { background: color ?? "#2DB88A" } : undefined}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">

          {/* Period + section heading */}
          <div className="flex items-baseline gap-2 mb-6">
            <h2 className="text-2xl font-bold text-text-main">{selectedPeriodLabel}</h2>
            <span className="text-subtle text-sm font-medium">
              {activeNav === "overview" ? "— all channels" :
               activeNav === "table"    ? "— full metrics table" :
               `— ${CHANNELS.find((c) => c.key === activeNav)?.title ?? ""}`}
            </span>
          </div>

          {/* Channel sections */}
          {visibleChannels.length > 0 && (
            <div className="space-y-10">
              {visibleChannels.map((ch, i) => (
                <div key={ch.key}>
                  <ChannelSection
                    title={ch.title}
                    color={ch.color}
                    dim={ch.dim}
                    rows={data[ch.key] ?? []}
                    periods={data.periods}
                    periodIdx={periodIdx}
                  />
                  {i < visibleChannels.length - 1 && (
                    <div className="mt-10 border-t border-border" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Table view */}
          {activeNav === "table" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-2 border border-border">
                  <Table2 size={15} className="text-subtle" />
                </div>
                <h3 className="text-base font-bold text-text-main">All Metrics</h3>
              </div>
              <DataTable data={data} channels={CHANNELS} />
            </div>
          )}

          {/* Table always appended to overview */}
          {activeNav === "overview" && (
            <div className="mt-10 pt-10 border-t border-border space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-2 border border-border">
                  <Table2 size={15} className="text-subtle" />
                </div>
                <h3 className="text-base font-bold text-text-main">All Metrics</h3>
              </div>
              <DataTable data={data} channels={CHANNELS} />
            </div>
          )}

          <p className="text-center text-xs text-muted mt-10 pb-4">
            Data sourced from Google Sheets · auto-refreshes every 30 seconds
          </p>
        </main>
      </div>
    </div>
  );
}
