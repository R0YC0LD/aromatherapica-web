import { NextResponse } from "next/server";
import { z } from "zod";
import { validateCartLines } from "@/lib/ticimax/stock-price";

const schema = z.object({
  lines: z.array(
    z.object({
      productId: z.number().int().positive(),
      variantId: z.number().int().positive(),
      quantity: z.number().int().positive(),
    }),
  ),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz sepet verisi" }, { status: 400 });
  }

  try {
    const validation = await validateCartLines(parsed.data.lines);
    return NextResponse.json(validation);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Doğrulama başarısız" },
      { status: 502 },
    );
  }
}
