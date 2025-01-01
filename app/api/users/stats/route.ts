import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";
import jwt from 'jsonwebtoken';
import { APIError, ValidationError, AuthenticationError } from "@/lib/errors";
import { logger } from "@/lib/logger";

const statsSchema = z.object({
  totalQuestions: z.number(),
  correctAnswers: z.number(),
  score: z.number()
});

interface JWTPayload {
  id: number;
}

export async function PUT(request: NextRequest) {
  let body: z.infer<typeof statsSchema> | undefined;
  let validatedBody: z.infer<typeof statsSchema>;
  
  try {

    const token = request.cookies.get("token")?.value;
    if (!token) {
      throw new AuthenticationError();
    }

    // Token doğrulama
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
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
      where: { id: decoded.id },
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
        userId: decoded.id,
        stats: validatedBody,
        message: 'İstatistikler güncellenirken veritabanı hatası'
      });
      throw new APIError("İstatistikler güncellenirken hata oluştu", 500, "DATABASE_ERROR");
    });

    return apiResponse.success(user, "Kullanıcı istatistikleri güncellendi");

  } catch (error) {
    logger.error('user', error as Error, {
      path: request.url,
      stats: body
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