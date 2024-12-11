import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";
import { z } from "zod";
import jwt from 'jsonwebtoken';

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
      return apiResponse.error("Yetkilendirme gerekli", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const body = await request.json();
    const validatedData = statsSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        total_play_count: { increment: 1 },
        total_questions_attempted: { increment: validatedData.totalQuestions },
        total_correct_answers: { increment: validatedData.correctAnswers },
        total_score: { increment: validatedData.score }
      }
    });

    return apiResponse.success(user, "Kullan��cı istatistikleri güncellendi");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiResponse.error(error.errors[0].message);
    }
    console.error("İstatistik güncelleme hatası:", error);
    return apiResponse.error("İstatistikler güncellenemedi");
  }
} 