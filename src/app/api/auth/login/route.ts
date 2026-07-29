import { NextResponse } from "next/server";
import { z } from "zod";
import { loginMember } from "@/lib/ticimax/members";
import { isTicimaxConfigured } from "@/lib/env";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  if (!isTicimaxConfigured()) {
    return NextResponse.json({ error: "Ticimax yapılandırması eksik" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  try {
    const result = await loginMember(parsed.data.email, parsed.data.password);
    if (!result?.Basarili) {
      return NextResponse.json({ error: result?.Mesaj || "Giriş başarısız" }, { status: 401 });
    }

    const token = randomBytes(32).toString("hex");
    await prisma.customerSession.create({
      data: {
        sessionToken: token,
        ticimaxMemberId: result.UyeID,
        email: parsed.data.email,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("arom_customer_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });

    return NextResponse.json({ ok: true, memberId: result.UyeID });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Giriş hatası" },
      { status: 502 },
    );
  }
}
