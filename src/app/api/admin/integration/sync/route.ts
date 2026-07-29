import { NextResponse } from "next/server";
import { getAdminSession, isAdminSessionActive } from "@/lib/auth/admin-session";
import { assertCsrf } from "@/lib/auth/csrf";
import { syncCategoriesAndProducts, syncOrders } from "@/lib/sync/sync-products";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!isAdminSessionActive(session)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { csrfToken?: string; type?: string };
  if (!(await assertCsrf(body.csrfToken))) {
    return NextResponse.json({ error: "CSRF doğrulaması başarısız" }, { status: 403 });
  }

  try {
    if (body.type === "orders") {
      const result = await syncOrders();
      return NextResponse.json({ ok: true, ...result });
    }
    const result = await syncCategoriesAndProducts();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Senkronizasyon başarısız" },
      { status: 502 },
    );
  }
}
