"use client";

import { MetricRow } from "@/types/dashboard";
import { buildChartData, autoFormat, autoHighlight } from "@/lib/utils";
import KPICard from "./KPICard";
import TrendChart from "./TrendChart";

interface Props {
  title: string;
  color: string;
  dim: string;
  rows: MetricRow[];
  periods: string[];
  periodIdx: number;
}

function findRow(rows: MetricRow[], ...keywords: string[]) {
  return rows.find((r) =>
    keywords.some((k) => r.label.toLowerCase().includes(k.toLowerCase()))
  );
}

export default function ChannelSection({ title, color, dim, rows, periods, periodIdx }: Props) {
  // Auto-detect key rows for charts
  const spendRow   = findRow(rows, "Spend");
  const roiRow     = findRow(rows, "ROI on Dollar");
  const meetSetRow = findRow(rows, "Meetings Set", "Meeting Set");
  const meetHadRow = findRow(rows, "Mtg Had", "Meetings Had");
  const closeRow   = findRow(rows, "Close Won", "Closed");
  const ltvRow     = findRow(rows, "Lifetime Value");
  const cacRow     = findRow(rows, "(CAC)");
  const ltvCacRow  = findRow(rows, "LTV:CAC");

  const hasSpendChart  = !!(spendRow);
  const hasFunnelChart = !!(meetSetRow || meetHadRow);
  const hasLtvChart    = !!(ltvRow && cacRow);

  // Build chart data
  const spendChartData = hasSpendChart
    ? buildChartData(periods, rows, [
        { key: spendRow!.label, label: "Spend" },
        ...(roiRow ? [{ key: roiRow.label, label: "ROI ($)" }] : []),
      ])
    : [];

  const funnelChartData = hasFunnelChart
    ? buildChartData(periods, rows, [
        ...(meetSetRow ? [{ key: meetSetRow.label, label: "Meetings Set" }] : []),
        ...(meetHadRow ? [{ key: meetHadRow.label, label: "Meetings Had" }] : []),
        ...(closeRow   ? [{ key: closeRow.label,   label: "Closed"       }] : []),
      ])
    : [];

  const ltvChartData = hasLtvChart
    ? buildChartData(periods, rows, [
        { key: ltvRow!.label, label: "LTV" },
        { key: cacRow!.label, label: "CAC" },
        ...(ltvCacRow ? [{ key: ltvCacRow.label, label: "LTV:CAC" }] : []),
      ])
    : [];

  const showCharts = hasSpendChart || hasFunnelChart;

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 rounded-full" style={{ background: color }} />
        <h2 className="text-lg font-bold text-slate-100">{title}</h2>
        <span
          className="text-xs px-2 py-0.5 rounded-full border font-medium"
          style={{ borderColor: `${color}40`, color, background: `${color}10` }}
        >
          {periods[periodIdx] ?? "—"}
        </span>
      </div>

      {/* KPI Cards — all rows from this section */}
      {rows.length === 0 && (
        <div className="rounded-xl border border-border bg-surface px-6 py-8 text-center text-subtle text-sm">
          No data available for this section yet
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {rows.map((row) => (
          <KPICard
            key={row.label}
            label={row.label}
            value={row.values[periodIdx] ?? null}
            format={autoFormat(row.label)}
            color={color}
            highlight={autoHighlight(row.label)}
          />
        ))}
      </div>

      {/* Charts */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {hasSpendChart && (
            <div className="bg-surface rounded-xl border border-border p-5">
              <p className="text-xs text-subtle uppercase tracking-wider font-medium mb-4">
                {roiRow ? "Spend vs ROI (Quarterly)" : "Spend (Quarterly)"}
              </p>
              <TrendChart
                data={spendChartData}
                dualAxis={!!roiRow}
                series={[
                  { key: "Spend", label: "Spend", type: "bar", color, yAxisId: "left" },
                  ...(roiRow
                    ? [{ key: "ROI ($)", label: "ROI ($)", type: "line" as const, color: "#f59e0b", yAxisId: "right" }]
                    : []),
                ]}
              />
            </div>
          )}

          {hasFunnelChart && (
            <div className="bg-surface rounded-xl border border-border p-5">
              <p className="text-xs text-subtle uppercase tracking-wider font-medium mb-4">
                Meeting Funnel (Quarterly)
              </p>
              <TrendChart
                data={funnelChartData}
                series={[
                  ...(meetSetRow ? [{ key: "Meetings Set", label: "Meetings Set", type: "bar" as const, color,    yAxisId: "left" }] : []),
                  ...(meetHadRow ? [{ key: "Meetings Had", label: "Meetings Had", type: "bar" as const, color: dim, yAxisId: "left" }] : []),
                  ...(closeRow   ? [{ key: "Closed",       label: "Closed",       type: "line" as const, color: "#f59e0b", yAxisId: "left" }] : []),
                ]}
              />
            </div>
          )}

          {hasLtvChart && (
            <div className="bg-surface rounded-xl border border-border p-5 lg:col-span-2">
              <p className="text-xs text-subtle uppercase tracking-wider font-medium mb-4">
                LTV vs CAC — Unit Economics (Quarterly)
              </p>
              <TrendChart
                height={200}
                data={ltvChartData}
                dualAxis={!!ltvCacRow}
                series={[
                  { key: "LTV", label: "LTV ($)", type: "bar",  color,        yAxisId: "left" },
                  { key: "CAC", label: "CAC ($)", type: "bar",  color: dim,   yAxisId: "left" },
                  ...(ltvCacRow ? [{ key: "LTV:CAC", label: "LTV:CAC", type: "line" as const, color: "#f59e0b", yAxisId: "right" }] : []),
                ]}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
