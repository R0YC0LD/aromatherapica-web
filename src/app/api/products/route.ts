import { NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog/service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = await getProducts({
    categoryId: searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined,
    categorySlug: searchParams.get("category") ?? undefined,
    sort: (searchParams.get("sort") as "price_asc" | "price_desc" | "name" | "newest") || undefined,
    q: searchParams.get("q") ?? undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 0,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : 48,
  });

  return NextResponse.json(result);
}
