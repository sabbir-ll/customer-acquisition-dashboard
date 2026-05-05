import { getSheetData } from "@/lib/sheets";
import Dashboard from "@/components/Dashboard";

export const revalidate = 300;

export default async function Home() {
  const data = await getSheetData();
  return <Dashboard data={data} />;
}
