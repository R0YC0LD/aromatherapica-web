import { NextResponse } from "next/server";
import { getCategories } from "@/lib/catalog/service";

export async function GET() {
  const result = await getCategories();
  return NextResponse.json(result);
}
