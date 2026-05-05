import { MetricFormat, MetricRow } from "@/types/dashboard";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getValue(rows: MetricRow[], label: string, idx: number): number | string | null {
  const row = rows.find((r) => r.label === label);
  return row ? (row.values[idx] ?? null) : null;
}

export function formatValue(val: number | string | null, format: MetricFormat): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "string") return val;

  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: val % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(val);
    case "roi":
      return `$${val.toFixed(2)}`;
    case "percent":
      return `${val.toFixed(0)}%`;
    case "multiplier":
      return val >= 100 ? `${val.toFixed(0)}x` : `${val.toFixed(1)}x`;
    case "number":
    default:
      return new Intl.NumberFormat("en-US").format(Math.round(val));
  }
}

export function shortCurrency(val: number | null): string {
  if (val === null) return "—";
  if (Math.abs(val) >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (Math.abs(val) >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

export function pctChange(current: number | null, prev: number | null): number | null {
  if (current === null || prev === null || prev === 0) return null;
  return ((current - prev) / Math.abs(prev)) * 100;
}

export function parseRawValue(raw: string | undefined): number | string | null {
  if (!raw || raw.trim() === "" || raw === "#DIV/0!" || raw === "#VALUE!" || raw === "#N/A") return null;
  const trimmed = raw.trim();
  const cleaned = trimmed.replace(/[$,]/g, "");
  if (cleaned.endsWith("%")) return parseFloat(cleaned);
  if (cleaned.endsWith("x")) return parseFloat(cleaned);
  const n = parseFloat(cleaned);
  return isNaN(n) ? trimmed : n;
}

export const QUARTERLY_LABELS = [
  "Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024",
  "Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025",
  "Q1 2026", "Q2 2026",
];

export const ANNUAL_LABELS = ["2022", "2023", "2024", "2025"];

export function getQuarterlyIndices(periods: string[]): number[] {
  return QUARTERLY_LABELS.map((l) => periods.indexOf(l)).filter((i) => i >= 0);
}

export function autoFormat(label: string): MetricFormat {
  const l = label.toLowerCase();
  if (l.includes("close rate") || l.includes("open rate") || l.includes("rate)") || l.endsWith("rate")) return "percent";
  if (l.includes("ltv:cac") || l.includes("ltv to cac") || l.endsWith(":cac")) return "multiplier";
  if (l.includes("roi on dollar") || l.includes("roi on $")) return "roi";
  if (
    l.includes("spend") || l.includes(" cost") || l.includes("(cac)") ||
    l.includes("cpm ") || l.includes(" arr") || l.includes("ltv") ||
    l.includes("revenue") || l.includes("value") || l.includes("cplp") ||
    l.startsWith("cp ") || l.startsWith("avg ") || l.startsWith("cost per")
  ) return "currency";
  return "number";
}

export function autoHighlight(label: string): boolean {
  const l = label.toLowerCase();
  return l.includes("roi") || l.includes("ltv") || l.includes("close rate") || l.includes("total arr");
}

export function buildChartData(
  periods: string[],
  rows: MetricRow[],
  metrics: { key: string; label: string }[]
) {
  const qIdxs = getQuarterlyIndices(periods);
  return qIdxs.map((pIdx) => {
    const entry: Record<string, string | number | null> = { period: periods[pIdx] };
    for (const m of metrics) {
      const row = rows.find((r) => r.label === m.key);
      const v = row ? row.values[pIdx] : null;
      entry[m.label] = typeof v === "number" ? v : null;
    }
    return entry;
  });
}
