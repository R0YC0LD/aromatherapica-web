import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession, isAdminSessionActive } from "@/lib/auth/admin-session";
import { assertCsrf } from "@/lib/auth/csrf";

const KEYS = [
  "siteName",
  "freeShippingThreshold",
  "contactEmail",
  "contactPhone",
  "ticimaxBaseUrl",
  "ticimaxUyeKodu",
  "ticimaxAlanAdi",
  "ticimaxStoreUrl",
  "integrationEnabled",
] as const;

export async function GET() {
  const session = await getAdminSession();
  if (!isAdminSessionActive(session)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const rows = await prisma.appMeta.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return NextResponse.json({
    data: {
      siteName: map.siteName || "Aromatherapica",
      freeShippingThreshold: Number(map.freeShippingThreshold || 100000),
      contactEmail: map.contactEmail || "",
      contactPhone: map.contactPhone || "",
      ticimaxBaseUrl: map.ticimaxBaseUrl || process.env.TICIMAX_BASE_URL || "",
      ticimaxUyeKodu: map.ticimaxUyeKodu || process.env.TICIMAX_UYE_KODU || "",
      ticimaxAlanAdi: map.ticimaxAlanAdi || process.env.TICIMAX_ALAN_ADI || "",
      ticimaxStoreUrl: map.ticimaxStoreUrl || process.env.TICIMAX_STORE_URL || "",
      integrationEnabled: map.integrationEnabled === "true",
    },
  });
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!isAdminSessionActive(session)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  if (!(await assertCsrf(String(body.csrfToken || "")))) {
    return NextResponse.json({ error: "CSRF doğrulaması başarısız" }, { status: 403 });
  }

  for (const key of KEYS) {
    if (body[key] === undefined) continue;
    const value = typeof body[key] === "boolean" ? String(body[key]) : String(body[key] ?? "");
    await prisma.appMeta.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  return NextResponse.json({ ok: true });
}
