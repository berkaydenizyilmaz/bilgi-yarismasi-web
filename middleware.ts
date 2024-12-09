import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const isAuthPath = pathname.startsWith("/auth/");

  if (pathname.startsWith("/api/")) return NextResponse.next();

  if (isAuthPath && token)
    return NextResponse.redirect(new URL("/", request.url));

  if (!isAuthPath && !token)
    return NextResponse.redirect(new URL("/auth/login", request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};