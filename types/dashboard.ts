export interface MetricRow {
  label: string;
  values: (number | string | null)[];
}

export interface DashboardData {
  periods: string[];
  facebook: MetricRow[];
  google: MetricRow[];
  email: MetricRow[];
  conference: MetricRow[];
  bullseyeAds: MetricRow[];
  bullseyeAll: MetricRow[];
  lastUpdated: string;
}

export type MetricFormat = "currency" | "number" | "percent" | "multiplier" | "roi";

export interface ChannelMeta {
  key: keyof Omit<DashboardData, "periods" | "lastUpdated">;
  title: string;
  color: string;
  dim: string;
}
