import { NextResponse } from "next/server";
import { z } from "zod";
import { changeAdminPassword } from "@/lib/auth/admin-auth";
import { getAdminSession, isAdminSessionActive } from "@/lib/auth/admin-session";
import { assertCsrf } from "@/lib/auth/csrf";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
  csrfToken: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!isAdminSessionActive(session) || !session.userId) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Yeni şifre en az 8 karakter olmalı" }, { status: 400 });
  }

  if (!(await assertCsrf(parsed.data.csrfToken))) {
    return NextResponse.json({ error: "CSRF doğrulaması başarısız" }, { status: 403 });
  }

  if (parsed.data.newPassword === "12345") {
    return NextResponse.json({ error: "Varsayılan şifre kullanılamaz" }, { status: 400 });
  }

  const { prisma } = await import("@/lib/db");
  const { verifyPassword } = await import("@/lib/auth/admin-auth");
  const user = await prisma.adminUser.findUnique({ where: { id: session.userId } });
  if (!user || !(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: "Mevcut şifre hatalı" }, { status: 400 });
  }

  await changeAdminPassword(session.userId, parsed.data.newPassword);
  session.mustChangePassword = false;
  await session.save();

  return NextResponse.json({ ok: true });
}
