import { NextResponse } from "next/server";
import { getProductById } from "@/lib/catalog/service";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: "Geçersiz ürün id" }, { status: 400 });
  }

  try {
    const product = await getProductById(productId);
    if (!product) return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    return NextResponse.json({ data: product });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ürün alınamadı" },
      { status: 502 },
    );
  }
}
