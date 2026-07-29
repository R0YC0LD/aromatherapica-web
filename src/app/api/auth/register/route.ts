import { NextResponse } from "next/server";
import { z } from "zod";
import { registerMember } from "@/lib/ticimax/members";
import { isTicimaxConfigured } from "@/lib/env";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  if (!isTicimaxConfigured()) {
    return NextResponse.json({ error: "Ticimax yapılandırması eksik" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });

  try {
    const memberId = await registerMember(parsed.data);
    if (!memberId || memberId <= 0) {
      return NextResponse.json({ error: "Üyelik oluşturulamadı" }, { status: 400 });
    }
    return NextResponse.json({ ok: true, memberId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kayıt hatası" },
      { status: 502 },
    );
  }
}
