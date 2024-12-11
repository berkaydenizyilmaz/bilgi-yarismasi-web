import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";
import jwt from 'jsonwebtoken';
import { APIError, ValidationError, AuthenticationError } from "@/lib/errors";

const statsSchema = z.object({
  totalQuestions: z.number(),
  correctAnswers: z.number(),
  score: z.number()
});

interface JWTPayload {
  id: number;
}

export async function PUT(request: NextRequest) {
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
    let body;
    try {
      body = await request.json();
    } catch (e) {
      throw new ValidationError("Geçersiz istek formatı");
    }

    // Zod validasyonu
    try {
      statsSchema.parse(body);
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
        total_questions_attempted: { increment: body.totalQuestions },
        total_correct_answers: { increment: body.correctAnswers },
        total_score: { increment: body.score }
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
      console.error("Stats update error:", error);
      throw new APIError("İstatistikler güncellenirken hata oluştu", 500, "DATABASE_ERROR");
    });

    return apiResponse.success(user, "Kullanıcı istatistikleri güncellendi");

  } catch (error) {
    console.error("Stats update error:", error);

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