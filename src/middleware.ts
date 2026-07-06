import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  ADMIN_AUTH_COOKIE,
  isAdminAuthenticated,
} from "@/lib/admin-auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = isAdminAuthenticated(
    request.cookies.get(ADMIN_AUTH_COOKIE)?.value,
  );

  if (pathname.startsWith("/admin/dashboard")) {
    if (!authenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    if (authenticated) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/admin") {
    const destination = authenticated ? "/admin/dashboard" : "/admin/login";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/login", "/admin/dashboard/:path*"],
};
