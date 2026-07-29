import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, isAdminSessionActive } from "@/lib/auth/admin-session";
import { fetchOrders } from "@/lib/ticimax/orders";
import { isTicimaxConfigured } from "@/lib/env";

export async function GET() {
  const session = await getAdminSession();
  if (!isAdminSessionActive(session)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const local = await prisma.localOrder.findMany({ orderBy: { createdAt: "desc" }, take: 50 });

  let ticimax: unknown[] = [];
  if (isTicimaxConfigured()) {
    try {
      ticimax = await fetchOrders(30);
    } catch {
      ticimax = [];
    }
  }

  return NextResponse.json({ local, ticimax });
}
