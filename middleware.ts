import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authData = request.cookies.get("auth_data")?.value;
  const isAuthenticated = !!authData;

  // Ignore API routes so they don't get intercepted by middleware
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Add all public routes here
  const publicRoutes = ["/login", "/signin"];

  // If not authenticated → redirect to login
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If authenticated and on public route → redirect to root
  if (isAuthenticated && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico).*)",
  ],
};
