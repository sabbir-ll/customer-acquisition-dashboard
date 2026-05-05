import { NextResponse } from "next/server";
import { getSheetData } from "@/lib/sheets";

export const dynamic = "force-dynamic"; // always fetch fresh, never cache

export async function GET() {
  try {
    const data = await getSheetData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch sheet data" }, { status: 500 });
  }
}
