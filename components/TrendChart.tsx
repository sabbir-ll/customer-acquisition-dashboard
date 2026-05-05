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
}

interface Props {
  data: DataPoint[];
  series: Series[];
  height?: number;
  dualAxis?: boolean;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl p-3 shadow-lg text-xs">
      <p className="font-semibold text-text-main mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4 py-0.5">
          <span style={{ color: p.color }} className="font-medium">{p.name}</span>
          <span className="font-mono text-text-main font-semibold">
            {typeof p.value === "number"
              ? p.value >= 1000 ? `$${(p.value / 1000).toFixed(0)}K`
              : p.value < 10    ? p.value.toFixed(2)
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
        <CartesianGrid strokeDasharray="3 3" stroke="#C5E5D4" />
        <XAxis
          dataKey="period"
          tick={{ fill: "#5A8A70", fontSize: 11 }}
          axisLine={{ stroke: "#C5E5D4" }}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          tick={{ fill: "#5A8A70", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : String(v)}
          width={52}
        />
        {dualAxis && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#5A8A70", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
        )}
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: "#5A8A70", paddingTop: 8 }}
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
                radius={[4, 4, 0, 0]}
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
              strokeWidth={2.5}
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
            <stop offset="5%"  stopColor={color} stopOpacity={0.2} />
            <stop offset="95%" stopColor={color} stopOpacity={0}   />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#grad-${dataKey})`}
          dot={false}
          connectNulls
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
