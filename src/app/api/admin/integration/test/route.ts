import { NextResponse } from "next/server";
import { getAdminSession, isAdminSessionActive } from "@/lib/auth/admin-session";
import { assertCsrf } from "@/lib/auth/csrf";
import { testTicimaxConnection } from "@/lib/ticimax/soap-client";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!isAdminSessionActive(session)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (!(await assertCsrf((body as { csrfToken?: string }).csrfToken))) {
    return NextResponse.json({ error: "CSRF doğrulaması başarısız" }, { status: 403 });
  }

  const result = await testTicimaxConnection();
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
