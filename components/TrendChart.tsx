"use client";

import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart,
} from "recharts";

type DataPoint = Record<string, string | number | null>;

interface Series {
  key: string;
  label: string;
  type: "bar" | "line" | "area";
  color: string;
  yAxisId?: string;
  formatter?: (v: number) => string;
}

interface Props {
  data: DataPoint[];
  series: Series[];
  height?: number;
  dualAxis?: boolean;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string; unit?: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111e36] border border-[#1a2d4a] rounded-lg p-3 shadow-xl text-xs">
      <p className="text-slate-300 font-semibold mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4 py-0.5">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono text-slate-100 font-semibold">
            {typeof p.value === "number"
              ? p.value >= 1000
                ? `$${(p.value / 1000).toFixed(0)}K`
                : p.value < 10
                ? p.value.toFixed(2)
                : p.value.toFixed(0)
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function TrendChart({ data, series, height = 240, dualAxis }: Props) {
  const filtered = data.filter((d) => series.some((s) => d[s.key] !== null));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={filtered} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a2d4a" />
        <XAxis
          dataKey="period"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={{ stroke: "#1a2d4a" }}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : String(v)}
          width={52}
        />
        {dualAxis && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
        )}
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: "#64748b", paddingTop: 8 }}
          iconType="circle"
          iconSize={8}
        />
        {series.map((s) => {
          const yId = s.yAxisId || "left";
          if (s.type === "bar") {
            return (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                fill={s.color}
                yAxisId={yId}
                radius={[3, 3, 0, 0]}
                maxBarSize={40}
                fillOpacity={0.85}
              />
            );
          }
          return (
            <Line
              key={s.key}
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              yAxisId={yId}
              strokeWidth={2}
              dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          );
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function SparkAreaChart({ data, dataKey, color }: {
  data: { period: string; value: number | null }[];
  dataKey: string;
  color: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#grad-${dataKey})`}
          dot={false}
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
