import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createTicimaxOrder } from "@/lib/ticimax/orders";
import { isTicimaxConfigured } from "@/lib/env";
import { logger } from "@/lib/logger";

const schema = z.object({
  idempotencyKey: z.string().min(8).max(128),
  memberId: z.number().int().positive(),
  billingAddressId: z.number().int().positive(),
  shippingAddressId: z.number().int().positive(),
  cargoCompanyId: z.number().int().positive().optional(),
  paymentType: z.number().int().min(0).max(30),
  paymentOptionId: z.number().int().positive().optional(),
  paymentStatus: z.number().int().min(0).max(4).default(0),
  customerEmail: z.string().email(),
  customerName: z.string().optional(),
  orderNote: z.string().optional(),
  lines: z.array(
    z.object({
      productId: z.number().int().positive(),
      variantId: z.number().int().positive(),
      quantity: z.number().int().positive(),
    }),
  ).min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz sipariş verisi", details: parsed.error.flatten() }, { status: 400 });
  }

  const input = parsed.data;

  // Allowed offline-safe payment types from Ticimax docs: Havale=1, KapidaOdemeNakit=2
  if (![1, 2, 3].includes(input.paymentType)) {
    return NextResponse.json(
      { error: "Desteklenen ödeme tipleri: Havale (1) veya Kapıda Ödeme (2/3). Kart verisi işlenmez." },
      { status: 400 },
    );
  }

  const existing = await prisma.localOrder.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
  if (existing) {
    return NextResponse.json({
      idempotent: true,
      orderId: existing.id,
      ticimaxOrderId: existing.ticimaxOrderId,
      ticimaxOrderCode: existing.ticimaxOrderCode,
      status: existing.status,
      totalAmount: existing.totalAmount,
    });
  }

  const pending = await prisma.localOrder.create({
    data: {
      idempotencyKey: input.idempotencyKey,
      status: "PENDING",
      paymentStatus: "PENDING",
      paymentType: input.paymentType,
      totalAmount: 0,
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      ticimaxMemberId: input.memberId,
      payload: JSON.stringify(input),
    },
  });

  try {
    const { validateCartLines } = await import("@/lib/ticimax/stock-price");
    const { shippingCost } = await import("@/lib/shipping");
    const validation = await validateCartLines(input.lines);
    if (!validation.valid) {
      await prisma.localOrder.update({
        where: { id: pending.id },
        data: { status: "FAILED", paymentStatus: "FAILED" },
      });
      return NextResponse.json({ error: "Sepet stok/fiyat doğrulamasından geçemedi" }, { status: 400 });
    }

    const cargo = shippingCost(validation.total);
    const grandTotal = validation.total + cargo;

    let ticimaxOrderId: number | null = null;
    let ticimaxOrderCode: string | null = null;

    if (isTicimaxConfigured()) {
      const result = await createTicimaxOrder({
        idempotencyKey: input.idempotencyKey,
        memberId: input.memberId,
        billingAddressId: input.billingAddressId,
        shippingAddressId: input.shippingAddressId,
        cargoCompanyId: input.cargoCompanyId ?? Number(process.env.DEFAULT_CARGO_COMPANY_ID || 1),
        paymentType: input.paymentType,
        paymentOptionId: input.paymentOptionId ?? Number(process.env.DEFAULT_PAYMENT_OPTION_ID || 1),
        paymentStatus: input.paymentStatus,
        lines: input.lines,
        orderNote: `${input.orderNote || ""} | Kargo: ${cargo === 0 ? "Ücretsiz (Ticimax kargo çeki)" : cargo}`,
      });
      ticimaxOrderId = result.orderId ?? null;
      ticimaxOrderCode = result.orderCode ?? null;
    }

    const updated = await prisma.localOrder.update({
      where: { id: pending.id },
      data: {
        status: "CREATED",
        paymentStatus: input.paymentType === 1 ? "AWAITING_TRANSFER" : "PENDING",
        paymentVerified: input.paymentStatus === 1,
        ticimaxOrderId,
        ticimaxOrderCode,
        totalAmount: grandTotal,
        payload: JSON.stringify({
          ...input,
          validatedTotal: validation.total,
          shipping: cargo,
          ticimaxSubmitted: isTicimaxConfigured(),
        }),
      },
    });

    logger.info("order.created", {
      localId: updated.id,
      ticimaxOrderId: updated.ticimaxOrderId,
      ticimaxSubmitted: isTicimaxConfigured(),
    });

    return NextResponse.json({
      idempotent: false,
      orderId: updated.id,
      ticimaxOrderId: updated.ticimaxOrderId,
      ticimaxOrderCode: updated.ticimaxOrderCode,
      status: updated.status,
      totalAmount: updated.totalAmount,
      shipping: cargo,
      ticimaxSubmitted: isTicimaxConfigured(),
      warning: isTicimaxConfigured()
        ? undefined
        : "Ticimax yapılandırması yok; sipariş yerel kaydedildi. TICIMAX_BASE_URL ve TICIMAX_UYE_KODU ekleyince canlı aktarım açılır.",
    });
  } catch (error) {
    await prisma.localOrder.update({
      where: { id: pending.id },
      data: { status: "FAILED", paymentStatus: "FAILED" },
    });
    logger.error("order.create.failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sipariş oluşturulamadı" },
      { status: 502 },
    );
  }
}
