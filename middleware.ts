import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value

  const protectedPaths = [
    "/quiz/categories",
    "/quiz/start",
    "/dashboard",
    "/quiz/result"
  ]

  const authPaths = ["/auth/login", "/auth/register"]
  const path = request.nextUrl.pathname

  // Ana sayfa ve API rotaları için middleware'i atla
  if (path === "/" || path.startsWith("/api")) {
    return NextResponse.next()
  }

  // Korunan sayfalara erişim kontrolü
  if (protectedPaths.some(pp => path.startsWith(pp))) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  // Giriş yapmış kullanıcıların auth sayfalarına erişim kontrolü
  if (authPaths.includes(path) && token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}