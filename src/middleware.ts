import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin UI uses client-side CMS auth (works on GitHub Pages too).
 * Server APIs remain protected via session checks in each route.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
