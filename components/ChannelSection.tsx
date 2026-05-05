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
  const spendRow   = findRow(rows, "Spend");
  const roiRow     = findRow(rows, "ROI on Dollar");
  const meetSetRow = findRow(rows, "Meetings Set", "Meeting Set");
  const meetHadRow = findRow(rows, "Mtg Had", "Meetings Had");
  const closeRow   = findRow(rows, "Close Won", "Closed");
  const ltvRow     = findRow(rows, "Lifetime Value");
  const cacRow     = findRow(rows, "(CAC)");
  const ltvCacRow  = findRow(rows, "LTV:CAC");

  const hasSpendChart  = !!spendRow;
  const hasFunnelChart = !!(meetSetRow || meetHadRow);
  const hasLtvChart    = !!(ltvRow && cacRow);

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

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-7 rounded-full" style={{ background: color }} />
        <div>
          <h2 className="text-lg font-bold text-text-main">{title}</h2>
        </div>
        <span
          className="ml-2 text-xs px-2.5 py-1 rounded-full font-semibold"
          style={{ background: `${color}15`, color }}
        >
          {periods[periodIdx] ?? "—"}
        </span>
      </div>

      {/* Empty state */}
      {rows.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-border bg-surface px-8 py-10 text-center">
          <p className="text-subtle font-medium">No data available for this section</p>
          <p className="text-muted text-xs mt-1">Update your Apps Script to include this section</p>
        </div>
      )}

      {/* KPI cards */}
      {rows.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
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
      )}

      {/* Charts */}
      {(hasSpendChart || hasFunnelChart) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {hasSpendChart && (
            <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
              <p className="text-xs font-semibold text-subtle uppercase tracking-wider mb-4">
                {roiRow ? "Spend vs ROI (Quarterly)" : "Spend (Quarterly)"}
              </p>
              <TrendChart
                data={spendChartData}
                dualAxis={!!roiRow}
                series={[
                  { key: "Spend",   label: "Spend",  type: "bar",  color,          yAxisId: "left"  },
                  ...(roiRow ? [{ key: "ROI ($)", label: "ROI ($)", type: "line" as const, color: "#f59e0b", yAxisId: "right" }] : []),
                ]}
              />
            </div>
          )}
          {hasFunnelChart && (
            <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
              <p className="text-xs font-semibold text-subtle uppercase tracking-wider mb-4">
                Meeting Funnel (Quarterly)
              </p>
              <TrendChart
                data={funnelChartData}
                series={[
                  ...(meetSetRow ? [{ key: "Meetings Set", label: "Meetings Set", type: "bar"  as const, color,    yAxisId: "left" }] : []),
                  ...(meetHadRow ? [{ key: "Meetings Had", label: "Meetings Had", type: "bar"  as const, color: dim, yAxisId: "left" }] : []),
                  ...(closeRow   ? [{ key: "Closed",       label: "Closed",       type: "line" as const, color: "#f59e0b", yAxisId: "left" }] : []),
                ]}
              />
            </div>
          )}
          {hasLtvChart && (
            <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm lg:col-span-2">
              <p className="text-xs font-semibold text-subtle uppercase tracking-wider mb-4">
                LTV vs CAC — Unit Economics (Quarterly)
              </p>
              <TrendChart
                height={200}
                data={ltvChartData}
                dualAxis={!!ltvCacRow}
                series={[
                  { key: "LTV", label: "LTV ($)", type: "bar",  color,        yAxisId: "left"  },
                  { key: "CAC", label: "CAC ($)", type: "bar",  color: dim,   yAxisId: "left"  },
                  ...(ltvCacRow ? [{ key: "LTV:CAC", label: "LTV:CAC", type: "line" as const, color: "#f59e0b", yAxisId: "right" }] : []),
                ]}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
