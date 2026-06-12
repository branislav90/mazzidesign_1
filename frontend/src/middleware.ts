import { NextRequest, NextResponse } from "next/server";

/**
 * Admin auth gate. Runs only for /admin/* (see matcher below).
 *
 * - /admin/api/auth/* (login/logout) is always allowed through.
 * - /admin/api/* without a refresh cookie → 401 JSON (no HTML redirects for fetches).
 * - /admin/login with a refresh cookie → already authed, redirect to /admin.
 * - any other /admin page without a refresh cookie → redirect to /admin/login.
 *
 * Presence of ww_refresh only gates routing; the actual JWT is validated by the
 * backend via the proxy route handler (which also performs refresh rotation).
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasRefresh = req.cookies.has("ww_refresh");

  if (pathname.startsWith("/admin/api/auth/")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin/api/")) {
    if (!hasRefresh) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    if (hasRefresh) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (!hasRefresh) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
