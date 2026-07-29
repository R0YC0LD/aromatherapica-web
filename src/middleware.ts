import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readAdminSessionFromCookieValue, isAdminSessionActive, ADMIN_SESSION_COOKIE } from "@/lib/auth/admin-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await readAdminSessionFromCookieValue(cookie);

  if (!isAdminSessionActive(session)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (session?.mustChangePassword && !pathname.startsWith("/admin/sifre-degistir")) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/sifre-degistir";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
