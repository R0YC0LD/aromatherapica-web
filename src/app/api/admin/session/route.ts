import { NextResponse } from "next/server";
import { getAdminSession, isAdminSessionActive } from "@/lib/auth/admin-session";
import { ensureCsrfToken } from "@/lib/auth/csrf";

export async function GET() {
  const session = await getAdminSession();
  if (!isAdminSessionActive(session)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const csrfToken = await ensureCsrfToken();
  return NextResponse.json({
    username: session.username,
    mustChangePassword: session.mustChangePassword,
    csrfToken,
  });
}
