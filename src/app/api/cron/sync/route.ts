import { NextResponse } from "next/server";
import { syncCategoriesAndProducts, syncOrders } from "@/lib/sync/sync-products";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const products = await syncCategoriesAndProducts();
    const orders = await syncOrders(30);
    return NextResponse.json({ ok: true, products, orders });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Cron sync failed" },
      { status: 502 },
    );
  }
}
