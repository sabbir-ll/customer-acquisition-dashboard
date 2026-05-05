export interface MetricRow {
  label: string;
  values: (number | string | null)[];
}

export interface DashboardData {
  periods: string[];
  facebook: MetricRow[];
  google: MetricRow[];
  lastUpdated: string;
}

export type MetricFormat = "currency" | "number" | "percent" | "multiplier" | "roi";

export interface KPIConfig {
  label: string;
  format: MetricFormat;
  highlight?: boolean;
}
