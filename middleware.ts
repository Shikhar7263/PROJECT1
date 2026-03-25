import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Protect vendor routes
  if (pathname.startsWith("/vendor")) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    if ((session.user as { role: string }).role !== "VENDOR") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    if ((session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith("/auth/") && session) {
    const role = (session.user as { role: string }).role;
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/vendor/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/vendor/:path*", "/admin/:path*", "/auth/:path*"],
};
