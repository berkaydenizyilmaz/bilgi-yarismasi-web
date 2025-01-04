import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";
import jwt from 'jsonwebtoken';
import { APIError, ValidationError, AuthenticationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * İstatistik güncelleme validasyon şeması
 */
const statsSchema = z.object({
  totalQuestions: z.number(),
  correctAnswers: z.number(),
  score: z.number()
});

interface JWTPayload {
  id: number;
}

/**
 * PUT /api/users/stats
 * Kullanıcı istatistiklerini günceller
 * 
 * Veritabanı İşlemleri:
 * 1. User tablosunda ilgili alanları artırır:
 *    - total_play_count: +1
 *    - total_questions_attempted: +totalQuestions
 *    - total_correct_answers: +correctAnswers
 *    - total_score: +score
 * 
 * Request Body:
 * - totalQuestions: Toplam soru sayısı
 * - correctAnswers: Doğru cevap sayısı
 * - score: Kazanılan puan
 */
export async function PUT(request: NextRequest) {
  let body: z.infer<typeof statsSchema> | undefined;
  let validatedBody: z.infer<typeof statsSchema>;
  let userId: number | undefined;
  
  try {
    // Token kontrolü
    const token = request.cookies.get("token")?.value;
    if (!token) {
      throw new AuthenticationError();
    }

    // Token doğrulama
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      userId = decoded.id;
    } catch (error) {
      throw new AuthenticationError("Geçersiz veya süresi dolmuş oturum");
    }

    // Request body'yi parse et
    try {
      body = await request.json();
    } catch (e) {
      throw new ValidationError("Geçersiz istek formatı");
    }

    // Zod validasyonu
    try {
      statsSchema.parse(body);
      validatedBody = body as z.infer<typeof statsSchema>;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError(error.errors[0].message);
      }
      throw error;
    }

    // İstatistikleri güncelle
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        total_play_count: { increment: 1 },
        total_questions_attempted: { increment: validatedBody.totalQuestions },
        total_correct_answers: { increment: validatedBody.correctAnswers },
        total_score: { increment: validatedBody.score }
      },
      select: {
        id: true,
        username: true,
        total_play_count: true,
        total_questions_attempted: true,
        total_correct_answers: true,
        total_score: true
      }
    }).catch((error) => {
      logger.error('user', error as Error, {
        action: 'update',
        userId,
        stats: validatedBody,
        errorType: 'DATABASE_ERROR',
        errorContext: 'update_stats'
      });
      throw new APIError("İstatistikler güncellenirken hata oluştu", 500, "DATABASE_ERROR");
    });

    // Başarılı güncelleme logu
    logger.info('user', 'update', 'İstatistikler güncellendi', {
      userId: user.id,
      username: user.username,
      newScore: validatedBody.score,
      totalScore: user.total_score
    });

    return apiResponse.success(user, "Kullanıcı istatistikleri güncellendi");

  } catch (error) {
    logger.error('user', error as Error, {
      action: 'update',
      userId,
      stats: body,
      errorType: error instanceof ValidationError ? 'VALIDATION_ERROR' : 'DATABASE_ERROR'
    });

    if (error instanceof APIError) {
      return apiResponse.error(error);
    }

    return apiResponse.error(
      new APIError(
        "İstatistikler güncellenirken beklenmeyen bir hata oluştu",
        500,
        "INTERNAL_SERVER_ERROR"
      )
    );
  }
}