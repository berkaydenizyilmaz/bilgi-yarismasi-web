import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt, { JwtPayload } from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  // Korunan yollar
  const protectedPaths = [
    "/quiz/categories",
    "/quiz/start",
    "/dashboard",
    "/quiz/result"
  ];

  // Admin paneli için korunan yollar
  const adminPaths = [
    "/admin",
    "/admin/logs",
    "/admin/feedback",
    "/admin/dashboard",
    "/admin/users"
  ];

  const authPaths = ["/auth/login", "/auth/register"];

  // Ana sayfa ve API rotaları için middleware'i atla
  if (path === "/" || path.startsWith("/api")) {
    return NextResponse.next();
  }

  // Korunan sayfalara erişim kontrolü
  if (protectedPaths.some(pp => path.startsWith(pp))) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // Admin paneline erişim kontrolü
  if (adminPaths.some(ap => path.startsWith(ap))) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Token'dan kullanıcı bilgilerini al
    let user: JwtPayload | string;
    try {
      user = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Kullanıcının rolünü kontrol et
    if (typeof user !== 'string' && user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Giriş yapmış kullanıcıların auth sayfalarına erişim kontrolü
  if (authPaths.includes(path) && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};