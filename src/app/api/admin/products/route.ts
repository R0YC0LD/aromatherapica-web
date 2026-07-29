import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, isAdminSessionActive } from "@/lib/auth/admin-session";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!isAdminSessionActive(session)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const active = searchParams.get("active");

  const products = await prisma.productCache.findMany({
    where: {
      ...(q ? { name: { contains: q } } : {}),
      ...(active === "1" ? { active: true } : active === "0" ? { active: false } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return NextResponse.json({
    data: products.map((p) => ({
      id: p.ticimaxId,
      name: p.name,
      slug: p.slug,
      price: p.price,
      salePrice: p.salePrice,
      stock: p.stock,
      active: p.active,
      categoryId: p.categoryId,
      imageUrl: p.imageUrl,
      syncedAt: p.syncedAt,
    })),
  });
}
