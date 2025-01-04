import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import jwt from 'jsonwebtoken';

/**
 * JWT token içeriği için tip tanımı
 */
interface JWTPayload {
  id: number;
  email: string;
  username: string;
}

/**
 * POST /api/auth/logout
 * Kullanıcı çıkışı yapar
 * 
 * İşlem Adımları:
 * 1. Token kontrolü
 * 2. Token'dan kullanıcı bilgilerini çıkarma (loglama için)
 * 3. Cookie'yi temizleme
 */
export async function POST(request: NextRequest) {
  try {
    // Token'ı al
    const token = request.cookies.get("token")?.value;

    if (token) {
      try {
        // Token'dan kullanıcı bilgilerini al
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        
        // Başarılı çıkış logu
        logger.authLog('logout', 'Kullanıcı çıkış yaptı', {
          userId: decoded.id,
          email: decoded.email,
          username: decoded.username
        });
      } catch (error) {
        // Token decode hatası
        logger.warn('auth', 'auth', 'Token decode hatası', {
          error: error instanceof Error ? error.message : 'Bilinmeyen hata'
        });
      }
    } 

    // Cookie'yi temizle
    return apiResponse.successWithCookie(
      { message: "Çıkış başarılı" },
      "Çıkış başarılı",
      [{
        name: "token",
        value: "",
        options: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 0, // Cookie'yi hemen sil
        }
      }]
    );

  } catch (error) {
    // Hata logu
    logger.error('auth', error as Error, {
      action: 'logout',
      path: request.url,
      errorType: 'LOGOUT_ERROR'
    });

    return apiResponse.error(
      new APIError(
        "Çıkış yapılırken bir hata oluştu",
        500,
        "LOGOUT_ERROR"
      )
    );
  }
}