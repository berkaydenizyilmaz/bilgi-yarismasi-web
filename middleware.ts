import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export async function middleware(request: NextRequest) {
    try {
        const path = request.nextUrl.pathname;
        const token = request.cookies.get("token")?.value;

        const protectedPaths = [
            "/quiz",
            "/quiz/start",
            "/dashboard",
            "/quiz/result",
            "/play"
        ];

        const adminPaths = [
            "/admin",
            "/admin/logs",
            "/admin/feedback",
            "/admin/users",
            "/admin/questions",
            "/admin/categories",
        ];

        const authPaths = ["/auth/login", "/auth/register"];

        if (path === "/" || path.startsWith("/api")) {
            return NextResponse.next();
        }

        // Korunan sayfalara erişim kontrolü
        if (protectedPaths.some(pp => path.startsWith(pp))) {
            if (!token) {
                return NextResponse.redirect(new URL("/auth/login", request.url));
            }
        }

        if (adminPaths.some((ap) => path.startsWith(ap))) {
            if (!token) {
                return NextResponse.redirect(new URL("/auth/login", request.url));
            }

            try {
                const apiUrl = `${request.nextUrl.origin}/api/auth`;
                const response = await fetch(apiUrl, {
                    headers: {
                        'Cookie': `token=${token}`
                    },
                    cache: 'no-cache'
                });

                if (!response.ok) {
                    return NextResponse.redirect(new URL("/auth/login", request.url));
                }

                const apiData = await response.json();

                if (!apiData.success || !apiData.data || !apiData.data.user) {
                    return NextResponse.redirect(new URL("/auth/login", request.url));
                }

                const user = apiData.data.user;

                if (user.role !== "admin") {
                    return NextResponse.redirect(new URL("/", request.url));
                }

            } catch (error) {
                return NextResponse.redirect(new URL("/auth/login", request.url));
            }
        }

        if (authPaths.includes(path) && token) {
            return NextResponse.redirect(new URL("/", request.url));
        }

        return NextResponse.next();
    } catch (error) {
        // Sistem hatası logu
        logger.systemError(error as Error, 'middleware', {
            path: request.nextUrl.pathname,
            method: request.method
        });

        return NextResponse.json(
            { success: false, message: "Sistem hatası" },
            { status: 500 }
        );
    }
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|public).*)",
    ],
};