import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAdminSession, isAdminSessionActive } from "@/lib/auth/admin-session";
import { assertCsrf } from "@/lib/auth/csrf";
import { appCache } from "@/lib/cache/memory-cache";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!isAdminSessionActive(session)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const active = searchParams.get("active");
  const id = searchParams.get("id");

  if (id) {
    const product = await prisma.productCache.findUnique({ where: { ticimaxId: Number(id) } });
    if (!product) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    return NextResponse.json({ data: product });
  }

  const products = await prisma.productCache.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { sku: { contains: q } },
              { categoryName: { contains: q } },
            ],
          }
        : {}),
      ...(active === "1" ? { active: true } : active === "0" ? { active: false } : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 500,
  });

  return NextResponse.json({
    data: products.map((p) => ({
      id: p.ticimaxId,
      variantId: p.variantId,
      name: p.name,
      slug: p.slug,
      price: p.price,
      salePrice: p.salePrice,
      stock: p.stock,
      active: p.active,
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      brandName: p.brandName,
      imageUrl: p.customImageUrl || p.imageUrl,
      customImageUrl: p.customImageUrl,
      shortDesc: p.shortDesc,
      hasCustomDescription: Boolean(p.customDescription),
      sku: p.sku,
      syncedAt: p.syncedAt,
      updatedAt: p.updatedAt,
    })),
  });
}

const updateSchema = z.object({
  id: z.number().int().positive(),
  csrfToken: z.string().min(1),
  customImageUrl: z.string().url().nullable().optional().or(z.literal("")),
  customDescription: z.string().max(20000).nullable().optional(),
  shortDesc: z.string().max(2000).nullable().optional(),
  name: z.string().min(1).max(300).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!isAdminSessionActive(session)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri", details: parsed.error.flatten() }, { status: 400 });
  }
  if (!(await assertCsrf(parsed.data.csrfToken))) {
    return NextResponse.json({ error: "CSRF doğrulaması başarısız" }, { status: 403 });
  }

  const { id, csrfToken: _c, ...fields } = parsed.data;
  const customImageUrl =
    fields.customImageUrl === "" || fields.customImageUrl === undefined
      ? fields.customImageUrl === ""
        ? null
        : undefined
      : fields.customImageUrl;

  const updated = await prisma.productCache.update({
    where: { ticimaxId: id },
    data: {
      ...(fields.name !== undefined ? { name: fields.name } : {}),
      ...(fields.active !== undefined ? { active: fields.active } : {}),
      ...(fields.shortDesc !== undefined ? { shortDesc: fields.shortDesc } : {}),
      ...(fields.customDescription !== undefined ? { customDescription: fields.customDescription } : {}),
      ...(customImageUrl !== undefined ? { customImageUrl } : {}),
    },
  });

  appCache.clear();
  return NextResponse.json({ ok: true, data: updated });
}
