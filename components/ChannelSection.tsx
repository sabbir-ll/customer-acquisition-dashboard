"use client";

import { MetricRow } from "@/types/dashboard";
import { getValue, buildChartData, formatValue } from "@/lib/utils";
import KPICard from "./KPICard";
import TrendChart from "./TrendChart";
import { KPIConfig } from "@/types/dashboard";

interface Props {
  channel: "facebook" | "google";
  rows: MetricRow[];
  periods: string[];
  periodIdx: number;
}

const FB_KPIS: KPIConfig[] = [
  { label: "Facebook Spend",              format: "currency" },
  { label: "Facebook LP",                 format: "number" },
  { label: "Qualified Facebook Meetings Set", format: "number" },
  { label: "Facebook Mtgs Had",           format: "number" },
  { label: "Close Rate",                  format: "percent" },
  { label: "Close Won",                   format: "number" },
  { label: "Avg ARR",                     format: "currency" },
  { label: "Total ARR",                   format: "currency" },
  { label: "Customer Acq Cost (CAC)",     format: "currency" },
  { label: "ROI on Dollars",              format: "roi",   highlight: true },
  { label: "Lifetime Value (LTV)",        format: "currency", highlight: true },
  { label: "LTV:CAC",                     format: "multiplier", highlight: true },
];

const GOOG_KPIS: KPIConfig[] = [
  { label: "Google Spend",        format: "currency" },
  { label: "Google LP",           format: "number" },
  { label: "Google Meetings Set", format: "number" },
  { label: "Google Mtg Had",      format: "number" },
  { label: "CPM Set",             format: "currency" },
  { label: "CPM Had",             format: "currency" },
  { label: "Google Customers",    format: "number", highlight: true },
];

export default function ChannelSection({ channel, rows, periods, periodIdx }: Props) {
  const isFb = channel === "facebook";
  const accent = isFb ? "blue" : "green";
  const kpis = isFb ? FB_KPIS : GOOG_KPIS;
  const accentColor = isFb ? "#3b82f6" : "#22c55e";
  const dimColor = isFb ? "#1d4ed8" : "#15803d";

  const spendKey = isFb ? "Facebook Spend" : "Google Spend";
  const meetKey = isFb ? "Qualified Facebook Meetings Set" : "Google Meetings Set";
  const hadKey = isFb ? "Facebook Mtgs Had" : "Google Mtg Had";

  const spendChartData = buildChartData(periods, rows, [
    { key: spendKey, label: "Spend" },
    ...(isFb ? [{ key: "ROI on Dollars", label: "ROI ($)" }] : [{ key: "Google Customers", label: "Customers" }]),
  ]);

  const meetingChartData = buildChartData(periods, rows, [
    { key: meetKey, label: "Meetings Set" },
    { key: hadKey, label: "Meetings Had" },
    ...(isFb ? [{ key: "Close Won", label: "Closed" }] : []),
  ]);

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-1 h-6 rounded-full"
          style={{ background: accentColor }}
        />
        <h2 className="text-lg font-bold text-slate-100">
          {isFb ? "Facebook Ads" : "Google Ads"}
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
          style={{ borderColor: `${accentColor}40`, color: accentColor, background: `${accentColor}10` }}>
          {periods[periodIdx] ?? "—"}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {kpis.map((kpi) => {
          const val = getValue(rows, kpi.label, periodIdx);
          return (
            <KPICard
              key={kpi.label}
              label={kpi.label}
              value={val}
              format={kpi.format}
              accent={accent}
              highlight={kpi.highlight}
            />
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-surface rounded-xl border border-border p-5">
          <p className="text-xs text-subtle uppercase tracking-wider font-medium mb-4">
            {isFb ? "Spend vs ROI (Quarterly)" : "Spend vs Customers (Quarterly)"}
          </p>
          <TrendChart
            data={spendChartData}
            dualAxis
            series={[
              { key: "Spend", label: "Spend", type: "bar", color: accentColor, yAxisId: "left" },
              {
                key: isFb ? "ROI ($)" : "Customers",
                label: isFb ? "ROI ($)" : "Customers",
                type: "line",
                color: isFb ? "#f59e0b" : "#a78bfa",
                yAxisId: "right",
              },
            ]}
          />
        </div>

        <div className="bg-surface rounded-xl border border-border p-5">
          <p className="text-xs text-subtle uppercase tracking-wider font-medium mb-4">
            Meeting Funnel (Quarterly)
          </p>
          <TrendChart
            data={meetingChartData}
            series={[
              { key: "Meetings Set", label: "Meetings Set", type: "bar", color: accentColor, yAxisId: "left" },
              { key: "Meetings Had", label: "Meetings Had", type: "bar", color: dimColor, yAxisId: "left" },
              ...(isFb ? [{ key: "Closed", label: "Closed", type: "line" as const, color: "#f59e0b", yAxisId: "left" }] : []),
            ]}
          />
        </div>

        {isFb && (
          <div className="bg-surface rounded-xl border border-border p-5 lg:col-span-2">
            <p className="text-xs text-subtle uppercase tracking-wider font-medium mb-4">
              LTV vs CAC — Unit Economics (Quarterly)
            </p>
            <TrendChart
              height={200}
              data={buildChartData(periods, rows, [
                { key: "Lifetime Value (LTV)", label: "LTV" },
                { key: "Customer Acq Cost (CAC)", label: "CAC" },
                { key: "LTV:CAC", label: "LTV:CAC (x)" },
              ])}
              dualAxis
              series={[
                { key: "LTV", label: "LTV ($)", type: "bar", color: "#3b82f6", yAxisId: "left" },
                { key: "CAC", label: "CAC ($)", type: "bar", color: "#1d4ed8", yAxisId: "left" },
                { key: "LTV:CAC (x)", label: "LTV:CAC", type: "line", color: "#f59e0b", yAxisId: "right" },
              ]}
            />
          </div>
        )}
      </div>
    </section>
  );
}
