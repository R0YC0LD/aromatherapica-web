import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, isAdminSessionActive } from "@/lib/auth/admin-session";
import { isTicimaxConfigured, getEnv } from "@/lib/env";
import { maskSecret } from "@/lib/format";
import { testTicimaxConnection } from "@/lib/ticimax/soap-client";

export async function GET() {
  const session = await getAdminSession();
  if (!isAdminSessionActive(session)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const [totalProducts, activeProducts, outOfStock, recentOrders, recentSyncs, recentErrors, lastSync] =
    await Promise.all([
      prisma.productCache.count(),
      prisma.productCache.count({ where: { active: true } }),
      prisma.productCache.count({ where: { active: true, stock: { lte: 0 } } }),
      prisma.localOrder.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
      prisma.syncRun.findMany({ orderBy: { startedAt: "desc" }, take: 5 }),
      prisma.syncError.findMany({ where: { resolved: false }, orderBy: { createdAt: "desc" }, take: 10 }),
      prisma.appMeta.findUnique({ where: { key: "last_product_sync" } }),
    ]);

  const statusCounts = await prisma.localOrder.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  let connection: { ok: boolean; message: string; durationMs?: number } = {
    ok: false,
    message: "Yapılandırılmamış",
  };
  if (isTicimaxConfigured()) {
    connection = await testTicimaxConnection();
  }

  const env = getEnv();

  return NextResponse.json({
    connection,
    lastSyncAt: lastSync?.value ?? null,
    totals: {
      products: totalProducts,
      activeProducts,
      outOfStock,
      orders: await prisma.localOrder.count(),
    },
    orderStatusDistribution: statusCounts.map((s) => ({ status: s.status, count: s._count.status })),
    recentOrders,
    recentSyncs,
    recentErrors,
    config: {
      baseUrl: env.TICIMAX_BASE_URL ? maskSecret(env.TICIMAX_BASE_URL) : "—",
      uyeKodu: maskSecret(env.TICIMAX_UYE_KODU),
      alanAdi: env.TICIMAX_ALAN_ADI || "—",
    },
  });
}
