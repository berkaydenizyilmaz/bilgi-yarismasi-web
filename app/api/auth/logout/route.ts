import { NextRequest } from "next/server";
import { apiResponse } from "@/lib/api-response";
import { APIError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: number;
  email: string;
  username: string;
}

export async function POST(request: NextRequest) {
  try {
    // Token'ı al
    const token = request.cookies.get("token")?.value;

    if (token) {
      try {
        // Token'dan kullanıcı bilgilerini al
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        
        logger.authLog('logout', 'Kullanıcı çıkış yaptı', {
          userId: decoded.id,
          email: decoded.email,
          username: decoded.username
        });
      } catch (error) {
        console.error('Token decode hatası:', error);
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
    logger.error('auth', error as Error, {
      path: request.url
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