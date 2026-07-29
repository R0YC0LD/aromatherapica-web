import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateAdmin, ensureAdminUser } from "@/lib/auth/admin-auth";
import { getAdminSession } from "@/lib/auth/admin-session";
import { generateCsrfToken } from "@/lib/auth/csrf";
import { isProductionDefaultAdminPassword } from "@/lib/env";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: Request) {
  await ensureAdminUser();

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Kullanıcı adı ve şifre gerekli" }, { status: 400 });
  }

  const result = await authenticateAdmin(parsed.data.username, parsed.data.password, clientIp(request));
  if (!result.ok || !result.user) {
    const status = result.reason === "locked" ? 429 : 401;
    return NextResponse.json(
      {
        error:
          result.reason === "locked"
            ? "Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin."
            : "Geçersiz kullanıcı adı veya şifre",
        retryAfterMs: result.retryAfterMs,
      },
      { status },
    );
  }

  const mustChange =
    result.user.mustChangePassword || isProductionDefaultAdminPassword();

  const session = await getAdminSession();
  session.userId = result.user.id;
  session.username = result.user.username;
  session.mustChangePassword = mustChange;
  session.csrfToken = generateCsrfToken();
  session.loggedInAt = Date.now();
  await session.save();

  if (mustChange && !result.user.mustChangePassword) {
    const { prisma } = await import("@/lib/db");
    await prisma.adminUser.update({
      where: { id: result.user.id },
      data: { mustChangePassword: true },
    });
  }

  return NextResponse.json({
    ok: true,
    username: result.user.username,
    mustChangePassword: mustChange,
    csrfToken: session.csrfToken,
  });
}
