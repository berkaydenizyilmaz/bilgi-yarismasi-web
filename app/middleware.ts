import { NextRequest, NextResponse } from "next/server";

function getTokenFromRequest(req: NextRequest): string | null {
    const cookie = req.cookies.get('token');
    return cookie?.value || null; 
}

function isAuthenticated(req: NextRequest): boolean {
    const token = getTokenFromRequest(req);
    return token !== null; // Token varsa kullanıcı giriş yapmış demektir
}

export function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();

    if (isAuthenticated(req)) {
        console.log("Giriş yapılmış, yönlendiriliyor...");
        // Giriş yapmış kullanıcılar için login ve register sayfalarına erişimi engelle
        if (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register')) {
            url.pathname = '/'; // Giriş yapılmışsa ana sayfaya yönlendir
            return NextResponse.rewrite(url);
        }
    } else {
        console.log("Giriş yapılmamış, yönlendiriliyor...");
        // Giriş yapmamış kullanıcılar için diğer sayfalara erişimi engelle
        if (!req.nextUrl.pathname.startsWith('/login') && !req.nextUrl.pathname.startsWith('/register')) {
            url.pathname = '/login'; // Giriş yapılmamışsa login sayfasına yönlendir
            return NextResponse.redirect(url);
        }
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};