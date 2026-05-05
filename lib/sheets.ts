import { DashboardData } from "@/types/dashboard";
import { SAMPLE_DATA } from "@/lib/sampleData";

const APPS_SCRIPT_URL = process.env.SHEET_API_URL;

export async function getSheetData(): Promise<DashboardData> {
  if (!APPS_SCRIPT_URL) {
    console.warn("SHEET_API_URL not set — showing sample data");
    return SAMPLE_DATA;
  }

  const res = await fetch(APPS_SCRIPT_URL, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Apps Script returned ${res.status}`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(`Apps Script error: ${data.error}`);
  }

  return data as DashboardData;
}
