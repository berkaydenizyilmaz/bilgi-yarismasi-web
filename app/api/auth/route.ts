import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import jwt from 'jsonwebtoken';
import { APIError, AuthenticationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * JWT token içeriği için tip tanımı
 */
interface JWTPayload {
  id: number;
  email: string;
  username: string;
  role: string
}

/**
 * GET /api/auth
 * Kullanıcı oturum kontrolü yapar
 * 
 * Veritabanı İşlemleri:
 * - User tablosundan kullanıcı bilgilerini çeker
 * - Kullanıcının istatistiklerini de getirir
 */
export async function GET(request: NextRequest) {
  try {
    // Token kontrolü
    const token = request.cookies.get("token")?.value;
    if (!token) {
      throw new AuthenticationError("Oturum bulunamadı");
    }

    // Token doğrulama
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch (error) {
      logger.warn('auth', 'auth', 'Geçersiz token', {
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
      throw new AuthenticationError("Geçersiz veya süresi dolmuş oturum");
    }

    // Kullanıcı bilgilerini getir
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        total_play_count: true,
        total_score: true,
        total_correct_answers: true,
        total_questions_attempted: true,
        created_at: true,
      },
    }).catch((error) => {
      logger.error('auth', error as Error, {
        userId: decoded.id,
        email: decoded.email,
        errorType: 'DATABASE_ERROR',
        errorContext: 'verify_session'
      });
      throw new APIError("Veritabanı hatası", 500, "DATABASE_ERROR");
    });

    if (!user) {
      logger.warn('auth', 'auth', 'Kullanıcı bulunamadı', {
        userId: decoded.id,
        email: decoded.email
      });
      throw new AuthenticationError("Kullanıcı bulunamadı");
    }

    return apiResponse.success({ user });

  } catch (error) {
    logger.error('auth', error as Error, {
      errorType: error instanceof AuthenticationError ? 'AUTH_ERROR' : 'INTERNAL_ERROR',
      errorContext: 'session_verify'
    });

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError(
        "Oturum kontrolü sırasında bir hata oluştu",
        500,
        "INTERNAL_SERVER_ERROR"
      )
    );
  }
}